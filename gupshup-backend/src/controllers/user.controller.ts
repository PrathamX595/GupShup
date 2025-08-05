import { Request, Response } from "express";
import { IUser, User } from "../models/User";
import ErrorResponse from "../utils/errorResponse";
import { ApiResponse } from "../utils/apiResponse";
import jwt from "jsonwebtoken";

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

const addUpvote = async (req: Request, res: Response) => {
  const { userName, email } = req.body;
  if (!userName || !email) {
    throw new ErrorResponse(400, "email or username missing");
  }

  try {
    const userToUpvote = await User.findOne({ email }).select("-password -refreshToken");
    if (!userToUpvote) {
      throw new ErrorResponse(404, "User to upvote not found");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userToUpvote._id,
      {
        $inc: { upvotes: 1 }
      },
      { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
      throw new ErrorResponse(404, "Failed to update user upvotes");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Upvote added successfully"));
  } catch (error) {
    console.error("Add upvote error:", error);
    throw new ErrorResponse(500, `Error adding upvote: ${error}`);
  }
};

const removeUpvote = async (req: Request, res: Response) => {
  const { userName, email } = req.body;
  if (!userName || !email) {
    throw new ErrorResponse(400, "email or username missing");
  }

  try {
    const userToUpdate = await User.findOne({ email }).select("-password -refreshToken");
    if (!userToUpdate) {
      throw new ErrorResponse(404, "User not found");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userToUpdate._id,
      {
        $inc: { upvotes: -1 }
      },
      { new: true }
    ).select("-password -refreshToken");

    if (updatedUser && updatedUser.upvotes < 0) {
      updatedUser.upvotes = 0;
      await updatedUser.save();
    }

    if (!updatedUser) {
      throw new ErrorResponse(404, "Failed to update user upvotes");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Upvote removed successfully"));
  } catch (error) {
    console.error("Remove upvote error:", error);
    throw new ErrorResponse(500, `Error removing upvote: ${error}`);
  }
};

const updateUpvoteList = async (req: Request, res: Response) => {
  const { userName, email } = req.body;
  
  console.log("updateUpvoteList called with:", { userName, email });
  console.log("req.user:", (req as any).user);
  
  if (!userName || !email) {
    throw new ErrorResponse(400, "email or username missing");
  }

  try {
    // Type assertion for authenticated user
    const currentUser = (req as any).user as IUser;
    if (!currentUser || !currentUser._id) {
      console.error("No authenticated user found in request");
      throw new ErrorResponse(401, "User not authenticated - please log in again");
    }

    // Find the user to upvote
    const userToUpvote = await User.findOne({ email }).select("_id userName email");
    if (!userToUpvote) {
      console.error("User to upvote not found:", email);
      throw new ErrorResponse(404, "User to upvote not found");
    }

    // Check if user is trying to upvote themselves
    if (currentUser._id.toString() === userToUpvote._id.toString()) {
      throw new ErrorResponse(400, "Cannot upvote yourself");
    }

    console.log("Current user ID type:", typeof currentUser._id, currentUser._id);
    console.log("Target user ID type:", typeof userToUpvote._id, userToUpvote._id);

    // Update the current user's upvotesGiven array
    // Since both _id values are strings (UUIDs), this should work correctly now
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      {
        $addToSet: {
          upvotesGiven: userToUpvote._id.toString(), // Ensure it's a string
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
      console.error("Failed to update current user:", currentUser._id);
      throw new ErrorResponse(404, "Failed to update user upvote list");
    }

    console.log("Successfully updated upvote list for user:", currentUser._id);
    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "upvote list updated successfully"));
      
  } catch (error) {
    console.error("Update upvote list error:", error);
    if (error instanceof ErrorResponse) {
      throw error;
    }
  }
};

const removeFromUpvoteList = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    throw new ErrorResponse(400, "email missing");
  }

  try {
    const currentUser = (req as any).user as IUser;
    if (!currentUser || !currentUser._id) {
      throw new ErrorResponse(401, "User not authenticated");
    }

    const userToRemove = await User.findOne({ email }).select("_id");
    if (!userToRemove) {
      throw new ErrorResponse(404, "User to remove not found");
    }

    const user = await User.findByIdAndUpdate(
      currentUser._id,
      {
        $pull: {
          upvotesGiven: userToRemove._id,
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    if (!user) {
      throw new ErrorResponse(404, "Current user not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "upvote list updated successfully"));
  } catch (error) {
    console.error("Remove from upvote list error:", error);
    throw new ErrorResponse(500, `Error removing from upvote list: ${error}`);
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
  try {
    const currentUser = (req as any).user as IUser;
    if (currentUser && currentUser._id) {
      await User.findByIdAndUpdate(
        currentUser._id,
        {
          $set: {
            refreshToken: undefined,
          },
        },
        { new: true }
      );
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    } as const;

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
  } catch (error) {
    console.error("Logout error:", error);
    
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    } as const;

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
  }
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
  addUpvote,
  removeUpvote,
  removeFromUpvoteList,
  updateUpvoteList,
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
