<p align="center">
  <img src="frontend/src/assets/logo.png" alt="Seva Hrudhayam Logo" width="120" height="120" style="border-radius: 50%;" />
</p>

<h1 align="center">Seva Hrudhayam</h1>

<p align="center">
  <strong>Food & Resource Donation Platform</strong><br />
  <em>Connecting events, caterers, and donors directly with nearby Indian childcare homes to prevent food waste and supply essentials.</em>
</p>

---

## 🌟 Overview

**Seva Hrudhayam** (Heart of Service) is a MERN/PostgreSQL web application designed to prevent surplus food waste from events (weddings, parties, receptions) and distribute usable household essentials (clothes, toys, mattresses, cots) directly to local orphanages.

### Key Features:
*   📍 **Location Matching**: Automatically matches donation locations with orphanages within a **20 km radius** using the Haversine formula, with a secondary district-level fallback.
*   🗺️ **Interactive Leaflet Maps**: Displays matching donor-orphanage coordinates and pathways dynamically on the map.
*   🔔 **Real-Time Sound Alerts**: Uses Web Audio synthesized chimes to alert Orphanage Dashboards instantly on new matching donations (powered by real-time Socket.io rooms).
*   ⚙️ **Role-Based Dashboards**: 
    *   **Donors**: Create instant donations or schedule future booking events.
    *   **Orphanages**: Access alerts feed, coordinate transport/pickups, and confirm delivery completion.
    *   **Admin**: Approve and verify registered orphanage heads, and monitor metrics.
*   🔒 **Password Visibility & Recovery**: Built-in password eye-toggles and a forgot/reset password recovery pipeline with simulated SMTP email tokens.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), React-Leaflet Maps, Lucide Icons, Vanilla CSS
*   **Backend**: Node.js, Express, Socket.io (WebSockets)
*   **Database**: Supabase PostgreSQL (SQL DDL initialization)
*   **Authentication**: JSON Web Tokens (JWT) & bcryptjs hashing

---

## 📁 Repository Structure

```text
├── backend/                  # Express API Server
│   ├── config/               # Database pool and SQL table initialization
│   ├── controllers/          # Business logic (Auth, Donations, Admin)
│   ├── middleware/           # JWT Route authentication
│   ├── models/               # Custom database helper models wrapping SQL
│   ├── routes/               # Express endpoints mapping
│   ├── utils/                # Sockets helper and server startup configs
│   ├── seed.js               # SQL seeding script for local demo data
│   └── server.js             # Server startup file
│
├── frontend/                 # React client application
│   ├── public/               # Public assets and favicon
│   ├── src/
│   │   ├── assets/           # Visual assets (Namaste logo)
│   │   ├── components/       # Forms, Navbar, Maps, and Dashboards
│   │   ├── context/          # Global Auth & Socket.io contexts
│   │   ├── pages/            # Core views (Home, About, Auth screens)
│   │   └── utils/            # Distance calculation and sound alert synth
```

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed. You will also need a Supabase project or a local PostgreSQL database instance.

### 2. Configure Environment Variables
Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
JWT_SECRET=seva_hrudhayam_secret_key_12345
DB_USER=your_supabase_username
DB_PASSWORD=your_supabase_password
DB_HOST=your_supabase_host_address
DB_PORT=6543
DB_NAME=postgres
```

### 3. Initialize & Seed Database
In the root directory, install dependencies and run the seeding script:
```bash
# Install dependencies for root, backend, and frontend
npm run install-all

# Run the seeding script to initialize SQL tables and insert test users
npm run seed --prefix backend
```
*   **Default Admin**: `admin@sevahrudhayam.org` | `admin123`
*   **Test Donor**: Phone `9876543210` | Password `donor123`
*   **Test Orphanage**: Phone `8765432101` | Password `head123`

### 4. Run the Application
Start both the backend API and frontend Vite servers concurrently:
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

---

## ☁️ Deployment Configurations

### Backend (Render Web Service)
*   **Root Directory**: `backend`
*   **Build Command**: `npm install`
*   **Start Command**: `npm start`
*   **Environment Variables**: Define your `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `JWT_SECRET`, and `PORT=5000`.

### Frontend (Render Static Site / Vercel)
*   **Root Directory**: `frontend`
*   **Build Command**: `npm install --legacy-peer-deps && npm run build`
*   **Publish Directory**: `dist`
*   **Environment Variables**:
    *   `VITE_API_URL`: `https://your-backend-service.onrender.com`
*   **Rewrites (For React Router support on Render)**:
    *   **Source**: `/*`
    *   **Destination**: `/index.html`
    *   **Action**: `Rewrite`
