const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const Session = require("./models/Session");
const sessionRoutes = require("./routes/sessionRoutes");

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use("/api/sessions", sessionRoutes);
app.get("/", (_, res) => res.send("Live Classroom Collaboration API is running"));

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});

const onlineUsersBySession = new Map();
// rate limit: track last event timestamps per socket
const rateLimits = new Map();

function getUsers(accessCode) {
  return Array.from(onlineUsersBySession.get(accessCode) || []);
}

function sanitize(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[<>]/g, "").slice(0, 2000);
}

function isRateLimited(socketId, key, limitMs = 500) {
  const k = `${socketId}:${key}`;
  const last = rateLimits.get(k) || 0;
  if (Date.now() - last < limitMs) return true;
  rateLimits.set(k, Date.now());
  return false;
}

io.on("connection", (socket) => {

  socket.on("join-session", async ({ accessCode, userName, password }) => {
    const session = await Session.findOne({ accessCode });

    if (!session) {
      socket.emit("join-error", "Session not found.");
      return;
    }
    if (session.password !== password) {
      socket.emit("join-error", "Incorrect password.");
      return;
    }

    socket.join(accessCode);
    socket.data.accessCode = accessCode;
    socket.data.userName = sanitize(userName);

    if (!onlineUsersBySession.has(accessCode)) {
      onlineUsersBySession.set(accessCode, new Set());
    }
    onlineUsersBySession.get(accessCode).add(socket.data.userName);
    io.to(accessCode).emit("presence-updated", getUsers(accessCode));
    socket.emit("session-state", session);
  });

  socket.on("notes-change", async ({ accessCode, notes }) => {
    if (isRateLimited(socket.id, "notes", 300)) return;
    const clean = sanitize(notes);
    const session = await Session.findOneAndUpdate(
      { accessCode },
      { notes: clean },
      { new: true }
    );
    if (session) socket.to(accessCode).emit("notes-updated", session.notes);
  });

  socket.on("cosolve-change", async ({ accessCode, coSolve }) => {
    if (isRateLimited(socket.id, "cosolve", 300)) return;
    const clean = sanitize(coSolve);
    await Session.findOneAndUpdate({ accessCode }, { coSolve: clean });
    socket.to(accessCode).emit("cosolve-updated", clean);
  });

  socket.on("chat-message", async ({ accessCode, userName, message }) => {
    if (isRateLimited(socket.id, "chat", 1000)) return;
    const chatItem = {
      userName: sanitize(userName),
      message: sanitize(message),
      createdAt: new Date()
    };
    await Session.findOneAndUpdate({ accessCode }, { $push: { chat: chatItem } });
    io.to(accessCode).emit("chat-message", chatItem);
  });

  socket.on("vote-poll", async ({ accessCode, option }) => {
    const { userName } = socket.data;
    const session = await Session.findOne({ accessCode });
    if (!session?.poll) return;

    // dedup: one vote per user
    if (session.poll.voters.includes(userName)) {
      socket.emit("vote-error", "You have already voted.");
      return;
    }

    const votes = session.poll.votes || new Map();
    votes.set(option, (votes.get(option) || 0) + 1);
    session.poll.votes = votes;
    session.poll.voters.push(userName);
    await session.save();

    io.to(accessCode).emit("poll-updated", session.poll);
  });

  socket.on("set-video", async ({ accessCode, userName, videoUrl }) => {
    const session = await Session.findOne({ accessCode });
    if (!session || session.creatorName !== userName) return;
    session.videoUrl = sanitize(videoUrl);
    await session.save();
    io.to(accessCode).emit("video-updated", session.videoUrl);
  });

  socket.on("cursor-change", ({ accessCode, userName, cursorPosition }) => {
    if (isRateLimited(socket.id, "cursor", 100)) return;
    socket.to(accessCode).emit("cursor-updated", { userName, cursorPosition });
  });

  socket.on("disconnect", () => {
    const { accessCode, userName } = socket.data;
    rateLimits.forEach((_, k) => { if (k.startsWith(socket.id)) rateLimits.delete(k); });
    if (accessCode && userName && onlineUsersBySession.has(accessCode)) {
      onlineUsersBySession.get(accessCode).delete(userName);
      io.to(accessCode).emit("presence-updated", getUsers(accessCode));
    }
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 5001;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    console.log("MongoDB connected successfully");
  })
  .catch((err) => console.error("MongoDB connection failed", err.message));
