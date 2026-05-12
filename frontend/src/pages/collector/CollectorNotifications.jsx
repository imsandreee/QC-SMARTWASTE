import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function CollectorNotifications() {
  const [notifs, setNotifs] = useState([]);
  useEffect(() => { api.get('/notifications/my').then(r => setNotifs(r.data)); }, []);
  const statusColor = { sent:'status-empty', failed:'status-full', pending:'status-half' };
  return (
    <div className="page-content">
      <div className="page-header"><div><h1>My Alerts</h1><p>SMS notifications sent to you</p></div></div>
      <div className="section-card">
        <div className="notif-log">
          {notifs.map(n => (
            <div key={n.id} className="notif-item">
              <div className="notif-header">
                <span className="notif-type">{n.type?.replace('_',' ')}</span>
                <span className={`status-badge ${statusColor[n.status]}`}>{n.status}</span>
              </div>
              <p className="notif-msg">{n.message}</p>
              <div className="notif-meta">
                {n.bin_code && <span>📦 {n.bin_code} – {n.location_name}</span>}
                <span>🕐 {new Date(n.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {!notifs.length && <p className="empty-state">No notifications yet</p>}
        </div>
      </div>
    </div>
  );
}
