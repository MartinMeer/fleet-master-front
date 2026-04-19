

---

## Вариант 1: Развёрнутый (для подробного описания опыта)

**Проект**: FleetMaster Pro — платформа управления автопарком (fleet management, SaaS)
**Роль**: Business Analyst / System Analyst
**Методология**: Agile (Scrum), DDD (Domain-Driven Design)

**Обязанности и достижения:**

- Провёл полный цикл аналитики для Notification Service (discovery → анализ требований → системное проектирование → валидация → передача в разработку) за 3–4 недели
- Выявил и формализовал бизнес-цели с измеримыми KPI: снижение пропущенных ТО на 30%, рост DAU/MAU на 15%, сокращение времени реакции на критические алерты до <2 часов
- Разработал User Stories с детальными Acceptance Criteria для 4 ключевых сценариев (email/push-уведомления, in-app notification center, управление предпочтениями)
- Создал Event Mapping Matrix — маппинг 6 типов доменных событий на каналы доставки с логикой дедупликации и приоритизации
- Специфицировал нефункциональные требования: availability 99.0%, zero message loss (DLQ + retry), idempotency, GDPR-совместимость (no PII stored)
- **Спроектировал топологию RabbitMQ**: topic exchange `fleetmaster.events` с гибким роутингом по routing keys, durable queues, Dead Letter Exchange для необработанных сообщений, wildcard audit queue
- **Провёл сравнительный анализ RabbitMQ vs Apache Kafka** по 10 критериям (throughput, replay, routing, operational complexity, cost). Обосновал выбор RabbitMQ для Phase 2 (event-driven notifications, 10K events/day) и определил триггеры для подключения Kafka в Phase 3 (event sourcing, ML replay, >100K events/day)
- Разработал контракт событий в формате CloudEvents v1.0 для межсервисного взаимодействия (8 типов событий)
- Спроектировал error handling & retry strategy: exponential backoff, circuit breaker, DLQ с категоризацией ошибок (5xx, 429, unrecoverable)
- Описал API-контракт (REST, 12 endpoints) для Frontend и AsyncAPI-спецификацию для event consumers
- Спроектировал data model в Redis (Sorted Sets, Hashes, TTL-based idempotency, push subscriptions)
- Создал C4 Context Diagram и Sequence Diagrams для ключевых сценариев
- Подготовил 9 выходных артефактов (BRD, OpenAPI, AsyncAPI, Data Model, Sequence Diagrams, NFR/SLA, Decision Log, Risk Assessment)
- Разбил epic на 7 stories и 25+ tasks для спринтового планирования

**Стек/инструменты**: RabbitMQ (AMQP 0.9.1), Redis, CloudEvents, OpenAPI, AsyncAPI, PlantUML/Mermaid, Confluence

---

## Вариант 2: Компактный (2–3 буллита для резюме)

**FleetMaster Pro** — SaaS-платформа управления автопарком | BA/SA

- Провёл полный цикл системной аналитики для Notification Service: от discovery и stakeholder-интервью до спецификации API-контрактов (REST + AsyncAPI), event mapping matrix и передачи в разработку (9 артефактов, 7 stories, 25+ tasks)
- Спроектировал event-driven архитектуру на RabbitMQ: топология с topic exchange, routing keys, Dead Letter Exchange, retry-стратегии с exponential backoff и circuit breaker. Провёл сравнительный анализ RabbitMQ vs Kafka, обосновал поэтапный подход с dual-broker архитектурой
- Определил NFR (availability 99.0%, zero message loss, idempotency, GDPR compliance) и data model (Redis: Sorted Sets для in-app notifications, TTL-based дедупликация, push subscriptions)

---

## Вариант 3: Фокус на RabbitMQ (для позиций, где важен опыт с MQ)

**Опыт проектирования event-driven архитектуры (RabbitMQ):**

- Спроектировал полную топологию RabbitMQ для микросервисной системы: topic exchange с dot-separated routing keys (`alert.created.critical` → SMS queue, `alert.created.*` → email queue), durable queues, Dead Letter Exchange (`fleetmaster.dlx`) для автоматического перенаправления необработанных сообщений
- Разработал контракты событий (CloudEvents v1.0) для 8 типов доменных событий между 3 сервисами-publisher и 4 consumer-очередями
- Определил стратегию обработки ошибок: exponential backoff retry (до 5 попыток), rate limit handling (Retry-After header), circuit breaker для зависимых сервисов, immediate DLQ routing для невалидных payload
- Провёл архитектурный ADR (Architecture Decision Record): RabbitMQ vs Kafka — обосновал RabbitMQ для delivery-oriented паттернов (notifications, alerts) и запланировал подключение Kafka для replay-oriented паттернов (ML training, event sourcing, audit trail) при масштабировании >100K events/day
- Спроектировал dual-broker архитектуру: RabbitMQ для real-time delivery (consume → ack → delete) + Kafka для historical replay (append-only log, consumer offset management)

---

## Ключевые слова для ATS-парсинга

Если нужно пройти автоматический скрининг резюме, убедись что в тексте есть:

`RabbitMQ` `AMQP` `Event-Driven Architecture` `Message Broker` `Dead Letter Queue (DLQ)` `Topic Exchange` `CloudEvents` `AsyncAPI` `OpenAPI` `REST API` `Redis` `Microservices` `DDD` `System Analysis` `Business Analysis` `NFR` `SLA` `User Stories` `Acceptance Criteria` `Sequence Diagram` `C4 Model` `Circuit Breaker` `Idempotency` `GDPR` `Kafka` `Saga Pattern` `BRD`

---

Какой вариант ближе к тому, что нужно? Могу адаптировать под конкретный формат резюме (hh.ru, LinkedIn, Notion, PDF) или переключить акценты (например, больше stakeholder management, или больше архитектуры).