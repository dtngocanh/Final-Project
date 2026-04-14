import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import XLSX from "xlsx";
import ErrorHandler from "../utils/errorHandler.js";
import axios from "axios";
/**
 * @route [POST] api/product/add
 */
export const addProduct = async (req, res, next) => {
  try {
    const productData = JSON.parse(req.body.productData);
    const images = req.files;

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
          folder: "GroceryImg/Product",
        });
        return {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }),
    );

    const newProduct = await Product.create({
      ...productData,
      images: imagesUrl,
    });

    res
      .status(201)
      .json({ success: true, message: "Product Added", newProduct });
  } catch (error) {
    next(error);
  }
};

/**
 * @route [GET] api/product/list
 */
export const productList = async (req, res, next) => {
  try {
    // Extract query parameters from the request
    const { categoryId, search } = req.query;
    let query = {};

    // Handle text-based search filtering
    if (search) {
      // Use $regex for partial match and "i" for case-insensitive search
      query.name = { $regex: search, $options: "i" };
    }

    // Handle category-based filtering (including subcategories)
    if (categoryId) {
      // Find the selected category and all its descendants using the path field
      const subCategories = await Category.find({
        $or: [{ _id: categoryId }, { path: new RegExp(`,${categoryId},`) }],
      }).select("_id");

      // Extract only the IDs into an array for the query
      const categoryIds = subCategories.map((cat) => cat._id);

      // Filter products that belong to any of the found category IDs
      query.category = { $in: categoryIds };
    }

    // Execute the database query with population and sorting
    const products = await Product.find(query)
      .populate("category", "name parent level")
      .sort({ createdAt: -1 });

    // Return the response to the client
    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route [GET] api/product/:id
 */
export const productById = async (req, res, next) => {
  try {
    const id = req.params.id;

    // 1. Fetch the primary product details from MongoDB
    const product = await Product.findById(id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    let relatedProducts = [];
    let recipeRelatedProducts = [];

    try {
      // 2. Call the AI service to get recommendation IDs
      // The Python server now returns { recommendations: [], recipe_related: [] }
      const aiResponse = await axios.get(
        `http://127.0.0.1:8000/recommend/${id}`,
      );
      const { recommendations, recipe_related } = aiResponse.data;

      // 3. Hydrate Similar Products (Content-based)
      if (recommendations && recommendations.length > 0) {
        const simDb = await Product.find({
          _id: { $in: recommendations },
        });
        //.select("name price images category");

        // Maintain the AI's ranking order
        relatedProducts = recommendations
          .map((recId) => simDb.find((p) => p._id.toString() === recId))
          .filter((p) => p !== undefined);
      }

      // 4. Hydrate Recipe-related Products (Usage-based)
      if (recipe_related && recipe_related.length > 0) {
        const recipeDb = await Product.find({
          _id: { $in: recipe_related },
        });
        //.select("name price images category");

        // Maintain the AI's ranking order
        recipeRelatedProducts = recipe_related
          .map((recId) => recipeDb.find((p) => p._id.toString() === recId))
          .filter((p) => p !== undefined);
      }
    } catch (err) {
      // Log AI error but keep the main product page functional
      // console.error("AI Service Error:", err.message);
      relatedProducts = [];
      recipeRelatedProducts = [];
    }

    // 5. Send unified response back to the client
    res.json({
      success: true,
      product: product,
      related: relatedProducts, // For "Similar Selections"
      recipes: recipeRelatedProducts, // For "Cook This With..." or "Recipe Ideas"
    });
  } catch (error) {
    next(error);
  }
};

//[DELETE] api/product/delete/:id
export const deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id;

    const product = await Product.findById(id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map(async (img) => {
          await cloudinary.uploader.destroy(img.public_id);
        }),
      );
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Product and associated images deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

//[PATCH] api/product/stock
export const changeStock = async (req, res) => {
  try {
    const { id, inStock } = req.body;

    const product = await Product.findByIdAndUpdate(id, { inStock });

    res.json({
      success: true,
      message: "Stock Updated",
      product,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//[POST] api/product/import
export const importProducts = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.json({
        success: false,
        message: "Please upload an Excel file",
      });
    }

    const file = req.files.file;

    const workbook = XLSX.read(file.data, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let products = XLSX.utils.sheet_to_json(sheet);

    const validProducts = [];
    const errors = [];

    const getPublicId = (url) => {
      try {
        const parts = url.split("/");
        const fileName = parts.pop();
        const uploadIndex = parts.findIndex((p) => p === "upload");
        const pathParts = parts.slice(uploadIndex + 2);
        return [...pathParts, fileName.split(".")[0]].join("/");
      } catch {
        return "";
      }
    };

    const validateProduct = (p, index) => {
      const err = [];

      if (!p.name || p.name.length < 2) {
        err.push("Name is required (>=2 chars)");
      }

      if (!p.price || isNaN(p.price) || Number(p.price) <= 0) {
        err.push("Invalid price");
      }

      if (p.stock === undefined || isNaN(p.stock) || Number(p.stock) < 0) {
        err.push("Invalid stock");
      }

      return err;
    };

    for (let i = 0; i < products.length; i++) {
      let p = products[i];

      let images = [];
      if (p.images && typeof p.images === "string") {
        try {
          const parsed = JSON.parse(p.images);

          if (Array.isArray(parsed)) {
            images = parsed
              .map((url) => {
                if (!url.includes("res.cloudinary.com")) {
                  return null;
                }
                return {
                  url,
                  public_id: getPublicId(url),
                };
              })
              .filter(Boolean);
          }
        } catch {
          images = [];
        }
      }

      const price = Number(p.price);
      const stock = Number(p.stock);

      const validationErrors = validateProduct(p, i);

      if (validationErrors.length > 0) {
        errors.push({
          row: i + 2,
          errors: validationErrors,
        });
        continue;
      }

      validProducts.push({
        name: p.name,
        category: p.category || "",
        subcategory: p.subcategory || "",
        description: p.description || "",
        images,
        price,
        stock,
      });
    }

    let insertedCount = 0;

    if (validProducts.length > 0) {
      const result = await Product.insertMany(validProducts, {
        ordered: false,
      });
      insertedCount = result.length;
    }

    return res.json({
      success: true,
      message: "Import completed",
      totalRows: products.length,
      successCount: insertedCount,
      failedCount: errors.length,
      errors,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

// export const handleInteraction = async (req, res, next) => {
//   const { userId, productId } = req.body;
//   try {
//     const newInteraction = new Interaction({
//       userId,
//       productId,
//       type: "click",
//     });
//     await newInteraction.save();
//     res.status(200).send("Click tracked");
//   } catch (err) {
//     next(err);
//   }
// };
