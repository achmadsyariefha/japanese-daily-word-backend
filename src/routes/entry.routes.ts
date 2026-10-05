import { Router } from "express";
import { validate } from "../middlewares/validate.middleware";
import { createEntrySchema, updateEntrySchema } from "../schemas/entry.schema";
import { createEntry, deleteEntry, getEntry, listEntries, updateEntry } from "../controllers/entry.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.use(requireAuth)

router.get('/', listEntries);
router.get('/:id', getEntry);
router.post('/', validate(createEntrySchema), createEntry);
router.patch('/:id', validate(updateEntrySchema), updateEntry);
router.delete('/:id', deleteEntry);

export default router;