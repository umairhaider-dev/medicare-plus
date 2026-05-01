<div align="center">

<img src="mobile/assets/icon.png" alt="MediCare Plus Logo" width="120" height="120" />

# MediCare Plus
### Complete Clinic & Pharmacy Management System

[![React Native](https://img.shields.io/badge/React_Native-Expo_SDK_54-20232A?style=for-the-badge&logo=react)](https://expo.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma_ORM-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)
[![Railway](https://img.shields.io/badge/Deployed_on-Railway-0B0D0E?style=for-the-badge&logo=railway)](https://railway.app)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> A full-stack mobile application for managing clinic operations / patients, appointments, pharmacy inventory, and POS sales / all in one place.

</div>

---

## Screenshots

<div align="center">

| Dashboard | Patients | Appointments |
|:---------:|:--------:|:------------:|
| <img src="screenshots/dashboard.jpg" width="220"/> | <img src="screenshots/patients.jpg" width="220"/> | <img src="screenshots/appointments.jpg" width="220"/> |

| Pharmacy Inventory | Reports |
|:---------:|:-------:|
| <img src="screenshots/pharmacy.jpg" width="220"/> | <img src="screenshots/reports.jpg" width="220"/> |

</div>

---

## Features

### 🏥 Dashboard
- Live clinic stats: total patients, today's appointments, revenue, low stock alerts
- Today's appointment schedule at a glance
- Quick action shortcuts to all core modules
- Monthly summary: appointments, new patients, revenue
- Pull-to-refresh for real-time updates

### 👥 Patient Management
- Register patients with full profile: name, MR number, DOB, gender, blood group, address
- Search by name, MR number, or phone
- Patient detail view with appointment history and prescriptions
- Edit patient records and book appointments directly from profile
- Auto-generated MR numbers

### 📅 Appointments
- Book appointments with doctor, date, time slot, visit type (OPD / Follow-up / Emergency)
- Today's view vs full schedule toggle
- Status filter: All / Waiting / In Room / Scheduled / Completed
- One-tap status updates: Waiting → In Room → Completed
- Cancel appointments with confirmation

### 💊 Pharmacy Inventory
- Full CRUD: add, edit, delete medicines
- Category and unit classification (Tablet, Syrup, Injection, Capsule, etc.)
- Track purchase price, sale price, quantity, and reorder level
- Expiry date tracking with visual warnings
- Low stock alerts (≤10 units) and out-of-stock indicators
- Tabs: All | Low Stock | Expiring Soon
- Real-time search

### 🛒 Pharmacy POS (Point of Sale)
- Medicine search and add to cart
- Quantity controls with stock limit enforcement
- Optional patient linking
- Discount entry
- Payment mode selection: Cash / Card / Bank Transfer / Credit
- Sale summary with subtotal, discount, and total

### 📊 Reports & Analytics
- Patient stats: total, new this month, new today
- Appointment stats: today, this month, completed, cancelled
- Revenue tracking: today, this month, total
- Pharmacy stats: low stock count, expiring count

---

## Tech Stack

### Mobile App
| Technology | Purpose |
|---|---|
| React Native (Expo SDK 54) | Cross-platform mobile framework |
| Expo EAS Build | Cloud APK / AAB build service |
| React Navigation v7 | Stack + Bottom Tab navigation |
| Zustand | Global state management (auth) |
| Axios | HTTP client with JWT interceptors |
| expo-secure-store | Secure token persistence |

### Backend API
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Prisma ORM | Database access layer |
| PostgreSQL | Relational database |
| JWT + bcryptjs | Authentication & password hashing |
| Railway | Cloud hosting + managed database |
| Cloudinary | Document / image storage |
| Helmet + CORS | API security |

---

## Project Structure

```
medicare-plus/
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # Login, register, staff management
│   │   │   ├── patients/       # Patient CRUD
│   │   │   ├── appointments/   # Appointment management
│   │   │   ├── pharmacy/       # Inventory + sales
│   │   │   ├── reports/        # Analytics & dashboard
│   │   │   ├── lab/            # Lab reports
│   │   │   ├── documents/      # File uploads
│   │   │   └── reminders/      # Scheduled reminders
│   │   ├── config/             # Database connection
│   │   └── utils/              # Scheduler, helpers
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   ├── railway.toml            # Railway deployment config
│   └── package.json
│
└── mobile/                     # React Native app
    ├── src/
    │   ├── api/                # Axios API clients
    │   ├── constants/          # Colors, enums, API URL
    │   ├── navigation/         # AppNavigator (tabs + stacks)
    │   ├── screens/
    │   │   ├── Auth/           # Login, Register
    │   │   ├── Dashboard/      # Home screen
    │   │   ├── Patients/       # List, Detail, Add/Edit
    │   │   ├── Appointments/   # List, Book
    │   │   ├── Pharmacy/       # Inventory, POS, Add/Edit Medicine
    │   │   └── Reports/        # Analytics
    │   └── store/              # Zustand auth store
    ├── assets/                 # App icon, splash screen
    ├── app.json                # Expo config
    ├── eas.json                # EAS Build config
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (local) or Railway account
- Expo CLI + EAS CLI
- Android device or emulator

---

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/medicare-plus.git
cd medicare-plus
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/medicare_db"
JWT_SECRET="your_jwt_secret_key"
JWT_EXPIRES_IN="30d"
PORT=5000
NODE_ENV="development"
```

Run database migrations and start the server:

```bash
npx prisma db push       # Create tables
npx prisma generate      # Generate Prisma client
npm run dev              # Start with nodemon
```

API will be running at `http://localhost:5000`
Health check: `http://localhost:5000/health`

---

### 3. Mobile Setup

```bash
cd mobile
npm install
```

Update `src/constants/index.js` with your local IP:

```js
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://YOUR_LOCAL_IP:5000/api';
```

Start Expo:

```bash
npx expo start
```

Scan the QR code with **Expo Go** (Android/iOS).

---

## Deployment

### Backend → Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Set **Root Directory** = `backend`
4. Add a **PostgreSQL** database service
5. Set environment variables (link `DATABASE_URL` from Postgres service)
6. Generate a public domain under Settings → Networking
7. Open Railway Shell and run: `npx prisma db push`

### Mobile → EAS Build (APK)

```bash
cd mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure project
eas build:configure

# Update eas.json with your Railway URL
# "EXPO_PUBLIC_API_URL": "https://YOUR_APP.railway.app/api"

# Build APK
eas build --platform android --profile preview
```

Download the `.apk` from the EAS dashboard and install on any Android device.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register clinic + admin |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/doctors` | List doctors |
| POST | `/api/auth/add-staff` | Add doctor/pharmacist/receptionist |
| GET | `/api/patients` | List patients |
| POST | `/api/patients` | Create patient |
| GET | `/api/patients/:id` | Patient detail |
| PUT | `/api/patients/:id` | Update patient |
| GET | `/api/appointments` | List appointments |
| POST | `/api/appointments` | Book appointment |
| PATCH | `/api/appointments/:id/status` | Update status |
| GET | `/api/pharmacy` | List medicines |
| POST | `/api/pharmacy` | Add medicine |
| PUT | `/api/pharmacy/:id` | Update medicine |
| DELETE | `/api/pharmacy/:id` | Delete medicine |
| POST | `/api/sales` | Create sale |
| GET | `/api/reports/dashboard` | Dashboard stats |

---

## User Roles

| Role | Access |
|------|--------|
| **ADMIN** | Full access — all modules, staff management |
| **DOCTOR** | Patients, appointments, prescriptions |
| **PHARMACIST** | Pharmacy inventory and POS sales |
| **RECEPTIONIST** | Patients and appointments |

---

## Environment Variables

### Backend `.env`

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `30d`) |
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | `development` or `production` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary for document uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Mobile `eas.json`

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Production backend URL |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

<div align="center">

Built with by **Umair Haider**

*MediCare Plus — Digitizing Healthcare, One Clinic at a Time*

</div>
