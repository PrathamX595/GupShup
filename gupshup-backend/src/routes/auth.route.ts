import { Router } from "express";
import passport from "passport";
import { googleLogin } from "../controllers/user.controller";

const router = Router();

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/google/callback", passport.authenticate("google", {failureRedirect: "/"}), googleLogin)

export default router