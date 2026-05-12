import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import api from '../utils/api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', barangay_id: '' });
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(false);

  useState(() => {
    api.get('/users/barangays').then(r => setBarangays(r.data)).catch(() => {});
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to QC SmartWaste.');
      navigate('/citizen');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card" style={{ maxWidth: 420 }}>
        <div className="login-logo">
          <Trash2 size={36} />
          <h1>QC SmartWaste</h1>
          <p>Create Citizen Account</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {[
            { id: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Juan Dela Cruz' },
            { id: 'email',     label: 'Email',     type: 'email', placeholder: 'you@email.com' },
            { id: 'password',  label: 'Password',  type: 'password', placeholder: 'Min. 6 characters' },
            { id: 'phone',     label: 'Phone (for SMS)', type: 'tel', placeholder: '09XXXXXXXXX' },
          ].map(f => (
            <div className="form-group" key={f.id}>
              <label htmlFor={f.id}>{f.label}</label>
              <input id={f.id} type={f.type} placeholder={f.placeholder}
                value={form[f.id]} onChange={e => setForm({ ...form, [f.id]: e.target.value })}
                required={f.id !== 'phone'} />
            </div>
          ))}
          <div className="form-group">
            <label htmlFor="barangay">Barangay</label>
            <select id="barangay" value={form.barangay_id}
              onChange={e => setForm({ ...form, barangay_id: e.target.value })}>
              <option value="">Select barangay...</option>
              {barangays.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p className="login-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
