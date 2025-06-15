import { Request, Response } from "express";
import { User } from "../models/User";
import ErrorResponse from "../utils/errorResponse";
import { ApiResponse } from "../utils/apiResponse";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorResponse(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ErrorResponse(
      500,
      "Something went wrong while generating access and refresh tokens",
    );
  }
};

const refreshAccessToken = async (req: Request, res: Response) => {
  const incommingRefreshToken =
    req.body.refreshToken || req.cookies.refreshToken;

  if (!incommingRefreshToken) {
    throw new ErrorResponse(401, "Refresh token not found");
  }

  try {
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new ErrorResponse(500, "Refresh token secret is not defined");
    }

    interface DecodedToken extends jwt.JwtPayload {
      _id: string;
    }

    const decodedToken = jwt.verify(
      incommingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    ) as DecodedToken;

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ErrorResponse(401, "user not found");
    }

    if (incommingRefreshToken !== user?.refreshToken) {
      throw new ErrorResponse(401, "Invalid refresh token");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "access token refreshed successfully",
        ),
      );
  } catch (error) {
    throw new ErrorResponse(
      500,
      "Something went wrong while refreshing access Token",
    );
  }
};
