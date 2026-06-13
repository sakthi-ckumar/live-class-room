function NotesPanel({ notes, onChange, remoteCursor }) {
  const handleChange = (e) => onChange(e.target.value, e.target.selectionStart);

  return (
    <div className="panel notes-panel">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-icon icon-notes"></div>
          Shared Notes
        </div>
        {remoteCursor && (
          <span className="cursor-info">
            {remoteCursor.userName} @ {remoteCursor.cursorPosition}
          </span>
        )}
      </div>
      <textarea value={notes} onChange={handleChange} placeholder="Start writing shared classroom notes..." />
    </div>
  );
}

export default NotesPanel;
