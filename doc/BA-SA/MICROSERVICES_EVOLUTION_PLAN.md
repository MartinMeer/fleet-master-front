# FleetMaster Pro — Microservices Evolution Plan

> **Version**: 1.0  
> **Date**: 2026-03-31  
> **Author**: Architecture Team  
> **Status**: Strategic Roadmap  
> **Audience**: Product Owner, Development Team, Backend Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Architecture Baseline](#2-current-architecture-baseline)
3. [Domain Decomposition](#3-domain-decomposition)
4. [Evolution Phases](#4-evolution-phases)
5. [Phase 0 — Modular Monolith (Current → 3 months)](#5-phase-0--modular-monolith)
6. [Phase 1 — Core Services (3–6 months)](#6-phase-1--core-services)
7. [Phase 2 — Extended Services (6–12 months)](#7-phase-2--extended-services)
8. [Phase 3 — Intelligence & Scale (12–24 months)](#8-phase-3--intelligence--scale)
9. [Phase 4 — Core Domain Decomposition (24–36 months)](#9-phase-4--core-domain-decomposition)
10. [Service Catalog (Target State)](#10-service-catalog-target-state)
11. [Inter-Service Communication](#11-inter-service-communication)
  - [Message Broker Decision: RabbitMQ vs Kafka](#message-broker-decision-rabbitmq-vs-apache-kafka)
12. [Data Strategy](#12-data-strategy)
13. [Infrastructure & DevOps](#13-infrastructure--devops)
14. [Extraction Decision Framework](#14-extraction-decision-framework)
15. [Risk Register](#15-risk-register)
16. [Migration Playbook](#16-migration-playbook)

---

## 1. Executive Summary

### Strategic Decision

FleetMaster Pro will follow a **"Monolith First, Extract Later"** evolution strategy — the approach recommended by Martin Fowler, Sam Newman (Building Microservices), and proven by Netflix, Amazon, and Shopify.

### Why Not Microservices Immediately


| Factor               | Our Reality              | Microservices Requirement          |
| -------------------- | ------------------------ | ---------------------------------- |
| Team size            | 1–3 developers           | 5+ per service (ideally)           |
| Domain knowledge     | Still evolving           | Stable, well-understood boundaries |
| User load            | 0 → early adopters       | Thousands+ concurrent              |
| Operational maturity | No CI/CD for backend yet | Full observability stack           |
| Budget               | Startup constraints      | Infrastructure + tooling cost      |


### The Plan in One Sentence

**Start with a well-structured modular monolith, extract Auth Service first, then selectively extract services as scaling, team, or deployment pressures demand it — culminating in full domain decomposition of the core fleet monolith when bounded context boundaries are proven and team capacity allows.**

### Mid-Term Target Architecture (18–24 months)

```
                        ┌─────────────┐
                        │   API       │
                        │   Gateway   │
                        │   (nginx)   │
                        └──────┬──────┘
               ┌───────────────┼───────────────┐
               ↓               ↓               ↓
        ┌─────────────┐ ┌───────────┐ ┌──────────────┐
        │ Auth Service│ │ Fleet     │ │ Notification │
        │ (Go)        │ │ Service   │ │ Service      │
        │             │ │ (Java)    │ │ (Go/Node)    │
        └─────────────┘ └───────────┘ └──────────────┘
               ↓               ↓               ↓
        ┌─────────────┐ ┌───────────┐ ┌──────────────┐
        │ Auth DB     │ │ Fleet DB  │ │ File Storage │
        │ (Postgres)  │ │ (Postgres)│ │ Service (S3) │
        └─────────────┘ └───────────┘ └──────────────┘
                               ↓
                        ┌─────────────┐
                        │ AI/Analytics│
                        │ Service     │
                        │ (Python)    │
                        └─────────────┘
```

### Full Vision Target Architecture (24–36 months)

```
                         ┌──────────────────┐
                         │   API Gateway /  │
                         │   BFF Layer      │
                         │   (nginx + comp.)│
                         └────────┬─────────┘
          ┌──────────┬───────────┼───────────┬──────────┐
          ↓          ↓           ↓           ↓          ↓
    ┌──────────┐┌──────────┐┌──────────┐┌────────┐┌─────────┐
    │  Auth    ││ Vehicle  ││  Maint.  ││ Repair ││ Finance │
    │  (Go)   ││  (Java)  ││  (Java)  ││ (Java) ││(Java/Go)│
    └────┬─────┘└────┬─────┘└────┬─────┘└───┬────┘└────┬────┘
         ↓          ↓           ↓           ↓          ↓
    ┌────────┐ ┌────────┐ ┌─────────┐ ┌────────┐ ┌────────┐
    │Auth DB │ │Vehic.DB│ │Maint. DB│ │Rep. DB │ │Fin. DB │
    └────────┘ └────────┘ └─────────┘ └────────┘ └────────┘

    ┌──────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────┐
    │  Files   │ │ Notification │ │  AI/ML   │ │  Event   │
    │  (Go)   │ │  (Go/Node)   │ │ (Python) │ │   Bus    │
    └────┬─────┘ └──────┬───────┘ └────┬─────┘ │(RMQ+Kfk)│
         ↓             ↓              ↓        └──────────┘
    ┌────────┐  ┌─────────────┐ ┌────────┐
    │  S3    │  │ Redis + MQ  │ │  ML DB │
    └────────┘  └─────────────┘ └────────┘
```

---

## 2. Current Architecture Baseline

### What Exists Today

```
Frontend (this repo):
├── apps/marketing-site/    → Auth UI (Login, Register, Landing)
├── apps/main-app/          → Business UI (Fleet, Maintenance, Alerts)
└── packages/shared/        → Shared assets

Backend (planned, not built):
├── Go Auth Service          → Designed, not implemented
└── Java Business Service    → Designed, not implemented

Infrastructure:
├── Docker Compose (dev/prod)
├── nginx gateway
├── GitHub Actions CI/CD
└── GitHub Pages deployment
```

### What's Already Decided (from existing docs)

- Frontend = thin client (presentation only)
- Auth Service separate from Business Service
- Go for Auth, Java Spring Boot for Business
- PostgreSQL for both databases
- JWT-based authentication
- RESTful API with OpenAPI contract
- localStorage demo mode for MVP (to be removed)

---

## 3. Domain Decomposition

### Bounded Contexts (Domain-Driven Design)

Based on the customer requirements and OpenAPI spec, FleetMaster has **6 bounded contexts**:

```
┌────────────────────────────────────────────────────────────────┐
│                    FleetMaster Pro Domain                       │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Identity   │  │   Vehicle    │  │   Maintenance        │ │
│  │   Context    │  │   Context    │  │   Context            │ │
│  │              │  │              │  │                      │ │
│  │  • Users     │  │  • Cars      │  │  • Periodic Sched.  │ │
│  │  • Auth      │  │  • Status    │  │  • Maintenance Plans │ │
│  │  • Roles     │  │  • Images    │  │  • Reglament Data   │ │
│  │  • Plans     │  │  • VIN Data  │  │  • PMG Operations   │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Repair     │  │   Finance    │  │   Intelligence       │ │
│  │   Context    │  │   Context    │  │   Context            │ │
│  │              │  │              │  │                      │ │
│  │  • Alerts    │  │  • Costs     │  │  • Predictive Maint. │ │
│  │  • Service   │  │  • Expenses  │  │  • Fleet Analytics   │ │
│  │    Records   │  │  • Insurance │  │  • Smart Alerts      │ │
│  │  • Providers │  │  • Reports   │  │  • Recommendations   │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Context Coupling Analysis

Understanding which contexts are tightly vs. loosely coupled determines extraction order:


| Context A    | Context B   | Coupling   | Reason                                                          |
| ------------ | ----------- | ---------- | --------------------------------------------------------------- |
| Vehicle      | Maintenance | **Tight**  | Maintenance is always about a specific car, shares mileage data |
| Vehicle      | Repair      | **Tight**  | Alerts/records reference car, affect car status                 |
| Maintenance  | Repair      | **Medium** | Plans link to service records, alerts feed into plans           |
| Finance      | Repair      | **Medium** | Service records contain costs                                   |
| Finance      | Maintenance | **Medium** | Plans have estimated costs                                      |
| Identity     | All others  | **Loose**  | Only provides userId, no domain data dependency                 |
| Intelligence | All others  | **Loose**  | Reads data, produces insights — no writes to core domain        |


### Extraction Priority (based on coupling)

```
Easiest to extract (loose coupling) — Phases 1–2:
  1. Identity (Auth)        ← Already planned (Phase 1)
  2. Intelligence (AI/ML)   ← Different runtime, read-only (Phase 3)
  3. Notifications           ← Fire-and-forget, async (Phase 2)

Hardest to extract (tight coupling) — Phase 4, after decoupling via events:
  4. Finance                ← Decouple from records via cost events
  5. Maintenance            ← Decouple from Vehicle via car-state events
  6. Vehicle + Repair       ← Core domain, extract when team/scale demand it
```

---

## 4. Evolution Phases

### Visual Roadmap

```
Phase 0           Phase 1           Phase 2           Phase 3           Phase 4
(NOW → 3 mo)     (3–6 mo)         (6–12 mo)        (12–24 mo)        (24–36 mo)
─────────────     ─────────         ──────────        ──────────        ──────────

┌───────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Modular   │  +  │ Auth     │  +  │ File     │  +  │ AI/ML    │  +  │ Vehicle  │
│ Monolith  │     │ Service  │     │ Service  │     │ Service  │     │ Maint.   │
│ (Java)    │     │ (Go)     │     │ (S3)     │     │ (Python) │     │ Repair   │
│           │     │          │     │          │     │          │     │ Finance  │
│ All biz   │     │ Users    │     │ Images   │     │ Predict  │     │ Services │
│ logic     │     │ JWT      │     │ PDFs     │     │ Analyze  │     │ (from    │
│ here      │     │ Roles    │     │ Exports  │     │ Recommend│     │ monolith)│
└───────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘

1 service         2 services        3 services        4–5 services      8–9 services
1 database        2 databases       3 storages        + event bus       full MSA

Team: 1–2         Team: 2–3         Team: 3–4         Team: 4+          Team: 6+
Users: 0–50       Users: 50–500     Users: 500–5K     Users: 5K+        Users: 10K+
```

---

## 5. Phase 0 — Modular Monolith

> **Timeline**: Now → 3 months  
> **Goal**: Build the Java backend as a single deployable with clean internal boundaries  
> **Trigger to start**: Immediately

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    API Gateway (nginx)                     │
│                    Port 80/443                             │
└────────────────────────┬─────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│              Java Spring Boot Monolith                     │
│              Port 8080                                     │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                  Security Layer                       │  │
│  │  JWT validation · CORS · Rate limiting               │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌────────────┐  │
│  │ car      │ │ alert    │ │ maint.    │ │ service    │  │
│  │ module   │ │ module   │ │ module    │ │ record     │  │
│  │          │ │          │ │           │ │ module     │  │
│  │ Control. │ │ Control. │ │ Control.  │ │ Control.   │  │
│  │ Service  │ │ Service  │ │ Service   │ │ Service    │  │
│  │ Repo     │ │ Repo     │ │ Repo      │ │ Repo       │  │
│  │ Model    │ │ Model    │ │ Model     │ │ Model      │  │
│  └──────────┘ └──────────┘ └───────────┘ └────────────┘  │
│                                                            │
│  ┌──────────┐ ┌──────────────────────────────────────┐    │
│  │ stats    │ │          shared                       │    │
│  │ module   │ │  Security config · DTOs · Exceptions  │    │
│  │          │ │  Base entities · Audit · Pagination    │    │
│  └──────────┘ └──────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│              PostgreSQL (single instance)                  │
│              All tables, schema-per-module ownership       │
└──────────────────────────────────────────────────────────┘
```

### Java Package Structure

```
com.fleetmaster.api/
├── FleetMasterApplication.java
│
├── shared/
│   ├── config/
│   │   ├── SecurityConfig.java          # JWT filter, CORS
│   │   ├── WebConfig.java               # General web config
│   │   └── OpenApiConfig.java           # Swagger/OpenAPI
│   ├── security/
│   │   ├── JwtTokenProvider.java        # Token validation
│   │   └── JwtAuthenticationFilter.java # Request filter
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   ├── ResourceNotFoundException.java
│   │   └── ValidationException.java
│   ├── dto/
│   │   ├── SuccessResponse.java
│   │   ├── ErrorResponse.java
│   │   └── PaginationResponse.java
│   └── audit/
│       └── BaseEntity.java              # createdAt, updatedAt
│
├── car/                                 # --- CAR MODULE ---
│   ├── CarController.java
│   ├── CarService.java                  # Interface
│   ├── CarServiceImpl.java
│   ├── CarRepository.java
│   ├── Car.java                         # Entity
│   ├── dto/
│   │   ├── CarCreateRequest.java
│   │   ├── CarUpdateRequest.java
│   │   └── CarResponse.java
│   └── package-info.java               # Module documentation
│
├── alert/                               # --- ALERT MODULE ---
│   ├── AlertController.java
│   ├── AlertService.java
│   ├── AlertServiceImpl.java
│   ├── AlertRepository.java
│   ├── Alert.java
│   ├── dto/
│   │   ├── AlertCreateRequest.java
│   │   ├── AlertUpdateRequest.java
│   │   └── AlertStatsResponse.java
│   └── package-info.java
│
├── maintenance/                         # --- MAINTENANCE MODULE ---
│   ├── MaintenanceController.java
│   ├── MaintenancePlanController.java
│   ├── MaintenanceService.java
│   ├── MaintenancePlanService.java
│   ├── MaintenanceRepository.java
│   ├── MaintenancePlanRepository.java
│   ├── MaintenanceEntry.java
│   ├── MaintenancePlan.java
│   ├── MaintenanceOperation.java
│   ├── dto/
│   │   ├── MaintenancePlanCreateRequest.java
│   │   └── MaintenancePlanUpdateRequest.java
│   └── package-info.java
│
├── servicerecord/                       # --- SERVICE RECORD MODULE ---
│   ├── ServiceRecordController.java
│   ├── ServiceRecordService.java
│   ├── ServiceRecordRepository.java
│   ├── ServiceRecord.java
│   ├── ServiceOperation.java
│   ├── dto/
│   │   ├── ServiceRecordCreateRequest.java
│   │   └── ServiceRecordStatsResponse.java
│   └── package-info.java
│
└── statistics/                          # --- STATISTICS MODULE ---
    ├── StatisticsController.java
    ├── StatisticsService.java           # Aggregates from other modules
    └── dto/
        ├── FleetOverviewResponse.java
        └── CostAnalysisResponse.java
```

### Module Boundary Rules

These rules ensure clean boundaries NOW so extraction is easy LATER:

1. **No cross-module entity imports** — modules reference each other by ID only (`carId: String`), never by entity class
2. **Inter-module calls go through service interfaces** — `CarService`, not `CarRepository` directly
3. **Each module owns its database tables** — no shared tables between modules
4. **DTOs at module boundaries** — modules expose DTOs, not entities
5. **No circular dependencies** — dependency direction: `statistics → [car, alert, maintenance, servicerecord]`, never backwards

### Deliverables

- Spring Boot project with module structure
- JWT validation filter (validates tokens from future Go Auth Service)
- Full CRUD for all 5 resource groups (matching OpenAPI spec)
- userId-scoped queries on every endpoint
- PostgreSQL schema with proper indexes
- Docker image with health checks
- Integration with existing docker-compose infrastructure

### Auth in Phase 0 (Temporary)

Until the Go Auth Service is built, the monolith can handle basic auth:

```java
// Temporary auth endpoint in monolith — will be removed in Phase 1
@RestController
@RequestMapping("/auth")
public class TemporaryAuthController {
    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest req) {
        // Simple validation + JWT generation
        // This entire class gets deleted when Go Auth Service is ready
    }
}
```

---

## 6. Phase 1 — Core Services

> **Timeline**: 3–6 months  
> **Goal**: Extract Auth Service into standalone Go service  
> **Trigger**: Backend team grows to 2+ people OR need for multi-app auth

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    API Gateway (nginx)                     │
│                                                            │
│   /auth/*  → Go Auth Service (port 3000)                  │
│   /api/*   → Java Fleet Service (port 8080)               │
└────────────────────────┬─────────────────────────────────┘
              ┌──────────┴──────────┐
              ↓                     ↓
┌──────────────────┐    ┌────────────────────────────────┐
│  Go Auth Service │    │  Java Fleet Service            │
│  Port 3000       │    │  Port 8080                     │
│                  │    │  (same monolith from Phase 0,  │
│  POST /login     │    │   minus temp auth controller)  │
│  POST /register  │    │                                │
│  POST /logout    │    │  Car + Alert + Maintenance +   │
│  POST /validate  │    │  ServiceRecord + Statistics    │
│  GET  /profile   │    │                                │
└────────┬─────────┘    └────────────────┬───────────────┘
         ↓                               ↓
┌──────────────────┐    ┌────────────────────────────────┐
│  Auth DB         │    │  Fleet DB                      │
│  (PostgreSQL)    │    │  (PostgreSQL)                  │
│                  │    │                                │
│  users           │    │  cars, alerts,                 │
│  refresh_tokens  │    │  maintenance_plans,            │
│                  │    │  service_records               │
└──────────────────┘    └────────────────────────────────┘
```

### Go Auth Service Specification

```
Service: fleetmaster-auth
Language: Go 1.22+
Framework: Gin / Chi / stdlib
Database: PostgreSQL 15+
Port: 3000

Endpoints:
  POST /auth/register     → Create user account
  POST /auth/login        → Authenticate, return JWT + refresh token
  POST /auth/logout       → Invalidate refresh token
  POST /auth/validate     → Validate JWT, return user profile
  POST /auth/refresh      → Exchange refresh token for new JWT
  GET  /auth/profile      → Get current user profile
  PUT  /auth/profile      → Update user profile

JWT Claims:
  {
    "sub": "<user-uuid>",
    "email": "<email>",
    "name": "<display-name>",
    "plan": "starter|pro|enterprise",
    "iat": <issued-at>,
    "exp": <expiration>
  }

Security:
  - bcrypt password hashing (cost 12)
  - JWT signing with RS256 (asymmetric) — public key shared with Java service
  - Refresh tokens stored in DB with expiration
  - Rate limiting: 5 login attempts per minute per IP
```

### Migration Steps: Monolith → Auth + Fleet

1. **Deploy Go Auth Service** alongside existing monolith
2. **Update nginx** to route `/auth/`* to Go service
3. **Share JWT signing keys** between Go (generates) and Java (validates)
4. **Delete TemporaryAuthController** from Java monolith
5. **Update frontend** `AuthService.ts` to point to new auth URL
6. **Migrate user data** from monolith DB to auth DB
7. **Run both in parallel** for 1–2 weeks, validate
8. **Cut over** completely

### Deliverables

- Go Auth Service with all endpoints
- Auth PostgreSQL schema and migrations
- RS256 JWT key pair generation and distribution
- Updated nginx routing config
- Updated docker-compose with auth service
- Health check endpoint (`GET /health`)
- Prometheus metrics endpoint (`GET /metrics`)
- Frontend auth URL configuration update

---

## 7. Phase 2 — Extended Services

> **Timeline**: 6–12 months  
> **Goal**: Extract File Service and Notification Service  
> **Trigger**: Image uploads cause storage issues OR notification channels multiply

### 7a. File Storage Service

**When to extract**: Car image uploads start consuming significant disk space, or you need CDN integration, or PDF export becomes heavy.

```
Service: fleetmaster-files
Language: Go or Node.js
Storage: S3-compatible (AWS S3, MinIO for dev)
Port: 3002

Endpoints:
  POST   /files/upload          → Upload image/PDF, return URL
  GET    /files/{id}            → Retrieve file metadata
  DELETE /files/{id}            → Delete file
  GET    /files/{id}/download   → Redirect to CDN/presigned URL
  POST   /files/pdf/export      → Generate PDF from maintenance plan

Integration:
  - Java Fleet Service stores file URLs (not binary data)
  - File service handles resizing, thumbnails, CDN invalidation
  - PDF generation uses template engine (e.g., Gotenberg, Puppeteer)
```

### 7b. Notification Service

**When to extract**: You add email notifications, push notifications, or SMS reminders for upcoming maintenance.

```
Service: fleetmaster-notifications
Language: Go or Node.js
Port: 3003

Responsibilities:
  - Email notifications (upcoming maintenance, overdue alerts)
  - Push notifications (mobile PWA)
  - In-app notification center
  - Notification preferences per user

Communication:
  - Consumes events from Fleet Service via message queue
  - Does NOT call Fleet Service API directly
  - Uses event-driven (async) pattern

Events consumed:
  - maintenance.due_soon          → Send reminder email
  - alert.created (critical)     → Send push notification
  - service_record.created        → Send confirmation email
  - maintenance_plan.overdue      → Send escalation email

Tech:
  - RabbitMQ or Redis Streams for event bus
  - SendGrid / AWS SES for email
  - Web Push API for browser notifications
```

### Architecture at End of Phase 2

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway (nginx)                       │
│  /auth/*    → Auth Service                                      │
│  /api/*     → Fleet Service                                     │
│  /files/*   → File Service                                      │
└──────────┬──────────┬──────────┬──────────┬────────────────────┘
           ↓          ↓          ↓          ↓
     ┌──────────┐ ┌────────┐ ┌────────┐ ┌──────────────┐
     │  Auth    │ │ Fleet  │ │ Files  │ │ Notification │
     │  (Go)   │ │ (Java) │ │ (Go)   │ │ (Go/Node)    │
     └────┬─────┘ └───┬────┘ └───┬────┘ └───────┬──────┘
          ↓           ↓          ↓               ↓
     ┌────────┐  ┌────────┐  ┌────────┐  ┌─────────────┐
     │Auth DB │  │Fleet DB│  │  S3    │  │ Message     │
     └────────┘  └────────┘  │Bucket  │  │ Queue       │
                              └────────┘  └─────────────┘
```

---

## 8. Phase 3 — Intelligence & Scale

> **Timeline**: 12–24 months  
> **Goal**: Add AI/ML capabilities and scale for enterprise customersы  
> **Trigger**: 500+ active users, enterprise customer requests, AI features on roadmap

### 8a. AI/Analytics Service

```
Service: fleetmaster-intelligence
Language: Python 3.11+
Framework: FastAPI
ML: scikit-learn, TensorFlow Lite, or cloud ML APIs
Port: 5000

Capabilities:
  1. Predictive Maintenance
     - Input: car model, mileage, service history, climate data
     - Output: predicted next failure, confidence score, recommended action
     
  2. Cost Optimization
     - Input: service records, parts costs, provider history
     - Output: cost trends, savings recommendations, provider ratings
     
  3. Fleet Health Score
     - Input: all cars' current state, alerts, maintenance compliance
     - Output: fleet health score (0-100), risk breakdown
     
  4. Smart Alert Triage
     - Input: new alert description, car history
     - Output: auto-priority assignment, similar past issues, recommended fix

Endpoints:
  GET  /ai/predict/{carId}           → Predictive maintenance for car
  GET  /ai/fleet-health              → Fleet health score
  POST /ai/triage-alert              → Auto-classify alert
  GET  /ai/cost-optimization/{carId} → Cost recommendations
  GET  /ai/analytics/dashboard       → Executive analytics data

Data Pipeline:
  - Reads from Fleet DB (read replica) — never writes to it
  - Maintains own analytics DB for ML features, aggregations
  - Batch processing nightly for model retraining
  - Real-time scoring via pre-trained models
```

### 8b. Finance Module Extraction (Conditional)

**Extract only if**: Enterprise customers require audit trails, compliance reporting, or billing integration.

```
Service: fleetmaster-finance
Language: Java (Spring Boot) or Go
Port: 8081

Responsibilities:
  - Cost tracking and categorization
  - Budget management per car / fleet
  - Insurance tracking and reminders
  - Financial reports and exports
  - Billing integration (Stripe/payment gateway)
  - Audit trail (immutable event log)

Extraction criteria:
  ✓ Enterprise tier requires separate financial compliance
  ✓ Finance calculations become complex (depreciation, TCO)
  ✓ Need for separate audit/compliance database
  ✓ Payment processing requires PCI DSS isolation
```

### 8c. Phase 3 Target Architecture

```
                    ┌─────────────────────────┐
                    │      Load Balancer      │
                    │      (nginx / ALB)      │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │      API Gateway        │
                    │   Routing · Rate Limit  │
                    │   Auth Token Validation │
                    └────────────┬────────────┘
          ┌──────────┬──────────┼──────────┬──────────┐
          ↓          ↓          ↓          ↓          ↓
    ┌──────────┐┌────────┐┌────────┐┌──────────┐┌─────────┐
    │  Auth   ││ Fleet  ││ Files  ││  Notif.  ││  AI/ML  │
    │  Service││ Service││ Service││  Service ││ Service │
    │  (Go)   ││ (Java) ││ (Go)   ││(Go/Node) ││(Python) │
    └────┬─────┘└───┬────┘└───┬────┘└────┬─────┘└────┬────┘
         │          │         │          │           │
         ↓          ↓         ↓          ↓           ↓
    ┌────────┐ ┌────────┐ ┌──────┐ ┌─────────┐ ┌────────┐
    │Auth DB │ │Fleet DB│ │ S3   │ │  Redis  │ │  ML DB │
    │Postgres│ │Postgres│ │Bucket│ │  + MQ   │ │Postgres│
    └────────┘ └────────┘ └──────┘ └─────────┘ └────────┘

    Observability Stack:
    ┌──────────────────────────────────────────────────────┐
    │  Prometheus · Grafana · Jaeger · ELK/Loki            │
    └──────────────────────────────────────────────────────┘
```

> **Note**: The Fleet Service monolith persists through Phase 3. For the full domain-decomposed architecture, see **Section 9 — Phase 4**.

---

## 9. Phase 4 — Core Domain Decomposition

> **Timeline**: 24–36 months  
> **Goal**: Decompose the Fleet monolith along bounded context boundaries (Section 3) into independent domain services  
> **Trigger**: Team grows to 6+ developers AND at least one category of the Extraction Decision Framework (Section 14) is fully satisfied for a core module

### Why This Phase Exists

Phases 0–3 deliberately keep Vehicle, Maintenance, Repair, and Finance inside a single Fleet Service because of their tight coupling. Phase 4 addresses the strategic question: **what happens when the monolith becomes the bottleneck?**

Concrete triggers for Phase 4:


| #   | Trigger                      | Signal                                                                                       |
| --- | ---------------------------- | -------------------------------------------------------------------------------------------- |
| T1  | **Team contention**          | 3+ sub-teams wait on each other's PRs in the Fleet repo; deploy queue exceeds 2 days         |
| T2  | **Independent scaling**      | Vehicle reads are 10x Maintenance writes; single JVM cannot serve both efficiently           |
| T3  | **Release cadence mismatch** | Finance needs weekly compliance releases while Vehicle is on bi-weekly feature cycles        |
| T4  | **Fault isolation**          | A bug in Repair alert processing takes down the entire Fleet Service including Vehicle reads |
| T5  | **Enterprise multi-tenancy** | Large customers require isolated Maintenance or Finance data planes for compliance           |


### Pre-Phase 4 Preparation (During Phase 3)

Before any extraction begins, the Fleet monolith must be **decoupling-ready**:

1. **All cross-module calls go through interfaces** — verified by ArchUnit tests
2. **Domain events published internally** — Spring `ApplicationEventPublisher` already emitting events even within the monolith
3. **No cross-module JOINs** — each module queries its own tables; cross-module data fetched via service calls
4. **Module-level integration tests** — each module has tests that run independently with its own schema
5. **Metrics per module** — Prometheus metrics tagged by module (`fleetmaster_vehicle_`*, `fleetmaster_maintenance_*`)

### 9a. Decoupling Strategy

The tight coupling identified in Section 3 is resolved via **data duplication + domain events**:

```
BEFORE (Phase 0–3): Synchronous, shared-DB coupling
─────────────────────────────────────────────────────
Maintenance Module                Vehicle Module
    │                                  │
    └── maintenanceRepo                │
           .findByCarId(carId)         │
           ↓                           │
        ┌──────────────────────────────────┐
        │         Single Fleet DB          │
        │  cars ←─── JOIN ───→ maint_plans │
        └──────────────────────────────────┘


AFTER (Phase 4): Event-driven, own-DB, eventual consistency
─────────────────────────────────────────────────────
Maintenance Service              Vehicle Service
    │                                  │
    │  Stores local projection:        │  Publishes:
    │  car_snapshot {carId,            │  car.created
    │    brand, model, mileage}        │  car.mileage_updated
    │                                  │  car.status_changed
    │  ←──── subscribes ─── Event Bus ─┘  car.deleted
    │
    └── maintenanceRepo
           .findByCarId(carId)
           ↓
        ┌───────────────────┐
        │  Maintenance DB   │
        │  maint_plans      │
        │  car_snapshots    │  ← denormalized projection
        └───────────────────┘
```

**Key pattern**: Each service stores a **minimal read projection** of data it needs from other domains. Events keep projections eventually consistent (~100ms lag under normal load).

### 9b. Extraction Order

Based on coupling analysis and business value, the Fleet monolith is decomposed in sub-phases:

```
Phase 4a (month 24–27):  Extract Finance Service
                          └─ Lowest inbound coupling of the four
                          └─ Strongest compliance/isolation driver
                          └─ Consumes cost events, no writes to other domains

Phase 4b (month 27–30):  Extract Vehicle Service
                          └─ Root entity (Car) becomes the authoritative source
                          └─ Publishes car-state events consumed by all others
                          └─ Highest read volume — benefits from independent scaling

Phase 4c (month 30–33):  Extract Maintenance Service
                          └─ Subscribes to car-state events
                          └─ Publishes maintenance.overdue, maintenance.due_soon
                          └─ Owns periodic scheduling engine

Phase 4d (month 33–36):  Extract Repair Service (alerts + service records)
                          └─ Last to extract — tightest coupling to Vehicle
                          └─ Subscribes to car-state and maintenance events
                          └─ Publishes alert and service_record events
```

### 9c. Service Specifications (Phase 4)

#### Vehicle Service

```
Service: fleetmaster-vehicle
Language: Java 17+ (Spring Boot)
Port: 8080 (takes over the original Fleet Service port)
Database: PostgreSQL (vehicle_db)

Tables owned:
  cars, car_images, car_vin_data, car_status_history

Endpoints (migrated from Fleet Service):
  GET    /api/cars                → List user's cars
  POST   /api/cars                → Add car
  GET    /api/cars/{id}           → Get car details
  PUT    /api/cars/{id}           → Update car
  DELETE /api/cars/{id}           → Delete car (publishes car.deleted)
  PATCH  /api/cars/{id}/mileage   → Update mileage (publishes car.mileage_updated)
  GET    /api/cars/{id}/timeline  → Car event timeline (API composition)

Events published:
  car.created, car.updated, car.deleted
  car.mileage_updated, car.status_changed
```

#### Maintenance Service

```
Service: fleetmaster-maintenance
Language: Java 17+ (Spring Boot)
Port: 8082
Database: PostgreSQL (maintenance_db)

Tables owned:
  maintenance_entries, maintenance_plans, maintenance_operations
  car_snapshots (projection: id, brand, model, year, current_mileage)

Endpoints (migrated from Fleet Service):
  GET    /api/cars/{carId}/maintenance       → List maintenance entries
  POST   /api/cars/{carId}/maintenance       → Create entry
  GET    /api/maintenance-plans              → List plans
  POST   /api/maintenance-plans              → Create plan
  PUT    /api/maintenance-plans/{id}         → Update plan
  GET    /api/maintenance-plans/{id}/check   → Check overdue status

Events published:
  maintenance.plan_created, maintenance.overdue, maintenance.due_soon

Events consumed:
  car.created        → Create car_snapshot
  car.mileage_updated → Update snapshot, recalculate due dates
  car.deleted        → Soft-delete related plans and entries
```

#### Repair Service

```
Service: fleetmaster-repair
Language: Java 17+ (Spring Boot)
Port: 8083
Database: PostgreSQL (repair_db)

Tables owned:
  alerts, service_records, service_operations, service_providers
  car_snapshots (projection: id, brand, model, year, current_mileage)

Endpoints (migrated from Fleet Service):
  GET    /api/cars/{carId}/alerts             → List alerts
  POST   /api/cars/{carId}/alerts             → Create alert
  PUT    /api/alerts/{id}                     → Update alert
  GET    /api/alerts/stats                    → Alert statistics
  GET    /api/cars/{carId}/service-records     → List service records
  POST   /api/cars/{carId}/service-records     → Create record
  GET    /api/service-records/{id}             → Get record details

Events published:
  alert.created, alert.resolved
  service_record.created, service_record.updated

Events consumed:
  car.created           → Create car_snapshot
  car.mileage_updated   → Update snapshot
  car.deleted           → Soft-delete related alerts and records
  maintenance.overdue   → Auto-create alert (priority: medium)
```

#### Finance Service (Promoted from Conditional)

```
Service: fleetmaster-finance
Language: Java 17+ (Spring Boot) or Go
Port: 8081
Database: PostgreSQL (finance_db)

Tables owned:
  expenses, cost_categories, insurance_records, budgets
  financial_reports, audit_trail (immutable append-only)

Endpoints:
  GET    /api/cars/{carId}/costs              → Cost history for car
  GET    /api/finance/summary                 → Fleet-wide cost summary
  GET    /api/finance/reports                 → Generate financial report
  POST   /api/finance/budgets                 → Set budget
  GET    /api/finance/insurance               → Insurance tracking

Events consumed:
  service_record.created  → Extract cost data, categorize
  maintenance.plan_created → Extract estimated costs
  car.created             → Initialize cost tracking
  car.deleted             → Finalize cost report, archive

No events published (read-heavy, reporting-oriented service).
```

### 9d. API Composition Layer

With the core domain split across services, **cross-domain queries** (e.g., "show me everything about car X") require an API composition strategy:

```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (nginx)                       │
│                                                               │
│  Simple routing:                                              │
│    /auth/*              → Auth Service                       │
│    /api/cars/*          → Vehicle Service                    │
│    /api/maintenance-*   → Maintenance Service                │
│    /api/alerts/*        → Repair Service                     │
│    /api/service-records → Repair Service                     │
│    /api/finance/*       → Finance Service                    │
│    /files/*             → File Service                       │
│    /ai/*                → AI/Analytics Service               │
│                                                               │
│  Composite endpoints (BFF pattern):                           │
│    /api/cars/{id}/dashboard  → BFF aggregates from all       │
│    /api/fleet/overview       → BFF aggregates from all       │
│    /api/statistics/*         → BFF aggregates from all       │
└─────────────────────────────────────────────────────────────┘
          │
          ↓  (composite routes only)
┌─────────────────────────────────────────────────────────────┐
│                  BFF Service (Backend-for-Frontend)           │
│                  Language: Go or Node.js                      │
│                  Port: 8090                                   │
│                                                               │
│  GET /api/cars/{id}/dashboard:                                │
│    parallel {                                                 │
│      vehicle  = GET Vehicle Service /api/cars/{id}           │
│      alerts   = GET Repair Service /api/cars/{id}/alerts     │
│      maint    = GET Maint. Service /api/cars/{id}/maintenance│
│      costs    = GET Finance Service /api/cars/{id}/costs     │
│    }                                                          │
│    return merge(vehicle, alerts, maint, costs)               │
│                                                               │
│  GET /api/fleet/overview:                                     │
│    parallel {                                                 │
│      cars     = GET Vehicle Service /api/cars                │
│      alertSum = GET Repair Service /api/alerts/stats         │
│      costSum  = GET Finance Service /api/finance/summary     │
│    }                                                          │
│    return merge(cars, alertSum, costSum)                      │
└─────────────────────────────────────────────────────────────┘
```

### 9e. Data Consistency in Phase 4


| Scenario                                              | Pattern                   | Implementation                                                                         |
| ----------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------- |
| Car deleted → cascade to Maintenance, Repair, Finance | **Choreography (events)** | Vehicle publishes `car.deleted`; each service reacts independently with soft-delete    |
| Service record created → Finance needs cost           | **Choreography (events)** | Repair publishes `service_record.created` with cost data embedded                      |
| Create car + first maintenance plan atomically        | **Saga (orchestrated)**   | BFF orchestrates: create car → on success → create default plan; compensate on failure |
| Dashboard needs data from 4 services                  | **API Composition**       | BFF fetches in parallel, merges, tolerates partial failures with fallbacks             |
| Mileage update triggers maintenance recalculation     | **Choreography (events)** | Vehicle publishes `car.mileage_updated`; Maintenance recalculates asynchronously       |


**Consistency guarantee**: Eventual consistency with a target propagation lag of <500ms. For operations requiring stronger guarantees (e.g., car creation + default plan), use orchestrated sagas with compensating transactions.

### 9f. Phase 4 Architecture

```
                         ┌──────────────────┐
                         │  Load Balancer   │
                         └────────┬─────────┘
                                  │
                         ┌────────┴─────────┐
                         │   API Gateway    │
                         │   (nginx)        │
                         └────────┬─────────┘
        ┌─────────┬──────────┬────┴────┬──────────┬─────────┐
        ↓         ↓          ↓        ↓          ↓         ↓
  ┌──────────┐┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐
  │  Auth   ││Vehicle ││ Maint. ││ Repair ││Finance ││  BFF   │
  │  (Go)   ││ (Java) ││ (Java) ││ (Java) ││(Java)  ││(Go/Nod)│
  └────┬─────┘└───┬────┘└───┬────┘└───┬────┘└───┬────┘└────────┘
       ↓         ↓         ↓         ↓         ↓
  ┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐
  │Auth DB ││Veh. DB ││Main. DB││Rep. DB ││Fin. DB │
  └────────┘└────────┘└────────┘└────────┘└────────┘

  ┌──────────┐ ┌──────────────┐ ┌──────────┐
  │  Files   │ │ Notification │ │  AI/ML   │
  │  (Go)   │ │  (Go/Node)   │ │ (Python) │
  └────┬─────┘ └──────┬───────┘ └────┬─────┘
       ↓             ↓              ↓
  ┌────────┐  ┌─────────────┐ ┌────────┐
  │  S3    │  │ Redis + MQ  │ │  ML DB │
  └────────┘  └─────────────┘ └────────┘

  ┌──────────────────────────────────────────────────┐
  │               Event Bus (Kafka + RabbitMQ)        │
  │                                                    │
  │  Kafka topics (domain events, replay-capable):    │
  │    fleet.vehicle.events                            │
  │    fleet.maintenance.events                        │
  │    fleet.repair.events                             │
  │                                                    │
  │  RabbitMQ (notification delivery, unchanged):     │
  │    fleetmaster.events exchange → notify queues    │
  └──────────────────────────────────────────────────┘
```

### Deliverables

- BFF Service with composite endpoints for dashboard and fleet overview
- Vehicle Service extracted with car-state event publishing
- Maintenance Service extracted with car_snapshot projections
- Repair Service extracted with car_snapshot projections
- Finance Service extracted with immutable audit trail
- Kafka topics for domain events (vehicle, maintenance, repair)
- Updated API Gateway routing for all domain services
- Saga orchestration for cross-service write operations
- Per-service database migration scripts
- End-to-end integration test suite covering cross-service flows
- Updated Grafana dashboards with per-service panels
- Runbook for each new service

---

## 10. Service Catalog (Target State)


| #   | Service                  | Language              | Port   | DB                          | Owner            | Phase               |
| --- | ------------------------ | --------------------- | ------ | --------------------------- | ---------------- | ------------------- |
| 1   | **API Gateway**          | nginx                 | 80/443 | —                           | Platform         | 0                   |
| 2   | **Fleet Service**        | Java 17 / Spring Boot | 8080   | PostgreSQL                  | Backend Team     | 0 (decomposed in 4) |
| 3   | **Auth Service**         | Go 1.22               | 3000   | PostgreSQL                  | Backend Team     | 1                   |
| 4   | **File Service**         | Go / Node.js          | 3002   | S3                          | Backend Team     | 2                   |
| 5   | **Notification Service** | Go / Node.js          | 3003   | Redis + MQ                  | Backend Team     | 2                   |
| 6   | **AI/Analytics Service** | Python 3.11 / FastAPI | 5000   | PostgreSQL (read replica)   | ML Team          | 3                   |
| 7   | **Vehicle Service**      | Java 17 / Spring Boot | 8080   | PostgreSQL (vehicle_db)     | Vehicle Team     | 4a                  |
| 8   | **Maintenance Service**  | Java 17 / Spring Boot | 8082   | PostgreSQL (maintenance_db) | Maintenance Team | 4c                  |
| 9   | **Repair Service**       | Java 17 / Spring Boot | 8083   | PostgreSQL (repair_db)      | Repair Team      | 4d                  |
| 10  | **Finance Service**      | Java / Go             | 8081   | PostgreSQL (finance_db)     | Finance Team     | 4a                  |
| 11  | **BFF Service**          | Go / Node.js          | 8090   | — (stateless)               | Platform         | 4b                  |


### Service SLAs


| Service       | Availability Target | Max Latency (p99) | Recovery Time |
| ------------- | ------------------- | ----------------- | ------------- |
| Auth          | 99.9%               | 200ms             | 5 min         |
| Fleet         | 99.5%               | 500ms             | 15 min        |
| Files         | 99.0%               | 1000ms            | 30 min        |
| Notifications | 99.0%               | N/A (async)       | 1 hour        |
| AI/Analytics  | 95.0%               | 2000ms            | 1 hour        |


---

## 11. Inter-Service Communication

### Communication Patterns

```
┌──────────────────────────────────────────────────────────────────┐
│                  Communication Matrix                             │
│                                                                   │
│  SYNCHRONOUS (REST/gRPC) — for request/response flows            │
│  ─────────────────────────────────────────────────                │
│  Frontend  ──REST──→  Auth Service     (login, register)         │
│  Frontend  ──REST──→  Fleet Service    (CRUD operations)         │
│  Frontend  ──REST──→  File Service     (upload, download)        │
│  Frontend  ──REST──→  AI Service       (predictions, scores)     │
│  Fleet Svc ──REST──→  File Service     (get image URLs)          │
│                                                                   │
│  ASYNCHRONOUS (Events/MQ) — for fire-and-forget flows            │
│  ─────────────────────────────────────────────────                │
│  Fleet Svc ──event──→  Notification Svc  (alert.created)         │
│  Fleet Svc ──event──→  AI Service        (data.updated)          │
│  Auth Svc  ──event──→  Notification Svc  (user.registered)       │
│                                                                   │
│  NO direct communication between:                                 │
│  Auth ✕ Fleet  (only shared JWT signing key)                     │
│  AI ✕ Notifications  (no dependency)                              │
│  File ✕ Auth  (no dependency)                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Event Bus (Phase 2+)

```
Event Format (CloudEvents v1.0 compatible):
{
  "specversion": "1.0",
  "type": "com.fleetmaster.alert.created",
  "source": "/fleet-service",
  "id": "<uuid>",
  "time": "2026-03-31T10:00:00Z",
  "data": {
    "alertId": "alert-123",
    "carId": "car-456",
    "userId": "user-789",
    "priority": "critical",
    "description": "Engine warning light"
  }
}

Event Types:
  com.fleetmaster.alert.created
  com.fleetmaster.alert.resolved
  com.fleetmaster.car.created
  com.fleetmaster.car.status_changed
  com.fleetmaster.maintenance.plan_created
  com.fleetmaster.maintenance.overdue
  com.fleetmaster.service_record.created
  com.fleetmaster.user.registered
  com.fleetmaster.user.plan_upgraded
```

### Message Broker Decision: RabbitMQ vs Apache Kafka

#### Decision Summary


| Phase                  | Broker                           | Rationale                                                                     |
| ---------------------- | -------------------------------- | ----------------------------------------------------------------------------- |
| Phase 2 (6–12 months)  | **RabbitMQ**                     | Matches event patterns, team capacity, and operational budget                 |
| Phase 3 (12–24 months) | **+ Kafka** (alongside RabbitMQ) | Only if AI/Analytics needs event replay or enterprise requires event sourcing |


#### Why RabbitMQ First

FleetMaster's async events in Phase 2 are **delivery-oriented**: something happened, notify someone, done. This is RabbitMQ's core strength.


| FleetMaster Need                           | RabbitMQ                                    | Kafka                                           |
| ------------------------------------------ | ------------------------------------------- | ----------------------------------------------- |
| Send email when alert is critical          | Deliver to queue, consumer sends, ack, done | Works but heavyweight for simple delivery       |
| Route critical alerts to SMS, low to email | Built-in exchange routing (topic type)      | Requires custom consumer-side logic             |
| Event volume: 10–500 events/day            | Handles millions/day; trivially sufficient  | Designed for millions/second; massive overkill  |
| Dead letter handling (failed deliveries)   | Native DLX (dead letter exchange) support   | Requires manual retry topic pattern             |
| Setup complexity                           | Single Docker container, 30 min             | Broker + KRaft/ZooKeeper, topic config          |
| Memory footprint                           | ~128MB RAM                                  | ~1GB+ RAM minimum                               |
| Management UI                              | Built-in (port 15672)                       | Requires separate tooling (Kafka UI, AKHQ)      |
| Operational burden for 1–3 devs            | Low — stable, mature, well-documented       | High — partitions, replication, consumer groups |
| Cloud managed cost                         | $15–30/mo (CloudAMQP)                       | $100–300/mo (Confluent Cloud)                   |


#### RabbitMQ Topology for FleetMaster

```
Fleet Service (publisher)           Auth Service (publisher)
     │                                     │
     │  publish to exchange                │  publish to exchange
     ↓                                     ↓
┌──────────────────────────────────────────────────────────────┐
│                        RabbitMQ                               │
│                                                               │
│  Exchange: fleetmaster.events (type: topic, durable: true)   │
│                                                               │
│  Routing Key              →  Queue                           │
│  ─────────────────────────────────────────────               │
│  alert.created.critical   →  queue.notify.sms                │
│  alert.created.*          →  queue.notify.email              │
│  alert.resolved           →  queue.notify.email              │
│  maintenance.overdue      →  queue.notify.email              │
│  maintenance.plan_created →  queue.notify.email              │
│  service_record.created   →  queue.notify.email              │
│  user.registered          →  queue.notify.welcome            │
│  user.plan_upgraded       →  queue.notify.email              │
│  *.* (wildcard)           →  queue.audit.log  (optional)     │
│                                                               │
│  Dead Letter Exchange: fleetmaster.dlx                       │
│  └── queue.dead_letters  (failed messages for inspection)    │
└──────────────────────────────────────────────────────────────┘
         │              │              │              │
         ↓              ↓              ↓              ↓
   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ SMS      │  │ Email    │  │ Welcome  │  │ Audit    │
   │ Consumer │  │ Consumer │  │ Consumer │  │ Consumer │
   │ (Notif.) │  │ (Notif.) │  │ (Notif.) │  │ (opt.)   │
   └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

**Key design choices:**

- **Topic exchange** allows flexible routing by dot-separated keys without code changes
- **Durable queues** survive broker restarts — no message loss
- **Dead letter exchange** catches failed deliveries for manual inspection/retry
- **Wildcard audit queue** (`*.`*) optionally captures all events for debugging

#### When to Add Kafka (Phase 3 Triggers)

Add Kafka **alongside** RabbitMQ (not replacing it) when any of these become true:


| Trigger                                                                            | Why Kafka Needed                                                            | RabbitMQ Limitation                                                     |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| AI service must **replay** all historical maintenance events to retrain models     | Kafka retains events indefinitely; consumers re-read from any offset        | Messages deleted after acknowledgment — no replay                       |
| Enterprise customers require **event sourcing** for compliance audit trail         | Kafka's append-only log is a natural immutable audit ledger                 | Not designed for long-term event storage                                |
| Event volume exceeds **100K events/day**                                           | Kafka's partitioned log scales horizontally with near-zero overhead         | RabbitMQ can handle this but approaches tuning territory                |
| Multiple independent consumers need the **same event stream** without coordination | Kafka consumer groups handle this natively — each group reads independently | Requires exchange fan-out to multiple queues (more config, more memory) |


#### Dual-Broker Architecture (Phase 3, if triggered)

```
Fleet Service
     │
     ├──→ RabbitMQ  ──→ Notification Service    (real-time delivery)
     │    (existing)     • Email, SMS, Push
     │                   • Message consumed and gone
     │                   • Simple, reliable delivery
     │
     └──→ Kafka     ──→ AI/Analytics Service    (historical replay)
          (new)          • Re-read all events for ML training
                         • Stream processing for fleet health scoring
                         • Event sourcing for audit trail
                         • Retain events for 90+ days
```

**Integration pattern**: Fleet Service publishes to **both** brokers. This avoids coupling between the delivery path (RabbitMQ) and the analytics path (Kafka). Each broker serves its strength.

#### Technology Comparison Summary


| Criterion                  | RabbitMQ                                        | Apache Kafka                                |
| -------------------------- | ----------------------------------------------- | ------------------------------------------- |
| **Core pattern**           | Message queue (smart broker, simple consumer)   | Event log (simple broker, smart consumer)   |
| **Message lifecycle**      | Consumed → acknowledged → deleted               | Appended → retained for configured period   |
| **Replay capability**      | Not possible                                    | Native — any consumer reads from any offset |
| **Routing**                | Rich (direct, topic, fanout, headers exchanges) | Topic + partition only                      |
| **Ordering guarantee**     | Per-queue FIFO                                  | Per-partition FIFO (strict)                 |
| **Throughput**             | ~50K msg/sec (single node)                      | ~1M msg/sec (single node)                   |
| **Latency**                | Sub-millisecond                                 | Low milliseconds                            |
| **Protocol**               | AMQP 0.9.1 (standard)                           | Custom TCP protocol                         |
| **Client libraries**       | Every language (mature)                         | Every language (mature)                     |
| **Operational complexity** | Low                                             | Medium–High                                 |
| **Best for FleetMaster**   | Phase 2: notifications, alerts, reminders       | Phase 3: AI training, event sourcing, audit |


#### Decision Rule

```
IF event_purpose == "deliver notification and forget"
   → Use RabbitMQ

IF event_purpose == "store history for replay, analysis, or audit"
   → Use Kafka

IF unsure
   → Use RabbitMQ (simpler to operate, can migrate events to Kafka later)
```

### Service Discovery (Phase 2+)

For Phase 0–1, simple nginx routing is sufficient. For Phase 2+, consider:


| Approach                | When             | Complexity |
| ----------------------- | ---------------- | ---------- |
| nginx reverse proxy     | 2–4 services     | Low        |
| Docker Compose DNS      | Development      | Low        |
| Consul / etcd           | 5+ services      | Medium     |
| Kubernetes service mesh | Enterprise scale | High       |


---

## 12. Data Strategy

### Database Per Service

Each service owns its data. No shared databases.

```
┌──────────────────────────────────────────────────────────────────┐
│              Data Ownership Map (Phases 0–3)                      │
│                                                                   │
│  Auth Service                                                     │
│  └── auth_db                                                      │
│      ├── users (id, email, password_hash, name, plan)            │
│      └── refresh_tokens (id, user_id, token, expires_at)         │
│                                                                   │
│  Fleet Service (monolith — decomposed in Phase 4)                │
│  └── fleet_db                                                     │
│      ├── cars (id, user_id, brand, model, year, mileage, ...)   │
│      ├── alerts (id, user_id, car_id, type, priority, ...)      │
│      ├── service_records (id, user_id, car_id, cost, ...)       │
│      ├── service_operations (id, record_id, type, ...)          │
│      ├── maintenance_entries (id, user_id, car_id, ...)         │
│      ├── maintenance_plans (id, user_id, car_id, status, ...)   │
│      └── maintenance_operations (id, plan_id, operation, ...)   │
│                                                                   │
│  AI Service                                                       │
│  └── analytics_db                                                 │
│      ├── predictions (id, car_id, predicted_issue, confidence)   │
│      ├── fleet_scores (id, user_id, score, calculated_at)       │
│      └── aggregated_metrics (materialized views from fleet_db)   │
│                                                                   │
│  Notification Service                                             │
│  └── Redis                                                        │
│      ├── notification_queue (pending notifications)              │
│      ├── user_preferences (notification settings)                │
│      └── delivery_log (sent notification history)                │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│              Data Ownership Map (Phase 4 — Post-Decomposition)   │
│                                                                   │
│  Vehicle Service                                                  │
│  └── vehicle_db                                                   │
│      ├── cars (id, user_id, brand, model, year, mileage, ...)   │
│      ├── car_images (id, car_id, file_url, uploaded_at)         │
│      └── car_status_history (id, car_id, status, changed_at)    │
│                                                                   │
│  Maintenance Service                                              │
│  └── maintenance_db                                               │
│      ├── maintenance_entries (id, user_id, car_id, ...)         │
│      ├── maintenance_plans (id, user_id, car_id, status, ...)   │
│      ├── maintenance_operations (id, plan_id, operation, ...)   │
│      └── car_snapshots (car_id, brand, model, mileage)  [proj.] │
│                                                                   │
│  Repair Service                                                   │
│  └── repair_db                                                    │
│      ├── alerts (id, user_id, car_id, type, priority, ...)      │
│      ├── service_records (id, user_id, car_id, cost, ...)       │
│      ├── service_operations (id, record_id, type, ...)          │
│      └── car_snapshots (car_id, brand, model, mileage)  [proj.] │
│                                                                   │
│  Finance Service                                                  │
│  └── finance_db                                                   │
│      ├── expenses (id, user_id, car_id, amount, category, ...)  │
│      ├── budgets (id, user_id, car_id, monthly_limit, ...)      │
│      ├── insurance_records (id, user_id, car_id, provider, ...) │
│      └── audit_trail (id, event_type, payload, timestamp)  [imm.]│
│                                                                   │
│  [proj.] = denormalized projection, kept in sync via events      │
│  [imm.]  = immutable append-only table                            │
└──────────────────────────────────────────────────────────────────┘
```

### Cross-Service Data Access Patterns


| Scenario                      | Pattern         | Implementation                                  |
| ----------------------------- | --------------- | ----------------------------------------------- |
| AI needs car history          | Read replica    | AI service reads from Fleet DB read replica     |
| Notification needs user email | API call        | Notification calls Auth Service `/auth/profile` |
| Fleet needs file URL          | API call        | Fleet Service calls File Service on upload      |
| Statistics across services    | API composition | Frontend aggregates from multiple services      |
| Cascade delete (car deleted)  | Domain events   | Fleet publishes `car.deleted`, others react     |


### Data Consistency Strategy


| Phase                   | Consistency Model  | Approach                                                                                      |
| ----------------------- | ------------------ | --------------------------------------------------------------------------------------------- |
| 0 (Monolith)            | Strong             | Single DB, database transactions                                                              |
| 1 (Auth + Fleet)        | Strong per service | Each service has ACID within its DB. Auth ↔ Fleet consistency via JWT (eventually consistent) |
| 2–3 (Multiple services) | Eventual           | Event-driven saga pattern for cross-service operations                                        |


---

## 13. Infrastructure & DevOps

### Docker Compose Evolution

#### Phase 0 (Dev)

```yaml
# infrastructure/docker-compose.yml
services:
  gateway:
    image: nginx:alpine
    ports: ["80:80"]
    
  fleet-service:
    build: ../backend/fleet-service
    ports: ["8080:8080"]
    environment:
      - DB_URL=jdbc:postgresql://fleet-db:5432/fleetmaster
      - JWT_PUBLIC_KEY_PATH=/keys/jwt-public.pem
    depends_on: [fleet-db]
    
  fleet-db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=fleetmaster
    volumes: [fleet-data:/var/lib/postgresql/data]

volumes:
  fleet-data:
```

#### Phase 1 (Dev)

```yaml
services:
  gateway:
    image: nginx:alpine
    ports: ["80:80"]
    
  auth-service:
    build: ../backend/auth-service
    ports: ["3000:3000"]
    environment:
      - DB_URL=postgres://auth-db:5432/auth
      - JWT_PRIVATE_KEY_PATH=/keys/jwt-private.pem
    depends_on: [auth-db]
    
  fleet-service:
    build: ../backend/fleet-service
    ports: ["8080:8080"]
    environment:
      - DB_URL=jdbc:postgresql://fleet-db:5432/fleetmaster
      - JWT_PUBLIC_KEY_PATH=/keys/jwt-public.pem
    depends_on: [fleet-db]
    
  auth-db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=auth
    volumes: [auth-data:/var/lib/postgresql/data]
    
  fleet-db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=fleetmaster
    volumes: [fleet-data:/var/lib/postgresql/data]

volumes:
  auth-data:
  fleet-data:
```

#### Phase 2+ (Dev)

```yaml
services:
  gateway:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    
  auth-service:
    build: ../backend/auth-service
    ports: ["3000:3000"]
    depends_on: [auth-db]
    
  fleet-service:
    build: ../backend/fleet-service
    ports: ["8080:8080"]
    depends_on: [fleet-db, rabbitmq]
    
  file-service:
    build: ../backend/file-service
    ports: ["3002:3002"]
    depends_on: [minio]
    
  notification-service:
    build: ../backend/notification-service
    ports: ["3003:3003"]
    depends_on: [rabbitmq, redis]
    
  auth-db:
    image: postgres:15-alpine
    volumes: [auth-data:/var/lib/postgresql/data]
    
  fleet-db:
    image: postgres:15-alpine
    volumes: [fleet-data:/var/lib/postgresql/data]
    
  minio:
    image: minio/minio
    ports: ["9000:9000"]
    command: server /data
    volumes: [minio-data:/data]
    
  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports: ["5672:5672", "15672:15672"]
    
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

volumes:
  auth-data:
  fleet-data:
  minio-data:
```

#### Phase 4 (Dev)

```yaml
services:
  gateway:
    image: nginx:alpine
    ports: ["80:80", "443:443"]

  bff-service:
    build: ../backend/bff-service
    ports: ["8090:8090"]
    depends_on: [vehicle-service, maintenance-service, repair-service, finance-service]

  auth-service:
    build: ../backend/auth-service
    ports: ["3000:3000"]
    depends_on: [auth-db]

  vehicle-service:
    build: ../backend/vehicle-service
    ports: ["8080:8080"]
    depends_on: [vehicle-db, kafka]

  maintenance-service:
    build: ../backend/maintenance-service
    ports: ["8082:8082"]
    depends_on: [maintenance-db, kafka]

  repair-service:
    build: ../backend/repair-service
    ports: ["8083:8083"]
    depends_on: [repair-db, kafka, rabbitmq]

  finance-service:
    build: ../backend/finance-service
    ports: ["8081:8081"]
    depends_on: [finance-db, kafka]

  file-service:
    build: ../backend/file-service
    ports: ["3002:3002"]
    depends_on: [minio]

  notification-service:
    build: ../backend/notification-service
    ports: ["3003:3003"]
    depends_on: [rabbitmq, redis]

  ai-service:
    build: ../backend/ai-service
    ports: ["5000:5000"]
    depends_on: [analytics-db, kafka]

  auth-db:
    image: postgres:15-alpine
    volumes: [auth-data:/var/lib/postgresql/data]

  vehicle-db:
    image: postgres:15-alpine
    volumes: [vehicle-data:/var/lib/postgresql/data]

  maintenance-db:
    image: postgres:15-alpine
    volumes: [maintenance-data:/var/lib/postgresql/data]

  repair-db:
    image: postgres:15-alpine
    volumes: [repair-data:/var/lib/postgresql/data]

  finance-db:
    image: postgres:15-alpine
    volumes: [finance-data:/var/lib/postgresql/data]

  analytics-db:
    image: postgres:15-alpine
    volumes: [analytics-data:/var/lib/postgresql/data]

  minio:
    image: minio/minio
    ports: ["9000:9000"]
    command: server /data
    volumes: [minio-data:/data]

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports: ["5672:5672", "15672:15672"]

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    ports: ["9092:9092"]
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
      CLUSTER_ID: FleetMasterKafkaCluster

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

volumes:
  auth-data:
  vehicle-data:
  maintenance-data:
  repair-data:
  finance-data:
  analytics-data:
  minio-data:
```

### CI/CD Pipeline Per Service

```
Per-service pipeline (GitHub Actions):

┌─────────┐   ┌─────────┐   ┌──────────┐   ┌───────────┐   ┌────────┐
│  Push   │──→│  Test   │──→│  Build   │──→│  Publish  │──→│ Deploy │
│  to     │   │  unit + │   │  Docker  │   │  to GHCR  │   │  to    │
│  branch │   │  integ  │   │  image   │   │           │   │ staging│
└─────────┘   └─────────┘   └──────────┘   └───────────┘   └────────┘

Triggered by: changes in that service's directory only
Example:
  backend/auth-service/**  → triggers auth-service pipeline
  backend/fleet-service/** → triggers fleet-service pipeline
```

### Monitoring Stack (Phase 2+)


| Tool            | Purpose                  | Priority                |
| --------------- | ------------------------ | ----------------------- |
| **Prometheus**  | Metrics collection       | High                    |
| **Grafana**     | Dashboards and alerting  | High                    |
| **Loki**        | Log aggregation          | Medium                  |
| **Jaeger**      | Distributed tracing      | Medium (Phase 2+)       |
| **Uptime Kuma** | Simple uptime monitoring | High (use from Phase 0) |


### Health Check Endpoints

Every service must expose:

```
GET /health          → { "status": "up", "version": "1.2.3" }
GET /health/ready    → { "status": "ready", "db": "connected" }
GET /health/live     → 200 OK (for container orchestration)
GET /metrics         → Prometheus format metrics
```

---

## 14. Extraction Decision Framework

Use this checklist BEFORE extracting any module into a separate service. **All items in at least one category must be true.**

### Category A: Scaling Pressure


| #   | Criterion                                                                           | Check |
| --- | ----------------------------------------------------------------------------------- | ----- |
| A1  | This module needs to scale independently (different CPU/memory profile)             | ☐     |
| A2  | This module's load pattern differs significantly from others (bursty vs. steady)    | ☐     |
| A3  | This module's downtime tolerance differs (auth must be 99.9%, analytics can be 95%) | ☐     |


### Category B: Team & Deployment


| #   | Criterion                                                          | Check |
| --- | ------------------------------------------------------------------ | ----- |
| B1  | A different team will own this module                              | ☐     |
| B2  | This module needs a different release cadence                      | ☐     |
| B3  | Changes to this module frequently break or slow down other modules | ☐     |


### Category C: Technology


| #   | Criterion                                                                             | Check |
| --- | ------------------------------------------------------------------------------------- | ----- |
| C1  | This module requires a different language/runtime (Python for ML, Go for performance) | ☐     |
| C2  | This module requires specialized infrastructure (GPU, message queue, object storage)  | ☐     |
| C3  | This module has fundamentally different security/compliance requirements              | ☐     |


### Decision Rule

```
IF (any full category A, B, or C is all-true)
   AND (team has capacity to operate another service)
   AND (module boundaries in monolith are already clean)
THEN → Extract into separate service

ELSE → Keep in monolith, improve module boundaries
```

### Pre-Extraction Readiness Checklist

Before extracting, verify:

- Module has zero circular dependencies with other modules
- All inter-module calls are through interfaces (not direct DB queries)
- Module has its own integration tests that pass independently
- CI/CD pipeline exists for the new service
- Monitoring and alerting is set up
- Runbook for the new service is documented
- Rollback plan is defined
- Team has operational experience with at least 2 services already

---

## 15. Risk Register


| #   | Risk                                                             | Probability | Impact   | Phase | Mitigation                                                                                       |
| --- | ---------------------------------------------------------------- | ----------- | -------- | ----- | ------------------------------------------------------------------------------------------------ |
| R1  | Premature extraction leads to distributed monolith               | Medium      | High     | 1–3   | Follow extraction decision framework strictly                                                    |
| R2  | Cross-service data consistency issues                            | Medium      | High     | 2–4   | Start with eventual consistency patterns early; use saga pattern                                 |
| R3  | Operational complexity exceeds team capacity                     | High        | Critical | 2–4   | Add services only when team grows; automate everything                                           |
| R4  | Network latency degrades user experience                         | Low         | Medium   | 2–4   | Keep tightly coupled modules in same service; monitor p99 latency                                |
| R5  | JWT key management becomes complex                               | Low         | High     | 1+    | Use asymmetric keys (RS256); distribute public key only                                          |
| R6  | Service discovery/routing failures                               | Low         | High     | 2+    | Start with nginx (proven); move to service mesh only when necessary                              |
| R7  | Database migration errors during extraction                      | Medium      | High     | 1–4   | Use feature flags; run old and new in parallel; validate data consistency                        |
| R8  | Vendor lock-in with cloud services                               | Low         | Medium   | 2+    | Use S3-compatible APIs (MinIO locally); abstract cloud services behind interfaces                |
| R9  | Event projection lag causes stale reads after core decomposition | Medium      | Medium   | 4     | Monitor projection lag metrics; use read-your-writes pattern for critical paths                  |
| R10 | BFF becomes a bottleneck or single point of failure              | Medium      | High     | 4     | Stateless BFF with horizontal scaling; circuit breakers per downstream service                   |
| R11 | Cross-service saga failures leave data in inconsistent state     | Medium      | High     | 4     | Implement compensating transactions; dead-letter queue for failed saga steps; reconciliation job |
| R12 | Phase 4 cost exceeds business justification                      | Medium      | Medium   | 4     | Gate Phase 4 on enterprise revenue; decompose incrementally (4a first, evaluate before 4b)       |


---

## 16. Migration Playbook

### Extracting a Module (Generic Steps)

This repeatable process applies to every future extraction:

```
Step 1: Prepare (1–2 weeks)
├── Verify module boundaries are clean (no circular deps)
├── Ensure all cross-module calls use interfaces
├── Write integration tests for the module's public API
└── Set up new service skeleton (build, deploy, health check)

Step 2: Duplicate (1 week)
├── Deploy new service alongside monolith
├── New service has same logic, own database
├── Data sync: monolith writes → event → new service writes
└── Validate data consistency between old and new

Step 3: Redirect (1 week)
├── Update API Gateway: route to new service
├── Monolith module still running but not receiving traffic
├── Monitor error rates, latency, data consistency
└── Keep monolith module as fallback

Step 4: Clean Up (1 week)
├── Remove module code from monolith
├── Remove sync mechanism
├── Update documentation
└── Archive monolith module tests
```

### Rollback Protocol

At any point during migration:

```
IF error_rate > 1% OR latency_p99 > 2x baseline
THEN:
  1. Switch API Gateway back to monolith
  2. Stop writing to new service DB
  3. Investigate root cause
  4. Fix and retry from Step 2
```

---

## Appendix A: Technology Selection Rationale


| Service               | Language           | Why                                                                                    |
| --------------------- | ------------------ | -------------------------------------------------------------------------------------- |
| Fleet (Phases 0–3)    | Java (Spring Boot) | Team expertise, rich ecosystem, strong typing, proven for CRUD-heavy services          |
| Auth                  | Go                 | Lightweight, fast startup, excellent for stateless HTTP services, low memory footprint |
| Files                 | Go                 | Good standard library for HTTP/file handling, efficient memory usage for streaming     |
| Notifications         | Go or Node.js      | Event-driven nature suits both; Go for performance, Node for ecosystem                 |
| AI/Analytics          | Python (FastAPI)   | ML ecosystem (scikit-learn, TensorFlow, pandas), data science team standard            |
| Vehicle (Phase 4)     | Java (Spring Boot) | Inherits Fleet codebase; highest read volume benefits from Spring WebFlux if needed    |
| Maintenance (Phase 4) | Java (Spring Boot) | Inherits Fleet codebase; scheduling logic well-served by Spring ecosystem              |
| Repair (Phase 4)      | Java (Spring Boot) | Inherits Fleet codebase; event publishing via Spring Kafka/AMQP                        |
| Finance (Phase 4)     | Java or Go         | BigDecimal for money, strong transaction support; Go viable if team prefers            |
| BFF (Phase 4)         | Go or Node.js      | Lightweight API composition layer; async parallel calls suit both                      |


## Appendix B: Cost Estimation (Infrastructure)

### Development (Local / Docker)


| Component              | Cost |
| ---------------------- | ---- |
| All services on Docker | Free |
| PostgreSQL (Docker)    | Free |
| MinIO (Docker)         | Free |
| RabbitMQ (Docker)      | Free |


### Production (Cloud — Estimated)


| Phase   | Services                           | Estimated Monthly Cost                      |
| ------- | ---------------------------------- | ------------------------------------------- |
| Phase 0 | 1 service + 1 DB                   | $20–40 (single VPS or small cloud instance) |
| Phase 1 | 2 services + 2 DBs                 | $40–80                                      |
| Phase 2 | 4 services + 3 DBs + S3 + MQ       | $100–200                                    |
| Phase 3 | 5–6 services + 4 DBs + ML          | $200–500                                    |
| Phase 4 | 9–10 services + 6 DBs + Kafka + ML | $500–1200                                   |


Cost optimization: Use managed DB services (RDS), containers (ECS/Fargate), Kubernetes for Phase 4 density, and right-size instances. Phase 4 costs justify with enterprise revenue.

## Appendix C: Related Documentation


| Document                      | Location                                               | Description                            |
| ----------------------------- | ------------------------------------------------------ | -------------------------------------- |
| Architecture Decision Summary | `final_alignments/01_ARCHITECTURE_DECISION_SUMMARY.md` | Auth + Business separation decision    |
| Architecture Separation Plan  | `final_alignments/03_ARCHITECTURE_SEPARATION_PLAN.md`  | Detailed separation specification      |
| Backend Integration Guide     | `final_alignments/04_BACKEND_INTEGRATION_GUIDE.md`     | Frontend-backend integration details   |
| Final Architecture Summary    | `final_alignments/FINAL_ARCHITECTURE_SUMMARY.md`       | Complete current architecture overview |
| Thin Client Implementation    | `final_alignments/THIN_CLIENT_IMPLEMENTATION.md`       | Frontend thin client pattern           |
| OpenAPI Specification         | `../api/fleetmaster-openapi.yaml`                      | REST API contract                      |
| Initial Customer Request      | `../BA-SA/initial-customer-request-v1.md`              | Original business requirements         |


---

> **This document is a living roadmap.** Update it as the project evolves, team grows, and business requirements change. The key principle: **extract services based on evidence, not speculation.**

