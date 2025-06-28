import { Request, Response } from "express";
import { IUser, User } from "../models/User";
import ErrorResponse from "../utils/errorResponse";
import { ApiResponse } from "../utils/apiResponse";
import jwt, { SignOptions } from "jsonwebtoken";

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
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ErrorResponse(400, "Missing fields");
  }

  const user = await User.findOne({
    $or: [{ email }],
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

const registerUser = async (req: Request, res: Response) => {
  try {
    const { userName, email, password } = req.body;
    if (!email || !userName || !password) {
      throw new ErrorResponse(400, "Missing fields");
    }
    let user = await User.findOne({ email: email });

    if (user) {
      return res
        .status(409)
        .json(
          new ApiResponse(409, null, "User with this email already exists")
        );
    }

    user = await User.create({
      userName: userName,
      email: email,
      password: password,
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          201,
          { user: createdUser, accessToken, refreshToken },
          "User registered successfully"
        )
      );
  } catch (error) {
    throw new ErrorResponse(
      400,
      `something went wrong while registering user: ${error}`
    );
  }
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
  try {
    const user = req.user as IUser;

    if (!user) {
      throw new Error("Authentication failed - no user data");
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw new Error("access token secret is not defined");
    }

    const options: SignOptions = {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY as any,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    };

    return res
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .redirect(process.env.FRONTEND_URL || "http://localhost:3000");
  } catch (error) {
    return res.redirect(
      `${frontendurl || "http://localhost:3000"}/login?error=authentication_failed`
    );
  }
};

const verifyUser = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res
        .status(401)
        .json({ authenticated: false, message: "No access token found" });
    }
    interface DecodedToken extends jwt.JwtPayload {
      _id: string;
      userName: string;
      email: string;
      avatar?: string;
    }
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as DecodedToken;

    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json({ authenticated: false });
    }

    return res.status(200).json({
      authenticated: true,
      user: user,
    });
  } catch (error) {
    console.error("Auth verification error:", error);
    return res.status(401).json({ authenticated: false });
  }
};

export {
  generateAccessAndRefreshToken,
  refreshAccessToken,
  login,
  logout,
  getCurrentUser,
  updateDetails,
  changePassword,
  googleLogin,
  registerUser,
  verifyUser,
};
