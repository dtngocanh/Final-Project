// ../utils/notificationHelper.js
import Notification from "../models/Notification.js";

export const createOrderNotification = async (order, status) => {
  try {
    // Nếu là đơn hàng của GUEST (Không có tài khoản) thì không cần lưu vào DB
    if (!order.user) return;

    let title = "";
    let message = "";

   switch (status) {
      case "Shipped":
        title = "Your order is on the way";
        message = `Order #${order._id.toString().slice(-6).toUpperCase()} has been handed over to GHN shipping and is en route to you.`;
        break;
      case "Delivered":
        title = "Order delivered successfully";
        message = `Order #${order._id.toString().slice(-6).toUpperCase()} has been successfully delivered. Thank you for shopping with us!`;
        break;
      case "Canceled":
        title = "Order canceled";
        message = `Order #${order._id.toString().slice(-6).toUpperCase()} has been canceled on the system.`;
        break;
      default:
        return; // Không tạo thông báo cho các trạng thái khác
    }

    // Lưu thông báo vào Database
    await Notification.create({
      user: order.user,
      title,
      message,
      orderId: order._id,
    });

    // 💡 MẸO REAL-TIME: Nếu dự án của bạn có dùng Socket.io, 
    // bạn có thể bắn lệnh emit ở đây để gọi lên giao diện ngay lập tức:
    // global.io.to(order.user.toString()).emit("new_notification", { title, message });

  } catch (error) {
    console.error("[NOTIFICATION ERROR]:", error);
  }
};