require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const Candidate = require("../models/Candidate");

const seedAdmin = async () => {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME?.trim() || !ADMIN_EMAIL?.trim() || !ADMIN_PASSWORD) {
      throw new Error("ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required");
    }

    if (ADMIN_PASSWORD.trim().length < 12) {
      throw new Error("Admin password must be at least 12 characters long");
    }

    await connectDB();

    const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();

    // Look up only the account identified by this email. This allows
    // multiple independent admins without overwriting another admin.
    const existingAccount = await Candidate.findOne({
      email: normalizedEmail,
    });

    if (existingAccount && existingAccount.role !== "admin") {
      throw new Error(
        "This email already belongs to a candidate account. Use a different email for the administrator.",
      );
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    if (existingAccount) {
      existingAccount.name = ADMIN_NAME.trim();
      existingAccount.passwordHash = passwordHash;

      await existingAccount.save();

      console.log(`Administrator account updated: ${normalizedEmail}`);
    } else {
      await Candidate.create({
        name: ADMIN_NAME.trim(),
        email: normalizedEmail,
        passwordHash,
        role: "admin",
      });

      console.log(`Administrator account created: ${normalizedEmail}`);
    }
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

seedAdmin();
