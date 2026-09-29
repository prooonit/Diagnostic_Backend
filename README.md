# Diagnostic Booking System

## API documentation

Interactive Swagger UI is available at `GET /docs` (for example, `http://localhost:3000/docs`).
The OpenAPI 3.0.3 document is available at `GET /docs.json`.

## Assumptions

### Appointment scheduling

Customers select an appointment date and time when creating a booking. The assignment does not define doctors/providers, provider schedules, test duration, machine/resource availability, or center capacity. Therefore, the current implementation does not model real-time slot availability. The system validates the appointment timestamp but does not perform capacity-based slot allocation. This can be extended later once those business rules are defined.

## Simulated payments

`POST /payments` requires authentication and accepts a booking ID plus a simulated result (`SUCCESS` or `FAILED`). It creates a pending payment using the booking's stored amount, then simulates the provider callback through the same webhook-processing service used by `POST /payments/webhook`.

The project does not integrate a real payment gateway. The payment API simulates the external provider and triggers the same webhook-processing logic that a real provider would call. Booking confirmation is performed by webhook processing rather than directly by the payment initiation endpoint.

Payment and booking lifecycle:

```text
PENDING
  |-- SUCCESS --> Payment SUCCESS, Booking CONFIRMED
  |-- FAILED  --> Payment FAILED, Booking FAILED
```

Webhook callbacks use a unique `eventId` for idempotency. Re-delivering an already processed event returns a successful no-op response. A late event cannot transition a cancelled booking, or change a terminal successful/failed payment and booking to a conflicting state.
