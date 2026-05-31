// ../controllers/notificationController.js
import Notification from "../models/Notification.js";

export const getMyNotifications = async (req, res, next) => {
  try {
    // Lấy thông báo của user hiện tại, sắp xếp cái mới nhất lên đầu
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20); // Giới hạn lấy 20 cái gần nhất

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};