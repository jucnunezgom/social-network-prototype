import { Router } from "express";
import {
  getPostController,
  postTestController,
  savePostController,
} from "../controllers/post.js";
import { ensureAuth } from "../middlewares/auth.js";

const postRouter = Router();

postRouter.get("/test", postTestController);
postRouter.post("/post", ensureAuth, savePostController);
postRouter.get("/get-post/:id", ensureAuth, getPostController);

export default postRouter;
