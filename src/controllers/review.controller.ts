import { Request, Response } from "express";
import z from "zod";
import { prisma } from "../lib/prisma";
import { MarkCardInput, SessionInput, sessionSchema } from "../schemas/review.schema";

const sessionKey = (userId: string, { dateKey, filterMode }: SessionInput) => ({
    userId_dateKey_filterMode: { userId, dateKey, filterMode },
});

const getOrCreateSession = (userId: string, input: SessionInput) => 
    prisma.reviewSession.upsert({
        where: sessionKey(userId, input),
        create: { userId, dateKey: input.dateKey, filterMode: input.filterMode },
        update: {},
    });

export const getSession = async (req: Request, res: Response) => {
    const parsed = sessionSchema.safeParse(req.query);
    if(!parsed.success) {
        return res.status(400).json({ message: "Invalid query parameters", errors: z.treeifyError(parsed.error) });
    }

    const userId = req.userId!;
    const { dateKey, filterMode } = parsed.data;
    
    const [session, cards] = await Promise.all([
        getOrCreateSession(userId, parsed.data),
        prisma.dailyEntry.findMany({
            where: {
                userId,
                date: dateKey,
                ...(filterMode === 'favorites' && { isFavorite: true }),
            },
            include: { exampleSentence: true },
            orderBy: { createdAt: 'asc'},
        }),
    ]);

    res.json({ session, cards});
}

export const markCard = async (req: Request, res: Response) => {
    const userId = req.userId!;
    const input = req.body as MarkCardInput;
    const { dateKey, cardId, status, currentIndex } = input;

    const card = await prisma.dailyEntry.findFirst({
        where: {
            id: cardId,
            userId,
            date: dateKey,
        },
        select: { id: true },
    });
    
    if(!card) {
        return res.status(404).json({ message: "Card not found" });
    }

    const session = await getOrCreateSession(userId, input);
    
    const known = session.knownCardIds.filter((id) => id !== cardId);
    const needReview = session.needReviewCardIds.filter((id) => id !== cardId);
    
    (status === 'known' ? known : needReview).push(cardId);

    const updated = await prisma.reviewSession.update({
        where: { id: session.id },
        data: {
            knownCardIds: known,
            needReviewCardIds: needReview,
            ...(currentIndex !== undefined && { currentIndex }),
        },
    });
    
    res.json({session: updated});
}

export const resetSession = async (req:Request, res: Response) => {
    const userId = req.userId!;
    const input = req.body as SessionInput;
    const session = await prisma.reviewSession.upsert({
        where: sessionKey(userId, input),
        create: { userId, dateKey: input.dateKey, filterMode: input.filterMode },
        update: {
            knownCardIds: [],
            needReviewCardIds: [],
            currentIndex: 0,
        },
    });
    res.json({session});
}