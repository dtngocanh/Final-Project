import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
  try {
    // Sử dụng .lean() để lấy object thuần cho nhẹ và xử lý nhanh
    const allCategories = await Category.find({})
      .sort({ createdAt: -1 })
      .lean();

    // 1. Lọc ra các danh mục gốc (Level 0)
    const rootCategories = allCategories.filter((cat) => cat.level === 0);

    // 2. Map để đính kèm subcategories (Đảm bảo chuyển ID sang String để so sánh)
    const categoriesWithSubs = rootCategories.map((root) => {
      const rootIdStr = root._id.toString(); // Chuyển ID cha về String một lần duy nhất

      return {
        ...root,
        subcategories: allCategories.filter((cat) => {
          // Kiểm tra xem danh mục này có cha không và ID cha có khớp với rootIdStr không
          return cat.parent && cat.parent.toString() === rootIdStr;
        }),
      };
    });

    res.json({
      success: true,
      categories: categoriesWithSubs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name, parent } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name) {
      category.name = name.trim();
    }

    if (parent !== undefined) {
      category.parent = parent || null;
      category.level = parent ? 1 : 0;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated",
      category,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, parent = null } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const existed = await Category.findOne({
      name: name.trim(),
    });

    if (existed) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    let parentCategory = null;

    if (parent) {
      parentCategory = await Category.findById(parent);
    }

    const category = await Category.create({
      name: name.trim(),
      parent: parent || null,
      level: parentCategory ? parentCategory.level + 1 : 0,
      path: parentCategory
        ? `${parentCategory.path}${parentCategory._id},`
        : ",",
    });

    res.status(201).json({
      success: true,
      message: "Category created",
      category,
    });
  } catch (error) {
    next(error);
  }
};
