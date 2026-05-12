const axios = require('axios');
const pool = require('../config/db');
require('dotenv').config();

/**
 * Send SMS via Semaphore API (Philippine gateway)
 * Docs: https://semaphore.co/docs
 */
const sendSMS = async ({ phone, message, type = 'manual', binId = null, recipientId = null }) => {
  // Log to DB first (pending)
  const [result] = await pool.query(
    `INSERT INTO notifications (recipient_id, phone, message, type, bin_id, status) VALUES (?,?,?,?,?,?)`,
    [recipientId, phone, message, type, binId, 'pending']
  );
  const notifId = result.insertId;

  try {
    const apiKey = process.env.SEMAPHORE_API_KEY;

    // If no real API key, simulate success (demo mode)
    if (!apiKey || apiKey === 'YOUR_SEMAPHORE_API_KEY_HERE') {
      console.log(`📱 [SMS SIMULATION] To: ${phone} | Message: ${message}`);
      await pool.query(
        `UPDATE notifications SET status='sent', sent_at=NOW() WHERE id=?`,
        [notifId]
      );
      return { success: true, simulated: true };
    }

    const response = await axios.post('https://api.semaphore.co/api/v4/messages', {
      apikey: apiKey,
      number: phone,
      message: message,
      sendername: process.env.SEMAPHORE_SENDER_NAME || 'BINTRACK',
    });

    await pool.query(
      `UPDATE notifications SET status='sent', sent_at=NOW() WHERE id=?`,
      [notifId]
    );
    return { success: true, data: response.data };
  } catch (err) {
    console.error('SMS send error:', err.message);
    await pool.query(`UPDATE notifications SET status='failed' WHERE id=?`, [notifId]);
    return { success: false, error: err.message };
  }
};

/**
 * Notify the assigned collector that a bin is full
 */
const notifyBinFull = async (bin) => {
  if (!bin.collector_phone) return;
  const message =
    `BINTRACK ALERT: Bin ${bin.bin_code} at "${bin.location_name}" is FULL (${bin.fill_level}%). ` +
    `Please collect immediately. - BinTrack System`;
  return sendSMS({
    phone: bin.collector_phone,
    message,
    type: 'bin_full',
    binId: bin.id,
    recipientId: bin.assigned_collector_id,
  });
};

const notifyBinHalf = async (bin) => {
  if (!bin.collector_phone) return;
  const message =
    `BINTRACK: Bin ${bin.bin_code} at "${bin.location_name}" is now HALF FULL (${bin.fill_level}%). ` +
    `Please schedule collection soon.`;
  return sendSMS({
    phone: bin.collector_phone,
    message,
    type: 'bin_half',
    binId: bin.id,
    recipientId: bin.assigned_collector_id,
  });
};

module.exports = { sendSMS, notifyBinFull, notifyBinHalf };
