import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
  try {    
    // Sử dụng .lean() để lấy object thuần cho nhẹ và xử lý nhanh
    const allCategories = await Category.find({}).sort({ createdAt: -1 }).lean();

    // 1. Lọc ra các danh mục gốc (Level 0)
    const rootCategories = allCategories.filter(cat => cat.level === 0);

    // 2. Map để đính kèm subcategories (Đảm bảo chuyển ID sang String để so sánh)
    const categoriesWithSubs = rootCategories.map(root => {
      const rootIdStr = root._id.toString(); // Chuyển ID cha về String một lần duy nhất

      return {
        ...root,
        subcategories: allCategories.filter(cat => {
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