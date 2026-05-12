import { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import BinMap from '../../components/BinMap';
import StatsCard from '../../components/StatsCard';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Trash2, CheckCircle, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import CollectionHistory from './CollectionHistory';
import CollectorNotifications from './CollectorNotifications';

function CollectorHome() {
  const { user } = useAuth();
  const [bins, setBins]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(null);
  const [selectedBin, setSelectedBin] = useState(null);

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

  const handleCollect = async (bin) => {
    if (!confirm(`Mark ${bin.bin_code} as collected?`)) return;
    setCollecting(bin.id);
    try {
      await api.post(`/bins/${bin.id}/collect`, { notes: 'Collected via app' });
      toast.success(`✅ ${bin.bin_code} marked as collected!`);
      fetchBins();
      setSelectedBin(null);
    } catch { toast.error('Failed to mark collection'); }
    finally { setCollecting(null); }
  };

  const myBins   = bins.filter(b => b.assigned_collector_id === user?.id);
  const fullBins = myBins.filter(b => b.status === 'full');
  const halfBins = myBins.filter(b => b.status === 'half');

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Collector Dashboard</h1>
          <p>Welcome, {user?.full_name} — manage your assigned bins</p>
        </div>
        <button className="btn-icon" onClick={fetchBins}><RefreshCw size={18}/></button>
      </div>

      <div className="stats-grid">
        <StatsCard icon={<Trash2/>}        label="Assigned Bins"  value={myBins.length}   color="blue"/>
        <StatsCard icon={<AlertTriangle/>} label="Full (Urgent)"  value={fullBins.length} color="red" sub="Collect immediately"/>
        <StatsCard icon={<Clock/>}         label="Half Full"      value={halfBins.length} color="yellow"/>
        <StatsCard icon={<CheckCircle/>}   label="Empty"          value={myBins.filter(b=>b.status==='empty').length} color="green"/>
      </div>

      {/* Priority List */}
      {fullBins.length > 0 && (
        <div className="section-card urgent-card">
          <h2>🚨 Urgent — Full Bins</h2>
          <div className="bin-cards-grid">
            {fullBins.map(b => (
              <div key={b.id} className="bin-card bin-card--full">
                <div className="bin-card-header">
                  <strong>{b.bin_code}</strong>
                  <span className="status-badge status-full">FULL</span>
                </div>
                <p>{b.location_name}</p>
                <p className="bin-card-sub">{b.barangay_name}</p>
                <div className="fill-bar-wrap">
                  <div className="fill-bar-label"><span>Fill Level</span><span>{b.fill_level}%</span></div>
                  <div className="fill-bar"><div className="fill-bar-inner fill-full" style={{ width:`${b.fill_level}%` }}/></div>
                </div>
                <button className="btn-collect" onClick={() => handleCollect(b)} disabled={collecting===b.id}>
                  {collecting===b.id ? 'Collecting...' : '✅ Mark Collected'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section-card">
        <h2>Live Map — My Assigned Bins</h2>
        {loading ? <div className="map-skeleton"/> :
          <BinMap bins={myBins} height="420px" onBinClick={setSelectedBin}/>
        }
      </div>

      <div className="section-card">
        <h2>All My Bins</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Code</th><th>Location</th><th>Fill Level</th><th>Status</th><th>Last Updated</th><th>Action</th></tr></thead>
            <tbody>
              {myBins.map(b => (
                <tr key={b.id}>
                  <td><strong>{b.bin_code}</strong></td>
                  <td>{b.location_name}</td>
                  <td>
                    <div className="fill-bar-wrap" style={{minWidth:120}}>
                      <div className="fill-bar-label"><span>{b.fill_level}%</span></div>
                      <div className="fill-bar"><div className={`fill-bar-inner fill-${b.status}`} style={{ width:`${b.fill_level}%` }}/></div>
                    </div>
                  </td>
                  <td><span className={`status-badge status-${b.status}`}>{b.status}</span></td>
                  <td>{b.last_updated ? new Date(b.last_updated).toLocaleTimeString() : '—'}</td>
                  <td>
                    {b.status !== 'empty' &&
                      <button className="btn-sm-collect" onClick={() => handleCollect(b)} disabled={collecting===b.id}>
                        {collecting===b.id ? '...' : 'Collect'}
                      </button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function CollectorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-layout">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
      <main className="main-content">
        <Routes>
          <Route index element={<CollectorHome/>}/>
          <Route path="history" element={<CollectionHistory/>}/>
          <Route path="notifications" element={<CollectorNotifications/>}/>
        </Routes>
      </main>
    </div>
  );
}
