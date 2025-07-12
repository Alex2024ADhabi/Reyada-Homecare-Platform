import express from "express";
import { ReferralData } from "@/services/referral.service";
import { ObjectId } from "./browser-mongodb";
import { mockDb as db } from "./mock-db";

const router = express.Router();

// Get all referrals
router.get("/", async (req, res) => {
  try {
    const referrals = await db.collection("referrals").find({}).toArray();
    res.json(referrals);
  } catch (error) {
    console.error("Error fetching referrals:", error);
    res.status(500).json({ error: "Failed to fetch referrals" });
  }
});

// Get referral by ID
router.get("/:id", async (req, res) => {
  try {
    const referral = await db.collection("referrals").findOne({
      _id: new ObjectId(req.params.id),
    });
    if (!referral) {
      return res.status(404).json({ error: "Referral not found" });
    }
    res.json(referral);
  } catch (error) {
    console.error("Error fetching referral:", error);
    res.status(500).json({ error: "Failed to fetch referral" });
  }
});

// Create new referral
router.post("/", async (req, res) => {
  try {
    const referral: Omit<ReferralData, "id"> = req.body;

    // Add timestamps
    referral.createdAt = new Date().toISOString();
    referral.updatedAt = new Date().toISOString();

    // Set default values
    referral.acknowledgmentStatus = referral.acknowledgmentStatus || "Pending";
    referral.referralStatus = referral.referralStatus || "New";
    referral.initialContactCompleted =
      referral.initialContactCompleted || false;
    referral.documentationPrepared = referral.documentationPrepared || false;

    const result = await db.collection("referrals").insertOne(referral);
    const newReferral = { ...referral, id: result.insertedId.toString() };
    res.status(201).json(newReferral);
  } catch (error) {
    console.error("Error creating referral:", error);
    res.status(500).json({ error: "Failed to create referral" });
  }
});

// Update referral
router.put("/:id", async (req, res) => {
  try {
    const updates: Partial<ReferralData> = req.body;
    updates.updatedAt = new Date().toISOString();

    const result = await db
      .collection("referrals")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Referral not found" });
    }

    const updatedReferral = await db.collection("referrals").findOne({
      _id: new ObjectId(req.params.id),
    });

    res.json(updatedReferral);
  } catch (error) {
    console.error("Error updating referral:", error);
    res.status(500).json({ error: "Failed to update referral" });
  }
});

// Delete referral
router.delete("/:id", async (req, res) => {
  try {
    const result = await db.collection("referrals").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Referral not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting referral:", error);
    res.status(500).json({ error: "Failed to delete referral" });
  }
});

// Acknowledge referral
router.patch("/:id/acknowledge", async (req, res) => {
  try {
    const { acknowledgedBy } = req.body;

    if (!acknowledgedBy) {
      return res.status(400).json({ error: "acknowledgedBy is required" });
    }

    const updates = {
      acknowledgedBy,
      acknowledgmentStatus: "Acknowledged",
      acknowledgmentDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db
      .collection("referrals")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Referral not found" });
    }

    const updatedReferral = await db.collection("referrals").findOne({
      _id: new ObjectId(req.params.id),
    });

    res.json(updatedReferral);
  } catch (error) {
    console.error("Error acknowledging referral:", error);
    res.status(500).json({ error: "Failed to acknowledge referral" });
  }
});

// Assign staff to referral
router.patch("/:id/assign", async (req, res) => {
  try {
    const staffAssignment = req.body;
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (staffAssignment.nurseSupervisor) {
      updates.assignedNurseSupervisor = staffAssignment.nurseSupervisor;
    }

    if (staffAssignment.chargeNurse) {
      updates.assignedChargeNurse = staffAssignment.chargeNurse;
    }

    if (staffAssignment.caseCoordinator) {
      updates.assignedCaseCoordinator = staffAssignment.caseCoordinator;
    }

    if (staffAssignment.assessmentDate) {
      updates.assessmentScheduledDate = staffAssignment.assessmentDate;
    }

    const result = await db
      .collection("referrals")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Referral not found" });
    }

    const updatedReferral = await db.collection("referrals").findOne({
      _id: new ObjectId(req.params.id),
    });

    res.json(updatedReferral);
  } catch (error) {
    console.error("Error assigning staff to referral:", error);
    res.status(500).json({ error: "Failed to assign staff to referral" });
  }
});

// Update referral status
router.patch("/:id/status", async (req, res) => {
  try {
    const { referralStatus, statusNotes } = req.body;

    if (!referralStatus) {
      return res.status(400).json({ error: "referralStatus is required" });
    }

    const updates: any = {
      referralStatus,
      updatedAt: new Date().toISOString(),
    };

    if (statusNotes) {
      updates.statusNotes = statusNotes;
    }

    const result = await db
      .collection("referrals")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Referral not found" });
    }

    const updatedReferral = await db.collection("referrals").findOne({
      _id: new ObjectId(req.params.id),
    });

    res.json(updatedReferral);
  } catch (error) {
    console.error("Error updating referral status:", error);
    res.status(500).json({ error: "Failed to update referral status" });
  }
});

// Mark initial contact as completed
router.patch("/:id/contact", async (req, res) => {
  try {
    const { initialContactCompleted } = req.body;

    if (initialContactCompleted === undefined) {
      return res
        .status(400)
        .json({ error: "initialContactCompleted is required" });
    }

    const updates = {
      initialContactCompleted,
      updatedAt: new Date().toISOString(),
    };

    const result = await db
      .collection("referrals")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Referral not found" });
    }

    const updatedReferral = await db.collection("referrals").findOne({
      _id: new ObjectId(req.params.id),
    });

    res.json(updatedReferral);
  } catch (error) {
    console.error("Error updating initial contact status:", error);
    res.status(500).json({ error: "Failed to update initial contact status" });
  }
});

// Mark documentation as prepared
router.patch("/:id/documentation", async (req, res) => {
  try {
    const { documentationPrepared } = req.body;

    if (documentationPrepared === undefined) {
      return res
        .status(400)
        .json({ error: "documentationPrepared is required" });
    }

    const updates = {
      documentationPrepared,
      updatedAt: new Date().toISOString(),
    };

    const result = await db
      .collection("referrals")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Referral not found" });
    }

    const updatedReferral = await db.collection("referrals").findOne({
      _id: new ObjectId(req.params.id),
    });

    res.json(updatedReferral);
  } catch (error) {
    console.error("Error updating documentation status:", error);
    res.status(500).json({ error: "Failed to update documentation status" });
  }
});

// Get referrals by status
router.get("/status/:status", async (req, res) => {
  try {
    const referrals = await db
      .collection("referrals")
      .find({ referralStatus: req.params.status })
      .toArray();
    res.json(referrals);
  } catch (error) {
    console.error("Error fetching referrals by status:", error);
    res.status(500).json({ error: "Failed to fetch referrals by status" });
  }
});

// Get referrals by source
router.get("/source/:source", async (req, res) => {
  try {
    const referrals = await db
      .collection("referrals")
      .find({ referralSource: req.params.source })
      .toArray();
    res.json(referrals);
  } catch (error) {
    console.error("Error fetching referrals by source:", error);
    res.status(500).json({ error: "Failed to fetch referrals by source" });
  }
});

// Get referrals by date range
router.get("/date-range", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });
    }

    const referrals = await db
      .collection("referrals")
      .find({
        referralDate: {
          $gte: startDate as string,
          $lte: endDate as string,
        },
      })
      .toArray();

    res.json(referrals);
  } catch (error) {
    console.error("Error fetching referrals by date range:", error);
    res.status(500).json({ error: "Failed to fetch referrals by date range" });
  }
});

export default router;
