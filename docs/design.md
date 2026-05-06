# 📄 Party Room Booking System — Product Requirements Document (PRD)

---

# 1. Product Overview

The Party Room Booking System is a self-service web application that allows customers to book party rooms at a playground without staff assistance.

The system replaces manual booking workflows with a structured, rule-based system that ensures:
- Real-time availability
- No double bookings
- Consistent booking rules
- Reduced operational overhead

---

# 2. Users

## 2.1 Customer (Parent)
Customers can:
- Browse availability
- Create bookings
- Enter event details

## 2.2 Admin (Staff)
Admins can:
- View all bookings
- Create/edit/cancel bookings
- Manage booking statuses
- Monitor daily occupancy

---

# 3. Core Concepts

## 3.1 Time Slots (Fixed for MVP)

The system defines availability using configurable time rules, not hardcoded slots.

```javascript
availabilityRules: [
  { start: "11:00", end: "13:00" },
  { start: "14:00", end: "16:00" },
  { start: "17:00", end: "19:00" }
]
```

Storage location:
Admin dashboard (preferred)
database config collection (MVP)

Key principle:

Business can modify availability rules without code changes or schema updates.

## 3.2 Rooms

- Room 1  
- Room 2  

## 3.3 Booking Status

| Status     | Meaning |
|------------|--------|
| HELD       | Temporary reservation during checkout (system only) |
| PENDING    | Submitted but unpaid |
| CONFIRMED  | Paid and finalized |
| CANCELLED  | Cancelled manually |
| EXPIRED    | Timed out (unpaid) |

## 3.4 Active Booking Definition

A slot is considered **available** if there exists:

- A booking where status:
  - `PENDING`
  - `CONFIRMED`
- OR a booking with :
  - `status = HELD` AND `expiresAt > now`
 
```js
{
  startTime,
  room,
  $or: [
  { status: { $in: ["PENDING", "CONFIRMED"] } },
    {
      status: "HELD",
      expiresAt: { $gt: now }
    }
  ]
}
```
 
## 3.5 Booking Window

- Maximum booking window: **3 months in advance**

Definition:
- Customers can only create bookings for dates within 3 months from the `startTime >= now + 2 days`
- Admins can only create bookings for dates within 3 months from the current `startTime >= now `

---

# 4. Booking Rules

## 4.1 Uniqueness Constraint

Only **one active booking** is allowed per room in a timeslot:
This must be enforced at the **database level**.

## 4.2 Capacity Limits

- Max 10 children  
- Max 10 adults  

Validation must occur server-side.

## 4.3 Package Rules

### Packages

- Solar (Mon–Thu, non-holidays)
- Solar (Fri–Sun + holidays)
- Galaxy (all days)

### Galaxy Package Requirements

If `package = Galaxy`:

Required fields:
- pizza1: `"cheese"` | `"pepperoni"`
- pizza2: `"cheese"` | `"pepperoni"`

Rules:
- Both fields are required
- Must be valid values
- Must be `null` for non-Galaxy bookings

---

# 5. Booking Flow (Customer)

## Step 1: Select Date
- Show next 3 months only (based on booking window constraint)
- Disable past dates

## Step 2: Select Slot
User selects:
- Date
- Time slot
- Room
- packages
  
Calculate price + GST

## Step 3: Slot Hold

When the user proceeds:

System validates:
- Slot exists
- Slot is not already active

- Booking is created with:
  - `status = HELD`
- Expires in **10–15 minutes**

### Behavior:
- HELD slots block availability
- HELD bookings include `expiresAt`
- A HELD booking is only valid if `expiresAt > now`
- Expired HELD bookings:
  - Must be ignored in availability queries
  - May be cleaned up asynchronously (optional, not required for correctness)

## Step 4: Enter Details

User provides:
- Customer info
- Celebrant info
- Booking info
- Optional notes (later)

System validates:
- Required fields
- Capacity limits
- Package rules

## Step 5: Submit Booking

On submission:

- System sets status → `PENDING`
- Slot becomes reserved

## Step 6: Expiration

- PENDING bookings expire after **3 days**
- System sets status → `EXPIRED`
- Slot becomes available again

---

# 6. Admin Flow

## 6.1 Dashboard

Displays:
- Booking list
- Filters (startTime, endTime, status)
- Daily grid view

## 6.2 Create Booking

Admin can:
- Select slot
- Input customer data
- Create booking as:
  - `PENDING` (default)
  - `CONFIRMED`
    
System must:
- Validate availability

## 6.3 Modify Booking

Editable fields:
- Date
- Time slot
- Room
- Customer details

Rules:
- Must revalidate availability
- Cannot create conflicts unless override is enabled

## 6.4 Cancel Booking

- Status → `CANCELLED`
- Slot becomes available

## 6.5 Status Updates

Allowed transitions:

| From → To |
|----------|
| HELD → PENDING |
| HELD → EXPIRED |
| PENDING → CONFIRMED |
| PENDING → CANCELLED |
| PENDING → EXPIRED |
| CONFIRMED → CANCELLED |

All changes must:
- Trigger availability recalculation

---

# 7. Availability Logic

## 7.1 Slot is UNAVAILABLE if:

- A non-expired HELD slot  
- OR a booking with:
  - `PENDING`
  - `CONFIRMED`

## 7.2 Priority (for UI)

| Priority | State |
|---------|------|
| 1 | CONFIRMED |
| 2 | PENDING |
| 3 | HELD |
| 4 | AVAILABLE |

---

# 8. Data Model (MVP)

```js
Booking {
  id: string,

  startTime: Date,  // stored in UTC

  endTime: Date, // stored in UTC

  room: 1 | 2,

  package: "SolarMT" | "SolarFS" | "Galaxy",

  status: "HELD" | "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED",

  customer: {
    firstName: string,
    lastName: string,
    phone: string,
    email: string
  },

  celebrant: {
    name: string,
    gender: "Male" | "Female",
    ageTurning: number
  },

  guests: {
    kids: number,
    adults: number
  },

  galaxyExtras: {
    pizza1: "cheese" | "pepperoni" | null,
    pizza2: "cheese" | "pepperoni" | null
  },

  expiresAt: Date,

  paymentDueAt: Date,

  idempotencyKey: string, // unique per booking submission attempt

  createdAt: Date,

  updatedAt: Date
}
```

---

# 9. System Constraints

## 9.1 Booking Creation Strategy

Booking creation must ensure correctness using:

- Business rule validation
- Application-level conflict detection
- Atomic database writes (for race condition safety)

Step 1: Business Rule Validation

Validate:
-booking is within availabilityRules
-booking is within booking window
-package rules

Step 2: Conflict Detection (Application Layer)

A booking is considered conflicting if:

```js
existing.startTime < newEnd &&
existing.endTime > newStart
```
Query:
```js
await Booking.findOne({
  room,
  status: { $in: ["HELD", "PENDING", "CONFIRMED"] },
  startTime: { $lt: newEnd },
  endTime: { $gt: newStart },
});
```

Step 3: Atomic Booking Insert (Race Condition Handling)

To prevent double booking under concurrency:

- Use transaction OR retry-safe insert
- Do NOT rely on uniqueness constraints for time ranges

```js
await Booking.create({
  room,
  startTime,
  endTime,
  status: "HELD",
  expiresAt,
  idempotencyKey
});
```

If a conflict is detected:
- return error
- client retries or refreshes availability

Step 4: System Guarantees

The system guarantees:

- No double booking via application checks
- No duplicate requests via idempotency key
- No stale holds via TTL expiration

## 9.2 Data Integrity Strategy

MongoDB does not support range-based uniqueness constraints.

Therefore, data integrity is ensured using:

- application-level overlap detection
- idempotency key uniqueness
- atomic document writes
- TTL-based lifecycle cleanup

## 9.3 Expiration Jobs

### Held Slot Handling

- HELD bookings include `expiresAt`
- A HELD booking is **only active if**:
  - `expiresAt > now`

- Expired HELD bookings:
  - Must be ignored in availability queries
  - Are automatically removed via TTL index (see Section 9.4)

### Booking Expiration (PENDING → EXPIRED)

- Identify PENDING bookings where:
  - `paymentDueAt < now`

- Update:
  - `status → EXPIRED`

---

### Rules

- Expired bookings must:
  - Release the reserved slot immediately

- Expired bookings:
  - **Must NOT be deleted**
  - Must remain for admin visibility and reporting

## 9.4 TTL Indexes (MongoDB)

```mongodb
bookingSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
)
```
Notes:
- TTL index applies to all documents with `expiresAt`
- Only HELD bookings should have `expiresAt` set
- Other bookings must have `expiresAt = null`
- Used for automatic cleanup
- NOT used for availability logic
- Expired HELD bookings must still be ignored via:
  - `expiresAt > now`

## 9.5 Idempotency (Duplicate Submission Protection)

To prevent duplicate bookings caused by repeated client requests:

### Requirements

- Each booking request must include a unique `idempotencyKey` (UUID)
- The key is generated on the frontend per submission attempt

### Backend Behavior

- Before creating a booking:
  - Check if a booking exists with the same `idempotencyKey`

- If found:
  - Return the existing booking (do NOT create a new one)

- If not found:
  - Proceed with normal booking creation

### Database Constraint

- `idempotencyKey` must be unique

```js
bookingSchema.index(
  { idempotencyKey: 1 },
  { unique: true }
)
```

Notes
- Prevents duplicate bookings from:
  - Double-clicks
  - Network retries
  - Client timeouts
- Works alongside (not instead of) the slot uniqueness constraint

## 9.6 Booking Window Constraint

### Rules

A booking date must satisfy:
  
Customers:
- today + 2 days <= startTime <= today + 3 months

Admins:
- today <= startTime <= today + 3 months

### Enforcement

- Must be validated on the server before booking creation
- Applies to:
  - Customer bookings
  - Admin bookings

## 9.7 Indexing Strategy
The following indexes must be created for performance:

```js

```js
bookingSchema.index({ room: 1, startTime: 1, endTime: 1 });

bookingSchema.index({ idempotencyKey: 1 }, { unique: true });

bookingSchema.index({ status: 1, expiresAt: 1 });

bookingSchema.index({ room: 1, status: 1, startTime: 1, endTime: 1 });
```

---

# 10. MVP Scope

## Included

- Availability view  
- Booking creation  
- Admin management  
- Conflict prevention  

## Not Included

- Payments  
- Notifications  
- Waitlist  
- Add-ons  

---

# 11. Future Enhancements

## Payments & Revenue

- Payment integration (deposits and refunds)  

## Communication

- Email notifications  
- SMS notifications  

## Operations

- Waitlist system  

## Analytics

- Analytics dashboard  

## Flexibility

- Configurable/flexible time slots  
