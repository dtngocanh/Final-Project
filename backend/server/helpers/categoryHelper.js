import Category from "../models/Category.js";

// Helper function để lấy ID của category và các con của nó
export const getCategoryIdsWithSub = async (categoryId) => {
  if (!categoryId) return [];

  const subCategories = await Category.find({
    $or: [
      { _id: categoryId }, 
      { path: new RegExp(`,${categoryId},`) }
    ],
  }).select("_id");

  return subCategories.map((cat) => cat._id);
};
