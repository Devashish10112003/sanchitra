import { Request, Response } from "express";
import prisma from "@repo/db/client";
import { loginSchema, signupSchema } from "@repo/schemas/types";
import bcrypt from "bcrypt";
import { generateTokenAnsSetCookie } from "../utils/generateToken";

export async function login(req: Request, res: Response) {
    try {
        const parsedData = loginSchema.safeParse(req.body);

        if (!parsedData.success) {
            res.status(400).json({ success: false, message: "Insufficient data passsed in login", error: parsedData.error });
            return;
        }

        const { email, password } = parsedData.data;
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            }
        })

        if (!user) {
            res.status(404).json({ success: false, message: "User not foound" });
            return;
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            res.status(401).json({ success: false, message: "Invalid credentials" });
            return;
        }

        const token = generateTokenAnsSetCookie(user.id, res);
        res.status(200).json({ success: true, message: "Logged in successfully", token: token });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error in login controller", error: error });
        return;
    }
}

export async function signup(req: Request, res: Response) {
    try {
        const parsedData = signupSchema.safeParse(req.body);

        if (!parsedData.success) {
            res.status(400).json({ success: false, message: "Insufficient data passsed in signup", error: parsedData.error });
            return;
        }

        const { email, password, username } = parsedData.data;

        const existingUser = await prisma.user.findUnique({
            where: {
                email: email,
            }
        });

        if (existingUser) {
            res.status(401).json({ success: false, message: "User with this email already exists" });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                username,
            }
        });

        res.status(201).json({ success: true, message: "Created user successsfully" });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error in signup controller", error: error });
        return;
    }

}

export async function logout(req: Request, res: Response) {
    try {
        res.clearCookie("jwt-sanchitra");
        res.status(200).json({ succsss: true, message: "Logged out successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error in logout controller", error: error });
        return;
    }
}

export async function getUser(req: Request, res: Response) {
    try {
        const userId = req.userId;

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                username: true,
                email: true,
            }
        })

        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        res.status(200).json({ success: true, message: "Fetched usre successfully", user: user });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, messagge: "Error in getUser controller", error: error });
        return;
    }
}