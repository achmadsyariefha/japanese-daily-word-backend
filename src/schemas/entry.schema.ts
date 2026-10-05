import { z } from "zod";

export const exampleSentenceSchema = z.object({
    japanese: z.string().min(1, "Japanese sentence is required"),
    reading: z.string().optional(),
    translation: z.string().min(1, "English translation is required"),
});

export const createEntrySchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    japanese: z.string().min(1, "Japanese is required"),
    reading: z.string().min(1, "Reading is required"),
    romaji: z.string().optional(),
    translation: z.string().min(1, "English translation is required"),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isFavorite: z.boolean().optional(),
    exampleSentences: exampleSentenceSchema.optional(),
});

export const updateEntrySchema = createEntrySchema.partial();
    

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;