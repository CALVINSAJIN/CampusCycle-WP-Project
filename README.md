# CampusCycle

**Give. Reuse. Keep it in the Campus.** A student-only campus reuse platform for Rajagiri School of Engineering & Technology. It is not a marketplace: no prices, payments, buying or selling.

## Problem Statement
Students have textbooks, calculators and lab components they no longer need, while other students need the same items. There is no dedicated campus platform for giving away items, requesting them and connecting the two students after approval.

## Objectives
Let students give away unused items, find useful items from others, reduce waste and keep reuse inside the campus.

## Features
- Registration/login (only `@rajagiri.edu.in`), JWT auth, bcrypt hashing, protected routes
- Item listings CRUD with ownership checks (no price field)
- Search by title plus category, condition and status filters (all combinable)
- Item requests: PENDING / ACCEPTED / REJECTED, with duplicate and invalid-state checks
- Accepting a request reserves the listing and rejects other pending requests (one DB transaction)
- Contact reveal: owner's phone, email and a WhatsApp button appear only after acceptance
- Handover: `AVAILABLE -> RESERVED -> COMPLETED`
- Owner preview on each listing (name, department • RSET)
- Profile dashboard: My Items / Requests / Completed counts, My Listings, My Requests, Received Requests
- Light/dark theme (React Context + CSS variables + localStorage), toggle in the navbar
- Loading, empty and error states (with Try Again)

## Technology Stack
React + Vite + React Router + CSS · Node.js + Express · PostgreSQL · JWT + bcryptjs · REST/JSON

## Architecture
```
React page -> services/api.js -> Express route -> controller -> PostgreSQL -> JSON -> React UI
```

## Database Design
`users` has a `department` column (used by the owner preview). Conditions are stored as `LIKE_NEW`, `GOOD`, `FAIR`.

`users (1) -> (N) listings (1) -> (N) requests`, and `users (1) -> (N) requests` (requester and owner). No price column. A partial unique index blocks duplicate active requests. See `backend/schema.sql`.

## API Documentation
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| POST | /api/auth/register | No | name, email, password, phone |
| POST | /api/auth/login | No | returns JWT |
| GET | /api/auth/me | Yes | current user |
| GET | /api/listings | No | `?search=` `?category=` `?condition=GOOD` `?status=AVAILABLE` (combinable) |
| GET | /api/listings/:id | No | |
| POST | /api/listings | Yes | owner from JWT |
| PUT | /api/listings/:id | Owner | edit details |
| DELETE | /api/listings/:id | Owner | |
| PUT | /api/listings/:id/status | Owner | `COMPLETED`, only from RESERVED |
| POST | /api/requests | Yes | only AVAILABLE items, no own item, no duplicates |
| GET | /api/requests | Yes | made and received; phone/email included only when ACCEPTED |
| PUT | /api/requests/:id | Owner | ACCEPTED (transaction) or REJECTED |

Responses: `{ "success": true, "message": "...", "data": {} }` or `{ "success": false, "message": "..." }`.

## Contact Reveal
PENDING requests show "Contact details will be available after the request is accepted". Once ACCEPTED, `requestController.getMine` returns phone and email through `CASE WHEN r.status = 'ACCEPTED'`, so hidden data never reaches the browser before acceptance. The WhatsApp button opens `wa.me` with the pre-filled message "Hi, I requested your item on CampusCycle. When can I collect it?".

## Installation and Environment Setup
```bash
createdb -U postgres campuscycle
cd backend && npm install && cp .env.example .env   # fill DB_PASSWORD and JWT_SECRET
npm run db:setup                                    # schema + seed data
cd ../frontend && npm install
```

## Running the Project
```bash
cd backend && npm run dev      # http://localhost:5000/api/health
cd frontend && npm run dev     # http://localhost:5173
```
Demo login: `calvin@rajagiri.edu.in` / `password123` (all seed users share this password).

## Testing
Verified against PostgreSQL 16 while building: registration (valid, bad domain, duplicate), listing filters, ownership 403s, own-item and duplicate requests, the accept transaction, contact hidden until ACCEPTED, and handover rules. Manual checklist: register valid / invalid-domain / duplicate email; wrong login; create, edit, delete item; search + category; edit another user's item (403); request own item (400); duplicate request (409); request a RESERVED item (409); contact hidden while PENDING and shown when ACCEPTED; accept (listing RESERVED, other pending rejected); complete handover; complete an AVAILABLE item (409).

## Dark Mode
`context/ThemeContext.jsx` keeps `theme` in state, writes it to `<html data-theme>` and `localStorage`. `index.css` defines colours as CSS variables under `:root` and `[data-theme=dark]`, so every component switches without extra code. A small script in `index.html` applies the saved theme before first paint.

## Live Modification Cheat Sheet
- New field: `schema.sql` -> `listingController` (validate/INSERT/UPDATE) -> `CreateListing.jsx` -> `ListingDetails.jsx`
- New category (e.g. Sports Equipment): CHECK in `schema.sql`, `CATEGORIES` in `listingController.js`, list in `frontend/src/constants.js`
- New condition (e.g. EXCELLENT): CHECK in `schema.sql`, `CONDITIONS` in `listingController.js` and `constants.js`
- New filter (e.g. location): add one `AND ($5::text IS NULL OR l.location ILIKE '%' || $5 || '%')` line and one array value in `getAll`, then a dropdown in `FilterBar.jsx`
- Status workflow: `requestController.updateStatus` and `listingController.setStatus`

## Future Scope
In-app messaging, push/email notifications, admin moderation, item reporting, reviews and trust indicators, advanced search, department filtering, campus map, QR-based handover, analytics.
