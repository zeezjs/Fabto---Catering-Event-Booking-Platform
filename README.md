# Fabto---Catering-Event-Booking-Platform

[![Built with Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple?logo=bootstrap)](https://getbootstrap.com/)
[![Built with Firebase](https://img.shields.io/badge/Firebase-10.12-orange?logo=firebase)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 Overview

**Fabto** is a full-featured, production-ready web application built for a small business event planner and caterer. It bridges the gap between a beautiful brand landing page and a functional back-office tool.

The platform allows potential clients to explore services, check availability, and submit booking requests directly to the business owner, while providing a secure admin dashboard to manage all incoming leads, update booking statuses, and track event details.

> **Purpose:** This was built as a portfolio project to demonstrate proficiency in vanilla JavaScript architecture, serverless backends, and secure database design, with the real-world goal of helping a family business digitize their booking process.

**Live Demo:** https://fabto-83327.web.app

---

## ✨ Features

### 👤 Client-Facing (Public)
- **Responsive Landing Page:** Built with Bootstrap 5, featuring a hero section, services overview, testimonials carousel, and contact information.
- **Smart Booking Form:** Clients can select event types (Wedding, Corporate, Birthday), choose dates, estimate guest counts, and leave special dietary requests. 
- **Instant Confirmation:** Upon submission, users receive a success message, and the booking is securely saved to the cloud.

### 🛡️ Admin Dashboard (Private)
- **Secure Authentication:** Role-based access using Firebase Authentication (Email/Password) to protect sensitive business data.
- **Live Booking Management:** View all incoming booking requests in a sortable table with status indicators (Pending, Confirmed, Cancelled, Completed).
- **CRUD Operations:** Admin can update booking statuses and add internal notes to keep track of client conversations.

### ⚙️ Technical Highlights
- **Serverless Architecture:** Fully hosted on Firebase, eliminating server maintenance costs.
- **Security Rules:** Granular Firestore rules ensure anyone can submit a booking, but only the authenticated admin can read or modify the database.
- **Offline Persistence:** Firestore enables offline data caching, ensuring the booking form works even with spotty internet connections.
- **No Build Tools:** Uses vanilla JS and CDN imports for a lightweight, lightning-fast load time.

---

##  Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | Bootstrap 5 (CSS) + Vanilla JavaScript (ES6) |
| **Backend / Database** | Firebase Firestore (NoSQL) |
| **Authentication** | Firebase Authentication (Email/Password) |
| **Hosting** | Firebase Hosting (Global CDN) |
| **Version Control** | Git & GitHub |

---

##  Project Structure

```text
aunts-catering/
└── public/                      # Root directory served by Firebase
    ├── index.html               # Landing Page
    ├── booking.html             # Booking Form Page
    ├── admin.html               # Admin Dashboard (Protected)
    ├── css/
    │   └── style.css            # Custom overrides for Bootstrap
    ├── js/
    │   ├── config.js            # Firebase API configuration
    │   ├── firebase-init.js     # Initializes Firebase App & Services
    │   ├── landing.js           # UI interactions for the landing page
    │   ├── booking.js           # Booking form validation & Firestore submission
    │   └── admin.js             # Admin login, fetching, and updating bookings
    └── assets/
        ├── images/              # Logos, hero backgrounds, and gallery photos
        └── icons/               # Favicons and social media SVGs
