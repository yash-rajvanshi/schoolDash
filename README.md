# Scholio Management Dashboard

[![Live Demo](https://img.shields.io/badge/Demo-Live-green)](https://scholio.vercel.app/)
Use Demo Credentials id:student@gmail.com pass:12345

SchoolDash is a modern, responsive school dashboard system built with Next.js. It features a **role-based login system** for students and teachers, offering structured access to academic and institutional information like subjects, events, teachers, and exams.

---

## ✨ Features

- 🔐 Role-based login system (Student, Teacher & Admin)
- 🧑‍🎓 Lists of students and their assigned teachers
- 📚 Subjects and who teaches what
- 📅 Upcoming events and exams
- 📊 Clean and intuitive dashboard layout
- 🌐 Live deployed frontend (Vercel)

---

## ⚙️ Tech Stack

| Category      | Technologies Used                      |
|---------------|-----------------------------------------|
| Frontend      | Next.js, JavaScript, TailwindCSS        |
| Backend       | Node.js, Express.js                     |
| Database      | MongoDB Atlas                                |
| Dev & Hosting | Git, Vercel (Frontend), Localhost       |

---

## 🎯 Purpose

The goal of this project is to streamline communication and information access between students and teachers. By centralizing academic data in a unified dashboard, schools can improve transparency, simplify access to resources, and help students stay updated on important events and exams.

---

## 🚀 Getting Started Locally

### Prerequisites:
- Node.js & npm installed
- MongoDB running (local or cloud)

### Steps:

```bash
# 1. Clone both frontend and backend repositories
git clone https://github.com/yash-rajvanshi/schoolDash.git
git clone https://github.com/yash-rajvanshi/Backend-Dashboard.git

# 2. Navigate to frontend folder and install dependencies
cd schoolDash
npm install

# 3. Start the frontend
npm run dev
# Frontend runs at: http://localhost:3000

# 4. In a new terminal, start the backend server
cd ../schoolDash-backend
node server.js
# Backend runs on: http://localhost:5000 (or as configured)
