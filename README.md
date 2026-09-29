# Diagnostic Booking System

Backend service for authentication, diagnostic-center and test management, customer bookings, simulated payments, and payment webhooks. It is multi-tenant: a `DiagnosticCenter` is a tenant and `CenterMembership` controls center-specific access. A user can own multiple centers.

# Key Assumptions

Diagnostic Center is treated as the tenant, with center-specific authorization through CenterMembership. A user can own multiple centers and can also book tests as a customer. Customers select appointment times, but real-time slot/capacity management is outside the assignment scope. Booking amount is a price snapshot from the selected test and cannot be client-controlled. Payments are simulated, with webhook processing responsible for final payment/booking state transitions and eventId-based idempotency. Centers/tests are deactivated rather than hard deleted to preserve historical data.

## Tech stack

Node.js, Express.js, PostgreSQL, Prisma ORM, JWT, bcrypt, Docker, Docker Compose, and Swagger/OpenAPI.

## Project structure

```text
diagnostic-booking-system/
├── src/ (config, controllers, docs, middleware, routes, services, utils, validators)
├── prisma/ (migrations, schema.prisma)
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── package.json
└── README.md
```

## Run with Docker

Prerequisites: Docker and Docker Compose.

```bash
git clone https://github.com/prooonit/Diagnostic_Backend
docker compose up --build
```

This starts the Node.js/Express API and PostgreSQL. The API is at `http://localhost:3000`; PostgreSQL data persists in the `postgres_data` named volume.
## Environment variables

`.env.example` documents `PORT`, `DATABASE_URL`, `JWT_SECRET`, and `JWT_EXPIRES_IN`. Create `.env` for local application use and use a real JWT secret outside local development. Compose supplies the API container's internal database URL.

## API documentation

Swagger UI: `http://localhost:3000/docs`  
OpenAPI JSON: `http://localhost:3000/docs.json`

Swagger provides interactive documentation and JWT authorization for protected operations. Postman is also suitable for manual API verification.

## API endpoints

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive a JWT |
| GET | `/auth/me` | Get the authenticated user |

### Diagnostic Centers

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/centers` | Create a diagnostic center |
| GET | `/centers` | List active centers with search and pagination |
| GET | `/centers/:slug` | Get an active diagnostic center |
| PATCH | `/centers/:slug` | Update a diagnostic center |
| PATCH | `/centers/:slug/status` | Activate/deactivate a center |

### Diagnostic Tests

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/centers/:slug/tests` | Create a diagnostic test |
| GET | `/centers/:slug/tests` | List active tests with search and pagination |
| GET | `/centers/:slug/tests/:testId` | Get an active diagnostic test |
| PATCH | `/centers/:slug/tests/:testId` | Update a diagnostic test |
| PATCH | `/centers/:slug/tests/:testId/status` | Activate/deactivate a test |

### Bookings

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/bookings` | Create a booking |
| GET | `/bookings` | List the authenticated user's bookings |
| GET | `/bookings/:id` | Get an owned booking |
| PATCH | `/bookings/:id/cancel` | Cancel a pending booking |

### Payments

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/payments` | Create a simulated payment |
| POST | `/payments/webhook` | Process a payment webhook |

## Authentication and authorization

JWT bearer authentication protects user, management, booking, and payment endpoints. Roles are center-specific: `CenterMembership` stores the current `OWNER` role, not `User`. Owning one center grants no access to another. Customers can book active public tests without membership, but can access only their own bookings.

## Database design

`User` stores application users; `DiagnosticCenter` is a tenant; `CenterMembership` stores the user-to-center role; `DiagnosticTest` belongs to one center; `Booking` records a customer's test booking; `Payment` is the payment for that booking; and `WebhookEvent` stores webhook/idempotency data.

Important decisions: users can own multiple centers; booking stores `centerId` for tenant isolation/history; booking amount snapshots the test price; `Payment.bookingId` is unique; `WebhookEvent.eventId` is unique; and centers/tests are deactivated rather than deleted.

### Database Diagram

The [Prisma schema](prisma/schema.prisma) is the source of truth for database relationships.
<img width="1656" height="948" alt="Diagnostic DB Diagram" src="https://github.com/user-attachments/assets/e051705b-637d-4ea5-abc3-1d7f781b7cbd" />


## Appointment scheduling

Customers select an appointment timestamp. The assignment does not define providers, schedules, test duration, machines/resources, or center capacity; the API validates the timestamp but does not allocate real-time slots. Availability management can be added once those rules are defined.

## Simulated payments

No real payment gateway is integrated. `POST /payments` accepts a booking ID and a simulated result. A booking starts `PENDING`; the payment uses the booking's stored amount, then webhook processing performs the final transition.

```text
PENDING
  +-- SUCCESS --> Payment SUCCESS, Booking CONFIRMED
  +-- FAILED  --> Payment FAILED,  Booking FAILED
```

Clients cannot choose payment amount. Payment and booking state changes are webhook-driven.

## Webhook idempotency

Each webhook has a unique `eventId`, backed by the `WebhookEvent.eventId` constraint. Repeated delivery is a safe no-op; it cannot duplicate records or corrupt state. Conflicting terminal transitions are rejected, and late webhooks cannot confirm cancelled bookings.

## Important business rules

- Booking amount is copied from diagnostic-test price.
- Booking creation rejects client-controlled `amount`, `status`, `userId`, and `centerId`.
- Booking access is scoped to the authenticated user.
- Center/test management is scoped to membership in that center; cross-tenant access is prevented.
- Historical bookings are preserved, and a booking has at most one payment.

## Manual verification

Verify manually in Swagger/Postman: authentication and invalid credentials, duplicate registration, missing/invalid JWTs, center/test authorization, cross-tenant access, search/pagination, invalid bookings, booking ownership/cancellation, payment success/failure and ownership, repeated/invalid/conflicting webhooks, late webhooks for cancelled bookings, Docker startup, and database persistence.

## Error handling

`400` validation or invalid state; `401` authentication failure; `403` forbidden center operation; `404` missing/inaccessible resource; `409` duplicate/conflicting operation; `500` unexpected server error.

## Docker architecture

```text
Docker Compose
├── API: Node.js + Express + Prisma (port 3000)
└── PostgreSQL: separate service with named volume
```

The API connects to PostgreSQL at `postgres:5432`. PostgreSQL has a healthcheck, and Compose waits for it before starting the API.

## Improvements with more time

- Real payment gateway and appointment capacity management
- Redis caching/rate limiting and background processing
- Production logging, monitoring, deployment, and observability
- For Now there is only one role which is of Owner but we can extend to  Additional center roles (ADMIN, MANAGER, STAFF)
- Automated integration tests
