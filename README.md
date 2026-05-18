# DRaaS — Disaster Recovery as a Service

A full-stack Disaster Recovery dashboard built with React, Node.js, Express, and MongoDB.

## Tech Stack
- **Frontend:** React, Recharts, Axios
- **Backend:** Node.js, Express, Mongoose, node-cron
- **Database:** MongoDB

## Project Structure
```
draas/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Servers.js
│   │   │   ├── Backups.js
│   │   │   ├── Policies.js
│   │   │   └── Recovery.js
│   │   ├── api.js
│   │   └── App.js
│   └── package.json
└── backend/
    ├── models/
    │   ├── Server.js
    │   ├── Backup.js
    │   └── Policy.js
    ├── controllers/
    │   └── serverController.js
    ├── routes/
    │   └── serverRoutes.js
    ├── utils/
    │   └── serverMonitor.js
    ├── server.js
    └── package.json
```

## Prerequisites
- Node.js (v16+)
- MongoDB installed and running locally

## Setup & Run

### 1. Start MongoDB
```bash
mongod
```

### 2. Backend
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

## Features
- **Dashboard** — Live stats, backup trends, storage charts
- **Servers** — Register, monitor, and manage servers with real-time CPU/RAM/Disk metrics
- **Backups** — Trigger full/incremental/differential backups, view history
- **Policies** — Define RTO/RPO policies, retention periods, replication settings
- **Recovery** — Initiate disaster recovery with a live step-by-step log console

## API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/dashboard | Dashboard stats |
| GET/POST | /api/servers | List / Create servers |
| PUT/DELETE | /api/servers/:id | Update / Delete server |
| GET | /api/backups | List backups |
| POST | /api/backups/trigger | Trigger backup |
| POST | /api/recovery/initiate | Start recovery |
| GET/POST | /api/policies | List / Create policies |
| PUT/DELETE | /api/policies/:id | Update / Delete policy |

---
Built by Chehak Gupta · VIT Chennai · 2027