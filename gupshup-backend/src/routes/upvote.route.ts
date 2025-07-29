import { Router } from "express";

import {
  addUpvote,
  updateUpvoteList,
  removeFromUpvoteList,
  removeUpvote,
} from "../controllers/user.controller";

const router = Router();

router.route("/add").put((req, res, next) => {
  addUpvote(req, res).catch(next);
});

router.route("/addInList").put((req, res, next) => {
  updateUpvoteList(req, res).catch(next);
});

router.route("/remove").put((req, res, next) => {
  removeUpvote(req, res).catch(next);
});

router.route("/removeFromList").put((req, res, next) => {
  removeFromUpvoteList(req, res).catch(next);
});

export default router;
