import { Prisma } from "@prisma/client";

const DAY_MS = 86_400_000;

const toDayNumber = (date: string) => Math.floor(Date.parse(`${date}T00:00:00Z`) / DAY_MS);

export const calculateStreaks = (dates: string[], today: string) => {
    const todayNum = toDayNumber(today);
    const days = [...new Set(dates)]
        .map(toDayNumber)
        .filter((d) => d <= todayNum)
        .sort((a, b) => a - b);

    if (days.length === 0) return { currentStreak: 0, longestStreak: 0 };

    let longestStreak = 1;
    let run = 1;
    for (let i = 1; i < days.length; i++) {
        run = days[i] === days[i - 1] + 1 ? run + 1 : 1;
        longestStreak = Math.max(longestStreak, run);
    }

    let currentStreak = 0;
    if (days[days.length - 1] >= todayNum) {
        currentStreak = 1;
        for (let i = days.length - 2; i >= 0 && days[i] === days[i + 1] - 1; i--) {
            currentStreak++;
        }
    }

    return { currentStreak, longestStreak };
};