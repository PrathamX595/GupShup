import { Router } from "express";
import healthCheck from "../controllers/healthCheck.controller";

const router = Router();

router.route("/").get((req, res, next) => {
  healthCheck(req, res).catch(next);
});

export default router;
