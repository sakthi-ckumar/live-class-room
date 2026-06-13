import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#6366f1", "#ec4899", "#06b6d4", "#10b981", "#f59e0b"];

function PollPanel({ poll, onVote, voted }) {
  if (!poll) return null;

  const votes = poll.votes || {};
  const chartData = poll.options.map((option) => ({ option, votes: votes[option] || 0 }));

  return (
    <div className="panel poll-panel">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-icon icon-poll"></div>
          Live Poll
        </div>
        {voted && <span className="badge badge-code" style={{fontSize:11}}>Voted</span>}
      </div>
      <p className="poll-question">{poll.question}</p>

      <div className="poll-options">
        {poll.options.map((option) => (
          <button key={option} onClick={() => onVote(option)} disabled={voted}
            style={voted ? { opacity: 0.5, cursor: "not-allowed", transform: "none" } : {}}>
            {option}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} barSize={28}>
          <XAxis dataKey="option" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#f1f5f9" }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PollPanel;
