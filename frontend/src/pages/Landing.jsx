import { Link } from 'react-router-dom';
import { Trash2, MapPin, Bell, BarChart2, Shield, Zap, Users, ChevronRight, CheckCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  const stats = [
    { value: '12+', label: 'Smart Bins Deployed' },
    { value: '8', label: 'Barangays Covered' },
    { value: '98%', label: 'Collection Rate' },
    { value: '24/7', label: 'Real-time Monitoring' },
  ];

  const features = [
    { icon: <MapPin size={28} />, title: 'Interactive Map', desc: 'View live bin status across the city with color-coded markers. Green is empty, yellow is half, red is full.' },
    { icon: <Bell size={28} />, title: 'SMS Alerts', desc: 'Collectors receive automatic SMS notifications when bins are full, enabling faster response times.' },
    { icon: <BarChart2 size={28} />, title: 'Analytics Dashboard', desc: 'Track collection trends, bin usage patterns, and barangay performance with rich visual reports.' },
    { icon: <Shield size={28} />, title: 'Role-Based Access', desc: 'Separate portals for Admins, Collectors, and Citizens — each with the right tools for their role.' },
    { icon: <Zap size={28} />, title: 'Real-Time Updates', desc: 'Sensor data refreshes every 30 seconds, so the map always shows the current bin fill levels.' },
    { icon: <Users size={28} />, title: 'Citizen Reporting', desc: 'Citizens can report overflowing or damaged bins directly through the app, accelerating resolution.' },
  ];

  const steps = [
    { num: '01', title: 'Bins Send Data', desc: 'Smart sensors inside each bin measure fill levels and transmit data to the BinTrack platform in real time.' },
    { num: '02', title: 'System Analyzes', desc: 'BinTrack processes the data, updates the map, and triggers SMS alerts to collectors when bins are nearly full.' },
    { num: '03', title: 'Collectors Act', desc: 'Collectors receive alerts on their phones, navigate to the full bin, collect it, and mark it done in the app.' },
  ];

  return (
    <div className="landing">
      {/* ── Navigation ── */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <img src="/assets/qc_smartwaste_logo.png" alt="Logo" style={{ height: '32px', marginRight: '8px' }} />
          <img src="/assets/quezon_city_logo.svg" alt="Logo" style={{ height: '32px', marginRight: '12px' }} />
          <span>QC SmartWaste</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
          <button className="btn-icon-sm" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/login" className="nav-cta">Login</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="hero" id="home">
        <div className="hero-content">
          <div className="hero-badge">🌿 Smart Waste Management System</div>
          <h1 className="hero-title">
            Monitor Waste Bins<br />
            <span className="gradient-text">Smarter. Faster. Cleaner.</span>
          </h1>
          <p className="hero-desc">
            QC SmartWaste uses IoT sensors and real-time mapping to help Quezon City
            manage waste collection efficiently — reducing overflow, costs, and environmental impact.
          </p>
          <div className="hero-cta">
            <Link to="/login" className="btn-hero-primary">
              Get Started <ChevronRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn-hero-secondary">See How It Works</a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-map-mock">
            <div className="mock-pin mock-pin--green" style={{ top: '30%', left: '40%' }}>🟢</div>
            <div className="mock-pin mock-pin--yellow" style={{ top: '50%', left: '60%' }}>🟡</div>
            <div className="mock-pin mock-pin--red" style={{ top: '65%', left: '30%' }}>🔴</div>
            <div className="mock-pin mock-pin--green" style={{ top: '20%', left: '70%' }}>🟢</div>
            <div className="mock-pin mock-pin--yellow" style={{ top: '75%', left: '65%' }}>🟡</div>
          </div>
        </div>
      </header>

      {/* ── Stats ── */}
      <section className="landing-stats">
        {stats.map((s, i) => (
          <div key={i} className="landing-stat">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── Features ── */}
      <section className="landing-section" id="features">
        <div className="section-header">
          <h2>Everything You Need</h2>
          <p>A complete platform for modern waste management operations</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <article key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="landing-section landing-section--dark" id="how-it-works">
        <div className="section-header">
          <h2>How BinTrack Works</h2>
          <p>Three simple steps to a cleaner city</p>
        </div>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div key={i} className="step-card">
              <div className="step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── User Roles ── */}
      <section className="landing-section" id="about">
        <div className="section-header">
          <h2>Built for Everyone</h2>
          <p>Three dedicated portals for three types of users</p>
        </div>
        <div className="roles-grid">
          {[
            { role: 'Admin', color: '#7c3aed', emoji: '👨‍💼', points: ['Full system control', 'Manage bins & users', 'Send SMS blasts', 'View all reports & analytics'] },
            { role: 'Collector', color: '#0891b2', emoji: '🚛', points: ['View assigned bins on map', 'Receive full-bin SMS alerts', 'Mark bins as collected', 'Track collection history'] },
            { role: 'Citizen', color: '#059669', emoji: '🏘️', points: ['Check nearby bin status', 'See live map of all bins', 'Report bin issues', 'Stay informed on waste schedule'] },
          ].map(r => (
            <div key={r.role} className="role-card" style={{ '--role-color': r.color }}>
              <div className="role-emoji">{r.emoji}</div>
              <h3 style={{ color: r.color }}>{r.role}</h3>
              <ul>
                {r.points.map((p, i) => (
                  <li key={i}><CheckCircle size={16} style={{ color: r.color }} /> {p}</li>
                ))}
              </ul>
              <Link to="/login" className="role-btn" style={{ background: r.color }}>
                Login as {r.role}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta">
        <h2>Ready to Transform Waste Management?</h2>
        <p>Join QC SmartWaste and help make Quezon City cleaner and smarter.</p>
        <Link to="/login" className="btn-hero-primary">
          Get Started Now <ChevronRight size={18} />
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <img src="/assets/qc_smartwaste_logo.png" alt="Logo" style={{ height: '30px', marginRight: '8px' }} />
          <img src="/assets/quezon_city_logo.svg" alt="Logo" style={{ height: '30px', marginRight: '8px' }} />
          QC SmartWaste
        </div>
        <p>© 2024 QC SmartWaste — Smart Waste Bin Monitoring System · Quezon City, Philippines</p>
        <p>Group #4 Capstone Project</p>
      </footer>
    </div>
  );
}
