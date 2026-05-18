# Jewellery Inventory Management System

A production-ready multi-shop inventory management system built for real jewellery business operations.

Designed for:

* Inventory tracking
* Barcode-based stock deduction
* Daily sales management
* Multi-shop operations
* Staff/admin role management
* Reports and exports

---

# Features

## Authentication & Roles

* JWT Authentication
* Admin and Staff roles
* Protected backend routes
* Persistent login sessions

## Multi-Shop System

* Shop switcher
* Separate inventory per shop
* Shop-aware reports and scanning
* Shared staff visibility across shops

## Product Management

* Add/Edit/Delete products
* Auto-generated SKU system
* Sequential barcode generation
* Product image uploads with Cloudinary
* Category and supplier support
* Low stock threshold alerts

## Barcode Scanning

* USB barcode scanner support
* Real-time stock deduction
* Immutable stock movement ledger
* Multi-shop safe scanning
* Rapid sequential scanning workflow

## Inventory Tracking

* Immutable stock movement history
* Manual stock adjustment system
* Quantity tracking
* Low stock alerts
* Stock history logs

## Reports & Analytics

* Daily sales reports
* Sales trend charts
* Low stock reports
* Excel export
* PDF export

## User Management

* Admin-only user management
* Staff restrictions enforced in backend
* Active/inactive user support

---

# Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* React Query
* Zustand
* Recharts
* React Hot Toast

## Backend

* FastAPI
* PostgreSQL
* SQLAlchemy Async
* JWT Authentication
* Repository-Service architecture

## Storage & Hosting

* Cloudinary (image storage)
* Railway / Render (backend)
* Vercel (frontend)

---

# Project Structure

## Backend

```text
backend/app/
├── api/v1/
├── core/
├── models/
├── repositories/
├── schemas/
├── services/
└── main.py
```

## Frontend

```text
frontend/src/
├── api/
├── components/
├── hooks/
├── pages/
├── store/
└── App.jsx
```

---

# Key Architecture Decisions

## Multi-Shop Architecture

Every business entity contains a `shop_id` field:

* products
* categories
* suppliers
* sales
* stock movements

This ensures:

* clean inventory separation
* accurate reports
* shop-specific scanning

---

## Immutable Stock Ledger

Stock movements are never overwritten.

Every inventory change creates a ledger entry:

* sales
* adjustments
* damages
* returns

This improves:

* auditability
* reliability
* stock tracing

---

## Barcode Workflow

Barcode scanners act as keyboard input.

Workflow:

1. Scanner scans barcode
2. Frontend captures input
3. Backend validates product
4. Stock deducted atomically
5. Sale + stock movement recorded
6. Low stock alerts triggered if needed

---

# Environment Variables

## Backend

```env
DATABASE_URL=
JWT_SECRET_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Frontend

```env
VITE_API_URL=
```

---

# Development Setup

## Backend Setup

```bash
cd backend

python -m venv venv
source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs on:

```text
http://localhost:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# Deployment

## Live Application

Frontend:

```text
https://your-frontend-domain.vercel.app
```

Backend API:

```text
https://your-backend-domain.onrender.com
```

API Documentation:

```text
https://your-backend-domain.onrender.com/docs
```

---

# Production Infrastructure

## Frontend Hosting

* Vercel

## Backend Hosting

* Render

## Database

* PostgreSQL

## Image Storage

* Cloudinary

---

# Production Features

* Multi-shop inventory management
* Barcode-based stock deduction
* Product image uploads
* Immutable stock ledger
* Daily reports
* PDF/Excel exports
* Role-based access control
* React Query caching
* Cloudinary integration
* Async backend architecture

---

# Future Improvements

* Barcode label printing
* Purchase order management
* Invoice generation
* GST billing
* Real-time stock sync
* Advanced analytics dashboard
* Automated backups
* Audit logs
* Mobile optimization

---

# License

Private business software.

---

# Author

Built for production-grade inventory and stock management operations.
