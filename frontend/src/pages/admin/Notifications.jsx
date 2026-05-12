import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

export default function Notifications() {
  const [logs, setLogs]       = useState([]);
  const [bins, setBins]       = useState([]);
  const [users, setUsers]     = useState([]);
  const [form, setForm]       = useState({ phone:'', message:'', recipient_id:'', bin_id:'' });
  const [sending, setSending] = useState(false);

  const fetchAll = async () => {
    const [n, b, u] = await Promise.all([api.get('/notifications'), api.get('/bins'), api.get('/users')]);
    setLogs(n.data); setBins(b.data); setUsers(u.data.filter(u => u.role !== 'admin'));
  };
  useEffect(() => { fetchAll(); }, []);

  const handleUserSelect = (e) => {
    const u = users.find(x => x.id === parseInt(e.target.value));
    setForm({ ...form, recipient_id: e.target.value, phone: u?.phone || '' });
  };

  const handleSend = async (e) => {
    e.preventDefault(); setSending(true);
    try {
      await api.post('/notifications/send', form);
      toast.success('SMS sent (or simulated in demo mode)');
      setForm({ phone:'', message:'', recipient_id:'', bin_id:'' });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
    finally { setSending(false); }
  };

  const statusColor = { sent:'status-empty', failed:'status-full', pending:'status-half' };

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h1>Notifications</h1><p>Send SMS alerts and view notification history</p></div>
      </div>

      <div className="two-col-layout">
        {/* Send Form */}
        <div className="section-card">
          <h2>Send Manual SMS</h2>
          <form onSubmit={handleSend} className="notif-form">
            <div className="form-group"><label>Recipient (User)</label>
              <select value={form.recipient_id} onChange={handleUserSelect}>
                <option value="">Select user...</option>
                {users.map(u=><option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>)}
              </select></div>
            <div className="form-group"><label>Phone Number</label>
              <input placeholder="09XXXXXXXXX" value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})} required/></div>
            <div className="form-group"><label>Related Bin (optional)</label>
              <select value={form.bin_id} onChange={e => setForm({...form, bin_id: e.target.value})}>
                <option value="">None</option>
                {bins.map(b=><option key={b.id} value={b.id}>{b.bin_code} – {b.location_name}</option>)}
              </select></div>
            <div className="form-group"><label>Message</label>
              <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                rows={4} placeholder="Type your message..." required/></div>
            <button type="submit" className="btn-primary" disabled={sending}>
              <Send size={16}/> {sending ? 'Sending...' : 'Send SMS'}
            </button>
          </form>
          <p className="demo-note">💡 Without a Semaphore API key, SMS will be simulated and logged.</p>
        </div>

        {/* Log */}
        <div className="section-card">
          <h2>Notification History</h2>
          <div className="notif-log">
            {logs.map(n => (
              <div key={n.id} className="notif-item">
                <div className="notif-header">
                  <span className="notif-phone">{n.phone}</span>
                  <span className={`status-badge ${statusColor[n.status]}`}>{n.status}</span>
                </div>
                <p className="notif-msg">{n.message}</p>
                <div className="notif-meta">
                  {n.bin_code && <span>📦 {n.bin_code}</span>}
                  <span>🕐 {new Date(n.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {!logs.length && <p className="empty-state">No notifications yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
