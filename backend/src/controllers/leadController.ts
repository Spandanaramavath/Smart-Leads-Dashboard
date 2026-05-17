import { Request, Response } from "express";
import Lead from "../models/Lead";

// GET ALL LEADS
export const getLeads = async (
  req: Request,
  res: Response
) => {
  try {

    const leads = await Lead.find().sort({
      createdAt: -1,
    });

    res.status(200).json(leads);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error fetching leads",
    });
  }
};

// GET SINGLE LEAD
export const getLeadById = async (
  req: Request,
  res: Response
) => {
  try {

    const lead = await Lead.findById(
      req.params.id
    );

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.status(200).json(lead);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error fetching lead",
    });
  }
};

// CREATE LEAD
export const createLead = async (
  req: Request,
  res: Response
) => {
  try {

    const {
      name,
      email,
      status,
      source,
    } = req.body;

    const newLead = new Lead({
      name,
      email,
      status,
      source,
    });

    const savedLead =
      await newLead.save();

    res.status(201).json(savedLead);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error creating lead",
    });
  }
};

// UPDATE LEAD
export const updateLead = async (
  req: Request,
  res: Response
) => {
  try {

    const updatedLead =
      await Lead.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    if (!updatedLead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.status(200).json(updatedLead);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error updating lead",
    });
  }
};

// DELETE LEAD
export const deleteLead = async (
  req: Request,
  res: Response
) => {
  try {

    const deletedLead =
      await Lead.findByIdAndDelete(
        req.params.id
      );

    if (!deletedLead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.status(200).json({
      message:
        "Lead deleted successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error deleting lead",
    });
  }
};