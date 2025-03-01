const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST'],
    },
});

const userSocketMap = {}; // {userId->socketId}

const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
}

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId
    if (userId !== undefined) {
        userSocketMap[userId] = socket.id;
    }

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    })
})

// Set up some basic routes for testing
app.get("/", (req, res) => {
    res.status(200).json({ message: "API is running..." });
});

// Mock routes for testing
app.post("/api/v1/user/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Missing credentials" });
    if (username === "meme" && password === "=x5]k*3BY?v5NXc") {
        return res.status(200).json({ token: "validtoken" });
    }
    return res.status(401).json({ error: "Invalid credentials" });
});

module.exports = { app, io, server, getReceiverSocketId };
