# FundBridge - Modern Crowdfunding Platform

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

FundBridge is a full-featured, production-ready MERN stack crowdfunding web application built for next-generation technology, environmental, healthcare, education, and community initiatives. 

Designed with an original fintech-inspired aesthetic, FundBridge enforces **strict Role-Based Access Control (RBAC)** across three distinct personas: **Supporters**, **Creators**, and **Administrators**, powered by a robust escrow credit economy, simulated Stripe payments, automated refund mechanisms, and live moderation workflows.

---

## 🌟 Quick Demo Credentials

You can test any role instantly with pre-seeded accounts:

| Role | Email | Password | Pre-seeded Balance |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@fundbridge.io` | `Password123!` | 5,000 credits |
| **Project Creator** | `creator@fundbridge.io` | `Password123!` | 1,450 credits |
| **Backer / Supporter** | `supporter@fundbridge.io` | `Password123!` | 750 credits |

*Note: Quick login buttons are embedded directly on the `/login` page for instant, zero-friction assessment review.*

---

## 🚀 Core Features

### 1. Public Discovery & Showcase
- **Hero Slider**: Dynamic carousel highlighting top-funded and featured campaigns.
- **Categorical Exploration**: Filter projects by Technology, Health, Education, Community, Environment, and Art.
- **Smart Search & Sorting**: Real-time keyword search, status filtering, and sorting by Deadline, Funding Goal, or Amount Raised.
- **Detailed Campaign Overview**: Real-time funding progress bars, countdown timers, creator credentials, backer tiers, and interactive pledge modules.

### 2. Comprehensive Role-Based Access Control (RBAC)
- **Supporter Persona**:
  - Browse and pledge credits to active campaigns.
  - Purchase platform credits via simulated Stripe card checkout with instant bonus multipliers.
  - Review personal contribution histories and pending escrow approvals.
  - Report campaigns suspected of copyright infringement or fraudulent claims.
- **Creator Persona**:
  - Launch campaigns with milestone descriptions, target deadlines, minimum pledge requirements, and visual uploads.
  - Track active campaigns sorted by deadline.
  - Review pending backer pledges and approve contributions into campaign balance.
  - Request credit payouts via Stripe, bKash, Rocket, or Nagad (20 credits = $1 USD, minimum 200 credits).
  - Delete campaigns with **automatic system-wide escrow refunds** to all backers.
- **Administrator Persona**:
  - Moderate incoming campaign submissions (Approve / Reject).
  - Suspend fraudulent campaigns or permanently delete illicit projects.
  - Audit creator withdrawal requests and approve payout disbursements.
  - Manage user database with one-click role upgrades (Supporter ↔ Creator ↔ Admin).
  - Review supporter-submitted fraud reports with immediate campaign freeze capabilities.

### 3. Dual-Mode Persistence Architecture (MongoDB + In-Memory Fallback)
- Connects automatically to **MongoDB Atlas** when `MONGODB_URI` is provided.
- Gracefully falls back to a high-fidelity **In-Memory Store** when running standalone or offline, ensuring zero container crashes and seamless local demonstration.
- Pre-seeds realistic campaigns, initial backers, billing records, and audit notifications.

### 4. Interactive Notifications & Escrow Economy
- In-app notification bell with unread counters and route-aware navigation.
- Escrow system: Backer credits are reserved during pledge and can be approved into creator balances or refunded upon campaign cancellation.

---

## 🛠️ Technology Stack

- **Client**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Swiper, Canvas Confetti.
- **Server**: Node.js, Express.js, TypeScript, tsx / esbuild.
- **Database**: MongoDB with Mongoose (with automated In-Memory data store fallback).
- **Authentication**: JWT (JSON Web Tokens), bcryptjs password hashing, Google OAuth client integration.
- **Payments**: Simulated Stripe Card Processing, local wallet credit accounting.
- **Media**: imgBB API integration and responsive asset handling.

---

## 📦 Project Structure

```
fundbridge/
├── server/
│   ├── controllers/         # Auth, Campaign, Contribution, Payment, Withdrawal, Report controllers
│   ├── middleware/          # JWT authentication and RBAC authorization guards
│   ├── models/              # Mongoose schemas (User, Campaign, Contribution, Payment, etc.)
│   ├── routes/              # Express API endpoint definitions (/api/*)
│   ├── services/            # Dual-mode DataStore (MongoDB + Memory fallback with seed data)
│   └── .env.example
├── src/
│   ├── components/
│   │   ├── common/          # Navbar, Footer, CampaignCard, Toast, ReportModal, ProtectedRoute
│   ├── context/             # AuthContext (JWT session, login, register, credit synchronization)
│   ├── pages/
│   │   ├── dashboard/       # DashboardLayout, DashboardHome, Admin, Creator, Supporter views
│   │   ├── Home.tsx         # Showcase, hero slider, featured campaigns, stats
│   │   ├── ExploreCampaigns.tsx # Search, filter, category tabs, card grid
│   │   ├── CampaignDetails.tsx  # Story, progress, rewards, pledge & report actions
│   │   ├── Login.tsx        # Email/password + quick role login shortcuts
│   │   ├── Register.tsx     # Account registration with role selection
│   │   └── NotFound.tsx     # 404 handler
│   ├── services/api.ts      # Axios client with JWT interceptor
│   ├── types/index.ts       # Shared TypeScript data models
│   ├── App.tsx              # Router configuration
│   └── main.tsx             # Entry point
├── server.ts                # Express server + Vite middleware
├── package.json
└── README.md
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- Node.js (v18 or newer recommended)
- npm or yarn

### 2. Installation
Clone the repository and install all dependencies:

```bash
git clone https://github.com/your-username/fundbridge.git
cd fundbridge
npm install
```

### 3. Environment Variables
Create a `.env` file in the project root based on `.env.example`:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=fundbridge_super_secret_jwt_key_2026
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fundbridge?retryWrites=true&w=majority
VITE_API_URL=/api
```

*(Note: If `MONGODB_URI` is omitted, the application runs on the robust built-in in-memory database with pre-populated seed data!)*

### 4. Running the Application
Start the full-stack development server (Express backend + Vite frontend):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /register` - Register a new account (Supporter / Creator).
- `POST /login` - Authenticate with email/password and receive JWT.
- `POST /google` - Authenticate via Google OAuth credential.

### Campaigns (`/api/campaigns`)
- `GET /` - List public approved campaigns (supports query filters: `category`, `search`, `sortBy`).
- `GET /top-funded` - Retrieve top funded campaigns for homepage showcase.
- `GET /creator/my` - Fetch campaigns owned by authenticated creator.
- `GET /:id` - Retrieve single campaign details.
- `POST /` - Create a new campaign (Creator/Admin).
- `PATCH /:id` - Update campaign story, title, or reward tiers.
- `DELETE /:id` - Delete campaign and trigger automated backer escrow refunds.

### Contributions & Escrow (`/api/contributions`)
- `POST /` - Pledge credits to an approved campaign.
- `GET /my` - Supporter contribution history.
- `GET /pending` - Creator pending pledges awaiting approval.
- `PATCH /:id/approve` - Approve pledge into creator balance.

### Payments & Credits (`/api/payments`)
- `POST /create` - Initiate Stripe credit package purchase.
- `POST /confirm` - Confirm transaction and disburse platform credits.
- `GET /history` - Personal credit purchase ledger.

### Creator Withdrawals (`/api/withdrawals`)
- `POST /` - Request payout (Stripe, bKash, Rocket, Nagad).
- `GET /my` - Creator's payout request history.
- `GET /pending` - Admin list of pending disbursements.
- `PATCH /:id/approve` - Admin approve and disburse payout.

### Trust & Moderation (`/api/reports` & `/api/admin`)
- `POST /api/reports` - Submit campaign audit report.
- `GET /api/reports` - Admin list of reported campaigns.
- `PATCH /api/admin/campaigns/:id/approve` - Approve campaign for public listing.
- `PATCH /api/admin/campaigns/:id/suspend` - Freeze suspicious campaign.
- `PATCH /api/admin/users/:id/role` - Update user role.

---

## 📋 Git Commit Plan

For your Junior MERN Stack assessment presentation, commit your repository using this structured history:

```
commit 1: chore: initial project scaffolding, tsconfig, vite, and tailwind setup
commit 2: feat(backend): express server configuration, mongoose schemas, and JWT middleware
commit 3: feat(backend): implement dual-mode dataStore with fallback and seed records
commit 4: feat(backend): full API routes for auth, campaigns, contributions, and withdrawals
commit 5: feat(frontend): routing, auth context, axios interceptor, and toast notifications
commit 6: feat(frontend): navbar, footer, campaign card, and responsive navigation
commit 7: feat(frontend): home showcase page with swiper banner, categories, and metrics
commit 8: feat(frontend): explore campaigns page with search, multi-filter, and sorting
commit 9: feat(frontend): campaign details view with pledge modal and fraud reporting
commit 10: feat(dashboard): multi-role dashboard layout with role-adaptive navigation
commit 11: feat(dashboard): creator suite - launch campaign, manage projects, and withdrawals
commit 12: feat(dashboard): supporter suite - impact contributions and stripe credit checkout
commit 13: feat(dashboard): admin moderation suite - user roles, campaign audit, and payouts
commit 14: docs: comprehensive project documentation and deployment instructions
```

---

## 🚢 Deployment

### Unified Container (Cloud Run / Docker)
Build and run the production server:
```bash
npm run build
npm start
```

### Decoupled Deployment
- **Backend (Render / Railway / Heroku)**: Set root to `server/` or point build command to `npm run build` and start command to `node dist/server.cjs`.
- **Frontend (Vercel / Netlify)**: Build command `npm run build`, output directory `dist/`, set environment variable `VITE_API_URL` to your live backend endpoint.
