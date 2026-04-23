# 📄 Party Room Booking System — Product Requirements Document (PRD)

---

# 1. Product Overview

The Party Room Booking System is a self-service platform that allows parents to book party rooms at a playground without needing to contact staff directly.

It replaces manual booking methods (calls/messages) with a structured digital system that provides:

- Real-time availability
- Standardized booking rules
- Reduced staff workload
- Controlled scheduling logic

The system supports two roles:
- Parents (customers)
- Staff (administrators)

---

# 2. Problem Statement

Current booking operations are manual and result in:

- Slow response times
- Double bookings and human error
- High staff workload during peak periods
- No real-time visibility of availability

---

# 3. Goals & Objectives

## Primary Goals
- Enable self-service booking for parents
- Prevent double bookings through system enforcement
- Provide real-time availability
- Standardize booking rules and packages

## Secondary Goals
- Reduce staff workload
- Improve operational efficiency
- Support future expansion (payments, notifications, analytics)

---

# 4. User Roles

## 4.1 Parent (Customer)
Parents can:
- View available dates, rooms, and time slots
- Create bookings
- Submit personal and event details
- Receive booking confirmations (future feature)

## 4.2 Staff (Admin)
Staff can:
- View all bookings
- Create bookings for customers
- Modify or cancel bookings
- Manage daily operations
- Monitor occupancy and availability

---

# 5. Core User Flows

---

# 5.1 Customer Booking Flow

## Step 1: Date Selection
- Calendar shows next 4 months only
- Past dates are disabled

---

## Step 2: Availability Selection

System displays:
- Time slots
- Room 1 and Room 2 availability

### Fixed Time Slots
- 11:00 – 13:00
- 14:00 – 16:00
- 17:00 – 19:00

### Rules
- Each room allows 1 booking per time slot per day

User selects:
- Date
- Time slot
- Room

System validates:
- Slot exists
- Date is valid
- Room is available

---

## Step 3: Package Selection

Available packages:

- Solar Package (Mon–Thu, excluding holidays)
- Solar Package (Fri–Sun and holidays)
- Galaxy Package (all days)

System displays:
- Base price
- Taxes (GST)
- Optional add-ons (future)

---

## Step 4: Booking Hold

When user proceeds:

- Booking is created with status `HELD`
- Slot is temporarily reserved
- Hold expires after 10–15 minutes if not completed

---

## Step 5: Customer Information

User provides:
- Name
- Contact details
- Number of children
- Number of adults
- Special requests (optional)

### Validation Rules
- All required fields must be completed
- Maximum capacity:
  - 10 children (including birthday child)
  - 10 adults

---

## Step 6: Confirmation

Upon submission:
- Booking status becomes `CONFIRMED`
- Slot is permanently reserved
- Confirmation is displayed

---

## Step 7: Notifications (Future)
- Email/SMS confirmation
- Staff dashboard updates

---

# 5.2 Staff Flow

## 1. Dashboard Overview
Staff can view:
- All bookings
- Filters: date, room, status
- Daily occupancy grid

---

## 2. Manual Booking Creation

Steps:
1. Select date
2. Select room and time slot
3. Validate availability
4. Enter customer details
5. Create a booking as:
   - CONFIRMED (default)
   - PENDING (if required)

Note: Staff-created bookings bypass HELD and are directly created in PENDING or CONFIRMED state.

---

## 3. Booking Management

### View Details
- Customer info
- Room and slot
- Package
- Status

### Modify Booking
- Change date
- Change room
- Update details

### Cancel Booking
- Status → `CANCELLED`
- Slot becomes available again

---

## 4. Daily Operations View

Grid view:
- Rows = time slots
- Columns = Room 1 / Room 2

Status per cell:
- Available
- Pending
- Confirmed

---

## 5. Status Management

Staff can update booking status at any time, including:

- PENDING → CONFIRMED
- PENDING → CANCELLED
- CONFIRMED → CANCELLED
- CONFIRMED → PENDING (if correction is needed)
- PENDING → EXPIRED (system or manual override)

All status changes must:
- be logged for audit purposes (later)
- trigger availability recalculation
- HELD status is system-managed only and cannot be created or modified manually by staff.

---

# 6. Business Rules

## Booking Rules

An ACTIVE booking is any booking with status:
- HELD
- PENDING
- CONFIRMED

Only one ACTIVE booking is allowed per room per time slot per date.

Any ACTIVE booking blocks availability.

---

## Capacity Rules
- Max 10 children per booking
- Max 10 adults per booking

---

## Package Rules

### Galaxy Package

When `package = "Galaxy"`:

- Customer receives 2 pizzas total
- For EACH pizza, the customer must choose:
  - Cheese OR Pepperoni

### Required Inputs
- pizza1: "cheese" or "pepperoni"
- pizza2: "cheese" or "pepperoni"

### Rules:
- Both fields must be either:
  - "cheese"
  - "pepperoni"
- Fields must be null for non-Galaxy packages

---

# 7. Booking Lifecycle

## HELD
- Temporary system lock while the customer is completing the booking form
- Prevents double selection of the same slot
- Expires automatically after 10–15 minutes
- If expired → slot becomes available again

## PENDING
- Booking has been created, but the deposit has not been paid yet
- Can be cancelled or expire if payment is not completed within the allowed time window (3 days)

## CONFIRMED
- Deposit paid and booking is finalized
- Slot is permanently reserved

## CANCELLED
- Booking is manually or automatically cancelled
- Slot becomes available again

## (Future) EXPIRED
- PENDING bookings that were not completed in time
---

# 8. Data Model (MVP)

```js
Booking {
  date: Date,

  timeSlot: "11-1" | "2-4" | "5-7",

  room: 1 | 2,

  package: "SolarMT" | "SolarFS" | "Galaxy",

  status: "HELD" | "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED",

  customer: {
    first_name: string,
    last_name: string,
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

  createdAt: Date,
  updatedAt: Date
}
```

---

# 9. Availability Logic

A room slot is considered available if no booking exists with the status:
- HELD
- PENDING
- CONFIRMED

### Notes:
- HELD blocks the slot temporarily during form completion
- PENDING reserves the slot after submission but before payment
- CONFIRMED permanently reserves the slot

---

## 10. System Constraints and Consistency

To prevent race conditions and inconsistent states:

- Booking creation must be atomic
- Only one CONFIRMED booking is allowed per combination of:
  room + timeSlot + date
- Server must validate availability before creating a booking
- Validation must be performed inside a transaction to prevent race conditions

---

## 11. MVP Scope

### Included in MVP
- View availability
- Create bookings
- Enforce the no double booking rule
- Fixed rooms and time slots

### Not included in MVP
- Payments
- Notifications (email/SMS)
- Waitlists
- Advanced add-ons/customizations (beyond fixed packages)

---

## 12. Future Improvements

### Payments & Revenue
- Payment integration (deposits and refunds)

### Communication
- Email/SMS notifications

### Operations
- Waitlist system for full slots
- Admin dashboard improvements

### UX Enhancements
- Calendar-based UI (weekly/monthly view)

### Analytics
- Booking analytics for staff

### Data model
- paymentStatus
- heldExpiresAt
- paymentDueAt
