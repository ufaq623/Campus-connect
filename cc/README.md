# Campus Connect

A Reddit-like community platform for CS Department students.
**React + Vite + Tailwind** frontend, **Node.js + Express** REST API, **SQLite** database, **JWT** authentication, role-based access control enforced on the server.

## Run locally

Requires Node.js 18+.

```bash
npm install          # installs the root helper (concurrently)
npm run setup        # installs server/ and client/ dependencies
npm run dev          # API on :4000 + React dev server on :5173
```

Open http://localhost:5173. The SQLite database (`server/data/campus.db`) is created and seeded automatically on first start.
To test on a phone on the same Wi-Fi: `npm run dev --prefix client -- --host` and open the Network URL it prints.

Reset the database to the demo data: `npm run seed:reset`.

## Demo logins

| Role | Email | Password |
|------|-------|----------|
| Admin (HOD) | admin@campus.edu | admin123 |
| Admin (Head CR) | headcr@campus.edu | headcr123 |
| Admin (Head GR) | headgr@campus.edu | headgr123 |
| Moderator (Coding Club) | mod@campus.edu | mod123 |
| Student | student@campus.edu | student123 |
| Student | ayesha@campus.edu | ayesha123 |

HOD, Head CR and Head GR share the same Admin permissions.

## Features

- **Auth:** login, sign-up (always creates a Student), bcrypt-hashed passwords, JWT sessions.
- **Clubs:** browse, join/leave, request new clubs; admins approve/reject (approved clubs are created instantly) and assign/remove moderators.
- **Club feeds:** text posts, links, image/document uploads (5 MB), comments, threaded replies, upvote/downvote, bookmarks, pinned posts.
- **Moderators** can pin/delete posts and comments **only in their assigned clubs**; admins can do so everywhere.
- **Announcements:** admins publish (text, link, attachment) with date/time; students view.
- **Events:** upcoming/past tabs; admins create, edit, cancel.
- **Admin panel:** club requests, moderators, announcements, events, all users. Students opening `/#/admin` see "Access Denied" and the API rejects them with 403.

## Project structure

```
client/src/
  components/  Header, Sidebar, PostCard, CommentSection, forms ...
  pages/       Login, Home, Clubs, ClubDetail, RequestClub, Announcements, Events, Admin, Profile
  services/    api.js (fetch client), AppContext.jsx (state + toasts), utils.js
server/
  index.js         Express app, error handler, serves client/dist in production
  db.js            SQLite connection + schema
  seed.js          demo data
  middleware.js    JWT auth, role checks, file upload rules
  state.js         builds the JSON snapshot for GET /api/bootstrap (shaped by user role)
  routes/          auth.js, community.js, official.js, admin.js
```

## How it works

The frontend calls `GET /api/bootstrap` for everything it needs to render, and every action (post, vote, join...) is a REST call followed by a refresh.
Permissions live in `server/middleware.js` (`requireAdmin`, `canManageClub`) and are checked in each route, so hiding a button in the UI is only cosmetic.

| Method | Endpoint | Who |
|--------|----------|-----|
| POST | /api/auth/login, /api/auth/signup | public |
| GET | /api/bootstrap | logged in |
| POST/DELETE | /api/clubs/:id/join | logged in |
| POST | /api/posts, PUT /api/posts/:id/vote, POST /api/posts/:id/bookmark | logged in (posting needs club membership) |
| DELETE | /api/posts/:id, POST /api/posts/:id/pin | admin or that club's moderator |
| POST | /api/posts/:id/comments | logged in |
| DELETE | /api/comments/:id | author, admin, or that club's moderator |
| POST | /api/club-requests | logged in |
| POST | /api/club-requests/:id/review | admin |
| POST/DELETE | /api/admin/moderators | admin |
| POST/DELETE | /api/announcements | admin |
| POST/PUT | /api/events, POST /api/events/:id/cancel | admin |

## Deploy (one service for API + frontend)

Build: `npm install && npm run build`   Start: `npm start`

**Render:** New > Blueprint (uses `render.yaml`), or create a Web Service with those two commands and set `JWT_SECRET`.
**Railway:** same build/start commands; set `JWT_SECRET`.

Free tiers have an ephemeral disk, so the SQLite file and uploads reset on redeploy; the demo data re-seeds automatically.
For persistence, attach a disk/volume and set `DB_PATH` and `UPLOAD_DIR` to paths on it (see `.env.example`).
