import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";

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

// Import Controllers & Middlewares
import { stripeWebhook } from "./controllers/stripeController.js";
import { errorMiddleware } from "./middlewares/error.js";
import interactionRouter from "./routes/interactionRoute.js";
// import watchOrders from "./helpers/aiWatcher.js";

const app = express();
const port = process.env.PORT || 4000;
const allowedOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL];

// 1. Stripe Webhook 
app.post(
  "/api/payment/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

// 2. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Cấu hình CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
const startServer = async () => {
  try {
    // 4. Kết nối Database & Cloudinary
    await connectDB();
    // watchOrders();
    await connectCloudinary();

    // 5. Định nghĩa các Route chính
    app.get("/", (req, res) => res.send("API Veganic Mart is working"));

    app.use("/api/user", userRouter);
    app.use("/api/admin", adminRouter);
    app.use("/api/product", productRouter);
    app.use("/api/cart", cartRouter);
    app.use("/api/address", addressRouter);
    app.use("/api/order", orderRouter);
    app.use("/api/payment", paymentRouter);
    app.use("/api/category", categoryRouter);
    app.use("/api/interaction", interactionRouter);
    app.use("/api/ai", aiRouter);

    // 6. Xử lý lỗi tập trung
    app.use(errorMiddleware);

    // 7. Khởi động Server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {}
};
startServer();
