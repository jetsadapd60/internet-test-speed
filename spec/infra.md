# Infrastructure Specification (ข้อกำหนดโครงสร้างพื้นฐาน)

**Project:** Internet Quality Intelligence App
**Language:** Thai (TH)
**Reference:** `system-architecture-spec.md`

เอกสารนี้ระบุรายละเอียดของ Infrastructure ที่ต้องจัดเตรียมเพื่อรองรับระบบ Production โดยเน้นความเสถียร (Stability), ความเร็ว (Speed), และความปลอดภัย (Security)

---

## 1. Cloud & Core Infrastructure

### 1.1 Cloud Providers

ระบบออกแบบมาให้รองรับ Multi-cloud / Hybrid Cloud:

- **Core Backend:** แนะนำ **AWS (Singapore Region)** หรือ **Google Cloud (Singapore/Bangkok)** เป็นหลัก
- **Edge Servers:** กระจายตาม Region เป้าหมาย (เช่น DigitalOcean, Vultr, หรือ Local IDC ในไทย) เพื่อให้ได้ Latency ที่ต่ำที่สุดสำหรับผู้ใช้ในพื้นที่นั้นๆ

### 1.2 Kubernetes Cluster (K8s)

ใช้ Container Orchestration ในการจัดการ Microservices:

- **Production Cluster:**
  - **Master Nodes:** 3 Nodes (High Availability)
  - **Worker Nodes:** Auto-scaling Group (min 2, max 10)
  - **Ingress Controller:** NGINX หรือ Istio สำหรับ Traffic Management
- **Staging Cluster:**
  - 1 Master, 2 Worker Nodes (ประหยัดค่าใช้จ่าย)

---

## 2. Server Specification

### 2.1 Edge Test Server (Speed Test Nodes)

เครื่องสำหรับรัน Speed Test Server ต้องใช้ Network Bandwidth สูง

- **CPU:** 4 vCPU (High Performance / Compute Optimized)
- **RAM:** 8 GB
- **Network Interface:** **10 Gbps (Mandatory)** หรือ 25 Gbps
- **OS:** User-space Networking Optimized Linux (เช่น DPDK support)
- **Disk:** NVMe SSD (สำหรับ Caching และ Log Buffer)

### 2.2 Backend API Services

- **CPU:** 2 vCPU
- **RAM:** 4 GB
- **Scaling:** Horizontal Scaling ตาม CPU Usage (> 70%)

---

## 3. Database & Storage

### 3.1 Relational Database (PostgreSQL)

ใช้เก็บข้อมูล User, Profile, Billing

- **Service:** Managed Database (AWS RDS / Cloud SQL)
- **Version:** PostgreSQL 15+
- **Config:**
  - Storage: 100 GB (Auto-growth)
  - Backup: Daily Snapshot + Point-in-time Recovery 7 วัน
  - High Availability: Multi-AZ

### 3.2 Time-Series Database (InfluxDB / TimescaleDB)

ใช้เก็บข้อมูล Network Metrics (Ping, Speed) ย้อนหลัง

- **Retention Policy:**
  - Raw Data: 30 วัน
  - Aggregated (1 hour): 1 ปี
  - Aggregated (1 day): 5 ปี
- **Disk:** High IOPS SSD

### 3.3 Object Storage (S3 / GCS)

- เก็บ Logs, Report CSV, รูปภาพ Profile
- ตั้งค่า Lifecycle policy ให้ Archive ข้อมูลเก่าเกิน 90 วันลง Cold Storage (Glacier)

### 3.4 Caching (Redis)

- เก็บ Session Token, Leaderboard caching, Real-time counting
- **Mode:** Cluster Mode enabled

---

## 4. Network & Security

### 4.1 Networking

- **VPC:** แยก Private Subnet (App/DB) และ Public Subnet (Load Balancer/Nat Gateway)
- **CDN:** Cloudflare หรือ CloudFront สำหรับ Static Assets (JS/CSS/Images)
- **DNS:** Route53 หรือ Cloudflare DNS

### 4.2 Security

- **Firewall (WAF):** ป้องกัน DDoS และ Common Web Exploits
- **SSL/TLS:** Certificate จาก Cloud Provider หรือ Let's Encrypt (Automated renewal)
- **Bastion Host / VPN:** สำหรับ Admin Access เข้าจัดการ Server

---

## 5. CI/CD Pipeline

### 5.1 Tools

- **Source Control:** GitHub / GitLab
- **CI Server:** GitHub Actions / GitLab CI
- **Registry:** Docker Hub / ECR / GCR

### 5.2 Workflow

1.  **Commit:** Developer push code เข้า branch `develop`
2.  **Test:** CI รัน Unit Test & Linting
3.  **Build:** สร้าง Docker Image และ Tag ด้วย Commit Hash
4.  **Scan:** สแกนหา Vulnerabilities ใน Image (Trivy)
5.  **Deploy (Staging):** Auto-deploy ไปยัง Staging Cluster
6.  **Release:** เมื่อ Merge เข้า `main` -> Deploy to Production (Manual Approval)

---

## 6. Monitoring & Observability

### 6.1 Logging

- **Centralized Logging:** ELK Stack (Elasticsearch, Logstash, Kibana) หรือ Grafana Loki
- เก็บ Logs จากทั้ง K8s Pods และ Edge Servers

### 6.2 Monitoring Dashboard (Grafana)

- **Dashboards:**
  - **System Health:** CPU, RAM, Disk, Network ของทุก Node
  - **Business Metrics:** จำนวน Active Users, Tests per Second, Average Speed
  - **Edge Latency:** แผนที่ Heatmap แสดง Latency ของแต่ละ Edge Server

### 6.3 Alerting

- แจ้งเตือนผ่าน Slack / Email / PagerDuty เมื่อ:
  - Error Rate > 1%
  - Server Down
  - Disk Space < 10%
