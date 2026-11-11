const mongoose = require("mongoose");
const APPLICATION_STATUSES = require("../constants/applicationStatus");

const candidateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        passwordHash: {
            type: String,
            required: true,
            select: false
        },

        role: {
            type: String,
            enum: ["admin", "candidate"],
            default: "candidate",
            required: true
        },

        jobRole: {
            type: String,
            trim: true,
            required: function () {
                return this.role === "candidate";
            }
        },

        currentStatus: {
            type: String,
            enum: APPLICATION_STATUSES,
            default: "Applied",
            required: true
        }
    },
    {
        timestamps: true
    }
);

candidateSchema.index({ currentStatus: 1 });

module.exports = mongoose.model("Candidate", candidateSchema);