import { z } from "zod";

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");
const filterMode = z.enum(['all', 'favorites']).default('all');

export const sessionSchema = z.object({ dateKey, filterMode });

export const markCardSchema = z.object({
    dateKey,
    filterMode,
    cardId: z.string().min(1),
    status: z.enum(['known', 'need-review']),
    currentIndex: z.number().int().min(0).optional(),
});

export type SessionInput = z.infer<typeof sessionSchema>;
export type MarkCardInput = z.infer<typeof markCardSchema>;
    