# 🩺 MediBook — Doctor Appointment Booking Platform

MediBook is a full-stack healthcare web application that simplifies the process of booking and managing doctor appointments. It provides three dedicated role-based portals — for **patients**, **doctors**, and **admins** — each with their own dashboard, workflows, and features. Built with React on the frontend and Node.js/Express with SQLite on the backend, secured with JWT authentication.

---


## ✨ Features

### 🧑 Patient Portal
- Register and log in securely with JWT authentication
- Browse and search doctors by name or specialty
- Book appointments through a guided 5-step flow:
  `Select Doctor → Choose Date → Pick Time Slot → Describe Symptoms → Confirm`
- View, reschedule, or cancel existing appointments
- Track appointment status in real time (Pending → Accepted → Completed)
- Rate and review doctors after a completed appointment
- Manage personal profile including medical history, blood group, and allergies

### 👨‍⚕️ Doctor Portal
- View all incoming appointment requests from patients
- Accept ✓ or reject ✕ bookings with an optional note to the patient
- Mark appointments as completed after the consultation
- View a day-by-day schedule with a scrollable calendar strip
- View personal profile, average star rating, and all patient reviews

### 🛡️ Admin Dashboard
- Monitor platform-wide stats — total patients, total doctors, today's appointments, pending requests
- View doctor demand and booking volume per specialty
- Search registered patients by name
- View top-rated doctors and their review counts

---

## 🛠️ Tech Stack

| Layer          | Technology                                      |
|----------------|-------------------------------------------------|
| Frontend       | React 19, React Router v7, Context API          |
| Backend        | Node.js, Express                                |
| Database       | SQLite (`sqlite3`)                  |
| Authentication | JWT (JSON Web Tokens)                           |
| Icons          | Lucide React                                    |
| Fonts          | DM Serif Display, DM Sans (Google Fonts)        |

---

## 📁 Project Structure

```
medibook/
├── public/
│   └── index.html
├── src/
│   ├── App.js                  # Top-level routing (patient / doctor / admin)
│   ├── AppContext.js           # Global state, API calls, auth logic
│   ├── AuthPages.js            # Login and Register pages
│   ├── BookingPage.js          # Multi-step appointment booking flow
│   ├── AppointmentsPage.js     # Patient appointment list, reschedule, rating
│   ├── DoctorDashboard.js      # Doctor home, requests, schedule, profile
│   ├── DoctorsPage.js          # Doctor discovery and search
│   ├── AdminPage.js            # Admin metrics and patient search
│   ├── ProfilePage.js          # Patient profile editor
│   ├── HomePage.js             # Patient landing dashboard
│   ├── Nav.js                  # Sidebar navigation (role-aware)
│   ├── components.js           # Shared UI — Card, Modal, StarRating, Toast, etc.
│   ├── index.js
│   └── index.css
├── server/
│   ├── database.js             # SQLite schema + seeding logic
│   ├── routes/                 # Express API routes
│   └── index.js                # Express server entry point
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16 or later
- npm

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/medibook.git
cd medibook
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
cd ..
```

### 4. Set up environment variables

Create a `.env` file inside the `server/` folder:

```env
JWT_SECRET=your_secret_key_here
PORT=5000
```

### 5. Start the backend server

```bash
npm run server
```

### 6. Start the React frontend

Open a new terminal in the project root:

```bash
npm start
```

The app will open at `http://localhost:3000`. The API runs at `http://localhost:5000`.

---

## 🗄️ Database

MediBook uses **SQLite** for local persistent storage. The schema is defined in `server/database.js` and includes the following tables:

| Table          | Description                                         |
|----------------|-----------------------------------------------------|
| `users`        | All registered users (patients, doctors, admins)    |
| `patients`     | Patient profile data (medical info, blood group)    |
| `doctors`      | Doctor profiles (specialty, rating, review count)   |
| `appointments` | All booked appointments with status tracking        |
| `reviews`      | Patient ratings and reviews for completed visits    |

> The `.db` file is excluded from version control. The database is created automatically when the server starts for the first time.

---

## 🔐 Demo Credentials

### Doctor Accounts (pre-seeded)

| Doctor                  | Email                      | Password    |
|-------------------------|----------------------------|-------------|
| Dr. Priya Sharma        | sharma@medibook.com        | doctor123   |
| Dr. Anita Desai         | desai@medibook.com         | doctor123   |
| Dr. Vikram Joshi        | joshi@medibook.com         | doctor123   |
| Dr. Sneha Kulkarni      | kulkarni@medibook.com      | doctor123   |
| Dr. Arjun Mehta         | mehta@medibook.com         | doctor123   |
| Dr. Rohit Patil         | patil@medibook.com         | doctor123   |

### Admin Account

| Role   | Email                   | Password    |
|--------|-------------------------|-------------|
| Admin  | admin@medibook.com      | admin123    |

### Patient
Register a new account from the login screen.

---

## 🔄 Appointment Workflow

```
Patient books appointment
        ↓
   Status: Pending
        ↓
Doctor accepts or rejects
        ↓
   Status: Accepted / Rejected
        ↓
Doctor marks as complete
        ↓
   Status: Completed
        ↓
Patient can now rate the doctor ⭐
```

---

## 📦 Available Scripts

| Command          | Description                        |
|------------------|------------------------------------|
| `npm start`      | Start the React development server |
| `npm run build`  | Build the app for production       |
| `npm run server` | Start the Express backend server   |
| `npm test`       | Run frontend tests                 |

---

## 🗺️ Roadmap

- [ ] Email / SMS appointment reminders
- [ ] Doctor availability calendar management
- [ ] Payment integration for consultation fees
- [ ] Video consultation support
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

---

## 👤 Author

**Arpita Singh**
- GitHub: https://github.com/arpita220
- LinkedIn: https://www.linkedin.com/in/arpitasingh22
