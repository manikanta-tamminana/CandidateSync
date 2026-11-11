
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const Candidate = require("../models/Candidate");

const seedAdmin = async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("Admin environment variables are missing");
    }

    await connectDB();

    const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();

    // Find the existing admin, even if their email is changing.
    const existingAdmin = await Candidate.findOne({ role: "admin" });

    // Prevent overwriting an email belonging to another account.
    const emailOwner = await Candidate.findOne({
      email: normalizedEmail,
    });

    if (
      emailOwner &&
      (!existingAdmin || !emailOwner._id.equals(existingAdmin._id))
    ) {
      throw new Error("This email is already being used by another account");
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    if (existingAdmin) {
      existingAdmin.name = ADMIN_NAME.trim();
      existingAdmin.email = normalizedEmail;
      existingAdmin.passwordHash = passwordHash;

      await existingAdmin.save();

      console.log("Admin account updated successfully");
    } else {
      await Candidate.create({
        name: ADMIN_NAME.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "admin",
      });

      console.log("Admin account created successfully");
    }
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
