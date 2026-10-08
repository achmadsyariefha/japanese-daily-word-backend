import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { sessionSchema, markCardSchema } from "../schemas/review.schema";
import { getSession, markCard, resetSession } from "../controllers/review.controller";

const router = Router();

router.use(requireAuth);

router.get("/", getSession);
router.post("/reset", validate(sessionSchema), resetSession);
router.post("/mark", validate(markCardSchema), markCard);

export default router;