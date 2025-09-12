import { Request, Response } from "express";
import { IUser, User } from "../models/User";
import ErrorResponse from "../utils/errorResponse";
import { ApiResponse } from "../utils/apiResponse";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

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
    const currentUser = (req as any).user as IUser;
    if (!currentUser || !currentUser._id) {
      throw new ErrorResponse(401, "User not authenticated");
    }

    const userToUpvote = await User.findOne({ email }).select(
      "-password -refreshToken"
    );
    if (!userToUpvote) {
      throw new ErrorResponse(404, "User to upvote not found");
    }

    if (currentUser._id.toString() === userToUpvote._id.toString()) {
      throw new ErrorResponse(400, "Cannot upvote yourself");
    }

    const currentUserFull = await User.findById(currentUser._id).select(
      "upvotesGiven"
    );
    if (currentUserFull?.upvotesGiven.includes(userToUpvote._id.toString())) {
      throw new ErrorResponse(400, "You have already upvoted this user");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userToUpvote._id,
      {
        $inc: { upvotes: 1 },
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
    if (error instanceof ErrorResponse) {
      throw error;
    }
    throw new ErrorResponse(500, `Error adding upvote: ${error}`);
  }
};

const removeUpvote = async (req: Request, res: Response) => {
  const { userName, email } = req.body;
  if (!userName || !email) {
    throw new ErrorResponse(400, "email or username missing");
  }

  try {
    const currentUser = (req as any).user as IUser;
    if (!currentUser || !currentUser._id) {
      throw new ErrorResponse(401, "User not authenticated");
    }

    const userToUpdate = await User.findOne({ email }).select(
      "-password -refreshToken"
    );
    if (!userToUpdate) {
      throw new ErrorResponse(404, "User not found");
    }

    if (currentUser._id.toString() === userToUpdate._id.toString()) {
      throw new ErrorResponse(400, "Cannot remove upvote from yourself");
    }

    const currentUserFull = await User.findById(currentUser._id).select(
      "upvotesGiven"
    );
    if (!currentUserFull?.upvotesGiven.includes(userToUpdate._id.toString())) {
      throw new ErrorResponse(400, "You haven't upvoted this user");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userToUpdate._id,
      {
        $inc: { upvotes: -1 },
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
    if (error instanceof ErrorResponse) {
      throw error;
    }
    throw new ErrorResponse(500, `Error removing upvote: ${error}`);
  }
};

const updateUpvoteList = async (req: Request, res: Response) => {
  const { userName, email } = req.body;

  console.log("updateUpvoteList called with:", { userName, email });

  if (!userName || !email) {
    throw new ErrorResponse(400, "email or username missing");
  }

  try {
    const currentUser = (req as any).user as IUser;
    if (!currentUser || !currentUser._id) {
      console.error("No authenticated user found in request");
      throw new ErrorResponse(
        401,
        "User not authenticated - please log in again"
      );
    }

    const userToUpvote = await User.findOne({ email }).select(
      "_id userName email"
    );
    if (!userToUpvote) {
      console.error("User to upvote not found:", email);
      throw new ErrorResponse(404, "User to upvote not found");
    }

    if (currentUser._id.toString() === userToUpvote._id.toString()) {
      throw new ErrorResponse(400, "Cannot upvote yourself");
    }

    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      {
        $addToSet: {
          upvotesGiven: userToUpvote._id.toString(),
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
      .json(
        new ApiResponse(200, updatedUser, "upvote list updated successfully")
      );
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
          upvotesGiven: userToRemove._id.toString(),
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
    if (error instanceof ErrorResponse) {
      throw error;
    }
    throw new ErrorResponse(500, `Error removing from upvote list: ${error}`);
  }
};

const checkUpvoteStatus = async (req: Request, res: Response) => {
  const { email } = req.query;

  if (!email) {
    throw new ErrorResponse(400, "email missing");
  }

  try {
    const currentUser = (req as any).user as IUser;
    if (!currentUser || !currentUser._id) {
      throw new ErrorResponse(401, "User not authenticated");
    }

    const userToCheck = await User.findOne({ email }).select("_id");
    if (!userToCheck) {
      throw new ErrorResponse(404, "User not found");
    }

    const currentUserFull = await User.findById(currentUser._id).select(
      "upvotesGiven"
    );
    const hasUpvoted =
      currentUserFull?.upvotesGiven.includes(userToCheck._id.toString()) ||
      false;

    return res
      .status(200)
      .json(new ApiResponse(200, { hasUpvoted }, "Upvote status retrieved"));
  } catch (error) {
    console.error("Check upvote status error:", error);
    if (error instanceof ErrorResponse) {
      throw error;
    }
    throw new ErrorResponse(500, `Error checking upvote status: ${error}`);
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

const sendVerificationMail = async (accessToken: String, sender: String) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_APP_PASS,
    },
  });
  await transporter
    .sendMail({
      from: "gupshup.website@gmail.com",
      to: `${sender}`,
      subject: "Gupshup Email Verification",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - GupShup</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5; padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border:2px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <tr>
                        <td bgcolor="#FDC62E" style="padding:20px 0; text-align:center;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px 20px 30px 20px; text-align:center; background:#ffffff;">
                            <div style="margin-bottom:20px;">
                                <img src="https://i.ibb.co/dmBT1Sj/mug-icon.png" alt="GupShup Logo" width="60" style="display:block; margin:0 auto;">
                            </div>
                            <h1 style="margin:0; font-size:48px; font-weight:bold; color:#000; font-family: Arial, sans-serif; letter-spacing:-1px;">
                                GupShup
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px; background:#ffffff;">
                            <!-- Grey content box with margins -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding:40px 30px 50px 30px; background:#e8e8e8; text-align:center;">
                                        <h2 style="margin:0 0 30px 0; font-size:36px; font-weight:bold; color:#000; font-family: Arial, sans-serif;">
                                            Email Verification
                                        </h2>
                                        <p style="margin:0 0 40px 0; font-size:16px; line-height:1.5; color:#000; font-family: Arial, sans-serif;">
                                            Hi, there was a recent login to <span style="color:#FDC62E; font-weight:bold;">gupshup</span> from your<br>
                                            email id, if it was you please verify it by clicking the<br>
                                            button below
                                        </p>
                                        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                                            <tr>
                                                <td>
                                                    <a href="http://localhost:5000/api/auth/verifyEmail/${accessToken}"
                                                       style="display:inline-block; background:#FDC62E; color:#000000; text-decoration:none;
                                                              padding:15px 40px; font-weight:bold; font-size:18px; font-family: Arial, sans-serif;
                                                              border:none; cursor:pointer;">
                                                        Verify
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="margin:60px 0 0 0; font-size:16px; color:#000; font-family: Arial, sans-serif;">
                                            if not just ignore this email, thanks for your time :D
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
    })
    .then((info: any) => {
      console.log("Message sent: %s", info.messageId);
    })
    .catch(console.error);
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

    sendVerificationMail(accessToken, user.email);

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

const resetPassword = async (req: Request, res: Response) => {
  const { newPass, id, token } = req.body;

  try {
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(400).json({ message: "user does not exists" });
    }

    const secret = process.env.ACCESS_TOKEN_SECRET + user.password;

    const verify = jwt.verify(token, secret);

    const encrypt = await bcrypt.hash(newPass, 10);

    await User.updateOne({ _id: id }, { $set: { password: encrypt } });

    await user.save();

    res.status(200).json({ message: "password reset done" });
  } catch (error) {
    throw error;
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

const verifyEmail = async (token: string) => {
  try {
    if (!token) {
      throw new ErrorResponse(401, "No access token found");
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
    ) as unknown as DecodedToken;

    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ErrorResponse(404, "User not found");
    }

    const verifiedUser = await User.findByIdAndUpdate(
      decoded._id,
      {
        $set: {
          isVerified: true,
        },
      },
      { new: true }
    ).select("-password -refreshToken");

    if (!verifiedUser) {
      throw new ErrorResponse(404, "User not found");
    }

    return {
      success: true,
      user: verifiedUser,
      message: "Email Verified Successfully",
    };
  } catch (error) {
    console.error("email verification error:", error);
    throw error;
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user as IUser;
    if (!currentUser || !currentUser._id) {
      throw new ErrorResponse(401, "User not authenticated");
    }

    const user = await User.findById(currentUser._id);
    if (!user) {
      throw new ErrorResponse(404, "User not found");
    }

    await User.findByIdAndDelete(currentUser._id);

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
      .json(new ApiResponse(200, {}, "User deleted successfully"));
  } catch (error) {
    console.error("Delete user error:", error);
    if (error instanceof ErrorResponse) {
      throw error;
    }
    throw new ErrorResponse(500, `Error deleting user: ${error}`);
  }
};

const updateAvatar = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user as IUser;
    if (!currentUser || !currentUser._id) {
      throw new ErrorResponse(401, "User not authenticated");
    }

    if (!req.file) {
      throw new ErrorResponse(400, "No file uploaded");
    }

    const base64Image = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;
    const avatarDataUrl = `data:${mimeType};base64,${base64Image}`;

    const sizeInKB = Math.round((base64Image.length * 0.75) / 1024);
    console.log(
      `Avatar upload - User: ${currentUser._id}, Size: ${sizeInKB}KB`
    );

    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { avatar: avatarDataUrl },
      { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
      throw new ErrorResponse(404, "User not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
  } catch (error) {
    console.error("Update avatar error:", error);
    if (error instanceof ErrorResponse) {
      throw error;
    }
    throw new ErrorResponse(500, `Error updating avatar: ${error}`);
  }
};

const resetPassLink = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ 
        success: false, 
        message: "Email not found in system" 
      });
  }

  const secret = process.env.ACCESS_TOKEN_SECRET + user.password;

  const token = jwt.sign({ id: user._id, email: user.email }, secret, {
    expiresIn: "1h",
  });

  const url = `http://localhost:3000/resetPass?id=${user._id}&token=${token}`;
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_APP_PASS,
    },
  });

  await transporter
    .sendMail({
      from: "gupshup.website@gmail.com",
      to: `${email}`,
      subject: "Password Reset",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - GupShup</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5; padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border:2px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <tr>
                        <td bgcolor="#FDC62E" style="padding:20px 0; text-align:center;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px 20px 30px 20px; text-align:center; background:#ffffff;">
                            <div style="margin-bottom:20px;">
                                <img src="https://i.ibb.co/dmBT1Sj/mug-icon.png" alt="GupShup Logo" width="60" style="display:block; margin:0 auto;">
                            </div>
                            <h1 style="margin:0; font-size:48px; font-weight:bold; color:#000; font-family: Arial, sans-serif; letter-spacing:-1px;">
                                GupShup
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px; background:#ffffff;">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding:40px 30px 50px 30px; background:#e8e8e8; text-align:center;">
                                        <h2 style="margin:0 0 30px 0; font-size:36px; font-weight:bold; color:#000; font-family: Arial, sans-serif;">
                                            Password Reset
                                        </h2>
                                        <p style="margin:0 0 40px 0; font-size:16px; line-height:1.5; color:#000; font-family: Arial, sans-serif;">
                                            Hi, there was a reset password request on your<br>
                                            email id, if it was you please reset your password it by clicking the<br>
                                            button below
                                        </p>
                                        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                                            <tr>
                                                <td>
                                                    <a href=${url}
                                                       style="display:inline-block; background:#FDC62E; color:#000000; text-decoration:none;
                                                              padding:15px 40px; font-weight:bold; font-size:18px; font-family: Arial, sans-serif;
                                                              border:none; cursor:pointer;">
                                                        Reset Password
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="margin:60px 0 0 0; font-size:16px; color:#000; font-family: Arial, sans-serif;">
                                            if not just ignore this email, thanks for your time :D
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
    })
    .then((info: any) => {
      console.log("Message sent: %s", info.messageId);
    })
    .catch(console.error);

    return res.status(200).json({
      success: true,
      message: "Password reset link sent successfully"
    });
  } catch (error) {
    console.error("Reset password link error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send reset link"
    });
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
  checkUpvoteStatus,
  deleteUser,
  updateAvatar,
  sendVerificationMail,
  verifyEmail,
  resetPassLink,
  resetPassword,
};
