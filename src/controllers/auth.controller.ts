import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { LoginInput, RegisterInput, UpdateProfileInput } from "../schemas/auth.schema";
import bcrypt from "bcrypt";
import { signToken } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
    const { email, password, name } = req.body as RegisterInput;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
        },
        select: {
            id: true,
            email: true,
            name: true,
            dailyTargetLimit: true,
        },
    });

    const token = signToken({ userId: user.id });
    res.status(201).json({ user, token });

};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginInput;
    const user = await prisma.user.findUnique({ where: { email } });
    const valid = user && (await bcrypt.compare(password, user.password));
    if (!user || !valid) {
        return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = signToken({ userId: user.id });
    res.json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            dailyTargetLimit: user.dailyTargetLimit,
        }, 
        token,
    });
};

export const me = async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
         where: { id: req.userId },
         select: {
            id: true,
            email: true,
            name: true,
            dailyTargetLimit: true,
         },
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
};

export const updateMe = async (req: Request, res: Response) => {
    const data = req.body as UpdateProfileInput;
    
    const user = await prisma.user.update({
        where: { id: req.userId },
        data,
        select: {
            id: true,
            email: true,
            name: true,
            dailyTargetLimit: true,
        },
    });

    res.status(200).json(user);
};
    

    