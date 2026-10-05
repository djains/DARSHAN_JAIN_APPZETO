# Point-by-Point Implementation Plan: Ticket Booking Platform

## 🎨 Global CSS & Architecture Rules
- **CSS Strategy**: Pure Vanilla CSS (`.css` files per screen folder + global CSS variables in `index.css`).
- **Global Theme Palette**: Dark glassmorphic theme defined via standard CSS variables:
  - `--bg-dark`: `#0b0f19`
  - `--bg-card`: `rgba(255, 255, 255, 0.05)`
  - `--primary-accent`: `#6366f1` (Indigo/Purple glow)
  - `--secondary-accent`: `#ec4899` (Neon Pink)
  - `--text-main`: `#f8fafc`
  - `--text-muted`: `#94a3b8`
  - `--seat-available`: `#22c55e` (Green)
  - `--seat-locked-other`: `#f59e0b` (Amber)
  - `--seat-selected-me`: `#3b82f6` (Blue glow)
  - `--seat-sold`: `#ef4444` (Red/Muted)
- **Screen File Structure**: Each screen lives in its own dedicated folder inside `client/src/pages/`, containing `<ScreenName>.jsx` and `<ScreenName>.css` (e.g., `pages/Home/Home.jsx` and `pages/Home/Home.css`).

---

## 📌 Point-by-Point Roadmap

### **Point 1: Base Monorepo & Express Server Setup**
- Setup `/server` structure with TypeScript, Express, Mongoose, Zod, and Pino logger.
- Implement centralized error middleware with standard response format `{ error: { code, message, details } }`.
- Configure Mongo connection (with single-node replica set support for transactions).

### **Point 2: Frontend Base Setup & Global CSS Theme**
- Setup `/client` with Vite + React.
- Create `src/index.css` containing global CSS variables, resets, glassmorphism utilities, font settings, and button/badge styles.
- Establish routing shell and layout structure.

### **Point 3: Auth Module (Backend & Frontend)**
- **Backend**: User model (`name`, `email` unique, `passwordHash`, `role: 'USER' | 'ADMIN'`), register, login (JWT generation), and `requireRole` middleware.
- **Frontend (`src/pages/Auth/Auth.jsx` & `Auth.css`)**: Glassmorphic login/register form with instant validation and token management in Zustand state.

### **Point 4: Events & Seat Map Generation (Backend)**
- **Event Model**: `title`, `description`, `venue`, `dateTime`, `status` ('DRAFT' | 'PUBLISHED'), `lockDurationMinutes`.
- **Seat Model**: `eventId`, `label` ('A1', 'A2'), `row`, `col`, `price`, `status` ('AVAILABLE' | 'LOCKED' | 'BOOKED'), `lockedBy`, `lockExpiresAt`.
- **Seat Grid Generator**: Auto-creates grid seats upon event creation.
- **CRUD Endpoints**: Pagination, filtering (`status=PUBLISHED`), publish/unpublish, and safe deletion blocks.

### **Point 5: Core Atomic Concurrency Seat Locking Engine & Expiry Sweeper**
- **Atomic Updates**: `POST /api/seats/lock` with conditional update query (`status: AVAILABLE` or `lockExpiresAt < now`).
- **Multi-Seat Locks**: Transaction/session mechanism with all-or-nothing rollback. Enforce max 6 seats lock limit per user.
- **Expiry Sweeper**: Background interval task (every 10s) clearing expired seats and query-level fallback.

### **Point 6: Booking & Idempotent Mock Payment Flow**
- **Booking Model**: `userId`, `eventId`, `seatIds`, `totalAmount`, `status` ('PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED' | 'EXPIRED').
- **`POST /api/bookings`**: Server calculates price, verifies active seat locks, creates `PENDING` booking.
- **`POST /api/bookings/:id/payment`**: Idempotent mock payment handling (`success`, `failure`, `timeout`). On success: updates seats to `BOOKED` and generates `nanoid` ticket code & QR code data URI. On failure/timeout: releases locks.
- **Cancellation**: Endpoint to release seats and update booking to `CANCELLED`.

### **Point 7: Real-Time Sync via Socket.IO**
- **Backend Socket**: Server setup with event rooms (`event:<eventId>`) and JWT handshake auth.
- **Real-Time Emitters**: Broadcast `seat:locked`, `seat:released`, `seat:booked` after database mutations.
- **Frontend Listener**: Live seat map status updates in real-time without page reloading.

### **Point 8: Frontend Screen Components (Vite React)**
Dedicated folder per screen with clean Vanilla CSS:
1. **Home Screen (`src/pages/Home/Home.jsx` & `Home.css`)**: Hero banner, event grid, search & filters.
2. **Event Detail Screen (`src/pages/EventDetail/EventDetail.jsx` & `EventDetail.css`)**: Event information, interactive visual seat map, live countdown lock timer, price summary, lock CTA button.
3. **Checkout Screen (`src/pages/Checkout/Checkout.jsx` & `Checkout.css`)**: Order summary, countdown timer, mock payment gateway controls (Success/Failure/Timeout).
4. **My Bookings Screen (`src/pages/Bookings/Bookings.jsx` & `Bookings.css`)**: Order history list, status badges, view ticket, and QR code overlay.
5. **Admin Dashboard Screen (`src/pages/Admin/Admin.jsx` & `Admin.css`)**: Event creation & seat grid builder form, publish toggles, analytics tables.

### **Point 9: Admin Analytics & MongoDB Aggregations**
- Pipeline calculating total revenue, total bookings, available vs sold seat counts, cancellation stats, and daily revenue metrics for Recharts visual charts.

### **Point 10: 100-Concurrent Load Proof Test Suite**
- Vitest + Supertest execution:
  - 1 seat, 100 simultaneous users -> `Promise.all` lock attempt (assert 1 winner HTTP 200, 99 rejected HTTP 409).
  - Transaction rollback test.
  - Payment idempotency verification.
