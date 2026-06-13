function PresencePanel({ users }) {
  return (
    <div className="panel presence-panel">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-icon icon-users"></div>
          Online — {users.length}
        </div>
      </div>
      <div className="user-list">
        {users.map((user) => (
          <span key={user} className="user-badge">
            <span className="user-dot" />
            {user}
          </span>
        ))}
      </div>
    </div>
  );
}

export default PresencePanel;
