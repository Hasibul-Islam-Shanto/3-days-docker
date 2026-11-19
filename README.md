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
