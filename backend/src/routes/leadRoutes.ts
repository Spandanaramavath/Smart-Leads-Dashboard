import express from "express";

import {
  createLead,
  getLeads,
  updateLead,
  deleteLead,
} from "../controllers/leadController";

const router = express.Router();

router.post("/", createLead);

router.get("/", getLeads);

router.put("/:id", updateLead);

router.delete("/:id", deleteLead);

export default router;