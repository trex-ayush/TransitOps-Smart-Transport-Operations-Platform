# TransitOps

**Smart Transport Operations Platform** — a role-based fleet management system for transport depots. Track vehicles, drivers, trips, maintenance, fuel and expenses, and turn it all into operational and financial analytics from a single dashboard.

🔗 **Live:** https://d3126aezf3inzw.cloudfront.net

---

## Demo credentials

| Role | Email | Password | What they can see |
| --- | --- | --- | --- |
| **Fleet Manager** | `singhayush.sa81@gmail.com` | `Ayush@123` | Everything — full access to all modules |
| **Financial Analyst** | `kavya.iyer@transitops.in` | `Transit@123` | Dashboard, Expenses, Analytics, Settings |
| **Safety Officer** | `arjun.mehta@transitops.in` | `Transit@123` | Dashboard, Drivers, Trips, Settings |
| **Dispatcher** | `priya.nair@transitops.in` | `Transit@123` | Dashboard, Fleet, Trips, Maintenance, Settings |

> Sign in as different roles to see how the sidebar and available modules change per role.

---

## Features

### 🔐 Authentication & roles
- Cookie-based JWT auth (`httpOnly`, `sameSite=lax`, `secure`) — no tokens in local storage.
- Four built-in roles — **Fleet Manager**, **Dispatcher**, **Safety Officer**, **Financial Analyst** — each with a curated set of accessible modules, enforced on both the UI (route guards + sidebar) and the API.
- Forgot / reset password flow over email (nodemailer).

### 📊 Dashboard
- Live KPIs: active vehicles, available vehicles, vehicles in the shop, active & pending trips, drivers on duty.
- Fleet-utilization percentage and a breakdown of vehicle status (Available / On Trip / In Shop / Retired).

### 🚚 Fleet
- Manage vehicles: registration number, name, type, max capacity, odometer, acquisition cost, region.
- Lifecycle status — Available → On Trip → In Shop → Retired.

### 👷 Drivers
- Driver records with license number, category (LMV / HMV / MCWG / Trailer) and expiry.
- Per-driver safety score and duty status (Available / On Trip / Off Duty / Suspended).

### 🗺️ Trips
- Dispatch trips with source, destination, assigned vehicle & driver, cargo weight and planned distance.
- Capture final odometer, fuel consumed and revenue on completion.
- Status flow: Draft → Dispatched → Completed / Cancelled.

### 🔧 Maintenance
- Log service jobs per vehicle with service type, cost and date.
- Track Active vs Completed work.

### ⛽ Fuel & 💰 Expenses
- Fuel logs (litres + cost) per vehicle.
- Operational expenses categorised as Toll, Parking, Permit, Fine or Other.

### 📈 Analytics & reports
- Fleet-wide fuel efficiency, utilization, total operational cost, average ROI and total revenue.
- Per-vehicle profitability: revenue, distance, fuel efficiency, operational cost and ROI.
- Monthly revenue trend and the top 5 costliest vehicles.

### ⚙️ Settings & profile
- Depot name, currency and distance unit.
- Update your own profile and password.

---

## Tech stack

| Layer | Tech |
| --- | --- |
| **Frontend** | React 19, React Router 7, Vite, Tailwind CSS, Axios, Lucide icons |
| **Backend** | Node.js, Express 5, Mongoose, JWT, bcryptjs, express-validator, nodemailer |
| **Database** | MongoDB (Atlas) |
| **Infra** | AWS Lambda + API Gateway (backend via `serverless-http`), S3 + CloudFront (frontend), defined in `template.yaml` (AWS SAM), deployed via GitHub Actions |

---

## Getting started (local)

**Prerequisites:** Node.js 18+ and a MongoDB connection string.

```bash
# 1. Backend
cd backend
npm install
# create backend/.env (see below)
npm run dev            # http://localhost:5000

# 2. Frontend (in a second terminal)
cd frontend
npm install
npm run dev            # http://localhost:5173  (proxies /api → :5000)
```

### `backend/.env`

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=any-long-random-string
PORT=5000
CLIENT_URL=http://localhost:5173
# Optional — only if you use the password-reset emails:
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

---

## Project structure

```
.
├── backend/            # Express API (routes, controllers, models)
│   ├── app.js          # Express app + route mounting
│   ├── server.js       # Local entry point
│   ├── lambda.js       # AWS Lambda entry (serverless-http)
│   └── config/db.js    # Mongoose connection (warm-pooled for Lambda)
├── frontend/           # React + Vite SPA
│   └── src/
│       ├── pages/      # Dashboard, Fleet, Drivers, Trips, ...
│       ├── components/ # Reusable UI
│       ├── api/        # Axios API clients
│       └── config/permissions.js   # Role → module access map
├── template.yaml       # AWS SAM infrastructure
└── DEPLOYMENT.md       # Full deploy guide
```

