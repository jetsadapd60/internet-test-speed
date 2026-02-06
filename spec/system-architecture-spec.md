# System Architecture Specification

## Internet Speed Test App

เอกสารนี้อธิบายสถาปัตยกรรมระบบเชิงเทคนิค (System Architecture Spec)
สำหรับแอปพลิเคชันทดสอบความเร็วอินเทอร์เน็ตแบบ lightweight

---

## 1. Architecture Overview

สถาปัตยกรรมระบบเป็นแบบ **Client-heavy with Minimal Backend**
โดยเน้นความเรียบง่ายและลดความซับซ้อนของการ deploy

### High-level Components

- **Client Application** (Next.js Web App)
- **Minimal Backend API** (NestJS with 3 endpoints only)
- **No Database** (localStorage for client-side persistence)

---

## 2. Client Layer

### Supported Clients

- Web App (Desktop / Mobile browsers)

### Responsibilities

- Execute network speed tests (Download/Upload)
- Measure latency via WebSocket (Ping)
- Calculate Health Score locally
- Store test history in localStorage
- Display results and analytics

### Technology Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19, TailwindCSS
- **State:** React Context / Hooks
- **Storage:** localStorage API
- **Network:** Fetch API, WebSocket

---

## 3. Backend API Architecture

### Purpose

Provide minimal endpoints required for network speed testing only.

### API Endpoints

1. **`GET /api/download`**
   - Stream random binary data to client
   - Used to measure download speed
   - No authentication required

2. **`POST /api/upload`**
   - Accept binary data from client
   - Discard data immediately (no storage)
   - Used to measure upload speed
   - No authentication required

3. **`WS /ping`**
   - WebSocket endpoint for real-time latency measurement
   - Echo messages back to client
   - Calculate round-trip time

### Technology Stack

- **Framework:** NestJS
- **Transport:** HTTP + WebSocket
- **Dependencies:** Minimal (no ORM, no database driver)

### What's NOT included

- ❌ Database connection
- ❌ Authentication/Authorization
- ❌ User management
- ❌ Session management
- ❌ Data persistence layer

---

## 4. Data Layer

### Client-Side Storage (localStorage)

**Purpose:** Store test history locally in browser

**Data Structure:**

```json
{
  "testHistory": [
    {
      "id": "uuid",
      "timestamp": 1234567890,
      "downloadSpeed": 100.5,
      "uploadSpeed": 50.2,
      "ping": 15.3,
      "jitter": 2.1,
      "healthScore": 85
    }
  ]
}
```

**Limitations:**

- Storage size: ~5-10MB (browser dependent)
- Data is device-specific (no sync)
- Cleared when browser data is cleared

**No Server-Side Database:**

- No PostgreSQL
- No cloud storage
- No backup/restore functionality

---

## 5. Data Flow Specification

### 5.1 Speed Test Flow

1. User clicks "Start Test"
2. Client initiates WebSocket connection to `/ping`
3. Client measures latency (multiple samples)
4. Client fetches data from `/api/download` and measures speed
5. Client uploads data to `/api/upload` and measures speed
6. Client calculates Health Score locally
7. Client saves result to localStorage
8. Client displays result

### 5.2 History Management Flow

1. User navigates to History page
2. Client loads data from localStorage
3. Client displays list of past tests
4. User can export to CSV/JSON
5. User can delete individual results or clear all

**Note:** No server-side API calls for history management.

---

## 6. Deployment Architecture

### Development

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├─→ Next.js Dev Server (http://localhost:3000)
       └─→ NestJS API (http://localhost:3010)
```

### Production

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ├─→ Next.js (https://speed.domain.com)
       └─→ NestJS API (https://speed.domain.com/api)
```

**Docker Deployment:**

- 2 containers: `web` (Next.js), `api` (NestJS)
- No database container
- Reverse proxy with Nginx/Caddy for HTTPS

---

## 7. Scalability & Performance

### Scalability Strategy

- **Horizontal Scaling:** Add more API instances via load balancer
- **CDN:** Serve Next.js static assets via CDN
- **No Database Bottleneck:** No shared state to synchronize

### Performance Targets

- API response time: < 100ms
- WebSocket latency: < 50ms
- Client-side rendering: < 1s
- localStorage operations: < 10ms

---

## 8. Security Architecture

### Data Privacy

- No personal data collected
- No user accounts or authentication
- No server-side data storage
- IP addresses not logged

### API Protection

- CORS configuration (allow browser origins only)
- Rate limiting on endpoints
- WebSocket connection limits

---

## 9. Observability

### Monitoring (Optional)

- API request metrics (response time, error rate)
- WebSocket connection count
- No user analytics (privacy-first approach)

### Logging

- Minimal server-side logging
- No sensitive data in logs
- Client-side console errors only

---

## 10. Comparison to Previous Architecture

| Aspect                | Previous (Enterprise)  | Current (Simplified)   |
| --------------------- | ---------------------- | ---------------------- |
| Database              | PostgreSQL + Prisma    | None (localStorage)    |
| Authentication        | JWT + OAuth            | None                   |
| Backend Services      | 6+ modules             | 1 module (3 endpoints) |
| Deployment Complexity | High (DB + migrations) | Low (2 containers)     |
| User Management       | Full system            | None                   |
| Data Persistence      | Cloud (permanent)      | Local (temporary)      |
| Scalability           | Complex                | Simple                 |

---

> เอกสารนี้ใช้เป็นฐานสำหรับทีม DEV และ DevOps
> ในการพัฒนาและ deploy ระบบแบบ lightweight
