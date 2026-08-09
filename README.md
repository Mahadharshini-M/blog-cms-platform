# Blog / Content Management Platform

This is my submission for the Full-Stack JavaScript Developer Assessment — 
a blog and content management platform with a REST API backend and a React 
frontend. Readers can browse, search, and filter published posts, and 
there's an admin dashboard where I can create, edit, publish, or delete 
articles.

> A quick note: I finished this a bit after the original deadline. 
> Everything below is fully working and tested — I wanted to get it right 
> rather than rush the last stretch.

## Live Project

- **Frontend:** https://blog-cms-frontend-hyqg.onrender.com
- **Backend API:** https://blog-cms-backend-f2mz.onrender.com/api/posts
- **GitHub:** https://github.com/Mahadharshini-M/blog-cms-platform

Heads up — the backend runs on Render's free tier, so it spins down when 
it's idle. The first request after a while might take 30-60 seconds to 
wake it back up. Just give it a moment.

## What it does

**For readers:**
- Browse published posts
- Search by title or content, with debounced input so it doesn't hammer the API on every keystroke
- Filter by category
- Sort by newest, oldest, or title
- Paginated results
- Full post view with a cover image
- Works on mobile too, not just desktop

**For admins/authors:**
- See every post, drafts included
- Write new articles with a Markdown editor and live preview
- Edit or delete anything
- Flip a post between Draft and Published
- Filter by category and status

## A few screenshots

| Admin Dashboard | Create Article |
|---|---|
| ![Admin Dashboard](./screenshots/admin-dashboard.png) | ![New Article Form](./screenshots/new-article-form.png) |

| Article View | Category Filter |
|---|---|
| ![Article View](./screenshots/article-view.png) | ![Category Filter](./screenshots/category-filter.png) |

## What I built it with

**Frontend:** React, Vite, React Router, React Markdown
**Backend:** Node.js, Express, SQLite (via better-sqlite3)
**Deployment:** Render, with the code on GitHub

## Project layout

blog-cms/
├── backend/ Express API + SQLite database
├── frontend/ The React app
├── screenshots/ Images used in this README
└── README.md

## API

| Method | Endpoint                 | What it does                                    |
|--------|---------------------------|--------------------------------------------------|
| GET    | `/api/posts`               | List posts. Supports `search`, `category`, `status`, `sort`, `page`, `limit` |
| GET    | `/api/posts/categories`    | Returns the list of categories in use             |
| GET    | `/api/posts/:idOrSlug`     | Fetch one post, by id or slug                     |
| POST   | `/api/posts`                | Create a post                                     |
| PUT    | `/api/posts/:id`            | Update a post — including switching Draft/Published |
| DELETE | `/api/posts/:id`            | Delete a post                                     |
| GET    | `/health`                   | Basic health check                                |

One thing worth explaining: by default the API only returns Published 
posts. To see Drafts too (the admin view), the request needs an `x-admin: 
true` header, or `?admin=true` in the query string. I didn't build a full 
login system for this — more on why below.

## Running it yourself

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
npm run seed      # fills the database with sample posts
npm run dev        # runs on http://localhost:5000
```

**Frontend**, in a separate terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev        # runs on http://localhost:5173
```

The frontend points at the backend using `VITE_API_URL` — check 
`frontend/.env.example` if you need to change it.

## Pages

- `/` — the blog homepage
- `/posts/:slug` — a single article
- `/admin` — the dashboard
- `/admin/posts/new` — write a new article
- `/admin/posts/:id/edit` — edit one

## How it's put together

The React app talks to the Express API over REST. All the searching, 
filtering, sorting, and pagination happen on the backend in SQL — I 
deliberately didn't just fetch everything and filter it in the browser, 
since that doesn't scale and wasn't what the brief asked for. The database 
schema sets itself up automatically on first run, and the seed script 
gives you realistic sample data to work with right away.

## Some things I chose, and why

- **No login system.** The brief didn't require authentication, so instead 
  of building a full auth flow, the admin view is unlocked with a simple 
  header/query flag. It's not meant to be secure — in a real production 
  app I'd swap this for proper authentication guarding the admin routes 
  and API responses.
- **SQLite.** Picked mainly for how fast it is to get running locally with 
  zero setup. The tradeoff is that Render's free tier wipes the disk on 
  redeploy, so the database resets occasionally — the seed script handles 
  repopulating it.
- **Auto-generated slugs.** Titles get turned into slugs automatically, 
  and if two posts would collide, it appends something to keep them 
  unique.
- **Cover images are URLs, not uploads.** Posts store an `image_url` 
  rather than an uploaded file — simpler to implement, and it kept the 
  focus on the core CRUD and API work the assessment asked for.

## What I'd add if I kept going

- Real authentication and role-based access
- Actual image file uploads instead of URLs
- A cloud database (Postgres, probably) so data survives redeploys
- Comments and likes
- A richer editor alongside Markdown
- Tests, and a CI/CD pipeline

## About me

**Mahadharshini M**
GitHub: https://github.com/Mahadharshini-M

## Status

Done, deployed, and working. 🚀