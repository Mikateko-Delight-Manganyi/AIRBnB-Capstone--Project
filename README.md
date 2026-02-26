# Zaio Capstone Project — Airbnb Clone + Admin Dashboard

## Overview
This project is a full-stack Airbnb clone built for the Zaio Full Stack Developer Bootcamp capstone.

It includes:
- Node.js + Express backend API
- MongoDB Atlas database
- Admin frontend (manage listings + view reservations)
- Airbnb frontend (browse listings, search/filter, make reservations)

## Tech Stack
- Backend: Node.js, Express, MongoDB (Atlas), JWT Auth
- Frontend: React (Vite), Axios, React Router
- Deployment: Heroku (backend), (Frontend optional: Netlify/Vercel)

## Features
### Authentication
- Register + Login
- JWT token protection
- Role-based access (Admin vs User)

### Admin Dashboard
- Create listing
- Edit listing
- Delete listing
- View all reservations

### Airbnb Frontend
- View listings (MongoDB)
- Images displayed with fallback
- Search by location
- Price range filtering + sorting
- Reserve listing
- View “My Reservations”

## Run Locally
### 1) Backend
```bash
cd backend
npm install
npm run dev
# Admin Front-end
cd admin-frontend
nmp install
npm run dev
# AirBnB frontend
cd airbnb-frontend
npm install
npm run dev