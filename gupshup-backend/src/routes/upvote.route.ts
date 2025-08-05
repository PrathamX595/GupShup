import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";

import {
  addUpvote,
  updateUpvoteList,
  removeFromUpvoteList,
  removeUpvote,
} from "../controllers/user.controller";

const router = Router();

router.route("/add").put(verifyJWT, (req, res, next) => {
  addUpvote(req, res).catch(next);
});

router.route("/addInList").put(verifyJWT, (req, res, next) => {
  updateUpvoteList(req, res).catch(next);
});

router.route("/remove").put(verifyJWT, (req, res, next) => {
  removeUpvote(req, res).catch(next);
});

router.route("/removeFromList").put(verifyJWT, (req, res, next) => {
  removeFromUpvoteList(req, res).catch(next);
});

export default router;