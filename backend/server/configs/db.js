import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', ()=> console.log("MongoDB Connected")
    );
    await mongoose.connect(`${process.env.MONGODB_URI}/ecommerce_db`);

  } catch (error) {
    console.error("MongoDB connection error:", error.message);
  }
};

export default connectDB;