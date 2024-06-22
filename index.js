import express, { json, urlencoded } from "express";
import cors from "cors";
import connection from "./database/connection.js";
import userRouter from "./routes/user.js";
import postRouter from "./routes/post.js";
import followRouter from "./routes/follow.js";

connection();

const app = express();
const PORT_NUMBER = 3900;

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/follow", followRouter);

app.listen(PORT_NUMBER, () => {
  console.log("✅ Server running on port " + PORT_NUMBER + "...");
});
