import jwt from "jsonwebtoken";
import { ENV_VARS } from "../config/envVars";
import { Response } from "express";

export function generateTokenAnsSetCookie(userId:string,res:Response){
    const token=jwt.sign({userId},ENV_VARS.JWT_SECRET,{expiresIn:"30d"})

    res.cookie("jwt-sanchitra",token,{
        maxAge:30*24*60*60*1000,
        httpOnly:true,
        sameSite:"lax",
        secure:false,
    })

    return token;
}