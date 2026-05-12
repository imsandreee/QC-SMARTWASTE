const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

// ── Middleware ───────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/bins',          require('./routes/binRoutes'));
app.use('/api/users',         require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports',       require('./routes/reportRoutes'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

// ── Mock Sensor Simulation ────────────────────────
const { runMockSimulation } = require('./utils/mockData');

// Run immediately once, then every 30 seconds
runMockSimulation();
const interval = parseInt(process.env.MOCK_INTERVAL) || 30000;
setInterval(runMockSimulation, interval);
console.log(`🔄 Mock sensor simulation running every ${interval / 1000}s`);

// ── Start Server ─────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 BINTRACK backend running on http://localhost:${PORT}`);
});
