import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Send, FileText } from 'lucide-react';

export default function ReportIssue() {
  const [bins, setBins]       = useState([]);
  const [myReports, setMine]  = useState([]);
  const [form, setForm]       = useState({ bin_id:'', issue_type:'overflowing', description:'' });
  const [sending, setSending] = useState(false);

  const fetchAll = async () => {
    const [b, r] = await Promise.all([api.get('/bins'), api.get('/reports')]);
    setBins(b.data); setMine(r.data);
  };
  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSending(true);
    try {
      await api.post('/reports', form);
      toast.success('Report submitted! Thank you for helping keep the city clean.');
      setForm({ bin_id:'', issue_type:'overflowing', description:'' });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSending(false); }
  };

  const statusColor = { pending:'status-full', acknowledged:'status-half', resolved:'status-empty' };

  return (
    <div className="page-content">
      <div className="page-header"><div><h1>Report a Bin Issue</h1><p>Help us keep the city clean</p></div></div>

      <div className="two-col-layout">
        <div className="section-card">
          <h2><FileText size={20}/> Submit a Report</h2>
          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-group"><label>Select Bin</label>
              <select value={form.bin_id} onChange={e => setForm({...form, bin_id: e.target.value})} required>
                <option value="">Choose a bin...</option>
                {bins.map(b=><option key={b.id} value={b.id}>{b.bin_code} – {b.location_name} ({b.status})</option>)}
              </select></div>
            <div className="form-group"><label>Issue Type</label>
              <select value={form.issue_type} onChange={e => setForm({...form, issue_type: e.target.value})}>
                {['overflowing','damaged','missing','odor','fire','other'].map(t=>
                  <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select></div>
            <div className="form-group"><label>Description</label>
              <textarea rows={4} placeholder="Describe the issue in detail..."
                value={form.description} onChange={e => setForm({...form, description: e.target.value})}/></div>
            <button type="submit" className="btn-primary" disabled={sending}>
              <Send size={16}/> {sending ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>

        <div className="section-card">
          <h2>My Reports</h2>
          <div className="notif-log">
            {myReports.map(r => (
              <div key={r.id} className="notif-item">
                <div className="notif-header">
                  <span className="notif-type">{r.issue_type}</span>
                  <span className={`status-badge ${statusColor[r.status]}`}>{r.status}</span>
                </div>
                <p className="notif-msg">{r.description || '(No description)'}</p>
                <div className="notif-meta">
                  <span>📦 {r.bin_code} – {r.location_name}</span>
                  <span>🕐 {new Date(r.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {!myReports.length && <p className="empty-state">You haven't submitted any reports yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
