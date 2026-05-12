import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';

const EMPTY_FORM = { bin_code:'', location_name:'', latitude:'', longitude:'', barangay_id:'', capacity_L:120, bin_type:'general', assigned_collector_id:'', installed_at:'' };

export default function ManageBins() {
  const [bins, setBins]               = useState([]);
  const [barangays, setBarangays]     = useState([]);
  const [collectors, setCollectors]   = useState([]);
  const [showModal, setShowModal]     = useState(false);
  const [editing, setEditing]         = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [loading, setLoading]         = useState(false);

  const fetchAll = async () => {
    const [b, br, col] = await Promise.all([
      api.get('/bins'),
      api.get('/users/barangays'),
      api.get('/users/collectors'),
    ]);
    setBins(b.data); setBarangays(br.data); setCollectors(col.data);
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setShowModal(true); };
  const openEdit   = (bin) => {
    setForm({ bin_code: bin.bin_code, location_name: bin.location_name, latitude: bin.latitude, longitude: bin.longitude,
      barangay_id: bin.barangay_id || '', capacity_L: bin.capacity_L, bin_type: bin.bin_type,
      assigned_collector_id: bin.assigned_collector_id || '', installed_at: bin.installed_at?.split('T')[0] || '' });
    setEditing(bin.id); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editing) { await api.put(`/bins/${editing}`, form); toast.success('Bin updated'); }
      else         { await api.post('/bins', form);            toast.success('Bin created'); }
      setShowModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this bin?')) return;
    try { await api.delete(`/bins/${id}`); toast.success('Bin deactivated'); fetchAll(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h1>Manage Bins</h1><p>Add, edit, or deactivate smart bins</p></div>
        <button className="btn-primary" onClick={openCreate}><Plus size={16}/> Add Bin</button>
      </div>

      <div className="section-card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Code</th><th>Location</th><th>Type</th><th>Barangay</th><th>Collector</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {bins.map(b => (
                <tr key={b.id}>
                  <td><strong>{b.bin_code}</strong></td>
                  <td>{b.location_name}</td>
                  <td><span className="type-badge">{b.bin_type}</span></td>
                  <td>{b.barangay_name || '—'}</td>
                  <td>{b.collector_name || '—'}</td>
                  <td><span className={`status-badge status-${b.status}`}>{b.status}</span></td>
                  <td className="action-cell">
                    <button className="btn-icon-sm" onClick={() => openEdit(b)}><Pencil size={14}/></button>
                    <button className="btn-icon-sm btn-danger-sm" onClick={() => handleDelete(b.id)}><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Bin' : 'Add New Bin'}</h3>
              <button onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group"><label>Bin Code</label>
                  <input value={form.bin_code} onChange={e => setForm({...form, bin_code: e.target.value})} required disabled={!!editing}/></div>
                <div className="form-group"><label>Type</label>
                  <select value={form.bin_type} onChange={e => setForm({...form, bin_type: e.target.value})}>
                    {['general','recyclable','hazardous','biodegradable'].map(t=><option key={t}>{t}</option>)}
                  </select></div>
              </div>
              <div className="form-group"><label>Location Name</label>
                <input value={form.location_name} onChange={e => setForm({...form, location_name: e.target.value})} required/></div>
              <div className="form-row">
                <div className="form-group"><label>Latitude</label>
                  <input type="number" step="any" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} required/></div>
                <div className="form-group"><label>Longitude</label>
                  <input type="number" step="any" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} required/></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Barangay</label>
                  <select value={form.barangay_id} onChange={e => setForm({...form, barangay_id: e.target.value})}>
                    <option value="">None</option>
                    {barangays.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                  </select></div>
                <div className="form-group"><label>Assigned Collector</label>
                  <select value={form.assigned_collector_id} onChange={e => setForm({...form, assigned_collector_id: e.target.value})}>
                    <option value="">Unassigned</option>
                    {collectors.map(c=><option key={c.id} value={c.id}>{c.full_name}</option>)}
                  </select></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Capacity (L)</label>
                  <input type="number" value={form.capacity_L} onChange={e => setForm({...form, capacity_L: e.target.value})}/></div>
                <div className="form-group"><label>Installed At</label>
                  <input type="date" value={form.installed_at} onChange={e => setForm({...form, installed_at: e.target.value})}/></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  <Save size={16}/> {loading ? 'Saving...' : 'Save Bin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
