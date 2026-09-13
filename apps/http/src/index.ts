import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoute from "./routes/auth.route";
import roomRoutes from "./routes/room.route";
import { middleware } from "./middleware/middleware";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/room", middleware, roomRoutes);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})