
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const http = require("http");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const { initializeSocket } = require("./config/socket");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/candidates", candidateRoutes);
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "CandidateSync API is running"
    });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
    try {
        await connectDB();

        // Create one HTTP server
        const httpServer = http.createServer(app);

        // Attach Socket.IO
        initializeSocket(httpServer);

        // Start listening
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log("Socket.IO initialized successfully");
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
