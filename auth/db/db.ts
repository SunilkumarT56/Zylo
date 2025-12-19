import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
mongoose.set("bufferCommands", false);
const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected");
    });
    mongoose.connection.on("error", (error) => {
      console.error(error);
    });
    await mongoose.connect(`${process.env.MONGO_URI}/auth-2`, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  } catch (error) {
    console.error(error);
  }
};

export default connectDB;
