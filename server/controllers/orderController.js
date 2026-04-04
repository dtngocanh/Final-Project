import Order from "../models/Order.js";
// export const placeOrderCOD = async (req, res) => {
//     try {
//         const userId = req.user._id;
//         const { selectedItems, shippingInfo } = req.body;

//         // 1. Lấy cart
//         const cart = await Cart.findOne({ user: userId });

//         if (!cart) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Cart not found"
//             });
//         }

//         // 2. Lọc item được chọn
//         const selectedCartItems = cart.cartItems.filter(item =>
//             selectedItems.includes(item._id.toString())
//         );

//         if (selectedCartItems.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "No items selected"
//             });
//         }

//         // 3. Convert sang orderItems
//         const orderItems = selectedCartItems.map(item => ({
//             product: item.product,
//             name: item.name,
//             price: item.price,
//             quantity: item.quantity,
//             image: item.image
//         }));

//         // 4. Tính giá
//         const itemsPrice = orderItems.reduce(
//             (acc, item) => acc + item.price * item.quantity,
//             0
//         );

//         const shippingPrice = itemsPrice > 500000 ? 0 : 30000;
//         const totalPrice = itemsPrice + shippingPrice;

//         // 5. Tạo order
//         const order = await Order.create({
//             buyer: userId,
//             orderItems,
//             shippingInfo,
//             paymentInfo: {
//                 paymentType: "COD",
//                 paymentStatus: "Pending"
//             },
//             itemsPrice,
//             shippingPrice,
//             totalPrice,
//             orderStatus: "Pending"
//         });

//         // 6. XÓA CHỈ NHỮNG ITEM ĐÃ ORDER
//         cart.cartItems = cart.cartItems.filter(item =>
//             !selectedItems.includes(item._id.toString())
//         );

//         await cart.save();

//         res.status(201).json({
//             success: true,
//             message: "Order placed with selected items",
//             order
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// get orders for user 
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user._id; // Middleware truyền vào
        // console.log(userId);


        const orders = await Order.find({ user: userId })
            .sort({ created_at: -1 }); // mới nhất trước

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const cancelOrder = async (req, res) => {
    try {

        const { orderId } = req.body;
        const userId = req.user._id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (order.user.toString() !== userId.toString()) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        if (order.orderStatus !== "Processing") {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel this order"
            });
        }
        order.orderStatus = "Canceled";
        await order.save();
        res.status(200).json({ success: true, message: "Order canceled" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// get all product for seller: api/order/seller
export const getAllOrders = async (req, res) => {
    try {

        const orders = await Order.find({
            $or: [
                { "paymentInfo.paymentType": "COD" },
                { "paymentInfo.paymentStatus": "Paid" }
            ]
        })
            .populate("orderItems.product")
            .sort({ created_at: -1 });

        res.json({
            success: true,
            orders
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};