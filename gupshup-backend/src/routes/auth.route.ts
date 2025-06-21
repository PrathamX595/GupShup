import { Router } from "express";
import passport from "passport";
import { googleLogin, verifyUser } from "../controllers/user.controller";

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

router.route("/verify").get((req, res, next) => {
  verifyUser(req, res).catch(next);
});

export default router;