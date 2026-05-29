import express from "express"
import authUser from "../middlewares/authUser.js";
import { addCombo, getCart, updateCart } from "../controllers/cartController.js";

const cartRouter = express.Router()

cartRouter.post('/update',authUser,updateCart)
cartRouter.get('/get',authUser,getCart)
cartRouter.post('/add-combo',authUser,addCombo)

export default cartRouter;