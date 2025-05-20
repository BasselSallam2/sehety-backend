# 🏥 Sehety – Clinic Booking Web Platform (Doctors & Patients)

**Sehety** is a modern web-based clinic booking system designed for doctors to publish their offers and manage appointments, and for patients to browse, select, and book with ease.

It includes a scalable backend system built with Node.js, role-based access, real-time socket communication, and a flexible architecture ready for expansion.

---

## 🔗 API Testing (Postman)

📬 [Explore the API on Postman](https://www.postman.com/enjaz7/workspace/sehety)

---

## 👨‍⚕️ Doctor Features

- Register account and clinic profile
- Create and publish clinic offers (pricing, date/time, services)
- Manage appointment requests
- Receive real-time notifications via **Firebase**
- Chat with patients using **Socket.IO**

---

## 🧑‍💼 Patient Features

- Sign up and explore clinics and doctors
- Browse active medical offers
- Book appointments instantly
- Receive appointment status updates
- Chat with clinic directly from booking interface

---

## 🧰 Backend Tech Stack

| Purpose           | Tool/Technology       |
|-------------------|------------------------|
| Runtime           | Node.js (Express.js)   |
| Database          | MySQL + Prisma ORM     |
| Authentication    | JWT + Bcrypt           |
| Realtime Chat     | Socket.IO              |
| Input Validation  | Zod                    |
| File Uploads      | Multer                 |
| Notifications     | Firebase Cloud Messaging |
| Deployment        | Hostinger VPS via SSH  |
| API Testing       | Postman Collection     |

---

## 🚀 Getting Started

```bash
git clone https://github.com/BasselSallam2/sehety-backend.git
cd sehety-backend
npm install
cp .env.example .env
npx prisma generate
npm run dev



