import Product from "../../models/Product.js";
import RestockLog from "../../models/PurchaseOrder.js";
import Category from "../../models/Category.js";
import XLSX from "xlsx";

import mongoose from "mongoose";

export const replenishStock = async (req, res) => {
  // Khởi tạo session cho transaction
  const session = await mongoose.startSession();

  try {
    const { productId, quantity, costPrice, manufactureDate, expiryDate } =
      req.body;

    // 1. Kiểm tra dữ liệu đầu vào (Làm trước khi start transaction để tối ưu hiệu năng)
    if (!productId || !quantity || quantity <= 0 || !costPrice) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product or quantity" });
    }

    if (!manufactureDate || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Manufacture date and expiry date are required",
      });
    }

    // Bắt đầu Transaction
    session.startTransaction();

    // 2. Tìm sản phẩm và cập nhật tăng tổng số lượng stock (Truyền session vào)
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: Number(quantity) } },
      { new: true, session },
    ).populate("category");

    if (!updatedProduct) {
      // Nếu không tìm thấy product, hủy transaction và return luôn
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // 3. Tạo bản ghi lịch sử nhập hàng (Truyền session vào dưới dạng mảng [] cho hàm tạo)
    // Lưu ý với Mongoose: .create() nhận session qua options ở tham số thứ 2 nếu truyền data dạng mảng
    const [newLog] = await RestockLog.create(
      [
        {
          product: productId,
          quantityAdded: Number(quantity),
          costPrice: Number(costPrice),
          manufactureDate: new Date(manufactureDate),
          expiryDate: new Date(expiryDate),
          supplier: "Veggies Wholesale Farm",
        },
      ],
      { session },
    );

    // Nếu mọi thứ chạy mượt mà đến đây, xác nhận lưu vĩnh viễn vào DB
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Stock replenished successfully with batch tracking!",
      product: updatedProduct,
      log: newLog,
    });
  } catch (error) {
    // Nếu có bất kỳ lỗi nào xảy ra trong khối try, hủy bỏ toàn bộ thay đổi trước đó
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpiringSoonLogs = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneMonthFromNow = new Date(today);
    oneMonthFromNow.setDate(oneMonthFromNow.getDate() + 30);
    oneMonthFromNow.setHours(23, 59, 59, 999);

    // console.log(today);
    // console.log(oneMonthFromNow);

    const expiringLogs = await RestockLog.find({
      expiryDate: {
        $gte: today,
        $lte: oneMonthFromNow,
      },
    })
      .populate("product")
      .sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      count: expiringLogs.length,
      expiringItems: expiringLogs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecentRestockLogs = async (req, res) => {
  try {
    // Lấy 10 log mới nhất, dùng .populate("product") để lấy kèm tên sản phẩm
    const logs = await RestockLog.find()
      .populate("product")
      .sort({ createdAt: -1 }) // Xếp log mới nhất lên đầu
      .limit(10);

    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrCreateCategory = async (name, parentId = null, level = 0) => {
  if (!name) return null;

  const cleanName = name.trim();

  // 1. Chỉ tìm theo tên để né lỗi cấu hình unique toàn bảng của DB
  let category = await Category.findOne({
    name: { $regex: new RegExp(`^${cleanName}$`, "i") },
  });

  // 2. Nếu chưa có thì mới tiến hành tạo mới
  if (!category) {
    try {
      category = await Category.create({
        name: cleanName,
        parent: parentId,
        level: level,
        path: parentId ? `${parentId},` : ",",
      });
      console.log(
        ` Successfully created category: ${cleanName} (Level ${level})`,
      );
    } catch (error) {
      // Bọc lót lỗi race condition bất đồng bộ (trùng mã E11000) thì tìm lại lần cuối
      if (error.code === 11000) {
        category = await Category.findOne({
          name: { $regex: new RegExp(`^${cleanName}$`, "i") },
        });
      } else {
        throw error;
      }
    }
  }
  return category;
};

// [POST] api/product/import
export const importPostman = async (req, res) => {
  try {
    // 1. Kiểm tra file đẩy lên từ Postman qua express-fileupload
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

    // Hàm bóc tách public_id (Chỉ dùng nếu link có Cloudinary, nếu không sẽ tự tạo id ngẫu nhiên)
    const getPublicId = (url) => {
      try {
        if (!url.includes("res.cloudinary.com")) {
          return `import_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        }
        const parts = url.split("/");
        const fileName = parts.pop();
        const uploadIndex = parts.findIndex((p) => p === "upload");
        const pathParts = parts.slice(uploadIndex + 2);
        return [...pathParts, fileName.split(".")[0]].join("/");
      } catch {
        return `import_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      }
    };

    // Hàm kiểm tra tính hợp lệ của dữ liệu đầu vào từ Excel
    const validateProduct = (p) => {
      const err = [];
      if (!p.name || String(p.name).trim().length < 2) {
        err.push("Name is required (>=2 chars)");
      }
      if (p.price === undefined || isNaN(p.price) || Number(p.price) <= 0) {
        err.push("Invalid price");
      }
      if (p.stock === undefined || isNaN(p.stock) || Number(p.stock) < 0) {
        err.push("Invalid stock");
      }
      if (!p.category) {
        err.push("Category is required");
      }
      return err;
    };

    // 2. Vòng lặp xử lý từng dòng dữ liệu trong file Excel
    for (let i = 0; i < products.length; i++) {
      let p = products[i];
      const rowNumber = i + 2;

      // --- XỬ LÝ ĐỒNG BỘ HOÀN CẢNH ẢNH (HỖ TRỢ CẢ STRING LẪN MẢNG JSON) ---
      let images = [];
      if (p.images) {
        try {
          const imgStr = String(p.images).trim();
          // Nếu ô Excel bọc trong mảng kiểu ["url1","url2"] thì parse, nếu không thì split bằng dấu phẩy
          const rawImgs = imgStr.startsWith("[")
            ? JSON.parse(imgStr)
            : imgStr.split(",");

          images = rawImgs
            .map((url) => {
              const cleanUrl = String(url).trim();
              if (!cleanUrl) return null;
              return {
                url: cleanUrl,
                public_id: getPublicId(cleanUrl),
              };
            })
            .filter(Boolean);
        } catch {
          images = [];
        }
      }

      // --- CHẠY VALIDATE TẦNG DÒNG ---
      const validationErrors = validateProduct(p);
      if (validationErrors.length > 0) {
        errors.push({
          row: rowNumber,
          errors: validationErrors,
        });
        continue;
      }

      // --- XỬ LÝ CHUYỂN ĐỔI CATEGORY CHỮ SANG OBJECT ID ---
      // Gọi lại hàm getOrCreateCategory chúng ta viết hôm trước để biến "Vegetables" thành ObjectId xịn
      const parentCat = await getOrCreateCategory(p.category, null, 0);
      let finalCategoryId = parentCat?._id;

      // Nếu có subcategory thì tìm/tạo tiếp danh mục con cấp 1
      if (p.subcategory && parentCat) {
        const subCat = await getOrCreateCategory(
          p.subcategory,
          parentCat._id,
          1,
        );
        if (subCat) finalCategoryId = subCat._id;
      }

      if (!finalCategoryId) {
        errors.push({
          row: rowNumber,
          errors: ["Could not resolve or create valid Category ID"],
        });
        continue;
      }

      // Đẩy sản phẩm đã làm sạch vào mảng chờ ghi
      validProducts.push({
        name: String(p.name).trim(),
        category: finalCategoryId, // ObjectId chuẩn từ DB
        description: p.description ? String(p.description).trim() : "",
        images: images,
        price: Number(p.price),
        stock: Number(p.stock),
        tags: p.tags
          ? String(p.tags)
              .split(",")
              .map((t) => t.trim())
          : [],
      });
    }

    // 3. Tiến hành Lưu hàng loạt vào DB (Bọc try-catch an toàn)
    let insertedCount = 0;
    if (validProducts.length > 0) {
      try {
        const result = await Product.insertMany(validProducts, {
          ordered: false,
        });
        insertedCount = result.length;
      } catch (insertError) {
        // Đếm các bản ghi thành công bất chấp có dòng bị lỗi loại ra
        insertedCount = insertError.insertedDocs
          ? insertError.insertedDocs.length
          : 0;

        // Đẩy các lỗi phát sinh từ DB vào mảng báo cáo chung
        if (insertError.writeErrors) {
          insertError.writeErrors.forEach((we) => {
            errors.push({ row: "Database_Constraint", errors: [we.errmsg] });
          });
        }
      }
    }

    // 4. Trả kết quả thống kê đẹp đẽ về Postman
    return res.json({
      success: true,
      message: "Import completed successfully",
      totalRows: products.length,
      successCount: insertedCount,
      failedCount: errors.length,
      errors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error: " + error.message,
    });
  }
};

// [DELETE] api/product/clean-mock
export const deleteMockProducts = async (req, res) => {
  try {
    // Tìm và xóa các sản phẩm có chứa từ khóa 'agricultural' trong mảng tags
    const result = await Product.deleteMany({ tags: "agricultural" });

    // Hoặc xóa theo danh mục nông sản nếu muốn:
    // const result = await Product.deleteMany({ category: { $in: [Danh_Sách_ID_Category_Nông_Sản] } });

    return res.json({
      success: true,
      message: `Đã dọn dẹp sạch sẽ ${result.deletedCount} sản phẩm mock data!`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
