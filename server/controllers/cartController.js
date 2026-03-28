import User from "../models/User.js";

//update user cartData: api/cart/update

export const updateCart = async (req, res) => {
    try {
        const userId = req.user._id;  //token
        const { cartItems } = req.body;

        await User.findByIdAndUpdate(userId, { cartItems })
        res.json({ success: true, message: "Cart Updated" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })

    }

}
// get cart for a user: api/cart/get
export const getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("cartItems.product");
        res.json({ success: true, cartItems: user.cartItems });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}