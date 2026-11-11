const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    // Authenticate every socket connection
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            socket.user = decoded;

            next();

        } catch (error) {
            next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user.id}`);
    console.log(`User role: ${socket.user.role}`);

    if (socket.user.role === "candidate") {
        const room = `candidate:${socket.user.id}`;

        socket.join(room);

        console.log(`Candidate joined room: ${room}`);
    }

    if (socket.user.role === "admin") {
        socket.join("admins");
        console.log("Admin joined admin room");
    }

    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.user.id}`);
    });
});

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO has not been initialized");
    }

    return io;
};

module.exports = {
    initializeSocket,
    getIO
};