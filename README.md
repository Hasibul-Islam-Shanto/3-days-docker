# Written (Monolith)

A publishing web application built with **React** and **Python FastAPI**, running against **MySQL**.

This project is a clean monolith refactor of the microservices architecture, featuring:
- **`client/`**: React 19 frontend with Vite 6, Tailwind CSS 4, React Router 7, and TanStack Query 5.
- **`server/`**: Python FastAPI monolith backend with SQLAlchemy 2.0 and MySQL.
- **Unified Relational Database**: True SQL Foreign Keys with cascading deletes (`posts.author_id -> users.id`, `comments.post_id -> posts.id`, `comments.parent_id -> comments.id`).
- **Zero Docker required**: Easy to run locally on your host machine.

---

## Project Structure

```
.
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # UI components, layout, cards, Markdown renderer
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── lib/api.ts          # API client configured for FastAPI endpoints
│   │   ├── pages/              # Home, Editor, Dashboard, Settings, etc.
│   │   └── types.ts            # Data models and interfaces
│   ├── package.json
│   └── vite.config.ts          # Proxies /api to http://localhost:8000
│
├── server/                     # FastAPI Monolith Backend
│   ├── app/
│   │   ├── main.py             # FastAPI entrypoint, CORS, custom error handlers
│   │   ├── config.py           # Pydantic settings & environment configuration
│   │   ├── database.py         # SQLAlchemy engine, session maker, get_db
│   │   ├── models/             # User, Post, Comment SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic validation schemas
│   │   ├── auth/               # JWT token issuance, verification, bcrypt password hashing
│   │   ├── routers/            # Auth, Users, Posts, Comments, Health routes
│   │   └── utils/              # Slug generation, excerpt, reading time, tree builder
│   ├── seed.py                 # Standalone idempotent demo data seeder
│   ├── alembic.ini             # Database migration configuration
│   └── requirements.txt
│
└── written/                    # Original reference microservices codebase
```

---

## Quick Start

### 1. Start the Backend (`server/`)

Make sure your MySQL server is running (e.g. `mysql.server start` or via Homebrew `brew services start mysql`).

```bash
cd server

# Setup virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Copy environment config
cp .env.example .env

# Seed initial database schema and demo accounts (Alice & Bob)
python seed.py

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```
- API is running at: `http://localhost:8000`
- Interactive API docs (Swagger): `http://localhost:8000/docs`

### 2. Start the Frontend (`client/`)

In another terminal window:

```bash
cd client
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## Demo Credentials

The database seeder (`server/seed.py`) creates:

| User | Email | Password | Role |
| --- | --- | --- | --- |
| Alice Mercer | `alice@example.com` | `Password123!` | Author (5 essays, 1 draft) |
| Bob Chen | `bob@example.com` | `Password123!` | Reader & Commenter |

---

## Key Features

- **Reader Feed**: Browse published essays with search, pagination, reading time estimates, and author bylines.
- **Markdown Editor**: Write essays and drafts with live preview.
- **Draft Management**: Save private drafts, publish them, or withdraw published posts.
- **Threaded Discussions**: Nested comment trees with moderation support.
- **Author Dashboard**: Overview of published essays, drafts, and responses.
- **Light/Dark Mode**: Persistent theme toggle with custom typography.

---

## 🐳 Day 1: Docker Fundamentals & Container Optimization

Comprehensive containerization and hardening of both the **React Frontend** (`client/`) and **FastAPI Backend** (`server/`).

### Checklist of Completed Milestones

- [x] **Build initial single-stage images and record size**
  - Created base `Dockerfile.single` files for both client (Node.js) and server (Python).
- [x] **Optimize using multi-stage builds & appropriate layer ordering**
  - Implemented `Dockerfile.multi` and `Dockerfile.optimize` separating the heavy build environment from the minimal runtime environment.
  - Placed dependency definitions (`package*.json`, `requirements.txt`) before source code to maximize Docker layer cache hits.
- [x] **Run application as a non-root user**
  - Client: Configured Nginx to run under unprivileged user `nginx` (UID 101) with pre-created permissions for PID, cache, and logs on port `8080`/`3000`.
  - Server: Created a dedicated system user/group (`appuser` UID 10001) with `/sbin/nologin` shell for secure non-root execution.
- [x] **Add `.dockerignore` files**
  - Configured project-wide and per-service `.dockerignore` files excluding `node_modules/`, `venv/`, `__pycache__/`, `.env`, and OS files (`.DS_Store`).
- [x] **Inspect image layers and build cache**
  - Enabled BuildKit cache mounts (`--mount=type=cache`) for `npm` and `pip` to eliminate redundant package downloads across rebuilds.
- [x] **Test container exit codes, logs, and filesystem permissions**
  - Added `PYTHONUNBUFFERED=1` for instant log streaming without buffer drops.
  - Set `PYTHONDONTWRITEBYTECODE=1` to prevent unauthorized `.pyc` writes in unprivileged filesystems.
  - Added native container health checks (`wget --spider` for Nginx, standard `urllib.request` for FastAPI `/health`).
- [x] **Compare initial vs. optimized image sizes**
  - Verified substantial disk footprint reduction and reduced security attack surface.

---

### Image Size Comparison

| Application | Single-Stage (`Dockerfile.single`) | Optimized Multi-Stage (`Dockerfile.optimize`) | Size Reduction | Key Advantage |
|---|---|---|---|---|
| **Client** (React / Vite) | **~1.15 GB** | **~28 MB** | **~97.5%** | Strips out Node.js runtime and devDependencies; serves static assets via Nginx. |
| **Server** (FastAPI / Python) | **~580 MB** | **~210 MB** | **~64%** | Strips out pip caches, build tools; isolates dependencies in `/opt/venv`. |

---

### Dockerfile Evolution Reference

Each service contains three progression stages for learning and reference:

1. **`Dockerfile.single`**:
   - Simple, developer-oriented single stage container.
   - Great for fast prototyping, but heavy and runs as root.
2. **`Dockerfile.multi`**:
   - Multi-stage pattern separating builder from runtime.
   - Drastically cuts image size and isolates runtime dependencies.
3. **`Dockerfile.optimize`**:
   - **Production-ready**: Non-root user + BuildKit caching + native health check + optimized runtime environment flags.

