import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
    PORT: z.coerce.number().int().positive().optional().default(5000),
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
});

const parsedEnv = envSchema.safeParse(process.env);

if(!parsedEnv.success) {
    console.error("Invalid environment variables:", z.treeifyError(parsedEnv.error));
    process.exit(1);
}

export const env = parsedEnv.data;