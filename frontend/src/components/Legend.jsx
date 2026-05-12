export default function Legend() {
  return (
    <div className="map-legend">
      <h4>Bin Status</h4>
      <div className="legend-item">
        <span className="legend-dot green" />
        <span>Empty (0–30%)</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot yellow" />
        <span>Half (31–70%)</span>
      </div>
      <div className="legend-item">
        <span className="legend-dot red" />
        <span>Full (71–100%)</span>
      </div>
    </div>
  );
}
