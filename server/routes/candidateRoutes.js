const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
    getAllCandidates,
    updateCandidateStatus,
    getCandidateHistory,
    getMyHistory
} = require("../controllers/candidateController");

// Admin: get all candidates
router.get(
    "/",
    protect,
    authorize("admin"),
    getAllCandidates
);

// Admin: update application status
router.patch(
    "/:id/status",
    protect,
    authorize("admin"),
    updateCandidateStatus
);

// Candidate: view own history
router.get(
    "/me/history",
    protect,
    authorize("candidate"),
    getMyHistory
);
// Admin: view candidate history
router.get(
    "/:id/history",
    protect,
    authorize("admin"),
    getCandidateHistory
);


module.exports = router;