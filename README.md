# Diagnostic Booking System

## Assumptions

### Appointment scheduling

Customers select an appointment date and time when creating a booking. The assignment does not define doctors/providers, provider schedules, test duration, machine/resource availability, or center capacity. Therefore, the current implementation does not model real-time slot availability. The system validates the appointment timestamp but does not perform capacity-based slot allocation. This can be extended later once those business rules are defined.
