import User from "../models/user.js";
import bcrypt from "bcrypt";
import createToken from "../services/jwt.js";
import fs from "fs";
import { followThisUser } from "../services/followings.js";

export const testController = async (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "Test controller",
  });
};

export const registerController = async (req, res) => {
  try {
    const params = req.body;

    if (
      !params.name ||
      !params.last_name ||
      !params.nick ||
      !params.email ||
      !params.password
    ) {
      return res.status(400).json({
        status: "error",
        message: "There are missing fields",
      });
    }

    const userToSave = new User(params);

    const existingUser = await User.findOne({
      $or: [
        {
          email: userToSave.email.toLowerCase(),
        },
        {
          nick: userToSave.nick.toLowerCase(),
        },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "User already exists",
      });
    }

    // const salt = bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userToSave.password, 10);
    userToSave.password = hashedPassword;

    await userToSave.save();

    return res.status(200).json({
      status: "success",
      message: "User registered successfully",
    });
  } catch (error) {
    console.log("Registration error", error);
    return res.status(500).json({
      status: "error",
      message: "An error ocurred while registering the user",
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const params = req.body;

    if (!params.email || !params.password) {
      return res.status(400).json({
        status: "error",
        message: "There are missing fields",
      });
    }

    const user = await User.findOne({ email: params.email.toLowerCase() });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "The user does not exist",
      });
    }

    const validPassword = await bcrypt.compare(params.password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        status: "error",
        message: "Incorrect password",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        last_name: user.lastName,
        bio: user.bio,
        email: user.email,
        nick: user.nick,
        role: user.role,
        image: user.image,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.log("Login error", error);
    return res.status(500).json({
      status: "error",
      message: "An error ocurred while loging in",
    });
  }
};

export const getProfileController = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid user id",
      });
    }

    const user = await User.findById(userId).select("-password -role -__v");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "The user does not exist",
      });
    }

    const followInfo = await followThisUser(req.user.userId, userId);

    return res.status(200).json({
      status: "success",
      message: "Profile success",
      user,
      followInfo,
    });
  } catch (error) {
    console.log("Profile error", error);
    return res.status(500).json({
      status: "error",
      message: "An error ocurred while getting the user profile",
    });
  }
};

export const getUsersController = async (req, res) => {
  try {
    const page = req.params.page ? parseInt(req.params.page, 10) : 1;
    const itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

    const options = {
      page,
      limit: itemsPerPage,
      select: "-password -role -__v",
    };

    const users = await User.paginate({}, options);

    if (!users || users.docs.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "There are no users",
      });
    }

    return res.status(200).json({
      status: "success",
      users: users.docs,
      totalDocs: users.totalDocs,
      totalPages: users.totalPages,
      page: users.page,
      pagingCounter: users.pagingCounter,
      hasPrevPage: users.hasPrevPage,
      hasNextPage: users.hasNextPage,
      prevPage: users.prevPage,
      nextPage: users.nextPage,
    });
  } catch (error) {
    console.log("An error ocurred while getting the users", error);
    return res.status(500).json({
      status: "error",
      message: "An error ocurred while getting the users",
    });
  }
};

export const updateUserController = async (req, res) => {
  try {
    let userIdentity = req.user;
    let userToUpdate = req.body;

    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;

    /*     if (!userToUpdate.email || !userToUpdate.nick) {
      return res.status(400).json({
        status: "error",
        message: "There are missing fields",
      });
    }
        const users = await User.find({
      $or: [
        { email: userToUpdate.email.toLowerCase() },
        { nick: userToUpdate.nick.toLowerCase() },
      ],
    }).exec();

    const isDuplicateUser = users.some((user) => {
      return user && user._id.toString() !== userIdentity.userId;
    });

    if (isDuplicateUser) {
      return res.status(400).json({
        status: "error",
        message: "User mismatch",
      });
    }

    if (userToUpdate.password) {
      try {
        let pwd = await bcrypt.hash(userToUpdate.password, 10);
        userToUpdate.password = pwd;
      } catch (hashError) {
        return res.status(500).json({
          status: "error",
          message: "Password hashing error",
        });
      }
    } else {
      delete userToUpdate.password;
    } */

    let userUpdated = await User.findByIdAndUpdate(
      userIdentity.userId,
      userToUpdate,
      { new: true, select: "-_id -password -role -__v -created_at" }
    );

    if (!userUpdated) {
      return res.status(400).json({
        status: "error",
        message: "Update user error",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "User updated successefully",
      user: userUpdated,
    });
  } catch (error) {
    console.log("Update user error", error);
    return res.status(500).json({
      status: "error",
      message: "Update user error",
    });
  }
};

export const uploadFileController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(404).json({
        status: "error",
        message: "The file is missing",
      });
    }

    let image = req.file.originalname;

    const imageSplit = image.split(".");
    const extension = imageSplit[imageSplit.length - 1];

    if (!["png", "jpg", "jpeg", "gif"].includes(extension.toLowerCase())) {
      const filePath = req.file.path;
      fs.unlinkSync(filePath);

      return res.status(400).json({
        status: "error",
        message: "Invalid file extension",
      });
    }

    const fileSize = req.file.size;
    const maxFileSize = 1 * 1024 * 1024;

    if (fileSize > maxFileSize) {
      const filePath = req.file.path;
      fs.unlinkSync(filePath);

      return res.status(400).json({
        status: "error",
        message: "1MB file size limit exceeded",
      });
    }

    const userUpdated = await User.findOneAndUpdate(
      { _id: req.user.userId },
      { image: req.file.filename },
      { new: true }
    );

    if (!userUpdated) {
      return res.status(500).json({
        status: "error",
        message: "Upload file error",
      });
    }

    return res.status(200).json({
      status: "success",
      user: userUpdated,
      file: req.file,
    });
  } catch (error) {
    console.log("Upload file error", error);
    return res.status(500).json({
      status: "error",
      message: "Upload file error",
    });
  }
};

export const getAvatarController = async (req, res) => {
  try {
    const file = req.params.file;

    const filePath = "./uploads/avatar/" + file;

    fs.stat(filePath, () => {});

    return res.status(200).json({
      status: "success",
      message: "Show avatar success",
    });
  } catch (error) {
    console.log("Show avatar error", error);
    return res.status(500).json({
      status: "error",
      message: "Show avatar error",
    });
  }
};
