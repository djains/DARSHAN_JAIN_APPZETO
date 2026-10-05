# Tech Stack & Architectural Plan: Ticket Booking Platform

## 1. Stack Confirmation

### Backend Stack
| Layer / Component | Technology | Purpose / Notes |
| :--- | :--- | :--- |
| **Runtime & Language** | Node.js + TypeScript (`tsx` for dev) | Type safety, modern ES features |
| **Web Framework** | Express.js | Core HTTP REST API framework |
| **Database & ODM** | MongoDB + Mongoose | Document storage with schemas, indexes, atomic updates, transactions |
| **Real-time Engine** | Socket.IO (`socket.io`) | Room-based real-time seat status updates (`event:<eventId>`) |
| **Data Validation** | Zod | Strict schema validation for request params, bodies, and env variables |
| **Authentication** | JWT (`jsonwebtoken`) + `bcryptjs` | Stateless auth, role middleware (`ADMIN` vs `USER`), password hashing |
| **Security** | `helmet`, `cors`, `express-rate-limit` | HTTP headers protection, CORS control, rate limiting |
| **Logger** | `pino` + `pino-http` | High-performance structured logging |
| **Scheduler** | `node-cron` / `setInterval` sweeper | Background sweeping of expired seat locks |
| **Code & QR Utilities** | `nanoid`, `qrcode` | Unique ticket identifiers and QR code generation |
| **Testing Suite** | Vitest + Supertest + `mongodb-memory-server` | Unit/integration testing, including 100-concurrent lock proof test |

### Frontend Stack
| Layer / Component | Technology | Purpose / Notes |
| :--- | :--- | :--- |
| **Build & Framework** | Vite + React + TypeScript | Fast HMR, reactive UI components |
| **Styling & Theme** | Tailwind CSS + Custom CSS Variables | Vibrant dark theme, sleek glassmorphism, responsive seat map UI |
| **Routing** | React Router v6 (`react-router-dom`) | Page navigation (Auth, Events, Seat Selection, Checkout, My Bookings, Admin) |
| **Server State** | `@tanstack/react-query` | Dynamic data caching, optimistic UI updates |
| **Client State** | Zustand | Global auth state, real-time selected seats, lock timer sync |
| **Real-Time WebSockets** | `socket.io-client` | Live subscription to event seat status changes |
| **Forms & Validation** | `react-hook-form` + Zod resolvers | Accessible, validated client forms |
| **Icons & Feedback** | `lucide-react`, `sonner` / `react-hot-toast` | Modern micro-interactions, alert toasts, live timers |
| **Data Visualization** | Recharts | Admin dashboard revenue & booking analytics |
| **Date Utilities** | `date-fns` | Formatting countdown timers, event schedules |

---

## 2. Core Concurrency & Locking Strategy

### Seat Lock Atomic Update
To prevent double-booking without race conditions, MongoDB atomic conditional updates are used:
```typescript
const res = await Seat.updateOne(
  {
    _id: seatId,
    $or: [
      { status: 'AVAILABLE' },
      { status: 'LOCKED', lockExpiresAt: { $lt: new Date() } }
    ]
  },
  { 
    $set: { 
      status: 'LOCKED', 
      lockedBy: userId, 
      lockExpiresAt: new Date(Date.now() + lockDurationMs) 
    } 
  }
);
if (res.modifiedCount === 0) throw new ConflictError('Seat is no longer available');
```

### Multi-Seat Lock Handling (All-or-Nothing)
- **Primary Mechanism**: MongoDB Transactions (via session) when running on a replica set. If any single seat update fails to modify a document, the entire transaction aborts.
- **Fallback / Alternative**: Sequential lock with immediate rollback: lock seats sequentially; if any seat fails, undo previously acquired locks in the same request before throwing a 409 Conflict.

### Lock Expiry & Double Enforcement
1. **Query-level enforcement**: `{ status: 'LOCKED', lockExpiresAt: { $lt: new Date() } }` treats expired locks as `AVAILABLE` immediately during lock attempts.
2. **Background Sweeper**: Periodic job (every 10s) finds expired locks, resets `status` to `AVAILABLE`, and emits `seat:released` via Socket.IO.

---

## 3. Database Indexes

- `users`: `{ email: 1 }` (unique)
- `events`: `{ status: 1, dateTime: 1 }`
- `seats`: `{ eventId: 1, label: 1 }` (unique), `{ eventId: 1, status: 1 }`, `{ status: 1, lockExpiresAt: 1 }`
- `bookings`: `{ userId: 1, createdAt: -1 }`, `{ eventId: 1, status: 1 }`

---

## 4. Next Steps
1. Scaffold `/server` and `/client` monorepo structure.
2. Build seat locking service & run 100-concurrent load proof test.
