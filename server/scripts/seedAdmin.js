
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const Candidate = require("../models/Candidate");

const seedAdmin = async () => {
  try {
    const {
      ADMIN_NAME,
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
    } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("Admin environment variables are missing");
    }

    await connectDB();

    const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();

    const existingAdmin = await Candidate.findOne({
      email: normalizedEmail,
      role: "admin",
    });

    if (existingAdmin) {
      console.log("Admin account already exists");
      return;
    }

    const passwordHash = await bcrypt.hash(
      ADMIN_PASSWORD,
      12
    );

    await Candidate.create({
      name: ADMIN_NAME.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "admin",
    });

    console.log("Admin account created successfully");

  } catch (error) {
    console.error("Admin seeding failed:", error.message);
    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
