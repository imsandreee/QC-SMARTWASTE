import { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import BinMap from '../../components/BinMap';
import StatsCard from '../../components/StatsCard';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Trash2, AlertTriangle, CheckCircle, MapPin, RefreshCw } from 'lucide-react';
import ReportIssue from './ReportIssue';

function CitizenHome() {
  const { user } = useAuth();
  const [bins, setBins]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  const fetchBins = useCallback(async () => {
    try {
      const { data } = await api.get('/bins');
      setBins(data);
    } catch { toast.error('Failed to load bins'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchBins();
    const iv = setInterval(fetchBins, 30000);
    return () => clearInterval(iv);
  }, [fetchBins]);

  const filtered = filter === 'all' ? bins : bins.filter(b => b.status === filter);
  const full  = bins.filter(b => b.status === 'full').length;
  const half  = bins.filter(b => b.status === 'half').length;
  const empty = bins.filter(b => b.status === 'empty').length;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Bin Status Map</h1>
          <p>Hello, {user?.full_name} — view live waste bin status in your area</p>
        </div>
        <button className="btn-icon" onClick={fetchBins}><RefreshCw size={18}/></button>
      </div>

      <div className="stats-grid">
        <StatsCard icon={<Trash2/>}        label="Total Bins"  value={bins.length} color="blue"/>
        <StatsCard icon={<AlertTriangle/>} label="Full Bins"   value={full}        color="red"    sub="Needs collection"/>
        <StatsCard icon={<Trash2/>}        label="Half Full"   value={half}        color="yellow"/>
        <StatsCard icon={<CheckCircle/>}   label="Empty"       value={empty}       color="green"/>
      </div>

      <div className="section-card">
        <div className="map-filter-bar">
          <h2>Live Map</h2>
          <div className="filter-pills">
            {['all','full','half','empty'].map(f => (
              <button key={f} className={`filter-pill filter-pill--${f} ${filter===f ? 'active':''}`}
                onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
            ))}
          </div>
        </div>
        {loading ? <div className="map-skeleton"/> :
          <BinMap bins={filtered} height="460px"/>
        }
      </div>

      <div className="section-card">
        <h2>Nearby Bins</h2>
        <div className="bin-cards-grid">
          {filtered.map(b => (
            <div key={b.id} className={`bin-card bin-card--${b.status}`}>
              <div className="bin-card-header">
                <strong>{b.bin_code}</strong>
                <span className={`status-badge status-${b.status}`}>{b.status?.toUpperCase()}</span>
              </div>
              <p className="bin-location"><MapPin size={14}/> {b.location_name}</p>
              <p className="bin-card-sub">{b.barangay_name}</p>
              <div className="fill-bar-wrap">
                <div className="fill-bar-label"><span>Fill Level</span><span>{b.fill_level}%</span></div>
                <div className="fill-bar"><div className={`fill-bar-inner fill-${b.status}`} style={{width:`${b.fill_level}%`}}/></div>
              </div>
              <p className="bin-updated">🕐 {b.last_updated ? new Date(b.last_updated).toLocaleTimeString() : 'N/A'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CitizenDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-layout">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
      <main className="main-content">
        <Routes>
          <Route index element={<CitizenHome/>}/>
          <Route path="report" element={<ReportIssue/>}/>
        </Routes>
      </main>
    </div>
  );
}
