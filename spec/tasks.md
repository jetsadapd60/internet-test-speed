# Detailed Implementation Tasks (แผนงานและรายการสิ่งที่ต้องทำ)

เอกสารนี้รวบรวม Task ทั้งหมดสำหรับการพัฒนาระบบ Internet Quality Intelligence App ตาม Specification ที่ระบุไว้

---

## **Phase 1: Foundation & DevOps Setup (การเตรียมพื้นฐานและระบบ DevOps)**

### 1.1 Project Initialization

- [x] **Setup Mono-repo:** สร้าง Git Repository และกำหนดโครงสร้าง Folder (Apps, Libs, Tools)
- [x] **Commit Convention:** ตั้งค่า Husky, Commitlint ให้เป็นมาตรฐานเดียวกัน
- [x] **Dependency Management:** เลือกและติดตั้ง Package Manager (pnpm/yarn) และ Workspace configuration

### 1.2 Design System Setup (`design-tokens.md`)

- [x] **Define Tokens:** สร้างไฟล์ Config (JSON/TS) สำหรับ Design Tokens (Colors, Typography, Spacing)
- [x] **Setup CSS Library:** ติดตั้ง TailwindCSS หรือ Global CSS Variables ตาม Tokens
- [x] **Component: Button:** สร้าง Base Button Component (Primary, Ghost, Disabled states)
- [x] **Component: Card:** สร้าง Glassmorphism Card Component
- [x] **Component: Typography:** สร้าง Text Components (H1, H2, Body, Caption)

### 1.3 DevOps & CI/CD

- [x] **CI Pipeline:** สร้าง GitHub Actions workflow สำหรับ Run Test & Lint
- [x] **Containerization:** เขียน `Dockerfile` สำหรับ Web Client และ Backend Service
- [x] **Vercel/Cloud Init:** Setup Project บน Hosting Platform (Staging Env)

---

## **Phase 2: Core Backend Services (ระบบหลังบ้านหลัก)**

### 2.1 Auth & User Service

- [x] **Database Schema:** ออกแบบ Table Users, Profiles
- [x] **API: Register:** สร้าง Endpoint สำหรับสมัครสมาชิก (Email/Password)
- [x] **API: Login:** สร้าง Endpoint สำหรับเข้าสู่ระบบ และออก JWT Token
- [x] **Middleware:** สร้าง Auth Guard สำหรับ Protect Private Routes

### 2.2 Test Session Service

- [x] **Session Schema:** ออกแบบ Table TestSessions เก็บ Session ID, UserID, StartTime
- [x] **API: Start Session:** endpoint ขอเริ่มเทส (return session_token + edge server info)
- [x] **Logic: Server Selector:** เขียน Algorithm เลือก Edge Server ที่ใกล้ที่สุด (GeoIP หรือ Ping Check)

### 2.3 Result Processing

- [x] **Metrics Schema:** ออกแบบ Time-series Schema (InfluxDB/Timescale) เก็บค่า Ping, Speed (Raw Data)
- [x] **API: Submit Result:** Endpoint รับค่าผลการทดสอบจาก Client
- [x] **Validation Logic:** ตรวจสอบความถูกต้องของข้อมูล (Sanity Check) ก่อนบันทึก
- [x] **Score Calculation:** เขียน Function คำนวณ Health Score (0-100) จากค่าที่ส่งมา

---

## **Phase 3: Edge Server Implementation (ระบบเซิร์ฟเวอร์ทดสอบ)**

### 3.1 Speed Test Engine

- [x] **Go/Rust Service:** ขึ้นโครงสร้าง Service ประสิทธิภาพสูง
- [x] **Endpoint: Download/Upload:** สร้าง Route สำหรับ Stream Data (TCP/HTTP)
- [x] **Socket Implementation:** จัดการ WebSocket สำหรับ Real-time Latency measuring

### 3.2 Deployment & Network

- [x] **Server Tuning:** ปรับ Kernel Parameter (sysctl) รองรับ Connection จำนวนมาก
- [x] **Load Balancing Strategy:** config NGINX/Envoy หน้า Edge Server

---

## **Phase 4: Client Application (Web App)**

### 4.1 UI Implementation (`design.md` & `behavior.md`)

- [x] **Landing Page:** Implement Hero Section และปุ่ม Start ที่มี Animation
- [x] **Layout:** สร้าง Main Layout (Navbar, Footer, Container)
- [x] **Anim: Speed Gauge:** สร้าง Custom Gauge Component หรือใช้ Library ที่ปรับแต่งได้
- [x] **Anim: Graph:** Implement Real-time Line Chart component

### 4.2 Test Logic Integration

- [x] **Worker Thread:** ย้าย Logic การโหลดไฟล์ (Download/Upload) ไปรันใน Web Worker
- [x] **Ping Logic:** เขียน Function วัด Latency ผ่าน WebSocket หรือ Fetch
- [x] **State Management:** จัดการ State (Idle -> Testing -> Result)

### 4.3 Internationalization (i18n)

- [ ] **i18n Setup:** ติดตั้งและ Config Library (next-i18next, react-intl หรือเทียบเท่า)
- [ ] **Translation Files:** สร้างไฟล์แปลภาษา (JSON/YAML) สำหรับ TH และ EN
  - [ ] Common UI (ปุ่ม, Label, Navigation)
  - [ ] Speed Test Flow (Idle, Testing, Result states)
  - [ ] Scenario Mode (Gaming, Streaming, Work from Home)
  - [ ] History & Profile Pages
  - [ ] Error Messages & Notifications
- [ ] **Language Switcher Component:** สร้าง UI Component สำหรับเปลี่ยนภาษา
- [ ] **Locale Detection:** ตรวจจับภาษาจาก Browser หรือ User Settings
- [ ] **Persistence:** บันทึกค่าภาษาที่เลือกใน LocalStorage/Database
- [ ] **Dynamic Content:** แปล Insights และ Recommendations ตามภาษา
- [ ] **Number & Date Formatting:** ปรับรูปแบบตัวเลขและวันที่ตามภาษา

### 4.4 Result & History

- [x] **Result Page:** แสดง Health Score และ Summary Cards
- [x] **History Page:** ดึง API ประวัติการทดสอบมาแสดงแบบ Table/List
- [x] **User Profile:** หน้าแก้ไขข้อมูลส่วนตัว

---

## **Phase 5: Testing & QA (การทดสอบและประกันคุณภาพ)**

### 5.1 Automated Testing

- [x] **Unit Test:** เขียน Test ครอบคลุม Core Logic (Calculation, Validation)
- [x] **E2E Test:** ใช้ Playwright/Cypress จำลอง User Flow (Start Test -> View Result)

### 5.2 Performance Testing

- [ ] **Load Test Backend:** ยิง Request ถล่ม API เพื่อวัด Throughput
- [ ] **Bandwidth Simulation:** จำลอง Network แย่ๆ (High Latency, Packet Loss) ดูการตอบสนองของ App
