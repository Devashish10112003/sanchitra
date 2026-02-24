import express from "express";
import { Router } from "express";
import { login,logout,signup,getUser } from "../controller/auth.controller";
import { middleware } from "../middleware/middleware";

const router:Router=express.Router();

router.post("/login",login);
router.post("/signup",signup);
router.post("/logout",logout);
router.get("/me",middleware,getUser);

export default router;