# Design Tokens Specification

**Project:** Internet Quality Intelligence App
**Theme:** Modern, High-Performance, Cyber/Tech, Glassmorphism
**Base Mode:** Dark Mode Preferred

---

## 1. Color Palette

### 1.1 Brand Identity (Neon & Electric)

Used for primary actions, highlights, and health scores.

- **Brand Primary (Speed/Go):** `#00F0FF` (Electric Cyan)
  - _Usage:_ Primary Buttons, High Scores, Active States.
- **Brand Secondary (Stability/Flow):** `#7000FF` (Electric Violet)
  - _Usage:_ Gradients, Accents, Secondary Actions.
- **Brand Tertiary (Energy):** `#FF0055` (Neon Red)
  - _Usage:_ Ping spikes, Errors, Critical Alerts.

### 1.2 Health Indicators (Score Colors)

- **Excellent (90-100):** `#00FFA3` (Neon Green)
- **Good (70-89):** `#00F0FF` (Electric Cyan)
- **Fair (50-69):** `#FFD600` (Bright Yellow)
- **Poor (30-49):** `#FF7A00` (Neon Orange)
- **Critical (0-29):** `#FF0055` (Neon Red)

### 1.3 Functional Colors

- **Success:** `#00FFA3`
- **Warning:** `#FFD600`
- **Error:** `#FF0055`
- **Info:** `#2D9CDB`

### 1.4 Backgrounds (Dark Mode)

- **Bg-App:** `#0A0A0F` (Deep Space Black - slightly tinted blue)
- **Bg-Surface-1:** `#13131F` (Card Background)
- **Bg-Surface-2:** `#1C1C2E` (Modal/Popovers)
- **Bg-Glass:** `rgba(19, 19, 31, 0.7)` (Backdrop blur 20px)

### 1.5 Text Colors

- **Text-Primary:** `#FFFFFF` (100%)
- **Text-Secondary:** `#A0A0B0` (70%)
- **Text-Tertiary:** `#606070` (40%)
- **Text-Disabled:** `#303040` (20%)

---

## 2. Typography

**Font Family:** `Inter`, `Roboto`, or `Outfit` (Modern Sans-Serif)

### 2.1 Scale

| Token       | Size | Line Height | Weight         | Usage                      |
| :---------- | :--- | :---------- | :------------- | :------------------------- |
| **H1**      | 48px | 1.1         | Bold (700)     | Hero Numbers, Main Titles  |
| **H2**      | 32px | 1.2         | SemiBold (600) | Section Headers            |
| **H3**      | 24px | 1.3         | SemiBold (600) | Card Titles                |
| **H4**      | 20px | 1.4         | Medium (500)   | Subsections                |
| **Body-L**  | 18px | 1.5         | Regular (400)  | Lead Text                  |
| **Body-M**  | 16px | 1.5         | Regular (400)  | Default Text, Inputs       |
| **Body-S**  | 14px | 1.5         | Regular (400)  | Secondary Info, Labels     |
| **Caption** | 12px | 1.4         | Regular (400)  | Tooltips, Status           |
| **Mono**    | 14px | 1.4         | Regular (400)  | IP Addresses, Latency logs |

---

## 3. Spacing System (4px Grid)

| Token   | Value | Usage                                  |
| :------ | :---- | :------------------------------------- |
| **xxs** | 4px   | Tight grouping                         |
| **xs**  | 8px   | Icon spacing, tight list               |
| **sm**  | 12px  | Component internal padding             |
| **md**  | 16px  | Default padding, Card padding (mobile) |
| **lg**  | 24px  | Card padding (desktop), Section gap    |
| **xl**  | 32px  | Section spacing                        |
| **2xl** | 48px  | Large layout gaps                      |
| **3xl** | 64px  | Hero section spacing                   |

---

## 4. Borders & Radius

### 4.1 Radius

- **Radius-SM:** `4px` (Small buttons, tags)
- **Radius-MD:** `8px` (Cards, Inputs)
- **Radius-LG:** `16px` (Modals, Large Containers)
- **Radius-Full:** `9999px` (Pills, Round Buttons)

### 4.2 Borders

- **Border-Thin:** `1px solid rgba(255, 255, 255, 0.1)`
- **Border-Highlight:** `1px solid rgba(0, 240, 255, 0.3)`

---

## 5. Effects

### 5.1 Shadows (Glows in Dark Mode)

- **Shadow-SM:** `0 2px 4px rgba(0, 0, 0, 0.5)`
- **Shadow-MD:** `0 4px 12px rgba(0, 0, 0, 0.5)`
- **Glow-Primary:** `0 0 20px rgba(0, 240, 255, 0.4)`
- **Glow-Error:** `0 0 20px rgba(255, 0, 85, 0.4)`

### 5.2 Glassmorphism

- **Glass-Panel:**
  - Background: `rgba(19, 19, 31, 0.6)`
  - Backdrop-Filter: `blur(12px)`
  - Border: `1px solid rgba(255, 255, 255, 0.05)`

---

## 6. Layout & Breakpoints

| Breakpoint  | Width           | Device               |
| :---------- | :-------------- | :------------------- |
| **Mobile**  | < 640px         | Phones               |
| **Tablet**  | 640px - 1023px  | iPads, Small Tablets |
| **Laptop**  | 1024px - 1279px | Small Laptops        |
| **Desktop** | > 1280px        | Large Screens        |

- **Max-Width:** `1200px` (Container)
- **Grid-Columns:** 12 (Desktop), 4 (Mobile)
