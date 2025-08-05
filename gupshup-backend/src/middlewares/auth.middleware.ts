import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import ErrorResponse from "../utils/errorResponse";

export const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
    console.log("Auth middleware - checking token:", !!token);
    
    if (!token) {
      throw new ErrorResponse(401, "Unauthorized request - no token provided");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as any;
    
    console.log("Auth middleware - decoded token:", decodedToken);
    
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
    if (!user) {
      throw new ErrorResponse(401, "Invalid access token - user not found");
    }
    
    (req as any).user = user;
    console.log("Auth middleware - user authenticated:", user._id);
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ErrorResponse(401, "Invalid access token");
    }
    
    if (error instanceof ErrorResponse) {
      throw error;
    }
    
    throw new ErrorResponse(401, "Unauthorized request");
  }
};