import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}`);
    console.log("MongoDB connected DBHost");
  } catch (error) {
    console.log("mongoDB connection error", error);
    process.exit(1);
  }
};

export default connectDB;
