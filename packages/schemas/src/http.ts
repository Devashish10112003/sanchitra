import {z} from "zod";

export const signupSchema=z.object({
    email:z.string().email(),
    username:z.string().min(3).max(20),
    password:z.string().min(8).max(20),
})

export const loginSchema=z.object({
    email:z.string().email(),
    password:z.string().min(8).max(20)
})

export const createRoomSchema=z.object({
    slug:z.string().min(3).max(20),
})

export type SignupSchema=z.infer<typeof signupSchema>;
export type LoginSchema=z.infer<typeof loginSchema>;
export type CreateRoomSchema=z.infer<typeof createRoomSchema>;