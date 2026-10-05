import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { CreateEntryInput, UpdateEntryInput } from "../schemas/entry.schema";

const getReachedDailyLimit = async (userId: string, date: string, excludeId?: string) => {
    const [user, count] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: { dailyTargetLimit: true},
        }),
        prisma.dailyEntry.count({
            where: {
                userId,
                date,
                ...(excludeId && { id: { not: excludeId } }),
            },
        }),
    ]);

    const limit = user?.dailyTargetLimit ?? 1;
    return count >= limit ? limit : null;
};

export const listEntries = async (req: Request, res: Response) => {
    const { date, favorite, tag } = req.query;

    const entries = await prisma.dailyEntry.findMany({
        where: {
            userId: req.userId!,
            ...(typeof date === 'string' && { date }),
            ...(typeof favorite === 'string' && { isFavorite: favorite === 'true' }),
            ...(typeof tag === 'string' && { tags: { has: tag } }),
        },
        include: {
            exampleSentence: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({entries});
};

export const getEntry = async (req: Request, res: Response) => {
    const entry = await prisma.dailyEntry.findFirst({
        where: {
            id: req.params.id as string,
            userId: req.userId!,
        },
        include: {
            exampleSentence: true,
        },
    });

    if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
    }
    
    res.status(200).json({entry});
};

export const createEntry = async (req: Request, res: Response) => {
    const { exampleSentences, ...data } = req.body as CreateEntryInput;

    const limit = await getReachedDailyLimit(req.userId!, data.date);
    if(limit !== null) {
        return res.status(409).json({message: `Daily entry limit (${limit}) reached for ${data.date}.`});
    }

    const entry = await prisma.dailyEntry.create({
        data: {
            ...data,
            userId: req.userId!,
            ...(exampleSentences && { exampleSentence: { create: exampleSentences} }),
        },
        include: {
            exampleSentence: true,
        },
    });

    res.status(201).json({entry});
};

export const updateEntry = async (req: Request, res: Response) => {
    const existing = await prisma.dailyEntry.findFirst({
        where: {
            id: req.params.id as string,
            userId: req.userId!,
        },
    });

    if (!existing) {
        return res.status(404).json({ message: "Entry not found" });
    }
    
    const { exampleSentences, ...data } = req.body as UpdateEntryInput;

    if(data.date && data.date !== existing.date) {
        const limit = await getReachedDailyLimit(req.userId!, data.date, existing.id);
        if(limit !== null) {
            return res.status(409).json({message: `Daily entry limit (${limit}) reached for ${data.date}.`});
        }
    }

    const entry = await prisma.dailyEntry.update({
        where: {
            id: existing.id,
        },
        data: {
            ...data,
            ...(exampleSentences && {
                exampleSentence: {
                    upsert: {
                        create: exampleSentences,
                        update: exampleSentences,
                    },
                },
            }),
        },
        include: {
            exampleSentence: true,
        },
    });
    
    res.status(200).json({entry});
};

export const deleteEntry = async (req: Request, res: Response) => {
    const existing = await prisma.dailyEntry.findFirst({
        where: {
            id: req.params.id as string,
            userId: req.userId!,
        },
    });

    if (!existing) {
        return res.status(404).json({ message: "Entry not found" });
    }

    await prisma.dailyEntry.delete({
        where: {
            id: existing.id,
        },
    });

    res.status(204).send();
};  