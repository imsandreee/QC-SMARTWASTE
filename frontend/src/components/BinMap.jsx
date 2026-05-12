import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Legend from './Legend';
import { useEffect } from 'react';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored icons
const createIcon = (color) => {
  const colorMap = {
    empty: '#22c55e',
    half:  '#eab308',
    full:  '#ef4444',
  };
  const hex = colorMap[color] || '#6b7280';
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:32px;height:32px;border-radius:50% 50% 50% 0;
        background:${hex};border:3px solid white;
        transform:rotate(-45deg);
        box-shadow:0 2px 8px rgba(0,0,0,0.4);
        position:relative;
      ">
        <div style="
          position:absolute;top:50%;left:50%;
          transform:translate(-50%,-50%) rotate(45deg);
          font-size:11px;font-weight:bold;color:white;
        ">🗑</div>
      </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  });
};

function AutoFit({ bins }) {
  const map = useMap();
  useEffect(() => {
    if (bins.length > 0) {
      const bounds = bins.map(b => [parseFloat(b.latitude), parseFloat(b.longitude)]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [bins]);
  return null;
}

export default function BinMap({ bins = [], onBinClick, height = '500px' }) {
  const center = bins.length > 0
    ? [parseFloat(bins[0].latitude), parseFloat(bins[0].longitude)]
    : [14.6760, 121.0437]; // Quezon City default

  return (
    <div style={{ position: 'relative', height }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '16px' }}>
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {bins.map(bin => (
          <Marker
            key={bin.id}
            position={[parseFloat(bin.latitude), parseFloat(bin.longitude)]}
            icon={createIcon(bin.status)}
            eventHandlers={{ click: () => onBinClick && onBinClick(bin) }}
          >
            <Popup>
              <div className="map-popup">
                <div className="popup-header">
                  <strong>{bin.bin_code}</strong>
                  <span className={`status-badge status-${bin.status}`}>{bin.status?.toUpperCase()}</span>
                </div>
                <div className="popup-body">
                  <p>📍 {bin.location_name}</p>
                  <p>🏘 {bin.barangay_name}</p>
                  <div className="fill-bar-wrap">
                    <div className="fill-bar-label">
                      <span>Fill Level</span><span>{bin.fill_level}%</span>
                    </div>
                    <div className="fill-bar">
                      <div
                        className={`fill-bar-inner fill-${bin.status}`}
                        style={{ width: `${bin.fill_level}%` }}
                      />
                    </div>
                  </div>
                  <p>🌡 {bin.temperature}°C &nbsp; 💧 {bin.humidity}%</p>
                  <p>🔋 Battery: {bin.battery_level}%</p>
                  {bin.collector_name && <p>👷 {bin.collector_name}</p>}
                  <p className="popup-time">
                    🕐 {bin.last_updated ? new Date(bin.last_updated).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        <AutoFit bins={bins} />
      </MapContainer>
      <Legend />
    </div>
  );
}
