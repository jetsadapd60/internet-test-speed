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

- [ ] **Create storage utility**
  - [ ] `saveResult()` - Save test result
  - [ ] `getHistory()` - Load all results
  - [ ] `deleteResult(id)` - Delete single result
  - [ ] `clearAll()` - Clear all history
  - [ ] `exportJSON()` - Export as JSON
  - [ ] `exportCSV()` - Export as CSV
  - [ ] Storage limit handling (max 1000 results)

### 3.2 API Client Simplification

- [ ] Remove authentication-related API calls
- [ ] Remove test session API calls
- [ ] Keep only speed test endpoints

### 3.3 Pages

- [x] **Home Page** (Speed Test UI - existing)
- [x] **Result Page** (existing, needs update)
  - [ ] Update to save results to localStorage
  - [ ] Remove API calls to backend
- [x] **History Page** (existing, needs update)
  - [ ] Update to load from localStorage
  - [ ] Add export buttons (CSV/JSON)
  - [ ] Add delete confirmation dialog
  - [ ] Add clear all button
- [ ] **Remove Profile Page** (no longer needed)

### 3.4 Components

- [x] Speed Gauge (existing)
- [x] Graph/Chart components (existing)
- [ ] Export buttons
- [ ] Delete confirmation modal
- [ ] Storage usage indicator

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

- [ ] **Update `docker-compose.full.yml`**
  - [ ] Remove `postgres` service
  - [ ] Remove DATABASE_URL from api service
  - [ ] Remove migration commands
  - [ ] Simplify api startup command

### 4.2 Root Dependencies

- [ ] Remove `@prisma/client` from root `package.json`
- [ ] Remove `prisma` from root `package.json`
- [ ] Regenerate `pnpm-lock.yaml`

---

## **Phase 5: Testing & Verification**

### 5.1 Backend Tests

- [ ] Test `/api/download` endpoint
- [ ] Test `/api/upload` endpoint
- [ ] Test `/ping` WebSocket endpoint
- [ ] Verify no database dependencies remain

### 5.2 Frontend Tests

- [ ] Test speed test flow (Ping → Download → Upload)
- [ ] Test localStorage save/load
- [ ] Test export functionality (CSV/JSON)
- [ ] Test delete/clear functionality
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

### 5.3 Deployment

- [ ] Docker build succeeds without database
- [ ] Application starts successfully
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
