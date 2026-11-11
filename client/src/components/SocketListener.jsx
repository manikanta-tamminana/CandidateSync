
import { useEffect, useRef } from "react";
import { createSocketConnection } from "../utils/socket";

const SocketListener = ({ token, onStatusUpdate }) => {
    const socketRef = useRef(null);

    useEffect(() => {
        if (!token) return;

        const socket = createSocketConnection(token);
        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Connected to Socket.IO:", socket.id);
        });

        socket.on("candidate:status-updated", (data) => {
            console.log("Candidate status updated:", data);
            onStatusUpdate?.(data);
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error.message);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [token, onStatusUpdate]);

    return null;
};

export default SocketListener;
