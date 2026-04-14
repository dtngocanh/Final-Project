import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
  try {    
    const categories = await Category.find({}).sort({ level: 1 });
    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};