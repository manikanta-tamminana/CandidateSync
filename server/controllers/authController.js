const Candidate = require("../models/Candidate");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const candidate = await Candidate.findOne({
      email: email.trim().toLowerCase(),
    }).select("+passwordHash");

    if (!candidate) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      candidate.passwordHash,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from environment variables");
    }
    const token = jwt.sign(
      {
        id: candidate._id,
        role: candidate.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        role: candidate.role,
        currentStatus: candidate.currentStatus,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get currently authenticated user
const getMe = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.user.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        role: candidate.role,
        currentStatus: candidate.currentStatus,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const register = async (req, res) => {
    try {
        const { name, email, password, jobRole } = req.body;

        // Validate required fields
        if (!name || !email || !password || !jobRole) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check whether account already exists
        const existingCandidate = await Candidate.findOne({
            email: normalizedEmail
        });

        if (existingCandidate) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Always create a candidate role
        const candidate = await Candidate.create({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
            role: "candidate",
            jobRole: jobRole.trim()
        });

        // Generate JWT
        const token = jwt.sign(
            {
                id: candidate._id,
                role: candidate.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user: {
                id: candidate._id,
                name: candidate.name,
                email: candidate.email,
                role: candidate.role,
                jobRole: candidate.jobRole,
                currentStatus: candidate.currentStatus
            }
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
};
module.exports = { register, login, getMe };
