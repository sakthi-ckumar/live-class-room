const express = require("express");
const Session = require("../models/Session");

const router = express.Router();

// Verify session exists (used by join page to check code before socket connect)
router.post("/verify", async (req, res) => {
  try {
    const { accessCode, password } = req.body;
    const session = await Session.findOne({ accessCode });
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.password !== password) return res.status(401).json({ message: "Incorrect password" });
    res.json({ title: session.title });
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
});

// Create session
router.post("/", async (req, res) => {
  try {
    const { title, accessCode, password, userName } = req.body;
    if (!title || !accessCode || !password)
      return res.status(400).json({ message: "title, accessCode and password are required" });

    const existing = await Session.findOne({ accessCode });
    if (existing) return res.status(400).json({ message: "Access code already in use" });

    const session = await Session.create({
      title,
      accessCode,
      password,
      creatorName: userName || "",
      notes: "",
      coSolve: "",
      videoUrl: "",
      poll: {
        question: "Did you understand today's topic?",
        options: ["Yes", "Partially", "No"],
        votes: { Yes: 0, Partially: 0, No: 0 },
        voters: []
      }
    });

    res.status(201).json({ title: session.title, accessCode: session.accessCode });
  } catch (err) {
    res.status(500).json({ message: "Failed to create session", error: err.message });
  }
});

// Set video URL (creator only — verified by matching creatorName)
router.post("/:accessCode/video", async (req, res) => {
  try {
    const { videoUrl, userName } = req.body;
    const session = await Session.findOne({ accessCode: req.params.accessCode });
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.creatorName !== userName) return res.status(403).json({ message: "Only the creator can set the video" });
    session.videoUrl = videoUrl || "";
    await session.save();
    res.json({ videoUrl: session.videoUrl });
  } catch (err) {
    res.status(500).json({ message: "Failed to set video", error: err.message });
  }
});

// Export session summary
router.get("/:accessCode/export", async (req, res) => {
  try {
    const session = await Session.findOne({ accessCode: req.params.accessCode });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const summary = {
      title: session.title,
      accessCode: session.accessCode,
      notes: session.notes,
      coSolve: session.coSolve,
      chat: session.chat,
      poll: {
        question: session.poll?.question,
        options: session.poll?.options,
        votes: session.poll?.votes ? Object.fromEntries(session.poll.votes) : {}
      },
      exportedAt: new Date()
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=${session.accessCode}-summary.json`);
    res.send(JSON.stringify(summary, null, 2));
  } catch (err) {
    res.status(500).json({ message: "Export failed", error: err.message });
  }
});

module.exports = router;
