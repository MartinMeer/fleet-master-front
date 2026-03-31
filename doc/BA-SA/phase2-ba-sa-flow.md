
## Флоу бизнес/системного аналитика — Notification Service

### Фаза 1. Discovery (Выявление потребностей) — 3-5 дней

**Цель**: понять *зачем* нужен сервис, *кому* он нужен и *какую бизнес-проблему* решает.

**1.1. Сбор стейкхолдерских требований**
- Интервью с Product Owner: какие уведомления нужны пользователям? Какие pain points?
- Интервью с UX/UI: как уведомления отображаются в приложении? Где notification center?
- Интервью с разработчиками Fleet Service: какие события уже генерируются или планируются?
- Анализ конкурентов: как аналогичные fleet-management системы уведомляют пользователей?

**1.2. Формирование бизнес-целей**

| # | Бизнес-цель | Метрика успеха |
|---|-------------|----------------|
| BG-1 | Снизить количество пропущенных ТО | % overdue maintenance снизился на 30% |
| BG-2 | Повысить engagement пользователей | DAU/MAU вырос на 15% |
| BG-3 | Сократить время реакции на критические алерты | Среднее время от alert.created до действия < 2 часов |
| BG-4 | Дать пользователю контроль над каналами уведомлений | 100% пользователей имеют настройки предпочтений |

**1.3. Определение scope (границ проекта)**

В scope:
- Email-уведомления (upcoming maintenance, overdue alerts, confirmation)
- Push-уведомления (mobile PWA, Web Push API)
- In-app notification center (список уведомлений в UI)
- Настройки предпочтений пользователя (каналы, частота, do-not-disturb)

Вне scope (отложено):
- SMS-уведомления (будет в следующей итерации, требует SMS-провайдера)
- WhatsApp/Telegram интеграция
- Уведомления для админов/менеджеров флота (multi-tenant Phase 3+)

---

### Фаза 2. Анализ требований — 5-7 дней

**Цель**: превратить бизнес-потребности в структурированные требования.

**2.1. User Stories + Acceptance Criteria**

```
US-1: Как владелец автомобиля, я хочу получать email за 7 дней до планового ТО,
      чтобы успеть записаться на сервис.

  AC-1.1: Email отправляется при получении события maintenance.due_soon
  AC-1.2: Email содержит: название ТО, авто (марка/модель), дату, ссылку на план
  AC-1.3: Email НЕ отправляется, если пользователь отключил email-канал
  AC-1.4: Email НЕ отправляется повторно для того же maintenance_plan.id
  
US-2: Как пользователь, я хочу получать push-уведомление при критическом алерте,
      чтобы немедленно среагировать.

  AC-2.1: Push отправляется при получении alert.created с priority=critical
  AC-2.2: Push содержит: краткое описание, марку/модель авто
  AC-2.3: Нажатие на push открывает экран алерта в приложении
  AC-2.4: Push НЕ отправляется в период do-not-disturb пользователя

US-3: Как пользователь, я хочу видеть все уведомления в notification center в приложении,
      чтобы не пропустить ничего важного.

  AC-3.1: Все уведомления сохраняются в in-app center независимо от канала
  AC-3.2: Уведомления отмечаются как read/unread
  AC-3.3: Отображается badge-счётчик непрочитанных на иконке колокольчика
  AC-3.4: Уведомления хранятся 90 дней, затем архивируются

US-4: Как пользователь, я хочу управлять своими notification preferences,
      чтобы получать только нужные уведомления удобным способом.

  AC-4.1: Настройки доступны в /settings/notifications
  AC-4.2: Можно включить/выключить: email, push, in-app — для каждого типа события
  AC-4.3: Можно задать "тихие часы" (do-not-disturb window)
  AC-4.4: По умолчанию все каналы включены
```

**2.2. Event Mapping Matrix**

Ключевая задача аналитика: маппинг входящих событий на уведомления.

| Входящее событие | Канал(ы) | Шаблон | Приоритет | Дедупликация |
|---|---|---|---|---|
| `maintenance.due_soon` | Email + In-app | `reminder_maintenance` | Normal | По `plan_id` + 7 дней |
| `alert.created` (critical) | Push + Email + In-app | `critical_alert` | Urgent | По `alert_id` |
| `alert.created` (medium/low) | Email + In-app | `alert_info` | Normal | По `alert_id` |
| `service_record.created` | Email + In-app | `service_confirmation` | Low | По `record_id` |
| `maintenance_plan.overdue` | Email + Push + In-app | `overdue_escalation` | High | По `plan_id` + 24 часа |
| `user.registered` | Email | `welcome_email` | Low | По `user_id` |

**2.3. Нефункциональные требования (NFR)**

| # | Категория | Требование |
|---|-----------|------------|
| NFR-1 | Availability | 99.0% (допустима задержка отправки, но не потеря) |
| NFR-2 | Latency | Event-to-delivery: email < 5 мин, push < 30 сек, in-app < 10 сек |
| NFR-3 | Throughput | До 10,000 уведомлений/день на Phase 2 |
| NFR-4 | Durability | Потеря уведомлений = 0 (DLQ + retry механизм) |
| NFR-5 | Idempotency | Повторная обработка одного события не создаёт дубль |
| NFR-6 | GDPR/Privacy | Email-адрес не хранится — запрашивается через Auth Service API |
| NFR-7 | Observability | Метрики: sent/failed/retried per channel, delivery latency p50/p95/p99 |

---

### Фаза 3. Системный анализ и проектирование — 5-7 дней

**Цель**: спроектировать *как* сервис работает, его интеграции и контракты.

**3.1. Context Diagram (C4 Level 1)**

```
                    ┌───────────────────────────┐
                    │        Frontend           │
                    │  (Notification Center UI) │
                    └────────────┬──────────────┘
                                 │ REST (GET /notifications, PATCH read)
                                 ↓
┌──────────────┐    ┌───────────────────────────┐    ┌──────────────────┐
│ Fleet Service│───→│   Notification Service    │───→│   Auth Service   │
│ (publisher)  │ MQ │                           │REST│ (user email/name)│
└──────────────┘    │  • Event consumer         │    └──────────────────┘
                    │  • Channel router          │
┌──────────────┐    │  • Template engine         │    ┌──────────────────┐
│ Auth Service │───→│  • Delivery dispatcher     │───→│   SendGrid / SES │
│ (publisher)  │ MQ │  • Preference manager      │SMTP│   (email)        │
└──────────────┘    │  • In-app store             │    └──────────────────┘
                    └────────────┬──────────────┘
                                 │                    ┌──────────────────┐
                                 └───────────────────→│   Web Push API   │
                                              Push    │   (browser push) │
                                                      └──────────────────┘
```

**3.2. API-контракт (REST endpoints)**

```
Notification Service API (Port 3003):

# --- In-App Notification Center (Frontend calls) ---
GET    /notifications                → Список уведомлений пользователя
       Query: ?unread=true&limit=20&offset=0
       Response: { items: [...], unread_count: 5, total: 42 }

GET    /notifications/{id}          → Детали одного уведомления
PATCH  /notifications/{id}/read     → Отметить как прочитанное
POST   /notifications/read-all      → Отметить все как прочитанные
DELETE /notifications/{id}          → Удалить уведомление

# --- Preferences ---
GET    /notifications/preferences   → Получить настройки пользователя
PUT    /notifications/preferences   → Обновить настройки

       Preferences schema:
       {
         "channels": {
           "email": true,
           "push": true,
           "in_app": true
         },
         "event_settings": {
           "maintenance_reminder": { "email": true, "push": false },
           "critical_alert":      { "email": true, "push": true },
           "service_confirmation": { "email": true, "push": false }
         },
         "quiet_hours": {
           "enabled": true,
           "start": "23:00",
           "end": "07:00",
           "timezone": "Europe/Moscow"
         }
       }

# --- Push subscription ---
POST   /notifications/push/subscribe    → Регистрация push-подписки (VAPID)
DELETE /notifications/push/unsubscribe  → Отмена push-подписки

# --- Health ---
GET    /health                      → { "status": "up" }
GET    /health/ready                → { "status": "ready", "redis": "ok", "rabbitmq": "ok" }
GET    /metrics                     → Prometheus metrics
```

**3.3. Sequence Diagram: критический алерт**

```
Fleet Service            RabbitMQ              Notification Service       Auth Service     SendGrid    Web Push
     │                      │                        │                       │               │           │
     │ publish event        │                        │                       │               │           │
     │ alert.created        │                        │                       │               │           │
     │ (priority=critical)  │                        │                       │               │           │
     │─────────────────────→│                        │                       │               │           │
     │                      │  deliver to            │                       │               │           │
     │                      │  queue.notify.email    │                       │               │           │
     │                      │  queue.notify.sms      │                       │               │           │
     │                      │───────────────────────→│                       │               │           │
     │                      │                        │                       │               │           │
     │                      │                        │ 1. Check idempotency  │               │           │
     │                      │                        │    (alertId in Redis?) │               │           │
     │                      │                        │                       │               │           │
     │                      │                        │ 2. Load preferences   │               │           │
     │                      │                        │    (from Redis cache)  │               │           │
     │                      │                        │                       │               │           │
     │                      │                        │ 3. Check quiet hours  │               │           │
     │                      │                        │    → NOT in quiet hrs │               │           │
     │                      │                        │                       │               │           │
     │                      │                        │ 4. Get user email     │               │           │
     │                      │                        │───────────────────────→               │           │
     │                      │                        │←── { email, name }    │               │           │
     │                      │                        │                       │               │           │
     │                      │                        │ 5. Render template    │               │           │
     │                      │                        │    "critical_alert"   │               │           │
     │                      │                        │                       │               │           │
     │                      │                        │ 6. Send email         │               │           │
     │                      │                        │──────────────────────────────────────→│           │
     │                      │                        │←── 202 Accepted      │               │           │
     │                      │                        │                       │               │           │
     │                      │                        │ 7. Send push          │               │           │
     │                      │                        │─────────────────────────────────────────────────→│
     │                      │                        │←── 201 Created       │               │           │
     │                      │                        │                       │               │           │
     │                      │                        │ 8. Save in-app notif  │               │           │
     │                      │                        │    (write to Redis)   │               │           │
     │                      │                        │                       │               │           │
     │                      │                        │ 9. ACK message to MQ  │               │           │
     │                      │                        │───────────────────────→               │           │
     │                      │                        │                       │               │           │
```

**3.4. Data Model**

```
Redis Key Design:

# In-app notifications (sorted set by timestamp)
notifications:{userId}            → ZSET { notifId: timestamp }
notification:{notifId}            → HASH { type, title, body, read, carId, link, createdAt }

# User preferences
preferences:{userId}              → HASH (serialized JSON preferences)

# Idempotency (TTL = 24h)
idempotent:{eventType}:{entityId} → "1" (with TTL)

# Push subscriptions
push:{userId}                     → SET { endpoint1, endpoint2, ... }

# Delivery log (last 30 days, for debugging)
delivery_log:{userId}             → LIST { serialized delivery records }
```

**3.5. Error Handling & Retry Strategy**

| Ошибка | Стратегия | Максимум попыток | Интервал |
|--------|-----------|------------------|----------|
| Email provider (SendGrid) 5xx | Exponential backoff retry | 5 | 1s → 2s → 4s → 8s → 16s |
| Email provider 429 (rate limit) | Delay + retry | 3 | Respect Retry-After header |
| Auth Service unavailable | Retry, затем defer | 3 | 2s → 4s → 8s, затем → DLQ |
| Push endpoint expired | Remove subscription, log | 1 | Immediate cleanup |
| Redis unavailable | Circuit breaker, queue in memory | N/A | 5s health check interval |
| Unrecoverable (bad payload) | Send to DLQ, alert ops team | 0 | Immediate |

---

### Фаза 4. Валидация и согласование — 2-3 дня

**Цель**: убедиться, что все стейкхолдеры согласны, а технические решения feasible.

**4.1. Checklist для Review**

| # | Элемент | Ревьюер | Статус |
|---|---------|---------|--------|
| 1 | User Stories + AC | Product Owner | ☐ |
| 2 | Event Mapping Matrix | Fleet Service Team | ☐ |
| 3 | API-контракт | Frontend Lead | ☐ |
| 4 | NFR + SLA | Tech Lead | ☐ |
| 5 | Data Model (Redis) | Backend Lead | ☐ |
| 6 | Email Templates (UX) | UX Designer | ☐ |
| 7 | Security (email via Auth Service, no PII stored) | Security | ☐ |
| 8 | Стоимость SendGrid/SES | Product Owner | ☐ |
| 9 | Fit with RabbitMQ topology (Section 11) | Architect | ☐ |

**4.2. Open Questions (backlog)**

| # | Вопрос | Владелец | Дедлайн |
|---|--------|----------|---------|
| OQ-1 | Какой email-провайдер? SendGrid vs AWS SES vs Mailgun | Tech Lead | Sprint N+1 |
| OQ-2 | Нужен ли digest-режим (1 письмо/день вместо каждого события)? | PO | Sprint N+1 |
| OQ-3 | Как получать email пользователя: кэш или каждый раз API call в Auth? | Architect | Sprint N |
| OQ-4 | Язык сервиса: Go или Node.js? | Tech Lead | Sprint N |
| OQ-5 | Нужен ли notification history export? | PO | Backlog |

---

### Фаза 5. Передача в разработку — 1-2 дня

**Цель**: оформить всё в actionable артефакты для спринтов.

**5.1. Выходные артефакты аналитика**

| # | Артефакт | Формат | Назначение |
|---|----------|--------|------------|
| 1 | **BRD** (Business Requirements Document) | Confluence / MD | Бизнес-цели, scope, user stories |
| 2 | **Event Contract** | AsyncAPI spec (YAML) | Формат входящих событий из RabbitMQ |
| 3 | **API Contract** | OpenAPI spec (YAML) | REST endpoints для Frontend |
| 4 | **Data Model** | Diagram + Redis key schema | Структура хранения |
| 5 | **Sequence Diagrams** | PlantUML / Mermaid | Основные сценарии |
| 6 | **NFR + SLA** | Таблица в BRD | Нефункциональные требования |
| 7 | **Email Templates Brief** | Figma / HTML mockups | Шаблоны писем для UX-ревью |
| 8 | **Decision Log** | ADR (Architecture Decision Record) | Go vs Node, Redis vs Postgres, SendGrid vs SES |
| 9 | **Risk Assessment** | Таблица | Ссылка на Risk Register (R2, R3) |

**5.2. Разбивка на Epic → Stories → Tasks**

```
Epic: NOTIF-001 — Notification Service MVP

  Story: NOTIF-001-01 — Service scaffold + infrastructure
    Task: Создать проект (Go/Node), Dockerfile, health endpoints
    Task: Добавить в docker-compose (RabbitMQ, Redis)
    Task: CI/CD pipeline (GitHub Actions)

  Story: NOTIF-001-02 — RabbitMQ consumer
    Task: Подключение к RabbitMQ (fleetmaster.events exchange)
    Task: Consumer для queue.notify.email
    Task: Consumer для queue.notify.sms (Phase 2+)
    Task: Idempotency check (Redis)
    Task: DLQ setup + dead letter consumer

  Story: NOTIF-001-03 — Email delivery
    Task: Интеграция с email-провайдером (SendGrid/SES)
    Task: Template engine (шаблоны: reminder, critical, confirmation, welcome)
    Task: Получение email через Auth Service API
    Task: Retry + circuit breaker

  Story: NOTIF-001-04 — Push notifications
    Task: VAPID key generation
    Task: Push subscription endpoint (POST /push/subscribe)
    Task: Web Push API integration
    Task: Push payload formatting

  Story: NOTIF-001-05 — In-app notification center
    Task: REST API (GET /notifications, PATCH read, POST read-all)
    Task: Redis storage для in-app уведомлений
    Task: Unread count endpoint (для badge в UI)
    Task: TTL 90 дней + cleanup job

  Story: NOTIF-001-06 — User preferences
    Task: Preferences API (GET/PUT /preferences)
    Task: Default preferences при первом запросе
    Task: Quiet hours logic
    Task: Channel routing с учётом preferences

  Story: NOTIF-001-07 — Observability
    Task: Prometheus metrics (sent, failed, retried per channel)
    Task: Structured logging
    Task: Grafana dashboard для Notification Service
```

---

### Визуализация всего флоу

```
 Фаза 1              Фаза 2                 Фаза 3                 Фаза 4           Фаза 5
 DISCOVERY           АНАЛИЗ                  ПРОЕКТИРОВАНИЕ         ВАЛИДАЦИЯ        ПЕРЕДАЧА
 3-5 дней            5-7 дней                5-7 дней               2-3 дня          1-2 дня
 ──────────          ──────────              ──────────              ──────────       ──────────

 Интервью            User Stories            Context Diagram         Review с PO      BRD
 стейкхолд.       →  + AC                →   API Contract        →   Review с Dev →   OpenAPI
 Бизнес-цели         Event Mapping           Sequence Diagrams      Review с UX      AsyncAPI
 Scope               NFR                     Data Model              Sign-off         Epic/Stories
 Конкуренты          Edge Cases              Error Handling          Open Questions   Sprint Plan
```

**Общая длительность**: ~3-4 недели (15-24 рабочих дня)
