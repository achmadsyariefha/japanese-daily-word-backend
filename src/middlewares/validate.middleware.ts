import { NextFunction, Request, Response } from "express";
import { z, ZodType } from "zod";

export const validate = (schema: ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({  
                message: "Validation failed", 
                errors: z.treeifyError(result.error),
            });
        }
        req.body = result.data;
        next();
    };
};