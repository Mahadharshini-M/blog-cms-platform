# Blog / Content Management Platform

A full-stack blog & CMS built for the Full-Stack JavaScript Developer assessment.

- **Backend:** Node.js, Express, SQLite (via `better-sqlite3`)
- **Frontend:** React (Vite), React Router, `react-markdown`

## Project structure

```
blog-cms/
├── backend/     Express REST API + SQLite database
└── frontend/    React app (public blog + admin/author view)
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
npm run seed     # creates data/blog.db and inserts 55 sample posts
npm run dev       # starts the API on http://localhost:5000 (or `npm start`)
```

Health check: `GET http://localhost:5000/health`

### API endpoints (mounted under `/api`)

| Method | Endpoint             | Description                                              |
| ------ | --------------------- | ---------------------------------------------------------- |
| GET    | `/api/posts`           | List posts. Query params: `search`, `category`, `status`, `page`, `limit` |
| GET    | `/api/posts/categories`| Distinct list of categories (used to populate filters)     |
| GET    | `/api/posts/:idOrSlug` | Get a single post by numeric id or slug                    |
| POST   | `/api/posts`           | Create a post                                               |
| PUT    | `/api/posts/:id`       | Update a post (including toggling `status`)                 |
| DELETE | `/api/posts/:id`       | Delete a post                                                |

**Public vs. admin visibility:** by default, only `Published` posts are returned/visible.
To view Draft posts (author/admin view), send either the header `x-admin: true`
or the query param `?admin=true`. This is a lightweight stand-in for
authentication — see "Assumptions" below.

Search (`search`) matches against title and content, server-side, using SQL `LIKE`.

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # points VITE_API_URL at the backend
npm run dev              # starts the app on http://localhost:5173
```

Open http://localhost:5173.

- `/` — public list of published posts, with debounced search + category filter and pagination
- `/posts/:slug` — full post view
- `/admin` — author/admin view: all posts (Draft + Published), filterable by status/category, with delete
- `/admin/posts/new` — create a post (Markdown editor with preview toggle, save as Draft or Publish)
- `/admin/posts/:id/edit` — edit a post, including toggling Draft ⇄ Published

## Running both at once

Two terminals (backend on :5000, frontend on :5173) is simplest. If you'd
rather run one command, install `concurrently` at the repo root and add a
script that runs both `npm run dev` commands — intentionally left out here to
keep each package self-contained per the assessment's "clean, minimal" ask.

## Assumptions

- The brief didn't specify an authentication system, so the "author/admin
  view" is gated by a simple `x-admin` flag rather than a full login system,
  to keep the focus on the CRUD/API/frontend requirements. In a production
  build this would be replaced with real authentication (e.g. JWT sessions)
  guarding the `/admin` routes and the non-public API responses.
- SQLite (file-based) was chosen over a hosted DB so the project runs
  anywhere with zero external setup — swap `DB_PATH` in `.env` to relocate it.
- Slugs are auto-generated from the title when not supplied, and de-duplicated
  automatically if a collision occurs.

## Tech notes

- All search/filter/pagination happens server-side in SQL (`WHERE`/`LIKE`/`LIMIT`/`OFFSET`) — the frontend never filters a full dataset client-side.
- Search input is debounced (400ms) before hitting the API.
- Centralized Express error handler returns consistent `{ error, details? }` JSON with appropriate HTTP status codes (400 validation, 404 not found, 409 slug conflict, 500 fallback).
