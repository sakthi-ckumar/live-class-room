import { useState } from "react";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/sessions`;

function JoinSession({ onJoin }) {
  const [tab, setTab] = useState("join");
  const [join, setJoin] = useState({ userName: "Sakthi", accessCode: "CLASS123", password: "teach123" });
  const [create, setCreate] = useState({ userName: "", title: "", accessCode: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");
    if (!join.userName.trim() || !join.accessCode.trim() || !join.password.trim()) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/verify`, { accessCode: join.accessCode, password: join.password });
      onJoin(join);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join session.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    if (!create.userName.trim() || !create.title.trim() || !create.accessCode.trim() || !create.password.trim()) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(API, create);
      setTab("join");
      setJoin({ userName: create.userName, accessCode: create.accessCode, password: create.password });
      setError(" Session created! You can now join it.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-page">
      <div className="join-card">
        <div className="join-logo">
          <div className="join-logo-icon"></div>
          <h1>Live Classroom</h1>
        </div>
        <p className="subtitle">Collaborate in real time with your class.</p>

        <div className="join-tabs">
          <button type="button" className={tab === "join" ? "tab-active" : "tab"} onClick={() => { setTab("join"); setError(""); }}>Join Session</button>
          <button type="button" className={tab === "create" ? "tab-active" : "tab"} onClick={() => { setTab("create"); setError(""); }}>Create Session</button>
        </div>

        {tab === "join" ? (
          <form onSubmit={handleJoin}>
            <label>Your Name</label>
            <input name="userName" value={join.userName} onChange={(e) => setJoin({ ...join, userName: e.target.value })} placeholder="Enter your name" />
            <label>Session Code</label>
            <input name="accessCode" value={join.accessCode} onChange={(e) => setJoin({ ...join, accessCode: e.target.value })} placeholder="e.g. CLASS123" />
            <label>Password</label>
            <input type="password" name="password" value={join.password} onChange={(e) => setJoin({ ...join, password: e.target.value })} placeholder="Session password" />
            {error && <p className="form-error">{error}</p>}
            <button type="submit" disabled={loading}>{loading ? "Joining..." : "Join Session"}</button>
          </form>
        ) : (
          <form onSubmit={handleCreate}>
            <label>Your Name (Creator)</label>
            <input value={create.userName} onChange={(e) => setCreate({ ...create, userName: e.target.value })} placeholder="Your name" />
            <label>Session Title</label>
            <input value={create.title} onChange={(e) => setCreate({ ...create, title: e.target.value })} placeholder="e.g. React Hooks Workshop" />
            <label>Session Code</label>
            <input value={create.accessCode} onChange={(e) => setCreate({ ...create, accessCode: e.target.value })} placeholder="e.g. HOOKS101" />
            <label>Password</label>
            <input type="password" value={create.password} onChange={(e) => setCreate({ ...create, password: e.target.value })} placeholder="Set a password" />
            {error && <p className="form-error">{error}</p>}
            <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Session"}</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default JoinSession;
