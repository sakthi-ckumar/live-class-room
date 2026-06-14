import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { jsPDF } from "jspdf";
import NotesPanel from "../components/NotesPanel";
import ChatPanel from "../components/ChatPanel";
import PollPanel from "../components/PollPanel";
import PresencePanel from "../components/PresencePanel";
import CoSolvePanel from "../components/CoSolvePanel";
import VideoPanel from "../components/VideoPanel";

function Classroom({ sessionInfo, onLeave }) {
  const { userName, accessCode, password } = sessionInfo;

  const [session, setSession]           = useState(null);
  const [notes, setNotes]               = useState("");
  const [coSolve, setCoSolve]           = useState("");
  const [chat, setChat]                 = useState([]);
  const [poll, setPoll]                 = useState(null);
  const [onlineUsers, setOnlineUsers]   = useState([]);
  const [remoteCursor, setRemoteCursor] = useState(null);
  const [saveStatus, setSaveStatus]     = useState("Connected");
  const [voted, setVoted]               = useState(false);
  const [authError, setAuthError]       = useState("");
  const [videoUrl, setVideoUrl]         = useState("");
  const [showSummary, setShowSummary]   = useState(false);
  const [summary, setSummary]           = useState(null);

  const notesTimerRef   = useRef(null);
  const coSolveTimerRef = useRef(null);
  const socketRef       = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL);
    socketRef.current = socket;

    socket.emit("join-session", { accessCode, userName, password });

    socket.on("join-error", (msg) => {
      setAuthError(msg);
      socket.disconnect();
    });

    socket.on("session-state", (data) => {
      if (!data) { setAuthError("Session not found."); return; }
      setSession(data);
      setNotes(data.notes || "");
      setCoSolve(data.coSolve || "");
      setChat(data.chat || []);
      setPoll(data.poll || null);
      setVideoUrl(data.videoUrl || "");
      if (data.poll?.voters?.includes(userName)) setVoted(true);
    });

    socket.on("notes-updated",   (v) => { setNotes(v); setSaveStatus("Synced"); });
    socket.on("cosolve-updated", (v) => setCoSolve(v));
    socket.on("chat-message",    (m) => setChat((prev) => [...prev, m]));
    socket.on("poll-updated",    (p) => setPoll(p));
    socket.on("video-updated",   (v) => setVideoUrl(v));
    socket.on("presence-updated",(u) => setOnlineUsers(u));
    socket.on("cursor-updated",  (c) => setRemoteCursor(c));
    socket.on("vote-error",      ()  => setVoted(true));

    return () => socket.disconnect();
  }, [accessCode, userName, password]);

  const handleNotesChange = (value, cursorPosition) => {
    setNotes(value);
    setSaveStatus("Saving...");
    socketRef.current.emit("cursor-change", { accessCode, userName, cursorPosition });
    clearTimeout(notesTimerRef.current);
    notesTimerRef.current = setTimeout(() => {
      socketRef.current.emit("notes-change", { accessCode, notes: value });
      setSaveStatus("Saved");
    }, 400);
  };

  const handleCoSolveChange = (value) => {
    setCoSolve(value);
    clearTimeout(coSolveTimerRef.current);
    coSolveTimerRef.current = setTimeout(() => {
      socketRef.current.emit("cosolve-change", { accessCode, coSolve: value });
    }, 400);
  };

  const handleSendMessage = (message) =>
    socketRef.current.emit("chat-message", { accessCode, userName, message });

  const handleSetVideo = (url) =>
    socketRef.current.emit("set-video", { accessCode, userName, videoUrl: url });

  const handleVote = (option) => {    if (voted) return;
    setVoted(true);
    socketRef.current.emit("vote-poll", { accessCode, option });
  };

  const handleExport = () => {
    const data = {
      title: session.title,
      accessCode,
      notes,
      coSolve,
      chat,
      poll: poll ? {
        question: poll.question,
        options: poll.options,
        votes: poll.votes
      } : null,
      exportedAt: new Date().toLocaleString()
    };
    setSummary(data);
    setShowSummary(true);
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    const lm = 15; // left margin
    const pw = 180; // page width for text
    let y = 20;

    const addLine = (text, size = 11, bold = false) => {
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, pw);
      lines.forEach((line) => {
        if (y > 275) { doc.addPage(); y = 20; }
        doc.text(line, lm, y);
        y += size * 0.5 + 2;
      });
    };

    const addSection = (title) => {
      y += 4;
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.4);
      doc.line(lm, y, lm + pw, y);
      y += 5;
      addLine(title, 13, true);
      y += 2;
    };

    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 18, "F");
    doc.setTextColor(255, 255, 255);
    addLine(summary.title, 16, true);
    doc.setTextColor(0, 0, 0);
    y = 26;
    addLine(`Session Code: ${summary.accessCode}  |  Exported: ${summary.exportedAt}`, 9);

    addSection("Notes");
    addLine(summary.notes || "—");

    addSection("Co-Solve");
    addLine(summary.coSolve || "—");

    if (summary.poll) {
      addSection("Poll");
      addLine(summary.poll.question, 11, true);
      summary.poll.options.forEach((opt) => {
        const votes = summary.poll.votes?.[opt] ?? 0;
        addLine(`  ${opt}: ${votes} vote${votes !== 1 ? "s" : ""}`);
      });
    }

    addSection(`Chat (${summary.chat.length} messages)`);
    if (summary.chat.length === 0) {
      addLine("No messages.");
    } else {
      summary.chat.forEach((c) => addLine(`${c.userName}: ${c.message}`));
    }

    doc.save(`${summary.accessCode}-summary.pdf`);
  };

  if (authError) {
    return (
      <div className="center">
        <p style={{ color: "#f87171", marginBottom: 16 }}>Access denied: {authError}</p>
        <button onClick={onLeave}>← Back</button>
      </div>
    );
  }

  if (!session) return (
    <div className="loader-screen">
      <div className="loader-spinner" />
      <p className="loader-text">Connecting to classroom...</p>
    </div>
  );

  const isSaving   = saveStatus === "Saving...";
  const isCreator  = session.creatorName === userName;

  return (
    <div className="classroom-page">
      <header className="classroom-header">
        <div className="header-left">
          <div className="header-icon">🎓</div>
          <div>
            <h1>{session.title}</h1>
            <div className="header-meta">
              <span className="badge badge-code">{accessCode}</span>
              <span className={`badge badge-status${isSaving ? " saving" : ""}`}>
                {saveStatus}
              </span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={handleExport}>Export</button>
          <button className="secondary" onClick={onLeave}>Leave</button>
        </div>
      </header>

      <main className="classroom-grid" style={{ minHeight: 0 }}>
        <section className="main-column">
          <VideoPanel isCreator={isCreator} videoUrl={videoUrl} onSetVideo={handleSetVideo} />
          <CoSolvePanel coSolve={coSolve} onChange={handleCoSolveChange} />
        </section>
        <aside className="side-column">
          <PresencePanel users={onlineUsers} />
          <NotesPanel notes={notes} onChange={handleNotesChange} remoteCursor={remoteCursor} />
          <ChatPanel chat={chat} onSend={handleSendMessage} />
          <PollPanel poll={poll} onVote={handleVote} voted={voted} />
        </aside>
      </main>

      <button className="fab-export" onClick={handleExport} title="View Summary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </button>

      {showSummary && summary && (
        <div className="modal-overlay" onClick={() => setShowSummary(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Session Summary</h2>
              <button className="modal-close" onClick={() => setShowSummary(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="summary-section">
                <span className="summary-label">Title</span>
                <p>{summary.title}</p>
              </div>
              <div className="summary-section">
                <span className="summary-label">Session Code</span>
                <p>{summary.accessCode}</p>
              </div>
              <div className="summary-section">
                <span className="summary-label">Notes</span>
                <pre>{summary.notes || "—"}</pre>
              </div>
              <div className="summary-section">
                <span className="summary-label">Co-Solve</span>
                <pre>{summary.coSolve || "—"}</pre>
              </div>
              {summary.poll && (
                <div className="summary-section">
                  <span className="summary-label">Poll — {summary.poll.question}</span>
                  {summary.poll.options.map((opt) => (
                    <div key={opt} className="summary-poll-row">
                      <span>{opt}</span>
                      <span className="summary-vote">{summary.poll.votes?.[opt] ?? 0} votes</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="summary-section">
                <span className="summary-label">Chat ({summary.chat.length} messages)</span>
                {summary.chat.map((c, i) => (
                  <div key={i} className="summary-chat-row">
                    <strong>{c.userName}:</strong> {c.message}
                  </div>
                ))}
              </div>
              <div className="summary-section">
                <span className="summary-label">Exported At</span>
                <p>{summary.exportedAt}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleDownload}>Download PDF</button>
              <button className="secondary" onClick={() => setShowSummary(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Classroom;
