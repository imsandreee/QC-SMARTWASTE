import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Trash2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const DEMOS = [
    { role: 'Admin', email: 'admin@bintrack.ph', password: 'password', color: 'var(--primary)' },
    { role: 'Collector', email: 'collector1@bintrack.ph', password: 'password', color: 'var(--secondary)' },
    { role: 'Citizen', email: 'citizen@bintrack.ph', password: 'password', color: 'var(--accent)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.full_name}!`);
      const redirectMap = { admin: '/admin', collector: '/collector', citizen: '/citizen' };
      navigate(redirectMap[user.role]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />

      <div className="login-card">
        <Link to="/" className="nav-link" style={{ marginBottom: '20px', width: 'fit-content' }}>
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <div className="login-logo">
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
            <img src="/assets/qc_smartwaste_logo.png" alt="QC SmartWaste" style={{ height: '60px' }} />
            <img src="/assets/quezon_city_logo.svg" alt="Quezon City" style={{ height: '60px' }} />
          </div>
          <h1>QC SmartWaste</h1>
          <p>Smart Waste Bin Monitoring</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-icon-wrap">
              <input
                id="password"
                type={show ? 'text' : 'password'}
                placeholder="Enter password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
              <button type="button" className="eye-btn" onClick={() => setShow(!show)}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo quick-login */}
        <div className="demo-section">
          <p>Quick Demo Login</p>
          <div className="demo-btns">
            {DEMOS.map(d => (
              <button
                key={d.role}
                className="demo-btn"
                style={{ borderColor: d.color, color: d.color }}
                onClick={() => setForm({ email: d.email, password: d.password })}
              >
                {d.role}
              </button>
            ))}
          </div>
        </div>

        <p className="login-footer">
          New citizen? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}
