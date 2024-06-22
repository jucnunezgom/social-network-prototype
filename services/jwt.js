import moment from "moment";
import jwt from "jwt-simple";

export const SECRET = "n0.m3.l4.r3.c0nt3s";

const createToken = (user) => {
  const payload = {
    userId: user._id,
    role: user.role,
    name: user.name,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix(),
  };

  return jwt.encode(payload, SECRET);
};

export default createToken;
