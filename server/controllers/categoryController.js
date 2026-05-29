import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
  try {    
    const allCategories = await Category.find({}).sort({ createdAt: -1 }).lean();

    const rootCategories = allCategories.filter(cat => cat.level === 0);

    const categoriesWithSubs = rootCategories.map(root => {
      return {
        ...root,
        subcategories: allCategories.filter(
          cat => cat.parent && cat.parent.toString() === root._id.toString()
        ),
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