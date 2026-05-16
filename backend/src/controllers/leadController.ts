import { Request, Response } from "express";
import Lead from "../models/Lead";

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

    const lead = await Lead.create({
      name,
      email,
      status,
      source,
    });

    res.status(201).json(lead);

  } catch (error) {

    res.status(500).json({
      message: "Server Error",
    });

  }
};

export const getLeads = async (
  req: Request,
  res: Response
) => {

  try {

    const page =
      Number(req.query.page) || 1;

    const limit = 10;

    const skip =
      (page - 1) * limit;

    const leads = await Lead.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(leads);

  } catch (error) {

    res.status(500).json({
      message: "Server Error",
    });

  }
};

export const updateLead = async (
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

    const updatedLead =
      await Lead.findByIdAndUpdate(
        req.params.id,
        {
          name,
          email,
          status,
          source,
        },
        {
          new: true,
        }
      );

    res.status(200).json(updatedLead);

  } catch (error) {

    res.status(500).json({
      message: "Server Error",
    });

  }
};

export const deleteLead = async (
  req: Request,
  res: Response
) => {

  try {

    await Lead.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      message: "Lead Deleted",
    });

  } catch (error) {

    res.status(500).json({
      message: "Server Error",
    });

  }
};