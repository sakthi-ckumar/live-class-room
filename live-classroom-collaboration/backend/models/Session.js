const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userName: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const pollSchema = new mongoose.Schema(
  {
    question: String,
    options: [String],
    votes: { type: Map, of: Number, default: {} },
    voters: { type: [String], default: [] }
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true },
    accessCode: { type: String, required: true, unique: true },
    password:   { type: String, required: true },
    notes:       { type: String, default: "" },
    coSolve:     { type: String, default: "" },
    videoUrl:    { type: String, default: "" },
    creatorName: { type: String, default: "" },
    chat:        [chatSchema],
    poll:        pollSchema,
    activeUsers: [String]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
