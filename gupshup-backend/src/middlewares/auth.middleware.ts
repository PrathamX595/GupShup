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
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
    if (!user) {
      console.error("Token details:", decodedToken);
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      });
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      });
      
      throw new ErrorResponse(401, "Invalid access token - user not found");
    }
    
    (req as any).user = user;
    console.log("Auth middleware - user authenticated:", user._id);
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      throw new ErrorResponse(401, "Invalid access token");
    }
    
    if (error instanceof ErrorResponse) {
      throw error;
    }
    
    throw new ErrorResponse(401, "Unauthorized request");
  }
};