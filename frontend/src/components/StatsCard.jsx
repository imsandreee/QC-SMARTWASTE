export default function StatsCard({ icon, label, value, color, sub }) {
  return (
    <div className={`stats-card stats-card--${color}`}>
      <div className="stats-icon">{icon}</div>
      <div className="stats-body">
        <div className="stats-value">{value}</div>
        <div className="stats-label">{label}</div>
        {sub && <div className="stats-sub">{sub}</div>}
      </div>
    </div>
  );
}
