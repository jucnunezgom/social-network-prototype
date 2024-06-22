import User from "../models/user.js";
import Follow from "../models/follow.js";
import { followUserIds } from "../services/followings.js";

export const followTestController = async (req, res) => {
  try {
    const follows = await Follow.find({});
    return res.status(200).json({
      status: "success",
      message: "Test success",
      follows,
    });
  } catch (error) {
    console.log("Test error", error);
    return res.status(200).json({
      status: "error",
      message: "Test error",
    });
  }
};

export const registerFollowController = async (req, res) => {
  try {
    const { followed_user } = req.body;

    const identity = req.user;

    if (!identity || !identity.userId) {
      return res.status(400).send({
        status: "error",
        message: "There are missing fields",
      });
    }

    if (identity.userId === followed_user) {
      return res.status(400).send({
        status: "error",
        message: "Users cannot follow themselves",
      });
    }

    const followedUser = await User.findById(followed_user);

    if (!followedUser) {
      return res.status(404).send({
        status: "error",
        message: "The user you want to follow does not exist",
      });
    }

    const existingFollow = await Follow.findOne({
      following_user: identity.userId,
      followed_user: followed_user,
    });

    if (existingFollow) {
      return res.status(400).send({
        status: "error",
        message: "You already follow this user",
      });
    }

    const newFollow = new Follow({
      following_user: identity.userId,
      followed_user: followed_user,
    });

    const followStored = await newFollow.save();

    if (!followStored) {
      return res.status(500).send({
        status: "error",
        message: "There was an error while trying to follow the user",
      });
    }

    const followedUserDetails = await User.findById(followed_user).select(
      "name last_name"
    );

    if (!followedUserDetails) {
      return res.status(404).send({
        status: "error",
        message: "Followed user not found",
      });
    }

    const combinedFollowData = {
      ...followStored.toObject(),
      followedUser: {
        name: followedUserDetails.name,
        last_name: followedUserDetails.last_name,
      },
    };

    return res.status(200).json({
      status: "success",
      identity: req.user,
      follow: combinedFollowData,
    });
  } catch (error) {
    console.log("Register follow error", error);
    return res.status(200).json({
      status: "error",
      message: "Register follow error",
    });
  }
};

export const registerUnfollowController = async (req, res) => {
  try {
    const userId = req.user.userId;

    const followedId = req.params.id;

    const followDeleted = await Follow.findOneAndDelete({
      following_user: userId,
      followed_user: followedId,
    });

    if (!followDeleted) {
      return res.status(404).send({
        status: "error",
        message: "You currently don't follow the user",
      });
    }
    return res.status(200).json({
      status: "success",
      message: "You have successesfully unfollowed the user",
    });
  } catch (error) {
    console.log("Unfollow error", error);
    return res.status(200).json({
      status: "error",
      message: "Unfollow error",
    });
  }
};

export const getFollowsController = async (req, res) => {
  try {
    let userId = req.user && req.user.userId ? req.user.userId : undefined;

    if (req.params.id) userId = req.params.id;

    let page = req.params.page ? parseInt(req.params.page, 10) : 1;

    let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

    const options = {
      page: page,
      limit: itemsPerPage,
      populate: {
        path: "followed_user",
        select: "-password -role -__v",
      },
      lean: true,
    };

    const follows = await Follow.paginate({ following_user: userId }, options);

    const followUsers = await followUserIds(req);

    return res.status(200).send({
      status: "success",
      follows: follows.docs,
      total: follows.totalDocs,
      pages: follows.totalPages,
      page: follows.page,
      limit: follows.limit,
      users_following: followUsers.following,
      user_follow_me: followUsers.followers,
    });
  } catch (error) {
    console.log("Get follow error", error);
    return res.status(500).send({
      status: "error",
      message: "Get follows error",
    });
  }
};

export const getFollowersController = async (req, res) => {
  try {
    // Obtener el ID del usuario identificado
    let userId = req.user && req.user.userId ? req.user.userId : undefined;

    // Comprobar si llega el ID por parámetro en la url (este tiene prioridad)
    if (req.params.id) userId = req.params.id;

    // Asignar el número de página
    let page = req.params.page ? parseInt(req.params.page, 10) : 1;

    // Número de usuarios que queremos mostrar por página
    let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

    // Configurar las opciones de la consulta
    const options = {
      page: page,
      limit: itemsPerPage,
      populate: {
        path: "following_user",
        select: "-password -role -__v",
      },
      lean: true,
    };

    // Buscar en la BD los seguidores y popular los datos de los usuarios
    const follows = await Follow.paginate({ followed_user: userId }, options);

    // Listar los seguidores de un usuario, obtener el array de IDs de los usuarios que sigo
    let followUsers = await followUserIds(req);

    // Devolver respuesta
    return res.status(200).send({
      status: "success",
      message: "Listado de usuarios que me siguen",
      follows: follows.docs,
      total: follows.totalDocs,
      pages: follows.totalPages,
      page: follows.page,
      limit: follows.limit,
      users_following: followUsers.following,
      user_follow_me: followUsers.followers,
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al listar los usuarios que me siguen.",
    });
  }
};
