import mongoose from "mongoose";
import Campaign from "../models/Campaign.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

// 1. Create a new discount campaign
export const createCampaign = async (req, res, next) => {
  try {
    const { targetType, product, category, saleLimit, ...rest } = req.body;

    const campaignData = {
      ...rest,
      targetType,
      saleLimit: saleLimit ? Number(saleLimit) : 0, 
      saleSold: 0, 
      isActive: false // Mặc định khi tạo mới chưa chạy
    };

    // Chuẩn hóa dữ liệu sang mảng products cho DB
    if (targetType === "product" || targetType === "products") {
      campaignData.targetType = "products"; 
      campaignData.products = product ? [product] : [];
      campaignData.category = undefined;
    } else if (targetType === "category") {
      campaignData.category = category;
      campaignData.products = [];
    }

    const newCampaign = await Campaign.create(campaignData);
    res.status(201).json({ success: true, data: newCampaign });
  } catch (error) {
    next(error);
  }
};

// 2. Get all campaigns
export const getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find()
      .populate("category")
      .populate("products");

    res.status(200).json({ success: true, data: campaigns });
  } catch (error) {
    next(error);
  }
};

// 3. Update a campaign
export const updateCampaign = async (req, res, next) => {
  try {
    const { targetType, product, category, saleLimit, ...rest } = req.body;

    const setData = {
      ...rest,
      saleLimit: saleLimit ? Number(saleLimit) : 0,
    };

    let mongooseQuery = {};

    if (targetType === "product" || targetType === "products") {
      setData.targetType = "products";
      setData.products = product ? [product] : [];

      mongooseQuery = {
        $set: setData,
        $unset: { category: "" } 
      };
    } else if (targetType === "category") {
      setData.targetType = "category";
      setData.category = category;

      mongooseQuery = {
        $set: setData,
        $unset: { products: "" } 
      };
    } else {
      setData.targetType = targetType;
      mongooseQuery = { $set: setData };
    }

    const updated = await Campaign.findByIdAndUpdate(
      req.params.id,
      mongooseQuery,
      { new: true, runValidators: true },
    )
      .populate("category")
      .populate("products");

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// =========================================================================
// 4. DELETE A CAMPAIGN (Đã cập nhật tự động đưa giá sale về 0 nếu đang bật)
// =========================================================================
export const deleteCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Tìm chiến dịch trước xem có tồn tại không
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found!" });
    }

    // 2. Nếu chiến dịch đang HOẠT ĐỘNG, phải dọn dẹp đưa giá giảm của sản phẩm về 0
    if (campaign.isActive === true) {
      let filter = {};

      if (campaign.targetType === "category") {
        if (campaign.category) {
          const targetCategoryId = campaign.category.toString();

          const relatedCategories = await Category.find({
            $or: [
              { _id: campaign.category },
              { path: new RegExp(`,${targetCategoryId},`) },
            ],
          });

          const categoryIds = relatedCategories.map((cat) => new mongoose.Types.ObjectId(cat._id));
          filter = { category: { $in: categoryIds } };
        }
      } else {
        const productObjectIds = (campaign.products || []).map(
          (prodId) => new mongoose.Types.ObjectId(prodId),
        );
        filter = { _id: { $in: productObjectIds } };
      }

      // Tiến hành đưa discountPrice về 0 cho các sản phẩm liên quan
      await Product.updateMany(filter, {
        $set: { discountPrice: 0 },
      });
    }

    // 3. Sau khi xử lý giá sản phẩm an toàn, tiến hành xóa chiến dịch khỏi Database
    await Campaign.findByIdAndDelete(id);

    res.status(200).json({ 
      success: true, 
      message: "Campaign deleted successfully and product prices restored!" 
    });
  } catch (error) {
    next(error);
  }
};

// 5. MANUAL TEST TRIGGER: FORCE START OR END DISCOUNT IMMEDIATELY
export const manualTriggerDiscount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.query; 

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found!" });
    }

    let filter = {};

    // Xử lý bộ lọc sản phẩm theo danh mục đa cấp
    if (campaign.targetType === "category") {
      if (!campaign.category) {
        return res.status(400).json({ 
          success: false, 
          message: "Campaign targetType is category but no category ID is attached!" 
        });
      }

      const targetCategoryId = campaign.category.toString();

      const relatedCategories = await Category.find({
        $or: [
          { _id: campaign.category },
          { path: new RegExp(`,${targetCategoryId},`) },
        ],
      });

      const categoryIds = relatedCategories.map((cat) => new mongoose.Types.ObjectId(cat._id));
      filter = { category: { $in: categoryIds } };
    } else {
      const productObjectIds = (campaign.products || []).map(
        (prodId) => new mongoose.Types.ObjectId(prodId),
      );
      filter = { _id: { $in: productObjectIds } };
    }

    if (action === "start") {
      const discountPercent = Number(campaign.discountPercent) || 0;
      const rate = (100 - discountPercent) / 100;

      // Tính toán và cập nhật giá giảm cho các sản phẩm
      const result = await Product.updateMany(
        filter, 
        [
          { $set: { discountPrice: { $multiply: ["$price", rate] } } }
        ],
        { updatePipeline: true }
      );

      // Cập nhật trạng thái chiến dịch thành hoạt động (true) và reset số suất đã bán về 0
      await Campaign.findByIdAndUpdate(id, { 
        isActive: true,
        saleSold: 0 
      });

      return res.status(200).json({
        success: true,
        message: `Discount activated for: ${campaign.name}. Counter reset to 0.`,
        updatedCount: result.modifiedCount || result.nModified || 0,
      });
    } else if (action === "end") {
      // Khôi phục giá ưu đãi về 0 khi tắt chiến dịch
      const result = await Product.updateMany(filter, {
        $set: { discountPrice: 0 },
      });

      // Cập nhật trạng thái chiến dịch thành dừng (false)
      await Campaign.findByIdAndUpdate(id, { isActive: false });

      return res.status(200).json({
        success: true,
        message: "Discount deactivated, original price restored!",
        updatedCount: result.modifiedCount || result.nModified || 0,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid action! Use either 'start' or 'end'.",
    });
  } catch (error) {
    next(error);
  }
};