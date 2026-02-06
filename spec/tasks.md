# Detailed Implementation Tasks

เอกสารนี้รวบรวม Task สำหรับการพัฒนาระบบ Internet Speed Test App (Simplified Architecture)

---

## **Phase 1: Foundation & Setup**

### 1.1 Project Structure

- [x] Setup Mono-repo with pnpm workspace
- [x] Configure Git with commit conventions (Husky + Commitlint)
- [x] Create Next.js web app
- [x] Create NestJS API app

### 1.2 Design System

- [x] Define Design Tokens (Colors, Typography, Spacing)
- [x] Setup TailwindCSS
- [x] Create Button Component
- [x] Create Card Component (Glassmorphism)
- [x] Create Typography Components

### 1.3 DevOps

- [x] Create Dockerfile for web and api
- [x] Create docker-compose.yml
- [x] Setup CI/CD with GitHub Actions

---

## **Phase 2: Minimal Backend API**

### 2.1 Core API Endpoints

- [x] **Remove all database-related code**
  - [x] Delete `apps/api/prisma/` directory
  - [x] Delete `apps/api/src/prisma.service.ts`
  - [x] Remove Prisma from `apps/api/package.json`

- [x] **Remove authentication system**
  - [x] Delete `apps/api/src/auth/` module
  - [x] Delete `apps/api/src/users/` module
  - [x] Remove auth dependencies

- [x] **Simplify app structure**
  - [x] Update `apps/api/src/app.module.ts` (keep SpeedTestModule only)
  - [x] Update `apps/api/src/main.ts` (remove DB/auth config)

- [x] **Speed Test Endpoints** (already implemented)
  - [x] `GET /api/download` - Stream random data
  - [x] `POST /api/upload` - Receive and discard data
  - [x] `WS /ping` - WebSocket latency measurement

---

## **Phase 3: Frontend Development**

### 3.1 localStorage Service

- [x] **Create storage utility**
  - [x] `saveResult()` - Save test result
  - [x] `getHistory()` - Load all results
  - [x] `deleteResult(id)` - Delete single result
  - [x] `clearAll()` - Clear all history
  - [x] `exportJSON()` - Export as JSON
  - [x] `exportCSV()` - Export as CSV
  - [x] Storage limit handling (max 1000 results)

### 3.2 API Client Simplification

- [x] Remove authentication-related API calls
- [x] Remove test session API calls
- [x] Keep only speed test endpoints

### 3.3 Pages

- [x] **Home Page** (Speed Test UI - existing)
- [x] **Result Page** (existing, needs update)
  - [x] Update to save results to localStorage
  - [x] Remove API calls to backend
- [x] **History Page** (existing, needs update)
  - [x] Update to load from localStorage
  - [x] Add export buttons (CSV/JSON)
  - [x] Add delete confirmation dialog
  - [x] Add clear all button
- [x] **Remove Profile Page** (no longer needed)

### 3.4 Components

- [x] Speed Gauge (existing)
- [x] Graph/Chart components (existing)
- [x] Export buttons
- [x] Delete confirmation modal
- [x] Storage usage indicator

### 3.5 Internationalization (i18n)

- [ ] Setup i18n library (next-i18next)
- [ ] Create translation files (TH, EN)
  - [ ] Common UI elements
  - [ ] Speed test flow
  - [ ] History page
  - [ ] Error messages
- [ ] Language switcher component
- [ ] Persist language choice in localStorage

---

## **Phase 4: Infrastructure Updates**

### 4.1 Docker Configuration

- [x] **Update `docker-compose.full.yml`**
  - [x] Remove `postgres` service
  - [x] Remove DATABASE_URL from api service
  - [x] Remove migration commands
  - [x] Simplify api startup command

### 4.2 Root Dependencies

- [x] Remove `@prisma/client` from root `package.json`
- [x] Remove `prisma` from root `package.json`
- [x] Regenerate `pnpm-lock.yaml`

---

## **Phase 5: Testing & Verification**

### 5.1 Backend Tests

- [x] Test `/api/download` endpoint
- [x] Test `/api/upload` endpoint
- [x] Test `/ping` WebSocket endpoint
- [x] Verify no database dependencies remain

### 5.2 Frontend Tests

- [x] Test speed test flow (Ping → Download → Upload)
- [x] Test localStorage save/load
- [x] Test export functionality (CSV/JSON)
- [x] Test delete/clear functionality
- [x] Cross-browser testing (Chrome, Firefox, Safari)

### 5.3 Deployment

- [x] Docker build succeeds without database
- [x] Application starts successfully
- [ ] All features work on VPS
- [ ] HTTPS/SSL configured correctly

---

## **Phase 6: Documentation**

- [x] Update `spec/spec.md`
- [x] Update `spec/system-architecture-spec.md`
- [x] Update `spec/tasks.md`
- [ ] Update `spec/behavior-ui-spec.md`
- [ ] Create deployment guide
- [ ] Create user guide
- [ ] Update README.md
