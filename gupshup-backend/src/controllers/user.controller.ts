import { Request, Response } from "express";
import { IUser, User } from "../models/User";
import ErrorResponse from "../utils/errorResponse";
import { ApiResponse } from "../utils/apiResponse";
import jwt from "jsonwebtoken";
import passport from "passport";

const frontendurl = process.env.FRONTEND_URL;

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
      "Something went wrong while generating access and refresh tokens"
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
      process.env.REFRESH_TOKEN_SECRET
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
          "access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ErrorResponse(
      500,
      "Something went wrong while refreshing access Token"
    );
  }
};

const login = async (req: Request, res: Response) => {
  const { email, userName, password } = req.body;
  if (!email || !userName || !password) {
    throw new ErrorResponse(400, "Missing fields");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ErrorResponse(400, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ErrorResponse(500, "wrong Password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!loggedInUser) {
    throw new ErrorResponse(404, "User not logged in");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "Successful login"
      )
    );
};

const logout = async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(
    (req.user as IUser)?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
};

const getCurrentUser = async (req: Request, res: Response) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "user extraction successful"));
};

const updateDetails = async (req: Request, res: Response) => {
  const { userName, email } = req.body;
  if (!userName || !email) {
    throw new ErrorResponse(400, "fullname or email missing");
  }
  const user = await User.findByIdAndUpdate(
    (req.user as IUser)?._id,
    {
      $set: {
        userName: userName,
        email: email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ErrorResponse(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "detailes updated successfully"));
};

const changePassword = async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById((req.user as IUser)?._id);
    if (!user) {
      throw new ErrorResponse(404, "User not found");
    }
    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
      throw new ErrorResponse(401, "password is not correct");
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "successfully changed the password"));
  } catch (error) {
    throw new ErrorResponse(
      500,
      "Something went wrong while updating the password"
    );
  }
};

const googleLogin = async (req: Request, res: Response) => {
  const user = req.user as IUser;

  const payload = {
      _id: user._id,
      userName: user.userName,
      email: user.email,
    };
  
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw new Error("access token secret is not defined");
    }
  
    const options = {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY as any,
    };

    const token = jwt.sign(payload, secret, options)

    res.redirect(`${frontendurl}/`);
};

export {
  generateAccessAndRefreshToken,
  refreshAccessToken,
  login,
  logout,
  getCurrentUser,
  updateDetails,
  changePassword,
  googleLogin
};
