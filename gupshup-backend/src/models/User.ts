import mongoose, { Document, Schema, Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";

interface IUser extends Document {
  _id: string;
  userName: string;
  email: string;
  avatar: string;
  createdAt: Date;
  password: string;
  refreshToken: string;
  upvotesGiven: string[];
  upvotes: number;

  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const UserSchema: Schema<IUser> = new Schema({
  _id: { type: String, default: uuidv4 },
  userName: { type: String, required: true, trim: true },
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
  refreshToken: { type: String },
  upvotesGiven: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  upvotes: { type: Number, default: 0 },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.isPasswordCorrect = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = function () {
  const payload = {
    _id: this._id,
    userName: this.userName,
    email: this.email,
    avatar: this.avatar,
  };

  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error("access token secret is not defined");
  }

  const options: SignOptions = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY as any,
  };
  return jwt.sign(payload, secret, options);
};

UserSchema.methods.generateRefreshToken = function () {
  const payload = {
    _id: this._id,
    userName: this.userName,
    email: this.email,
  };

  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error("refresh token secret is not defined");
  }

  const options: SignOptions = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY as any,
  };
  return jwt.sign(payload, secret, options);
};

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export { User, IUser };
