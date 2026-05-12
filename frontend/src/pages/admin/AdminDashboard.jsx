import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import StatsCard from '../../components/StatsCard';
import BinMap from '../../components/BinMap';
import api from '../../utils/api';
import { Trash2, Users, CheckCircle, AlertTriangle, Bell, Plus, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import ManageBins from './ManageBins';
import ManageUsers from './ManageUsers';
import Reports from './Reports';
import Notifications from './Notifications';

function AdminHome() {
  const [bins, setBins]   = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [binsRes, statsRes] = await Promise.all([
        api.get('/bins'),
        api.get('/bins/stats/summary'),
      ]);
      setBins(binsRes.data);
      setStats(statsRes.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Real-time waste bin monitoring overview</p>
        </div>
        <button className="btn-icon" onClick={fetchData} title="Refresh">
          <RefreshCw size={18}/>
        </button>
      </div>

      <div className="stats-grid">
        <StatsCard icon={<Trash2/>} label="Total Bins"    value={stats.total_bins || 0}         color="blue"   />
        <StatsCard icon={<AlertTriangle/>} label="Full Bins" value={stats.full_bins || 0}        color="red"    sub="Needs collection"/>
        <StatsCard icon={<Trash2/>}   label="Half Full"   value={stats.half_bins || 0}           color="yellow" />
        <StatsCard icon={<CheckCircle/>} label="Empty"    value={stats.empty_bins || 0}          color="green"  />
        <StatsCard icon={<CheckCircle/>} label="Collected Today" value={stats.collections_today || 0} color="purple"/>
        <StatsCard icon={<Users/>}    label="Collectors"  value={stats.active_collectors || 0}   color="cyan"   />
      </div>

      <div className="section-card">
        <h2>Live Bin Map</h2>
        {loading ? <div className="map-skeleton"/> :
          <BinMap bins={bins} height="480px" />
        }
      </div>

      <div className="section-card">
        <h2>All Bins Status</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th><th>Location</th><th>Barangay</th>
                <th>Fill Level</th><th>Status</th><th>Collector</th><th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {bins.map(b => (
                <tr key={b.id}>
                  <td><strong>{b.bin_code}</strong></td>
                  <td>{b.location_name}</td>
                  <td>{b.barangay_name}</td>
                  <td>
                    <div className="fill-bar-wrap">
                      <div className="fill-bar-label"><span>{b.fill_level}%</span></div>
                      <div className="fill-bar">
                        <div className={`fill-bar-inner fill-${b.status}`} style={{ width: `${b.fill_level}%` }}/>
                      </div>
                    </div>
                  </td>
                  <td><span className={`status-badge status-${b.status}`}>{b.status}</span></td>
                  <td>{b.collector_name || '—'}</td>
                  <td>{b.last_updated ? new Date(b.last_updated).toLocaleTimeString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-layout">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
      <main className="main-content">
        <Routes>
          <Route index element={<AdminHome/>}/>
          <Route path="bins" element={<ManageBins/>}/>
          <Route path="users" element={<ManageUsers/>}/>
          <Route path="reports" element={<Reports/>}/>
          <Route path="notifications" element={<Notifications/>}/>
        </Routes>
      </main>
    </div>
  );
}
