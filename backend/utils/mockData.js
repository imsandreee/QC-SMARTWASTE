const pool = require('../config/db');
const { notifyBinFull, notifyBinHalf } = require('../services/smsService');

// Track previous statuses to detect transitions
const prevStatus = new Map();

/**
 * Generate a mock sensor reading for a bin
 * Simulates realistic fill-level changes
 */
function generateMockReading(binId, currentFill) {
  const delta = Math.floor(Math.random() * 12) - 3; // -3 to +8 percent change
  let newFill = Math.min(100, Math.max(0, currentFill + delta));

  return {
    binId,
    fillLevel: newFill,
    temperature: parseFloat((28 + Math.random() * 8).toFixed(1)),
    humidity: parseFloat((60 + Math.random() * 25).toFixed(1)),
    batteryLevel: Math.max(10, Math.min(100, 85 + Math.floor(Math.random() * 15))),
  };
}

function getStatus(fillLevel) {
  if (fillLevel <= 30) return 'empty';
  if (fillLevel <= 70) return 'half';
  return 'full';
}

/**
 * Run one simulation cycle: update all active bins with mock readings
 */
async function runMockSimulation() {
  try {
    // Get latest fill level for each bin
    const [bins] = await pool.query(`
      SELECT
        b.id, b.bin_code, b.location_name, b.assigned_collector_id,
        u.phone AS collector_phone,
        COALESCE(
          (SELECT fill_level FROM bin_status WHERE bin_id = b.id ORDER BY recorded_at DESC LIMIT 1),
          0
        ) AS current_fill
      FROM bins b
      LEFT JOIN users u ON u.id = b.assigned_collector_id
      WHERE b.is_active = 1
    `);

    for (const bin of bins) {
      const currentFill = parseInt(bin.current_fill) || 0;
      const reading = generateMockReading(bin.id, currentFill);
      await pool.query(
        `INSERT INTO bin_status (bin_id, fill_level, temperature, humidity, battery_level) VALUES (?,?,?,?,?)`,
        [reading.binId, reading.fillLevel, reading.temperature, reading.humidity, reading.batteryLevel]
      );

      const newStatus = getStatus(reading.fillLevel);
      const oldStatus = prevStatus.get(bin.id) || getStatus(bin.current_fill);

      // Trigger SMS on status transition
      if (newStatus !== oldStatus) {
        const binData = { ...bin, fill_level: reading.fillLevel };
        if (newStatus === 'full') {
          await notifyBinFull(binData);
        } else if (newStatus === 'half' && oldStatus === 'empty') {
          await notifyBinHalf(binData);
        }
      }
      prevStatus.set(bin.id, newStatus);
    }

    // Cleanup old readings (keep last 200 per bin)
    await pool.query(`
      DELETE FROM bin_status
      WHERE id NOT IN (
        SELECT id FROM (
          SELECT id FROM bin_status ORDER BY recorded_at DESC LIMIT 2400
        ) sub
      )
    `);
  } catch (err) {
    console.error('Mock simulation error:', err.message);
  }
}

module.exports = { runMockSimulation };
