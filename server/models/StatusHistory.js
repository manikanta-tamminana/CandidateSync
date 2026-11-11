const mongoose = require("mongoose");
const APPLICATION_STATUSES = require("../constants/applicationStatus");

const statusHistorySchema = new mongoose.Schema(
    {
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate",
            required: true
        },

        previousStatus: {
            type: String,
            enum: APPLICATION_STATUSES,
            required: true
        },

        newStatus: {
            type: String,
            enum: APPLICATION_STATUSES,
            required: true
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Candidate",
            required: true
        },

        remarks: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

statusHistorySchema.index({
    candidateId: 1,
    createdAt: -1
});

module.exports = mongoose.model("StatusHistory", statusHistorySchema);