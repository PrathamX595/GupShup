import { Router } from "express";
import passport from "passport";
import { verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../config/multer";
import {
  googleLogin,
  login,
  logout,
  registerUser,
  verifyUser,
  deleteUser,
  updateDetails,
  changePassword,
  updateAvatar,
  verifyEmail,
  resetPassLink,
  resetPassword
} from "../controllers/user.controller";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  googleLogin
);

router.route("/register").post((req, res, next) => {
  registerUser(req, res).catch(next);
});

router.route("/logout").get(verifyJWT, (req, res, next) => {
  logout(req, res).catch(next);
});

router.route("/login").post((req, res, next) => {
  login(req, res).catch(next);
});

router.route("/verify").get((req, res, next) => {
  verifyUser(req, res).catch(next);
});

router.route("/verifyEmail/:something").get(async (req, res, next) => {
  try {
    const token = req.params.something;
    const result = await verifyEmail(token);
    
    if (result.success) {
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}?emailVerified=true`);
    }
  } catch (error) {
    console.error("Email verification route error:", error);
    return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}?emailVerified=false&error=verification_failed`);
  }
});

router.route("/delete").delete(verifyJWT, (req, res, next) => {
  deleteUser(req, res).catch(next);
});

router.route("/update").put(verifyJWT, (req, res, next) => {
  updateDetails(req, res).catch(next);
});

router.route("/update-pass").put(verifyJWT, (req, res, next) => {
  changePassword(req, res).catch(next);
});

router.route("/resetLink").put((req, res, next) => {
  resetPassLink(req, res).catch(next);
})

router.route("/resetPass").put((req, res, next) => {
  resetPassword(req, res).catch(next);
})

router
  .route("/update-avatar")
  .put(verifyJWT, upload.single("avatar"), (req, res, next) => {
    updateAvatar(req, res).catch(next);
  });

export default router;
