const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Session = require("./models/Session");

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Session.deleteMany();

    await Session.create({
      title: "React Live Classroom",
      accessCode: "CLASS123",
      password: "teach123",
      creatorName: "Sakthi",
      notes: "Topic: React Hooks\n\n1. useState manages component state.\n2. useEffect handles side effects.\n3. useMemo improves performance for expensive calculations.",
      coSolve: "Problem: Write a custom useFetch hook.\n\n// Your solution here:",
      chat: [
        {
          userName: "Mentor",
          message: "Welcome everyone. Please add your doubts in chat.",
          createdAt: new Date()
        }
      ],
      poll: {
        question: "How confident are you with React Hooks?",
        options: ["Good", "Average", "Need Practice"],
        votes: { Good: 1, Average: 0, "Need Practice": 0 },
        voters: []
      }
    });

    console.log("Seed session created successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
