import { Router } from "express";
import authRoutes from "./auth.routes";
import entryRoutes from "./entry.routes";
import statsRoutes from "./stats.routes";
import reviewRoutes from "./review.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/entries", entryRoutes);
router.use("/stats", statsRoutes);
router.use("/review", reviewRoutes);

export default router;