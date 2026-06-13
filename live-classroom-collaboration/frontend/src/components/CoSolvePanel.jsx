function CoSolvePanel({ coSolve, onChange }) {
  return (
    <div className="panel cosolve-panel">
      <div className="panel-header">
        <div className="panel-title">
          <div className="panel-icon icon-cosolve"></div>
          Co-Solve Scratchpad
        </div>
        <span className="cursor-info">shared · live</span>
      </div>
      <textarea
        value={coSolve}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste a problem here and solve it together..."
        spellCheck={false}
      />
    </div>
  );
}

export default CoSolvePanel;
