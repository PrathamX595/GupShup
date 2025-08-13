import { Router } from "express";
import passport from "passport";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  googleLogin,
  login,
  logout,
  registerUser,
  verifyUser,
  deleteUser
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

router.route("/delete").delete(verifyJWT,(req, res, next) => {
  deleteUser(req, res).catch(next);
});

export default router;
