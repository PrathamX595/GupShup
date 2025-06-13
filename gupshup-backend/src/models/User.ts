import mongoose, { Document, Schema, Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

interface IUser extends Document {
  _id: string;
  userName: string;
  email: string;
  avatar: string;
  createdAt: Date;
  password: string;
}

const UserSchema: Schema<IUser> = new Schema({
  _id: { type: String, default: uuidv4 },
  userName: { type: String, required: true, lowercase: true, trim: true },
  password: { type: String, required: [true, "password is required"] },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export { User, IUser };
