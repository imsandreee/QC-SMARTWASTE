import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';

const EMPTY = { full_name:'', email:'', password:'', role:'collector', phone:'', barangay_id:'' };

export default function ManageUsers() {
  const [users, setUsers]         = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [loading, setLoading]     = useState(false);

  const fetchAll = async () => {
    const [u, b] = await Promise.all([api.get('/users'), api.get('/users/barangays')]);
    setUsers(u.data); setBarangays(b.data);
  };
  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setShowModal(true); };
  const openEdit   = (u) => {
    setForm({ full_name: u.full_name, email: u.email, password: '', role: u.role, phone: u.phone||'', barangay_id: u.barangay_id||'' });
    setEditing(u.id); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editing) { await api.put(`/users/${editing}`, form); toast.success('User updated'); }
      else         { await api.post('/users', form);            toast.success('User created'); }
      setShowModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    try { await api.delete(`/users/${id}`); toast.success('User deactivated'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const roleColor = { admin: '#7c3aed', collector: '#0891b2', citizen: '#059669' };

  return (
    <div className="page-content">
      <div className="page-header">
        <div><h1>Manage Users</h1><p>Create and manage system accounts</p></div>
        <button className="btn-primary" onClick={openCreate}><Plus size={16}/> Add User</button>
      </div>

      <div className="section-card">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Barangay</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.full_name}</strong></td>
                  <td>{u.email}</td>
                  <td><span className="role-pill" style={{ background: roleColor[u.role]+'22', color: roleColor[u.role] }}>{u.role}</span></td>
                  <td>{u.phone || '—'}</td>
                  <td>{u.barangay_name || '—'}</td>
                  <td><span className={`status-badge ${u.is_active ? 'status-empty' : 'status-full'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="action-cell">
                    <button className="btn-icon-sm" onClick={() => openEdit(u)}><Pencil size={14}/></button>
                    <button className="btn-icon-sm btn-danger-sm" onClick={() => handleDelete(u.id)}><Trash2 size={14}/></button>
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
              <h3>{editing ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group"><label>Full Name</label>
                  <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required/></div>
                <div className="form-group"><label>Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    <option>admin</option><option>collector</option><option>citizen</option>
                  </select></div>
              </div>
              <div className="form-group"><label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required/></div>
              <div className="form-row">
                <div className="form-group"><label>Password {editing && '(leave blank to keep)'}</label>
                  <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                    required={!editing}/></div>
                <div className="form-group"><label>Phone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="09XXXXXXXXX"/></div>
              </div>
              <div className="form-group"><label>Barangay</label>
                <select value={form.barangay_id} onChange={e => setForm({...form, barangay_id: e.target.value})}>
                  <option value="">None</option>
                  {barangays.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                </select></div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  <Save size={16}/> {loading ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
