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

| Slot ID | Time        |
|--------|-------------|
| 11-1   | 11:00–13:00 |
| 2-4    | 14:00–16:00 |
| 5-7    | 17:00–19:00 |

---

## 3.2 Rooms

- Room 1  
- Room 2  

---

## 3.3 Booking Status

| Status     | Meaning |
|------------|--------|
| HELD       | Temporary reservation during checkout (system only) |
| PENDING    | Submitted but unpaid |
| CONFIRMED  | Paid and finalized |
| CANCELLED  | Cancelled manually |
| EXPIRED    | Timed out (unpaid) |

---

## 3.4 Active Booking Definition

A slot is considered **unavailable** if there exists:

- A non-expired HELD slot  
- OR a booking with status:
  - `PENDING`
  - `CONFIRMED`

---

# 4. Booking Rules

## 4.1 Uniqueness Constraint (Critical)

Only **one active booking** is allowed per:
This must be enforced at the **database level**.

---

## 4.2 Capacity Limits

- Max 10 children  
- Max 10 adults  

Validation must occur server-side.

---

## 4.3 Package Rules

### Packages

- Solar (Mon–Thu, non-holidays)
- Solar (Fri–Sun + holidays)
- Galaxy (all days)

---

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
- Show next 4 months only
- Disable past dates

---

## Step 2: Select Slot
User selects:
- Date
- Time slot
- Room

System validates:
- Slot exists
- Slot is not already active

---

## Step 3: Package Selection
- Show available packages
- Calculate price + GST

---

## Step 4: Slot Hold

When user proceeds:

- System creates a **HELD slot**
- Expires in **10–15 minutes**

### Behavior:
- HELD slots block availability
- Expired HELD slots are ignored

---

## Step 5: Enter Details

User provides:
- Customer info
- Celebrant info
- Guest counts
- Optional notes

System validates:
- Required fields
- Capacity limits
- Package rules

---

## Step 6: Submit Booking

On submission:

- HELD slot is consumed
- Booking is created with:
  - `status = PENDING`
- Slot becomes reserved

---

## Step 7: Expiration

- PENDING bookings expire after **3 days**
- System sets status → `EXPIRED`
- Slot becomes available again

---

# 6. Admin Flow

## 6.1 Dashboard

Displays:
- Booking list
- Filters (date, room, status)
- Daily grid view

---

## 6.2 Create Booking

Admin can:
- Select slot
- Input customer data
- Create booking as:
  - `CONFIRMED` (default)
  - `PENDING`

System must:
- Validate availability

---

## 6.3 Modify Booking

Editable fields:
- Date
- Time slot
- Room
- Customer details

Rules:
- Must revalidate availability
- Cannot create conflicts unless override is enabled

---

## 6.4 Cancel Booking

- Status → `CANCELLED`
- Slot becomes available

---

## 6.5 Status Updates

Allowed transitions:

| From → To |
|----------|
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

---

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

  date: Date,
  timeSlot: "11-1" | "2-4" | "5-7",
  room: 1 | 2,

  package: "SolarMT" | "SolarFS" | "Galaxy",

  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED",

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

  paymentDueAt: Date,

  createdAt: Date,
  updatedAt: Date
}

HeldSlot {
  id: string,

  date: Date,
  timeSlot: "11-1" | "2-4" | "5-7",
  room: 1 | 2,

  expiresAt: Date
}

}
```

---

# 9. System Constraints (Critical)

## 9.1 Atomic Booking Creation

Booking creation must:

- Run inside a database transaction  
- Recheck availability before insert  

---

## 9.2 Database Constraint

The system must enforce a uniqueness constraint to prevent double bookings:

```sql
UNIQUE(date, timeSlot, room)
WHERE status IN ('PENDING', 'CONFIRMED')
```

## 9.3 Expiration Jobs

### HeldSlot Handling

- Expired HeldSlots must be ignored in availability queries  
- Optional: run a background cleanup job to delete expired records  

---

### Booking Expiration

- Identify PENDING bookings where `paymentDueAt < now`  
- Update status → `EXPIRED`  
- Expired bookings must release the reserved slot  

---

# 10. MVP Scope

## Included

- Availability view  
- Booking creation  
- Admin management  
- Conflict prevention  

---

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
