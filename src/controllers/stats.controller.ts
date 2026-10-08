import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { calculateStreaks } from "../utils/streak";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const getStats = async (req: Request, res: Response) => {
    const userId = req.userId!;
    const todayParam = req.query.today;
    const today = typeof todayParam === 'string' && DATE_PATTERN.test(todayParam)
        ? todayParam
        : new Date().toISOString().slice(0, 10);

    const [user, totalEntries, favoriteCount, entriesToday, dateRows] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: { dailyTargetLimit: true },
        }),
        prisma.dailyEntry.count({where: {userId}}),
        prisma.dailyEntry.count({where: {userId, isFavorite: true}}),
        prisma.dailyEntry.count({where: {userId, date: today}}),
        prisma.dailyEntry.findMany({
            where: {userId},
            select: {date: true},
            distinct: ['date'],
        }),
    ]);

    const streak =  calculateStreaks(dateRows.map((row) => row.date), today);

    res.json({
        stats : {
            totalEntries,
            favoriteCount,
            entriesToday,
            dailyTargetLimit: user?.dailyTargetLimit,
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
        }
    });
};
