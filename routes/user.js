import { Router } from "express";
import multer from "multer";
import { ensureAuth } from "../middlewares/auth.js";
import {
  getProfileController,
  getUsersController,
  loginController,
  registerController,
  getAvatarController,
  testController,
  updateUserController,
  uploadFileController,
} from "../controllers/user.js";

const userRouter = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/avatars");
  },
  filename: (req, file, cb) => {
    cb(null, "avatar-" + Date.now() + file.originalname);
  },
});

const uploadConfig = multer({ storage });

userRouter.post("/test", ensureAuth, testController);
userRouter.post("/register", registerController);
userRouter.post("/login", loginController);
userRouter.get("/profile/:id", ensureAuth, getProfileController);
userRouter.get("/list/:page?", ensureAuth, getUsersController);
userRouter.put("/update", ensureAuth, updateUserController);
userRouter.post(
  "/upload",
  [ensureAuth, uploadConfig.single("file0")],
  uploadFileController
);
userRouter.get("/avatar/:file", ensureAuth, getAvatarController);

export default userRouter;
