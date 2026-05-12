# 🗑️ BINTRACK – Smart Waste Bin Monitoring System

A full-stack MERN + MySQL web application for real-time smart waste bin monitoring.

## 🚀 Quick Start

### 1. Database Setup (XAMPP / MySQL)
1. Start **XAMPP** → Start **Apache** and **MySQL**
2. Open **phpMyAdmin** → http://localhost/phpmyadmin
3. Click **Import** → Select `database/schema.sql` → Click **Go**

### 2. Backend Setup
```bash
cd backend
# Edit .env if needed (DB password, etc.)
npm install
npm run dev
```
Backend runs on → http://localhost:5000

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on → http://localhost:5173

---

## 🔑 Demo Login Credentials
| Role      | Email                     | Password |
|-----------|---------------------------|----------|
| Admin     | admin@bintrack.ph         | password |
| Collector | collector1@bintrack.ph    | password |
| Citizen   | citizen@bintrack.ph       | password |

---

## 📁 Project Structure
```
BINTRACK/
├── backend/           # Node.js + Express API
│   ├── config/        # MySQL connection
│   ├── controllers/   # Route handlers
│   ├── middleware/    # JWT auth
│   ├── routes/        # API endpoints
│   ├── services/      # SMS (Semaphore)
│   ├── utils/         # Mock sensor simulation
│   └── server.js      # Entry point
├── frontend/          # React + Vite
│   └── src/
│       ├── pages/
│       │   ├── admin/      # Admin dashboard
│       │   ├── collector/  # Collector dashboard
│       │   └── citizen/    # Citizen dashboard
│       ├── components/     # BinMap, Navbar, etc.
│       └── context/        # Auth context
└── database/
    └── schema.sql     # Full MySQL schema + seed data
```

## 🗄️ Database Tables
| Table           | Purpose                    |
|-----------------|----------------------------|
| `users`         | Admin / Collector / Citizen |
| `bins`          | Physical bin records       |
| `bin_status`    | Sensor/mock readings       |
| `collections`   | Collector pickup records   |
| `reports`       | Citizen issue reports      |
| `notifications` | SMS notification logs      |
| `barangays`     | Location groupings         |

## 📱 SMS Notifications (Semaphore)
1. Sign up at https://semaphore.co
2. Add your API key to `backend/.env`:
   ```
   SEMAPHORE_API_KEY=your_key_here
   ```
3. Without a key → SMS is **simulated** (logged to console + DB)

## 🗺️ Map Legend
- 🟢 **Green** = Empty (0–30%)
- 🟡 **Yellow** = Half Full (31–70%)
- 🔴 **Red** = Full (71–100%)

## ⚙️ Features
- ✅ JWT Authentication (3 roles)
- ✅ Interactive Leaflet.js map with live markers
- ✅ Mock sensor simulation (updates every 30s)
- ✅ SMS notifications on bin full/half status
- ✅ Admin: full CRUD bins, users, notifications
- ✅ Collector: map, collect bin, history
- ✅ Citizen: view map, report issues
- ✅ Responsive dark UI
