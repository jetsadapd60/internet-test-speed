# Design & Layout Specification (ข้อกำหนดการออกแบบและโครงสร้างหน้าจอ)

**Project:** Internet Quality Intelligence App
**Language:** Thai (TH)
**Reference:** `design-tokens.md`, `behavior-ui-spec.md`

เอกสารนี้ระบุโครงสร้าง Layout และการจัดวางองค์ประกอบ (Composition) ของหน้าจอหลัก เพื่อให้การพัฒนามีทิศทางเดียวกันและสวยงามตามรูปแบบ Modern High-Performance Team

---

## 1. Core Layout Structure (โครงสร้างหลัก)

### 1.1 Desktop Layout (12 Column Grid)

- **Header (Navigation Bar):**
  - **Height:** 80px
  - **Position:** Sticky Top
  - **Background:** `Bg-Glass` (Blur 20px)
  - **Content:** Logo (ซ้าย), เมนูนำทาง (กลาง), Language Switcher + User Profile/Settings (ขวา)
  - **Language Switcher:** Toggle หรือ Dropdown ระหว่าง TH/EN ด้วยไอคอนธงชาติหรือรหัสภาษา
- **Main Container:**
  - **Max-Width:** 1200px
  - **Padding:** X-Axis `24px` (`lg`)
  - **Alignment:** Center
- **Footer:**
  - **Content:** Copyright, Links, Social Icons
  - **Style:** Minimal, สี Text-Tertiary

### 1.2 Mobile Layout (Single Column)

- **Header:** ลดความสูงเหลือ 60px, ซ่อนเมนูไว้ใน Hamburger
- **Bottom Navigation (Optional for App):** อาจพิจารณาในอนาคตสำหรับ Mobile App

---

## 2. Key Screen Designs (หน้าจอหลัก)

### 2.1 Landing / Home Page (หน้าแรก)

เน้นความ "ว้าว" และเข้าถึงการทดสอบได้ทันที

- **Hero Section:**
  - **Center:** ปุ่ม "GO" ขนาดใหญ่ (200x200px) ลอยเด่นกลางจอ พร้อม Effect แสง `Glow-Primary`
  - **Background:** Abstract Neon Grid หรือ Cyberpunk Mesh เคลื่อนไหวช้าๆ
- **Stats Bar:** แถบแสดงข้อมูลพื้นฐาน (IP, Provider, Location) อยู่ด้านล่าง Hero
- **Quick Scenarios:** การ์ดเลือกโหมด 3 ใบ (Gaming, Streaming, Work) เรียงแนวนอนด้านล่าง

### 2.2 Test Running Page (หน้าขณะทดสอบ)

เน้นการแสดงผล Real-time ที่ตื่นตาตื่นใจ

- **Speed Gauge:**
  - ไม่ใช้เข็มแบบเก่า แต่ใช้ **Digital Ring** หรือ **Arc Progress** ที่มีความหนา
  - ตัวเลขความเร็ว (Mbps) ขนาดใหญ่ (`H1`) ตรงกลาง
- **Real-time Graph:**
  - กราฟเส้น (Line Chart) แสดงความเสถียรอยู่ด้านล่าง Gauge
  - Area ใต้กราฟ Fill ด้วย Gradient โปร่งแสง
- **Details Panel:** แสดงค่า Ping, Jitter แบบ Real-time ที่มุมจอ

### 2.3 Result Summary Page (หน้าสรุปผล)

เน้นการอ่านผลวิเคราะห์และ Health Score

- **Health Score Card:**
  - การ์ดใหญ่ที่สุด แสดงคะแนน 0-100
  - สี Circular Progress เปลี่ยนตามเกรด (เขียว/ฟ้า/ส้ม/แดง)
- **Grid Layout (2x2):**
  - Download Speed
  - Upload Speed
  - Ping / Latency
  - Jitter / Packet Loss
- **Insight Section:**
  - กล่องข้อความ `Bg-Surface-1` พร้อมไอคอน และคำแนะนำที่เข้าใจง่าย (ไม่ใช่ศัพท์เทคนิคจ๋า)

### 2.4 History & Analytics (หน้าประวัติ)

- **Table View:** รายการทดสอบย้อนหลัง (Date, Speed, Score)
- **Filter Bar:** กรองตามช่วงเวลา หรือ Server
- **Trend Chart:** กราฟแท่งแสดงแนวโน้มความเร็วในช่วง 7-30 วันที่ผ่านมา

---

## 3. Component Design (การออกแบบองค์ประกอบ)

### 3.1 Cards (การ์ด)

- **Style:** Glassmorphism (`Bg-Surface-1` + Border-Thin)
- **Hover:** ยกตัวขึ้น (`Make it float`) และขอบสว่างขึ้น (`Border-Highlight`)
- **Content:** หัวข้อ (`H3`) อยู่บน, เนื้อหาหลักอยู่กลาง, action อยู่ล่างขวา

### 3.2 Buttons (ปุ่ม)

- **Primary (CTA):**
  - Gradient Background (`Brand Primary` -> `Brand Secondary`)
  - ไม่มี Border
  - Shadow แบบ `Glow-Primary`
- **Secondary (Ghost):**
  - พื้นหลังโปร่งใส
  - Border `1px solid Brand Primary`
  - Text สี `Brand Primary`

### 3.3 Icons & Imagery

- **Icons:** ใช้ชุดไอคอนแบบ Thin Line หรือ Duotone ที่ดูทันสมัย (เช่น Lucide, Heroicons)
- **Empty States:** ใช้ภาพ 3D Abstract หรือ Illustration เส้น Neon เมื่อไม่มีข้อมูล

---

## 4. Visual Effects (เอฟเฟกต์พิเศษ)

- **Parallax:** พื้นหลังขยับช้าๆ ตามเมาส์ เพื่อสร้างมิติ (Depth)
- **Neon Pulse:** แสงหายใจ (Breathing) ที่ปุ่ม GO และค่า Critical
- **Blur:** ใช้ Backdrop Filter Blur กับ Modal และ Header เพื่อความลึก
