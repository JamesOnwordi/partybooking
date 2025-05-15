# 🎉 Party Booking

A web application that allows users to easily book party rooms online, streamlining the process for both customers and staff.

## 🚀 Project Overview

Customers currently need to call or visit to book rooms. This manual process is time-consuming, error-prone, and inconvenient. This web app allows:

- Customers to view room availability and make bookings online.
- Staff to manage bookings via an admin dashboard.
- Reduction in phone traffic and manual entry errors.
- Automate the confirmation email process, reducing staff workload.
- Optional: future support for online payments.

## ✅ Goals for MVP

- Customers can book available rooms
- Admin can manage bookings
- All bookings are saved in the database
- Confirmation emails are sent out to customers

---

## 📌 Features

### Customer Side
- View available party rooms
- Submit booking requests with date/time
- Receive a confirmation email after booking

### Admin Side
- Secure login
- View all upcoming bookings
- Add, edit, or cancel bookings
- Manage room inventory (name, size, description)

---

## 🛠️ Tech Stack (Planned)

- **Frontend:** React / Next.js / HTML / CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Authentication:** (Optional) JWT or session-based auth
- **Hosting:** Vercel / Render / Railway

---

## 📐 Wireframes

- ✅ Admin Dashboard [View Wireframe](https://balsamiq.cloud/sm412ao/pe2fwn8/r2278)
- 📋 Customer Booking Flow (Coming Soon)

##  🌐 API Design (Routes & Methods)

| Method         | Route                         | Purpose                |
|----------------|-------------------------------|------------------------|
| GET            | /availability/:yyyy-mm-dd          | Get available time slots per room       |
| GET            | admin/bookings                     | Get all bookings       |
| GET            | admin/bookings/date/:yyyy-mm-dd    | Get bookings for a specific date     |
| POST           | /bookings                          | Create a new booking   |
| PATCH          | admin/bookings/:id                  | Edit booking (id)      |
| DELETE         | admin/bookings/:id                  | Delete booking (id)    |


