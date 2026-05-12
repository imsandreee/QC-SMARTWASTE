import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function CollectionHistory() {
  const [collections, setCollections] = useState([]);
  useEffect(() => { api.get('/reports/collections').then(r => setCollections(r.data)); }, []);
  return (
    <div className="page-content">
      <div className="page-header"><div><h1>Collection History</h1><p>Your past collections</p></div></div>
      <div className="section-card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Bin</th><th>Location</th><th>Fill Before</th><th>Notes</th><th>Collected At</th></tr></thead>
            <tbody>
              {collections.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.bin_code}</strong></td>
                  <td>{c.location_name}</td>
                  <td>
                    <div className="fill-bar-wrap" style={{minWidth:100}}>
                      <div className="fill-bar-label"><span>{c.fill_level_before}%</span></div>
                      <div className="fill-bar"><div className="fill-bar-inner fill-full" style={{width:`${c.fill_level_before}%`}}/></div>
                    </div>
                  </td>
                  <td>{c.notes || '—'}</td>
                  <td>{new Date(c.collected_at).toLocaleString()}</td>
                </tr>
              ))}
              {!collections.length && <tr><td colSpan={5} className="empty-td">No collections yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
