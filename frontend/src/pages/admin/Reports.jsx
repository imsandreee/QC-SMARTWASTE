import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function Reports() {
  const [reports, setReports]         = useState([]);
  const [collections, setCollections] = useState([]);
  const [tab, setTab]                 = useState('reports');

  const fetchAll = async () => {
    const [r, c] = await Promise.all([api.get('/reports'), api.get('/reports/collections')]);
    setReports(r.data); setCollections(c.data);
  };
  useEffect(() => { fetchAll(); }, []);

  const updateStatus = async (id, status) => {
    try { await api.put(`/reports/${id}/status`, { status }); toast.success('Status updated'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const statusColor = { pending: 'status-full', acknowledged: 'status-half', resolved: 'status-empty' };

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h1>Reports & Collections</h1><p>Citizen reports and collection history</p></div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab==='reports' ? 'tab--active' : ''}`} onClick={() => setTab('reports')}>Citizen Reports ({reports.length})</button>
        <button className={`tab ${tab==='collections' ? 'tab--active' : ''}`} onClick={() => setTab('collections')}>Collection History ({collections.length})</button>
      </div>

      {tab === 'reports' && (
        <div className="section-card">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Bin</th><th>Location</th><th>Issue</th><th>Description</th><th>Reporter</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.bin_code}</strong></td>
                    <td>{r.location_name}</td>
                    <td><span className="type-badge">{r.issue_type}</span></td>
                    <td>{r.description || '—'}</td>
                    <td>{r.citizen_name}</td>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    <td><span className={`status-badge ${statusColor[r.status]}`}>{r.status}</span></td>
                    <td>
                      {r.status !== 'resolved' && (
                        <select className="inline-select" value={r.status}
                          onChange={e => updateStatus(r.id, e.target.value)}>
                          <option value="pending">Pending</option>
                          <option value="acknowledged">Acknowledged</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'collections' && (
        <div className="section-card">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Bin</th><th>Location</th><th>Collector</th><th>Fill Before</th><th>Notes</th><th>Collected At</th></tr></thead>
              <tbody>
                {collections.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.bin_code}</strong></td>
                    <td>{c.location_name}</td>
                    <td>{c.collector_name}</td>
                    <td>
                      <div className="fill-bar-wrap" style={{minWidth:100}}>
                        <div className="fill-bar-label"><span>{c.fill_level_before}%</span></div>
                        <div className="fill-bar"><div className="fill-bar-inner fill-full" style={{ width:`${c.fill_level_before}%` }}/></div>
                      </div>
                    </td>
                    <td>{c.notes || '—'}</td>
                    <td>{new Date(c.collected_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
