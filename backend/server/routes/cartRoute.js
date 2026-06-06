import express from "express"
import authUser from "../middlewares/authUser.js";
import { addCombo, addToCart, bulkAddCart, clearCart, getCart, removeFromCart, updateCart, updateQty } from "../controllers/cartController.js";

const cartRouter = express.Router()

cartRouter.post('/update',authUser,updateCart)
cartRouter.get('/get',authUser,getCart)
cartRouter.post('/add-combo',authUser,addCombo)
cartRouter.post('/add',authUser,addToCart)
cartRouter.post('/bulk-add',authUser,bulkAddCart)
cartRouter.post('/remove',authUser,removeFromCart)
cartRouter.post('/update-qty',authUser,updateQty)
cartRouter.post('/clear',authUser,clearCart)

export default cartRouter;