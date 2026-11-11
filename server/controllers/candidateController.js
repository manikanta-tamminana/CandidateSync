const mongoose = require("mongoose");

const Candidate = require("../models/Candidate");
const StatusHistory = require("../models/StatusHistory");
const APPLICATION_STATUSES = require("../constants/applicationStatus");
const { getIO } = require("../config/socket");

// ==========================================
// 1. GET ALL CANDIDATES (ADMIN)
// ==========================================

const getAllCandidates = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    // Validate status filter
    if (status && !APPLICATION_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    // Build MongoDB query
    const query = {
      role: "candidate",
    };

    if (status) {
      query.currentStatus = status;
    }

    // Search by name or email
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      query.$or = [
        {
          name: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          email: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }

    // Pagination
    const currentPage = Math.max(1, parseInt(page, 10) || 1);

    const pageLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    const skip = (currentPage - 1) * pageLimit;

    // Fetch candidates and count concurrently
    const [candidates, totalCandidates] = await Promise.all([
      Candidate.find(query)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),

      Candidate.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      totalCandidates,
      currentPage,
      totalPages: Math.ceil(totalCandidates / pageLimit),
      candidates,
    });
  } catch (error) {
    console.error("Get candidates error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve candidates",
    });
  }
};

// ==========================================
// 2. UPDATE CANDIDATE STATUS (ADMIN)
// ==========================================

const updateCandidateStatus = async (req, res) => {
  const { status, remarks = "" } = req.body;
  const { id } = req.params;

  // Validate status
  if (!APPLICATION_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid application status",
    });
  }

  // Validate remarks
  if (typeof remarks !== "string" || remarks.length > 500) {
    return res.status(400).json({
      success: false,
      message: "Remarks must be a string of at most 500 characters",
    });
  }

  // Validate candidate ID
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid candidate ID",
    });
  }

  let session;

  try {
    session = await mongoose.startSession();

    let updatedCandidate;
    let historyRecord;

    // Both database operations must succeed together
    await session.withTransaction(async () => {
      const candidate = await Candidate.findOne({
        _id: id,
        role: "candidate",
      }).session(session);

      if (!candidate) {
        const error = new Error("Candidate not found");
        error.statusCode = 404;
        throw error;
      }

      const previousStatus = candidate.currentStatus;

      // Prevent duplicate status updates
      if (previousStatus === status) {
        const error = new Error("Candidate already has this status");

        error.statusCode = 409;
        throw error;
      }

      // Update current candidate status
      candidate.currentStatus = status;

      updatedCandidate = await candidate.save({
        session,
      });

      // Create corresponding history record
      const records = await StatusHistory.create(
        [
          {
            candidateId: candidate._id,
            previousStatus,
            newStatus: status,
            updatedBy: req.user.id,
            remarks: remarks.trim(),
          },
        ],
        { session },
      );

      historyRecord = records[0];
    });

    // IMPORTANT:
    // Emit the event only after the transaction commits.
    // Socket failures must not undo a successful database update.

    try {
      const room = `candidate:${updatedCandidate._id}`;

      getIO().to(room).emit("candidate:status-updated", {
        candidateId: updatedCandidate._id,
        previousStatus: historyRecord.previousStatus,
        newStatus: historyRecord.newStatus,
        remarks: historyRecord.remarks,
        updatedAt: historyRecord.createdAt,
      });

      console.log(`Status notification emitted to room: ${room}`);
    } catch (socketError) {
      console.error("Socket notification failed:", socketError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",

      candidate: {
        id: updatedCandidate._id,
        name: updatedCandidate.name,
        currentStatus: updatedCandidate.currentStatus,
      },

      history: historyRecord,
    });
  } catch (error) {
    console.error("Status update error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to update application status",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// ==========================================
// 3. GET CANDIDATE HISTORY (ADMIN)
// ==========================================

const getCandidateHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate candidate ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID",
      });
    }

    // Find candidate
    const candidate = await Candidate.findOne({
      _id: id,
      role: "candidate",
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    // Fetch status history
    const history = await StatusHistory.find({
      candidateId: id,
    })
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,

      candidate: {
        id: candidate._id,
        name: candidate.name,
        currentStatus: candidate.currentStatus,
      },

      history,
    });
  } catch (error) {
    console.error("History retrieval error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve status history",
    });
  }
};

// ==========================================
// 4. GET MY HISTORY (CANDIDATE)
// ==========================================

const getMyHistory = async (req, res) => {
  try {
    const history = await StatusHistory.find({
      candidateId: req.user.id,
    })
      .populate("updatedBy", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("My history error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your status history",
    });
  }
};

// ==========================================
// EXPORT ALL CONTROLLER FUNCTIONS
// ==========================================

module.exports = {
  getAllCandidates,
  updateCandidateStatus,
  getCandidateHistory,
  getMyHistory,
};
