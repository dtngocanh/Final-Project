import { v2 as cloudinary } from "cloudinary";
// import ProductSimilarity from "../models/ProductSimilarity.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import XLSX from "xlsx";
import ErrorHandler from "../utils/errorHandler.js";
import axios from "axios";
import { getCategoryIdsWithSub } from "../helpers/categoryHelper.js";
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
      .json({ success: true, message: "Product added to catalog", newProduct });
  } catch (error) {
    next(error);
  }
};

/**
 * @route [GET] api/product/list
 */
export const productList = async (req, res, next) => {
  try {
    const { categoryId, search, page, limit } = req.query;

    const currentPage = parseInt(page, 10) || 1;
    const resPerPage = parseInt(limit, 10) || 20;
    const skip = (currentPage - 1) * resPerPage;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (categoryId) {
      const cateIds = await getCategoryIdsWithSub(categoryId);
      query.category = { $in: cateIds };
    }

    const [totalProducts, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .select("name description price images category stock ratings discountPrice")
        .populate("category", "name parent level")
        .sort({ createdAt: -1 })
        .skip(skip) 
        .limit(resPerPage) 
        .lean(),
    ]);

    res.json({
      success: true,
      totalProducts, 
      resPerPage, 
      count: products.length,
      products, 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route [GET] /api/products/search?q=apple
 */
export const searchProducts = async (req, res) => {
  try {
    const { q, categoryId } = req.query;

    if (!q) return res.json([]);

    let pipeline = [
      {
        $search: {
          index: "idx-search",
          compound: {
            should: [
              {
                autocomplete: {
                  query: q,
                  path: "name",
                  score: { boost: { value: 5 } },
                },
              },
              {
                autocomplete: {
                  query: q,
                  path: "tags",
                  score: { boost: { value: 2 } },
                },
              },
            ],
          },
        },
      },
    ];

    if (categoryId) {
      const categoryIds = await getCategoryIdsWithSub(categoryId);
      pipeline.push({
        $match: {
          category: { $in: categoryIds },
        },
      });
    }

    pipeline.push({ $limit: 20 });

    pipeline.push({
      $lookup: {
        from: "categories", // Tên collection chứa danh mục trong DB của bạn
        localField: "category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    });

    pipeline.push({
      $project: {
        name: 1,
        price: 1,
        images: "$images",
        categoryName: { $arrayElemAt: ["$categoryInfo.name", 0] },
        score: { $meta: "searchScore" },
      },
    });

    const results = await Product.aggregate(pipeline);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @route [GET] api/product/:id
 */
export const productById = async (req, res, next) => {
  try {
    const id = req.params.id;

    // 1. Fetch the primary product details from MongoDB
    const product = await Product.findById(id)
      .select("name price images category ratings stock description numOfReviews discountPrice")
      .lean();

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    let relatedProducts = [];
    let recipeRelatedProducts = [];

    // 5. Send unified response back to the client
    res.json({
      success: true,
      product: product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route [DELETE] api/product/delete/:id
 */
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
      message: "Product removed from catalog",
    });
  } catch (error) {
    next(error);
  }
};

/**
 *
 * @route [PATCH] api/product/:id
 */
export const updateProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    let product = await Product.findById(id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Kiểm tra dữ liệu đầu vào
    if (!req.body.productData) {
      return next(new ErrorHandler("Missing product data", 400));
    }

    const data = JSON.parse(req.body.productData);
    const images = req.files;

    if (images && images.length > 0) {
      // 1. Xóa ảnh cũ trên Cloudinary
      if (product.images && product.images.length > 0) {
        await Promise.all(
          product.images.map((img) =>
            cloudinary.uploader.destroy(img.public_id),
          ),
        );
      }

      // 2. Upload ảnh mới
      const newImagesUrl = await Promise.all(
        images.map(async (i) => {
          const rs = await cloudinary.uploader.upload(i.path, {
            resource_type: "image",
            folder: "GroceryImg/Product",
          });
          return {
            public_id: rs.public_id,
            url: rs.secure_url,
          };
        }),
      );
      data.images = newImagesUrl;
    }

    // 3. Cập nhật Database
    product = await Product.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Product details updated",
      product,
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

// TUI LM LỎ LỎ
// import product list
// Hàm Helper: Tìm hoặc tạo mới Category/Subcategory

const getOrCreateCategory = async (name, parentId = null, level = 0) => {
  if (!name) return null;

  // Tìm danh mục khớp cả Tên VÀ Cha (để tránh lấy nhầm Herbs của Fruits cho Vegetables)
  let category = await Category.findOne({
    name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    parent: parentId,
  });

  if (!category) {
    category = await Category.create({
      name: name.trim(),
      parent: parentId,
      level: level,
      path: parentId ? `${parentId},` : ",",
    });
    console.log(` Đã tạo danh mục mới: ${name} (Level ${level})`);
  }
  return category;
};

export const importProducts = async (req, res) => {
  try {
    // 1. Kiểm tra file (Dùng Multer nên lấy từ req.file)
    const file = req.file;
    if (!file) {
      return res.json({ success: false, message: "Ní chưa chọn file Excel!" });
    }

    // 2. Đọc dữ liệu từ file Excel
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const productsFromExcel = XLSX.utils.sheet_to_json(sheet);

    const validProducts = [];
    const errors = [];

    // 3. Duyệt qua từng dòng trong Excel
    for (let i = 0; i < productsFromExcel.length; i++) {
      let p = productsFromExcel[i];

      try {
        // --- XỬ LÝ CATEGORY ---
        // Lấy hoặc tạo Category cha (ví dụ: "Trái cây")
        const parentCat = await getOrCreateCategory(p.category, null, 0);

        let finalCategoryId = parentCat?._id;

        // Lấy hoặc tạo Subcategory nếu có (ví dụ: "Táo Nhập Khẩu")
        if (p.subcategory && parentCat) {
          const subCat = await getOrCreateCategory(
            p.subcategory,
            parentCat._id,
            1,
          );
          finalCategoryId = subCat._id;
        }

        if (!finalCategoryId) {
          errors.push({ row: i + 2, error: "Thiếu thông tin Category" });
          continue;
        }

        // --- XỬ LÝ ẢNH ---
        let images = [];
        if (p.images) {
          try {
            // Hỗ trợ cả mảng JSON ["url1", "url2"] hoặc chuỗi cách nhau bởi dấu phẩy
            const rawImgs =
              typeof p.images === "string" && p.images.startsWith("[")
                ? JSON.parse(p.images)
                : p.images.split(",");

            images = rawImgs
              .map((url) => ({
                url: url.trim(),
                public_id: `import_${Date.now()}`, // Hoặc dùng hàm getPublicId cũ của ní
              }))
              .filter((img) => img.url.includes("res.cloudinary.com"));
          } catch (e) {
            images = [];
          }
        }

        // --- PUSH VÀO MẢNG CHỜ ---
        validProducts.push({
          name: p.name,
          description: p.description || "",
          price: Number(p.price) || 0,
          stock: Number(p.stock) || 0,
          category: finalCategoryId, // Đã là ObjectId xịn
          images: images,
          tags: p.tags ? p.tags.split(",").map((t) => t.trim()) : [],
        });
      } catch (err) {
        errors.push({ row: i + 2, error: err.message });
      }
    }

    // 4. Lưu vào Database
    let insertedCount = 0;
    if (validProducts.length > 0) {
      const result = await Product.insertMany(validProducts, {
        ordered: false,
      });
      insertedCount = result.length;
    }

    return res.json({
      success: true,
      message: "Import hoàn tất!",
      totalRows: productsFromExcel.length,
      successCount: insertedCount,
      failedCount: errors.length,
      errors,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi hệ thống: " + error.message });
  }
};

/**
 *
 * [GET] api/product/related-v2/:id
 * Giải thích: Lấy trực tiếp mảng related_product_ids từ DB và hydrate thông tin
 */
export const getRelatedProductsFromDB = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Tìm sản phẩm hiện tại, chỉ lấy đúng trường related_product_ids
    const product = await Product.findById(id).select("related_product_ids");

    if (!product) {
      return next(new ErrorHandler("Cannot find this product", 404));
    }

    // 2. Nếu mảng rỗng thì trả về mảng rỗng luôn
    if (
      !product.related_product_ids ||
      product.related_product_ids.length === 0
    ) {
      return res.status(200).json({
        success: true,
        related: [],
      });
    }

    // 3. Lôi chi tiết thông tin của 6 cái ID đó ra
    const relatedProducts = await Product.find({
      _id: { $in: product.related_product_ids },
    });

    // 4. Sắp xếp lại cho đúng thứ tự ưu tiên mà AI đã tính
    const sortedRelated = product.related_product_ids
      .map((recId) =>
        relatedProducts.find((p) => p._id.toString() === recId.toString()),
      )
      .filter((p) => p !== undefined);

    res.status(200).json({
      success: true,
      related: sortedRelated,
    });
  } catch (error) {
    next(error);
  }
};
// get freq product
export const getFreqProducts = async (req, res) => {
  try {
    // Dùng .lean() để lấy plain object, nhẹ và nhanh hơn
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    let recommendations = product.frequentlyBoughtTogether || [];

    // Kiểm tra nếu chưa đủ 4 món
    if (recommendations.length < 4) {
      // Lấy danh sách ID đã có để tránh trùng
      const currentIds = recommendations.map((r) => r.productId.toString());
      currentIds.push(product._id.toString());

      const fallback = await Product.find({
        _id: { $nin: currentIds },
        category: product.category,
      })
        .sort({ salesCount: -1 })
        .limit(4 - recommendations.length)
        .select("_id name image")
        .lean(); // Dùng .lean() ở đây luôn

      const formattedFallback = fallback.map((f) => ({
        productId: f._id,
        name: f.name,
        // Kiểm tra xem image có tồn tại và là mảng không
        image: f.image && f.image.length > 0 ? f.image[0] : "",
      }));

      recommendations = [...recommendations, ...formattedFallback];
    }

    // Chỉ trả về 4 món đầu tiên
    const finalRecommendations = recommendations.slice(0, 4);

    // Trả về dữ liệu
    res.json({
      success: true,
      // Nếu ní chỉ cần list gợi ý thì dùng key này
      frequentlyBoughtTogether: finalRecommendations,
      // Nếu cần cả thông tin SP gốc thì giữ lại dòng dưới
      // product: product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// export const getRelatedProductsFromDB2 = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     // 1. Kiểm tra sản phẩm gốc
//     const product = await Product.findById(id).lean();
//     if (!product) {
//       return next(new ErrorHandler("Cannot find this product", 404));
//     }

//     // 2. Truy vấn từ bảng AI
//     const aiRecommendation = await ProductSimilarity.findOne({ productId: id })
//       .populate({
//         path: "similarProducts.productId",
//         model: Product,
//       })
//       .lean();

//     let sortedRelated = [];

//     // 3. Kiểm tra dữ liệu AI
//     if (aiRecommendation && aiRecommendation.similarProducts?.length > 0) {
//       sortedRelated = aiRecommendation.similarProducts
//         .filter((item) => {
//           if (item.productId == null) {
//             return false;
//           }
//           return true;
//         })
//         .map((item) => item.productId);
//     } else {
//     }

//     // 4. Fallback
//     if (sortedRelated.length === 0) {
//       sortedRelated = await Product.find({
//         category: product.category,
//         _id: { $ne: id },
//       })
//         .limit(6)
//         .lean();
//     }

//     res.status(200).json({
//       success: true,
//       related: sortedRelated,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
