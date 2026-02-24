import express from "express";
import { Router } from "express";
import { createRoom, getRooms, getRoomBySlug } from "../controller/room.controller";

const router: Router = express.Router();

router.post("/create", createRoom);
router.get("/all", getRooms);
router.get("/:slug", getRoomBySlug);
export default router;