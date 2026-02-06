# Behavior & UI Specification (ข้อกำหนดพฤติกรรมผู้ใช้และส่วนต่อประสานกับผู้ใช้)

**Project:** Internet Quality Intelligence App
**Language:** Thai (TH)
**Reference:** `design-tokens.md`

เอกสารนี้ระบุพฤติกรรมการใช้งาน (Behavior) และการตอบสนองของ UI (Interaction) ในแต่ละสถานะของการใช้งาน เพื่อให้ทีมพัฒนาและ UX/UI Designer เข้าใจตรงกัน

---

## 1. Global Interaction (การตอบสนองทั่วไป)

### 1.1 Hover & Focus States

- **Buttons (ปุ่มกด):**
  - **Normal:** สีพื้นหลังปกติตาม Token (เช่น `#00F0FF` สำหรับ Primary)
  - **Hover:** เพิ่มความสว่าง (Brightness) 10% และมี Glow Effect (`Glow-Primary`) เล็กน้อย
  - **Active/Press:** ลดขนาดปุ่มลง 2% (Scale 0.98) เพื่อให้ความรู้สึกสมจริงของการกด
  - **Disabled:** สีเทา `#303040` (Text-Disabled), เคอร์เซอร์เป็น `not-allowed`, ไม่มี Hover Effect
- **Inputs (ช่องกรอกข้อมูล):**
  - **Focus:** ขอบเปลี่ยนเป็นสี `#00F0FF` (Electric Cyan) พร้อม Glow Effect

### 1.2 Transitions (การเคลื่อนไหว)

- **Duration:** 200ms - 300ms สำหรับ Micro-interactions (Hover, Click)
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (Smooth ease-out)
- **Page Transition:** เนื้อหา Fade in + Slide up เล็กน้อยเมื่อเปลี่ยนหน้า

---

## 2. Language Switching (การเปลี่ยนภาษา)

### 2.1 Language Selector Behavior

- **Location:** มุมขวาบนใน Header
- **Display:**
  - แสดงเป็น Toggle (TH/EN) พร้อมไอคอนธงชาติ
  - ภาษาปัจจุบันจะถูก Highlight ด้วยสี `Brand Primary`
- **Interaction:**
  - **Click:** เปลี่ยนภาษาทันที โดยไม่ต้อง Reload หน้า
  - **Animation:** Content Fade out → Switch → Fade in (ระยะเวลา 200ms)
  - **Persistence:** บันทึกค่าการเลือกภาษาใน localStorage

### 2.2 Content Localization

- **UI Elements:** ปุ่ม, Label, Placeholder, Error Messages ทั้งหมดต้องรองรับทั้ง 2 ภาษา
- **Dynamic Content:**
  - ข้อความวิเคราะห์ (Insights) และคำแนะนำ (Recommendations) จะปรับตามภาษาที่เลือก
  - ชื่อ Scenario (Gaming, Streaming, Work from Home) จะแปลเป็นภาษาปัจจุบัน
- **Number Formatting:**
  - ใช้รูปแบบตัวเลขที่เหมาะสมกับแต่ละภาษา (เช่น จุดทศนิยม, การคั่นหลักพัน)
- **Date/Time:** แสดงวันที่และเวลาตามรูปแบบของภาษานั้นๆ

---

## 3. Speed Test Flow (การทดสอบความเร็ว)

### 2.1 Idle State (ก่อนเริ่มทดสอบ)

- **Start Button:** ปุ่ม "GO" ขนาดใหญ่ (Circle) กลางหน้าจอ มี Animation แบบ "Breathing" (ขยาย-หด เล็กน้อย) เพื่อดึงดูดความสนใจ
- **Information:** แสดง IP Address และ ISP ผู้ใช้งานปัจจุบันที่มุมล่างหรือส่วน Header
- **Server Selection:** แสดง Server ที่เลือกอัตโนมัติ (Ping ต่ำสุด) อนุญาตให้คลิกเพื่อเปลี่ยนได้

### 2.2 Testing Phases (ระหว่างทดสอบ)

กระบวนการทดสอบจะแบ่งเป็น 3 ช่วงหลัก โดยมี Gauge หรือ Progress Ring แสดงสถานะ:

1.  **Preparation (เตรียมการ):**
    - ปุ่ม GO หายไป
    - แสดงข้อความ "Connecting..." หรือ "Finding optimal server..."
    - Spinner หมุนบริเวณกลางหน้าจอ

2.  **Ping & Jitter Test:**
    - แสดงตัวเลข Ping วิ่งขึ้นลงชั่วคราว
    - เมื่อเสร็จสิ้น ตัวเลขจะหยุดและแสดงค่าสุดท้ายที่ตำแหน่งสรุปผล

3.  **Download Test:**
    - Gauge เข็มความเร็วดีดขึ้นตาม Real-time speed
    - กราฟเส้น (Real-time Graph) พล็อตค่าความเร็วตลอดช่วงเวลา (แกน X คือเวลา, แกน Y คือ Mbps)
    - ใช้สี `#00F0FF` (Cyan) แสดงสถานะ Download
    - พื้นหลังอาจมี Particle Effect เคลื่อนที่เข้าหาตัวผู้ใช้ (Warp speed feel)

4.  **Upload Test:**
    - คล้าย Download แต่วิ่งในทิศทางสวนกลับ หรือใช้สี `#7000FF` (Violet)
    - กราฟเส้นพล็อตต่อจาก Download

### 2.3 Result State (หลังทดสอบ)

- **Health Score:** ปรากฏขึ้นด้วย Animation แบบ Pop-up หรือ Count-up (0 ถึง คะแนนจริง)
- **Summary Cards:** แสดงค่า Download, Upload, Ping, Jitter, Packet Loss ให้อ่านง่าย
- **Insights:** แสดงข้อความวิเคราะห์สั้นๆ เช่น "เครือข่ายของคุณดีเยี่ยมสำหรับการสตรีม 4K" (ใช้สี Text-Success)
- **Action Buttons:** "Test Again" (ปุ่มหลัก), "Share Result" (ปุ่มรอง)

---

## 3. Scenario Mode (โหมดจำลองสถานการณ์)

ผู้ใช้สามารถเลือกโหมดทดสอบเฉพาะทางได้

- **Selection Grid:** การ์ดตัวเลือก (Gaming, Streaming, Meeting)
  - **Hover:** การ์ดลอยขึ้น (Translate Y -4px) และเปลี่ยนสีขอบ
  - **Selected:** มีขอบเรืองแสงสี Brand Primary
- **Execution:**
  - เมื่อกดเริ่ม จะแสดง UI ที่จำลองสถานการณ์นั้นๆ (เช่น หน้าจอ Video Call จำลอง) แทนที่จะเป็น Gauge ความเร็วปกติ
  - **Feedback:** ระบบจะแจ้งเตือน Real-time หากเกิดกระตุก (Lag) หรือภาพไม่ชัดในขณะนั้น

---

## 4. Notifications & Feedback (การแจ้งเตือน)

### 4.1 Toast Messages

แจ้งเตือนชั่วคราว (ลอยที่มุมขวาบน หรือ ด้านล่างกลาง)

- **Success:** ไอคอนถูกสีเขียว, ข้อความเช่น "บันทึกข้อมูลเรียบร้อย"
- **Error:** ไอคอนตกใจสีแดง, ข้อความเช่น "ไม่สามารถเชื่อมต่อ Server ได้"
- **Behavior:** หายไปเองใน 4 วินาที หรือปัดทิ้งได้

### 4.2 Modal / Dialog

ใช้สำหรับยืนยันการกระทำที่สำคัญ หรือต้องการข้อมูลเพิ่มเติม

- **Backdrop:** สีดำโปร่งแสง `Bg-Glass` พร้อม Blur
- **Animation:** Zoom in จากกลางหน้าจอ (Scale 0.9 -> 1.0, Opacity 0 -> 1)

---

## 5. Loading State (การโหลด)

### 5.1 Skeleton Screens

ใช้ขณะโหลดข้อมูลใน Dashboard หรือ History

- แสดงแท่งสีเทาอ่อน (`#1C1C2E`) กระพริบ (Pulse Animation) แทนที่ข้อความหรือรูปภาพ เพื่อลดความรู้สึกรอนาน

### 5.2 Progress Bar

ใช้เมื่อมีการโหลดที่ทราบเวลาชัดเจน (เช่น กำลังอัปโหลดไฟล์)

- **Style:** แถบสี Gradient (Cyan -> Violet) วิ่งเต็มความกว้าง

---

## 6. Mobile Responsiveness (การแสดงผลบนมือถือ)

- **Hamburger Menu:** บน Mobile เมนูจะถูกซ่อนใน Hamburger Icon
  - **Behavior:** เมื่อกด เมนูจะเลื่อนมาจากด้านข้าง (Slide-in drawer)
- **Card Layout:** เปลี่ยนจาก Grid แนวนอน (Desktop) เป็น Stack แนวตั้ง (Mobile)
- **Touch Areas:** ปุ่มและจุดสัมผัสต้องมีความสูงอย่างน้อย 44px เพื่อให้กดยู่นิ้วได้ง่าย
