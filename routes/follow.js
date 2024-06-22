import { Router } from "express";
import { ensureAuth } from "../middlewares/auth.js";
import {
  followTestController,
  getFollowersController,
  getFollowsController,
  registerFollowController,
  registerUnfollowController,
} from "../controllers/follow.js";

const followRouter = Router();

followRouter.get("/test", followTestController);
followRouter.post("/follow", ensureAuth, registerFollowController);
followRouter.delete("/unfollow/:id", ensureAuth, registerUnfollowController);
followRouter.get("/following/:id?/:page?", ensureAuth, getFollowsController);
followRouter.get("/followers/:id?/:page?", ensureAuth, getFollowersController);

export default followRouter;
