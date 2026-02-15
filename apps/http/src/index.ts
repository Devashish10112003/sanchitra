import prisma from "@repo/db/client";
import express from "express";
import { loginSchema } from "@repo/schemas/types";

const app=express();

app.get("/",async (req,res)=>{
    const user=await prisma.user.findFirst();

    res.json(user);
})

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})