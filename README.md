# National Harold Campus Library Management System (LibraManage)

Welcome to the **National Harold Campus Library (LibraManage) Enterprise Suite**, a highly polished, production-ready full-stack application.

This repository features a hybrid architecture combining a high-performance **React Single Page Application (SPA)** styled with Tailwind CSS and Framer Motion, an **API Gateway & Orchestration Server** powered by Node.js/Express, and an enterprise **Django REST Framework (DRF)** back-end service.

---

## 🚀 Key Feature Sets

1. **Pragmatic User Profile Management**
   - **Student Features**: Real-time update of demographics, custom avatar customization matching seed signatures, instant overview of books borrowed, active hold requests, and outstanding payment ledgers.
   - **Staff & Admin Controls**: Department assignments, contact setting, and secure password changes.

2. **Full-Featured User Management Portal**
   - Interactive CRUD operations for administrative oversight.
   - Role assignments (Student, Librarian, Admin) with granular permission restrictions.
   - Real-time search/filter inputs and real-time user action auditing.

3. **Intelligent Book Cataloging & Circulation Workflows**
   - Check-out books instantly with automatic stock counter controls.
   - Advanced reservation queue system (holds) with active queuing numbers for out-of-stock items.
   - Automated fine calculation engine with overdues tracking and payment settling.

4. **Interactive Reports & Analytic Engines**
   - Aesthetic data visualization cards monitoring Circulation Velocity, Inventory Allocation, and member registrations.
   - Dynamic charts tracing Top Borrowed Books lists and Monthly Circulation Tendencies (utilizing Recharts).

5. **Notification Stream**
   - Instant transaction notifications (checkouts, returns, hold availability matches, payment resolutions).

---

## 🏗️ Technical Architecture & Directory Layout

```
├── .env.example             # Template for secure environment settings
├── metadata.json            # Frame and platform hardware permissions
├── package.json             # Root level node dependencies & scripts
├── server.ts                # Primary production node orchestration proxy & static server
├── db.json                  # Highly responsive simulated JSON database file
├── src/                     # React/Vite front-end source directory
│   ├── App.tsx              # Main orchestrating interface
│   ├── types.ts             # Shared global TypeScript types & definitions
│   ├── index.css            # Tailwinds import & global stylesheet custom scrollbars
│   ├── lib/
│   │   └── api.ts           # Standardized axios client & API endpoints mapping
│   └── components/          # Reusable view cards and specialized dashboards
└── backend/                 # Parallel Django Backend microservices
    ├── manage.py            # Django admin manager CLI helper
    ├── requirements.txt     # Python requirements list
    ├── db_backup.sql        # Database export schema and insert data seeding sql statements
    ├── seed.py              # SQLite automated seed database execution script
    └── library_project/     # Configuration module settings & settings.py
```

---

## 📂 Environment Variables (`.env.example`)

We maintain a secure environment configuration template in the root `.env.example`. Duplicate this file as `.env` and fill in necessary keys:

```ini
# Server configuration
NODE_ENV=production
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=*

# Optional API Keys and details
GEMINI_API_KEY=your-secure-google-gemini-key
```

---

## 📦 Developer Setup & Deployment Guides

### A. React & Node.js Production Launch (Primary Stack)

The primary full-stack pipeline combines React front-end compilation and Express API gateway serving in a unified, containerized pipeline. We compile Node directly into CommonJS `dist/server.cjs` using `esbuild` to guarantee fast load times and clean routing.

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Run in Development Mode
```bash
npm run dev
```
The server launches on [http://localhost:3000](http://localhost:3000) with hot code reloading.

#### 3. Production Build & Execution
```bash
# Compile client assets and bundle back-end code
npm run build

# Start persistent Express server serving the build
npm run start
```

---

### B. Django Backend Installation

To run the parallel Python security & catalog administration servers:

#### 1. Configure the Python Virtual Environment
```bash
cd backend
python -m venv venv

# Activate Virtual Environment:
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

#### 2. Install Required Python Libraries
```bash
pip install -r requirements.txt
```

#### 3. Run Database Migrations
```bash
python manage.py migrate
```

#### 4. Seed Academic Databases with Defaults
```bash
python seed.py
```

#### 5. Launch Django REST Engine
```bash
python manage.py runserver 8000
```
Interactive API docs are available at `http://localhost:8000/swagger/` or `http://localhost:8000/redoc/`.

---

## 🪟 Windows Local Installation Guide

If you're deploying on a Windows PC, use the following manual step-by-step instructions.

### Prerequisites
1. **GitHub Git Suite**: Install from [Git for Windows](https://gitforwindows.org/).
2. **NodeJS LTS (v18 or v20)**: Download and run the installer from [Node.js Official Website](https://nodejs.org/).
3. **Python 3.10+**: Download from [python.org](https://www.python.org/). Make sure to select **"Add python.exe to PATH"** during installation.

### Project Boot-Up (Windows Powershell / Command Prompt)

1. Open **Command Prompt (cmd)** as Administrator and clone the code:
   ```cmd
   git clone <repository-url>
   cd library-management-system
   ```

2. **Install Frontend and Primary Server**:
   ```cmd
   npm install
   ```

3. **Launch the Portal**:
   ```cmd
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

4. **Setup Python Django Services (Optional Parallel Server)**:
   Open a separate Command Prompt window:
   ```cmd
   cd backend
   python -m venv venv
   call venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python seed.py
   python manage.py runserver 8000
   ```

---

## 🏦 Database Backups & Export Schemas

For migrations to relational database systems (PostgreSQL, MySQL, SQLite, Oracle), please reference the dedicated backup file located under `/backend/db_backup.sql`.

To import the backup:
```bash
# SQLite Import
sqlite3 library.db < backend/db_backup.sql

# MySQL/MariaDB Import
mysql -u root -p library_database < backend/db_backup.sql

# PostgreSQL Import
psql -U postgres -d library_database -f backend/db_backup.sql
```

---

## 🔗 REST API Endpoints Specification

### Authentication & Profiles (`/api/auth/*`)
- `POST /api/auth/login/`: Validates credentials, returns signed bearer session tokens and student metadata.
- `POST /api/auth/register/`: Registers a new student account.
- `GET /api/auth/me/`: Retrieves details about the current authenticated user session.
- `PUT /api/auth/me/update/`: Updates personal department and phone contacts.
- `PUT /api/auth/me/change-password/`: Modifies old security passwords safely.

### Inventory Catalog (`/api/books/*`)
- `GET /api/books/catalog/`: Filter and query catalog books. Supports search text queries and genre categories.
- `POST /api/books/catalog/`: (Librarian/Admin only) Registers a new book into the inventory.
- `GET /api/books/catalog/:id/`: Fetches unique specifications of a particular title.
- `PUT /api/books/catalog/:id/`: Updates locations, quantities, and descriptions of inventory books.
- `DELETE /api/books/catalog/:id/`: Liquidates unique literary assets entirely.

### Circulation Desk & Reservations (`/api/borrowings/*`)
- `GET /api/borrowings/records/`: Lists borrow sessions.
- `POST /api/borrowings/records/`: Checks out an item creating an active loan.
- `POST /api/borrowings/records/:id/return-book/`: Discharges active loans and updates stock count.
- `POST /api/borrowings/records/pay-fines/`: Clears fines balance.
- `GET /api/borrowings/reservations/`: Views waiting list queues.
- `POST /api/borrowings/reservations/`: Reserves out-of-stock items.
- `POST /api/borrowings/reservations/:id/cancel/`: Cancels hold requests.
- `GET /api/borrowings/reports/advanced/`: Retrieves aggregated telemetry logs.

### Members Directory & Updates (`/api/users/*`)
- `GET /api/users/`: Lists profiles.
- `POST /api/users/`: Creates accounts.
- `PUT /api/users/:id/`: Updates accounts.
- `DELETE /api/users/:id/`: Deactivates/removes records.

### Alerts (`/api/notifications/*`)
- `GET /api/notifications/`: Fetches transactional user notifications.
