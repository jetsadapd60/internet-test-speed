# System Architecture Specification

## Internet Quality Intelligence App

เอกสารนี้อธิบายสถาปัตยกรรมระบบเชิงเทคนิค (System Architecture Spec)
ครอบคลุม Backend, Edge Server และ Data Flow
เพื่อรองรับระบบทดสอบและวิเคราะห์คุณภาพอินเทอร์เน็ตระดับ production

------------------------------------------------------------------------

## 1. Architecture Overview

สถาปัตยกรรมระบบถูกออกแบบในลักษณะ **Cloud-native + Edge-based**
เพื่อให้ผลการทดสอบมีความแม่นยำและ latency ต่ำ

### High-level Components

-   Client Applications (Mobile / Web / Desktop)
-   Edge Test Server (Regional)
-   Core Backend Services
-   Data & Analytics Layer
-   External Integration

------------------------------------------------------------------------

## 2. Client Layer

### Supported Clients

-   Web App (Desktop / Mobile)
-   iOS / Android App(Phase ถัดไป)
-   Desktop App (Electron -- Phase ถัดไป)

### Responsibilities

-   Initiate test session
-   Execute network test (บางส่วน)
-   Collect raw metrics
-   Display result & insight

------------------------------------------------------------------------

## 3. Edge Server Architecture

### Purpose

-   ลด latency ระหว่างการทดสอบ
-   จำลอง traffic pattern ใกล้ผู้ใช้จริง

### Edge Server Components

-   Test Orchestrator
-   Speed Test Engine (TCP / UDP / QUIC)
-   QoE Simulation Engine
-   Regional Load Balancer

### Deployment Model

-   Multi-region (Asia / EU / US)
-   ใช้ Cloud Provider ใกล้ผู้ใช้มากที่สุด

------------------------------------------------------------------------

## 4. Backend Architecture

### Core Services

-   Auth & User Service
-   Test Session Service
-   Result Processing Service
-   Scoring & Insight Engine
-   Recommendation Engine
-   Admin / B2B API

### Architecture Pattern

-   Microservices
-   REST / gRPC
-   Event-driven (Async Processing)

------------------------------------------------------------------------

## 5. Data Layer

### Databases

-   Relational DB (User, Subscription)
-   Time-series DB (Network Metrics)
-   Object Storage (Raw Test Data)

### Data Policy

-   Anonymize IP
-   Encrypt at rest & in transit
-   Retention Policy ตามแผน Subscription

------------------------------------------------------------------------

## 6. Data Flow Specification

### 6.1 Speed Test Flow

1.  Client ขอเริ่ม Test Session
2.  Backend เลือก Edge Server ที่เหมาะสม
3.  Client ทดสอบกับ Edge Server
4.  Raw Metrics ส่งกลับ Backend
5.  Backend ประมวลผลและให้ Health Score

### 6.2 QoE Test Flow

1.  Client เลือก Scenario
2.  Edge Server จำลอง traffic pattern
3.  เก็บค่า latency / jitter / loss
4.  ส่งผลให้ Backend วิเคราะห์

### 6.3 History & Analytics Flow

1.  Backend บันทึกผลลง Time-series DB
2.  Aggregate เพื่อใช้แสดงผล
3.  Client ดึงข้อมูลย้อนหลัง

------------------------------------------------------------------------

## 7. Scalability & Performance

-   Auto-scaling Edge Server ตาม region
-   Horizontal scaling Backend services
-   Caching layer สำหรับ static insight

------------------------------------------------------------------------

## 8. Security Architecture

-   OAuth 2.0 / JWT
-   TLS ทุกการสื่อสาร
-   Rate limit ป้องกัน abuse
-   Monitoring & Alerting

------------------------------------------------------------------------

## 9. Observability

-   Centralized Logging
-   Metrics & Monitoring
-   Distributed Tracing

------------------------------------------------------------------------

## 10. Failure & Fallback Strategy

-   Edge server failover
-   Graceful degradation
-   Retry & timeout policy

------------------------------------------------------------------------

## 11. Future Extension

-   ISP Integration
-   Router SDK
-   AI-based Prediction Engine

------------------------------------------------------------------------

> เอกสารนี้ใช้เป็นฐานสำหรับทีม SA, DEV และ DevOps
> ในการออกแบบและพัฒนาระบบระดับ production
