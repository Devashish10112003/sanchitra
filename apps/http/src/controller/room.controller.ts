import { Request, Response } from "express";
import { createRoomSchema } from "@repo/schemas/types";
import prisma from "@repo/db/client";

export async function createRoom(req: Request, res: Response) {
    try {
        const parseData = createRoomSchema.safeParse(req.body);
        if (!parseData.success) {
            res.status(400).json({ success: false, message: "Insufficient data passed" });
            return;
        }

        const slug = parseData.data.slug;

        const existingRoom = await prisma.room.findFirst({
            where: {
                slug,
            }
        });

        if (existingRoom) {
            res.status(409).json({ success: false, message: "Room with this slug already exists" });
            return;
        }

        const room = await prisma.room.create({
            data: {
                slug,
                ownerId: req.userId,
                canvasState: {},
            }
        });

        res.status(200).json({ success: true, message: "Room created successfully", roomId: room.id });
        return;

    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error in create room handler", error })
    }
}

export async function getRooms(req: Request, res: Response) {
    try {
        const rooms = await prisma.room.findMany({
            where: {
                OR: [
                    { ownerId: req.userId },
                    { members: { some: { userId: req.userId } } }
                ]
            }
        });

        res.status(200).json({ success: true, message: "Fetched rooms successfully", rooms });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error in get rooms handler", error });
        return;
    }
}

export async function getRoomBySlug(req: Request, res: Response) {
    try {
        const slug = req.params.slug as string;
        const room = await prisma.room.findFirst({
            where: {
                slug,
            },
            include: {
                members: {
                    where: {
                        userId: req.userId,
                    }
                }
            }
        });

        if (!room) {
            res.status(400).json({ success: false, message: "No room with this slug found" });
            return;
        }

        const isOwner = room.ownerId === req.userId;
        const isMember = room.members.length > 0;
        if (!isOwner && !isMember) {
            await prisma.roomMember.create({
                data: {
                    userId: req.userId,
                    roomId: room.id,
                    role: "EDITOR",
                }
            })
        }

        res.status(200).json({ success: true, message: "Got the room successfully", room });
        return;
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Error in get room handler", error });
        return;
    }
}