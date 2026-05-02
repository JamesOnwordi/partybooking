# Product: Party Room Booking System

## Problem

Parents need a way to book party rooms without having to call or message staff.

## Users

* Parent (books parties)
* Staff (manages bookings)

## Core Actions

### Customer
* View availability
* Create booking
* Make a deposit
* Receive notifications

### Staff
* View all bookings
* Create bookings (if needed for walk-ins)
* Cancel bookings on behalf of customers
* Manage booking status (pending / confirmed / cancelled)

## Rules (Non-negotiable)

* No double booking
* Cannot book in the past
* Cannot book > 3 months ahead
* Booking must be tied to a valid fixed time slot
* Only confirmed bookings reduce availability
* A room can only have one CONFIRMED booking per time slot

## MVP Scope

* View availability (based on date + room + time slot + confirmed bookings)
* Create booking
* Prevent double booking (one CONFIRMED booking per room per slot)

## Later

* Payments
* Email notifications
* Add-ons/packages
