import { NextFunction, Request, Response } from "express";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    return res.status(404).json({ message: "Not found" });
};  

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if(err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: "Invalid JSON", });
    }
    console.error(err);
    res.status(err.status ?? 500).json({ message: err.message || "Internal server error" });
};