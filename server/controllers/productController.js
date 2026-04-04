import { v2 as cloudinary } from "cloudinary";
import Product from "../models/Product.js";
import XLSX from "xlsx";

//add product: api/product/add
export const addProduct = async (req, res) => {
    try {

        let productData = JSON.parse(req.body.productData)
        const images = req.files

        let imagesUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, {
                    resource_type: "image"
                })
                return result.secure_url
            })
        )

        await Product.create({
            ...productData,
            image: imagesUrl
        })

        res.json({ success: true, message: "Product Added" })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}


//get product list: api/product/list
export const productList = async (req, res) => {
    try {

        // const products = await Product.find({})
        const count = await Product.countDocuments();
        const products = await Product.aggregate([{$sample:{size:count}}]);

        res.json({
            success: true,
            products
        })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}


//get single product: api/product/id
export const productById = async (req, res) => {
    try {

        // const { id } = req.body
        const id = req.params.id;

        const product = await Product.findById(id)

        if (!product) {
            return res.json({
                success: false,
                message: "Product not found"
            })
        }

        res.json({
            success: true,
            product
        })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}


//change product stock: api/product/stock
export const changeStock = async (req, res) => {
    try {

        const { id, inStock } = req.body

        const product = await Product.findByIdAndUpdate(
            id,
            { inStock },
            // { new: true }
        )

        res.json({
            success: true,
            message: "Stock Updated",
            product
        })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}

export const importProducts = async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.json({
                success: false,
                message: "Please upload an Excel file"
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
                const uploadIndex = parts.findIndex(p => p === "upload");
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
                        images = parsed.map(url => {
                            if (!url.includes("res.cloudinary.com")) {
                                return null;
                            }
                            return {
                                url,
                                public_id: getPublicId(url)
                            };
                        }).filter(Boolean);
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
                    row: i + 2, // vì excel bắt đầu từ dòng 2
                    errors: validationErrors
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
                stock
            });
        }

        let insertedCount = 0;

        if (validProducts.length > 0) {
            const result = await Product.insertMany(validProducts, {
                ordered: false
            });
            insertedCount = result.length;
        }

        return res.json({
            success: true,
            message: "Import completed",
            totalRows: products.length,
            successCount: insertedCount,
            failedCount: errors.length,
            errors 
        });

    } catch (error) {
        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
};