import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Map, LayoutDashboard, Users, Bell, FileText, Trash2, Sun, Moon } from 'lucide-react';

const NAV = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/admin/bins', label: 'Manage Bins', icon: <Trash2 size={18} /> },
    { to: '/admin/users', label: 'Users', icon: <Users size={18} /> },
    { to: '/admin/reports', label: 'Reports', icon: <FileText size={18} /> },
    { to: '/admin/notifications', label: 'Notifications', icon: <Bell size={18} /> },
  ],
  collector: [
    { to: '/collector', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/collector/history', label: 'Collection History', icon: <FileText size={18} /> },
    { to: '/collector/notifications', label: 'Alerts', icon: <Bell size={18} /> },
  ],
  citizen: [
    { to: '/citizen', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/citizen/report', label: 'Report Issue', icon: <FileText size={18} /> },
  ],
};

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const links = NAV[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-brand" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <img src="/assets/qc_smartwaste_logo.png" alt="Logo" style={{ height: '32px' }} />
            <img src="/assets/quezon_city_logo.svg" alt="Logo" style={{ height: '32px' }} />
          </div>
          <span>QC SmartWaste</span>
        </div>

        <nav className="sidebar-nav">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              end={l.to === '/admin' || l.to === '/collector' || l.to === '/citizen'}
              className={`nav-link ${pathname === l.to ? 'nav-link--active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {l.icon}
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.full_name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.full_name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-icon" onClick={toggleTheme} style={{ width: '100%', justifyContent: 'center' }}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="logout-btn" onClick={handleLogout} style={{ flex: 1 }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Top bar (mobile) */}
      <header className="topbar">
        <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <span /><span /><span />
        </button>
        <div className="topbar-brand">
          <img src="/assets/qc_smartwaste_logo.png" alt="Logo" style={{ height: '24px', marginRight: '8px' }} />
          QC SmartWaste
        </div>
        <button className="btn-icon-sm" onClick={toggleTheme} style={{ marginLeft: 'auto' }}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  );
}
