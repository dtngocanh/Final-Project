import 'dotenv/config';
import express from "express";
import connectDB from "./configs/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoute.js";
import sellerRouter from "./routes/sellerRoute.js";
import connectCloudinary from "./configs/cloudinary.js";
import productRouter from "./routes/productRoute.js";
import fileUpload from "express-fileupload";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";
import { stripeWebhook } from './controllers/stripeController.js';
import paymentRouter from './routes/paymentRoute.js';
import aiRouter from "./routes/aiRoute.js";

const app = express();
const port = process.env.PORT || 4000;
const allowedOrigins = [
    process.env.FRONTEND_URL, 
    process.env.ADMIN_URL
];

app.post(
  '/api/payment/webhook', 
  express.raw({ type: 'application/json' }), 
  stripeWebhook
);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: function (origin, callback) {
        // 1. Allow requests with no origin (like mobile apps or Stripe CLI/Postman)
        // 2. Check if the incoming origin is in our allowed list
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true // Required for cookies/sessions
}));
app.use(fileUpload());

await connectDB();
await connectCloudinary();


app.get('/', (req, res) =>res.send("API is working") );
app.use('/api/user', userRouter);
app.use('/api/seller',sellerRouter);
app.use('/api/product',productRouter);
app.use('/api/cart',cartRouter);
app.use('/api/address',addressRouter);
app.use('/api/order',orderRouter);
app.use('/api/payment',paymentRouter);
app.use('/api/ai', aiRouter);

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);   
})
