import express from "express";

import {
  createLead,
  getLeads,
  deleteLead,
  updateLead,
} from "../controllers/leadController";

const router = express.Router();

router.post("/", createLead);

router.get("/", getLeads);

router.delete("/:id", deleteLead);
router.put("/:id", updateLead);
export default router;