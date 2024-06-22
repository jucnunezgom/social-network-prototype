import jwt from "jwt-simple";
import { SECRET } from "../services/jwt.js";
import moment from "moment";

export const ensureAuth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(403).json({
      status: "error",
      message: "Missing authorization header",
    });
  }
  const token = req.headers.authorization.replace(/['"]+/g, "");

  try {
    const payload = jwt.decode(token, SECRET);

    if (payload.exp <= moment().unix()) {
      return res.status(401).json({
        status: "error",
        message: "Expired token",
      });
    }

    req.user = payload;
  } catch (error) {
    console.log("Registration error", error);
    return res.status(404).json({
      status: "error",
      message: "Invalid token",
    });
  }

  next();
};
