import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";
// import fileUpload from 'express-fileupload';

// Import Routes
import userRouter from "./routes/userRoute.js";
import adminRouter from "./routes/adminRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import aiRouter from "./routes/aiRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import recRouter from "./routes/recommendationRoute.js";
import productAdRouter from "./routes/admin/productRoute.js";

// Import Controllers & Middlewares
import { stripeWebhook } from "./controllers/webhookController.js";
import { errorMiddleware } from "./middlewares/error.js";
import interactionRouter from "./routes/interactionRoute.js";
import recipeRouter from "./routes/recipeRoute.js";

const app = express();
const port = process.env.PORT || 4000;
// const allowedOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL];

const allowedOrigins = [
  'https://freshmart-8gbr.onrender.com',       
  'https://freshmart-dashboard.onrender.com',  
  'http://localhost:5173',                     
  'http://localhost:5174'
];

// 1. Stripe Webhook 
app.post(
  "/payment/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// 2. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.use(fileUpload());

app.use(cors({
  origin: function (origin, callback) {
    // Cho phép các request không có origin (như Postman hoặc lệnh curl nội bộ)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Bị chặn bởi cấu hình CORS của Freshmart!'));
    }
  },
  credentials: true // Bắt buộc phải có để gửi kèm cookie/token (withCredentials)
}));


const startServer = async () => {
  try {
    // 4. Kết nối Database & Cloudinary
    await connectDB();
    await connectCloudinary();

    // 5. Định nghĩa các Route chính
    app.get("/", (req, res) => res.send("API Veganic Mart is working"));

    app.use("/user", userRouter);
    app.use("/admin", adminRouter);
    app.use("/product", productRouter);
    app.use("/cart", cartRouter);
    app.use("/address", addressRouter);
    app.use("/order", orderRouter);
    app.use("/payment", paymentRouter);
    app.use("/category", categoryRouter);
    app.use("/interaction", interactionRouter);
    app.use("/ai", aiRouter);
    app.use("/recommendations", recRouter);
    app.use("/admin/products",productAdRouter);
    app.use("/recipes",recipeRouter);

    // 6. Xử lý lỗi tập trung
    app.use(errorMiddleware);

    // 7. Khởi động Server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Lỗi khởi động server:", error);
  }
};

startServer();