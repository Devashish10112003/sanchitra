import express from "express";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth.route";
import roomRoutes from "./routes/room.route";
import { middleware } from "./middleware/middleware";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/room", middleware, roomRoutes);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})