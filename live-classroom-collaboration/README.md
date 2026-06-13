# Challenge 2: Live Classroom Collaboration Platform

This is a full-stack real-time classroom collaboration project.

## Features

- Join session using name and access code
- Real-time shared notes
- Real-time chat
- Live poll voting and visualization
- Online user presence
- Cursor position broadcast
- Session persistence in MongoDB
- Export session summary as JSON

## Tech Stack

- Frontend: React.js, Vite, Socket.IO Client, Axios, Recharts
- Backend: Node.js, Express.js, Socket.IO, MongoDB, Mongoose

## Project Structure

```text
live-classroom-collaboration
├── backend
│   ├── server.js
│   ├── seed.js
│   ├── package.json
│   ├── .env
│   ├── models
│   │   └── Session.js
│   └── routes
│       └── sessionRoutes.js
└── frontend
    ├── index.html
    ├── package.json
    └── src
        ├── App.jsx
        ├── main.jsx
        ├── style.css
        ├── pages
        │   ├── JoinSession.jsx
        │   └── Classroom.jsx
        └── components
            ├── NotesPanel.jsx
            ├── ChatPanel.jsx
            ├── PollPanel.jsx
            └── PresencePanel.jsx
```

## Setup Instructions

### 1. Start MongoDB

Make sure MongoDB is running locally.

```bash
mongodb://127.0.0.1:27017
```

### 2. Start Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

Backend runs on:

```bash
http://localhost:5001
```

### 3. Start Frontend

Open a second terminal.

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

### 4. Demo Session

```text
Name: Sakthi
Session Code: CLASS123
```

Open the same URL in two browser tabs with different names to test real-time collaboration.

## Interview Explanation

Sir, this project is a Live Classroom Collaboration Platform. The main objective is to allow multiple users to collaborate in real time during a classroom session.

I implemented shared notes, live chat, polling, online presence, cursor tracking, session persistence, and export functionality.

On the frontend, I used React.js with Socket.IO Client for real-time communication. On the backend, I used Node.js, Express.js, Socket.IO, MongoDB, and Mongoose.

When a user joins a classroom session, the frontend connects to the Socket.IO server and joins a room based on the session code. Any update to notes, chat, poll voting, or cursor movement is emitted to the server and broadcast to other users in the same room.

For persistence, I stored session notes, chat messages, and poll votes in MongoDB. I also added export functionality to download the session summary as JSON.

This project demonstrates real-time communication, state synchronization, backend persistence, and scalable full-stack architecture.
