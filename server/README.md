# Written Monolith Backend (FastAPI + SQLAlchemy + MySQL)

A clean monolith backend in Python FastAPI with MySQL and SQLAlchemy 2.0.

## Setup & Running Locally

### 1. Requirements
- Python 3.10+
- MySQL Server (running locally on port 3306 or via any MySQL connection)

### 2. Virtual Environment & Dependencies
```bash
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` matches your MySQL credentials and database name:
```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/written_db
```
*(Tip: In a local MySQL shell, run `CREATE DATABASE IF NOT EXISTS written_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`)*

### 4. Run the Seed Script
Initialize the schema and seed demo users (Alice Mercer & Bob Chen), published essays, drafts, and threaded discussions:
```bash
python seed.py
```

### 5. Start the FastAPI Server
```bash
uvicorn app.main:app --reload --port 8000
```
- API is available at: `http://localhost:8000`
- Interactive Swagger docs: `http://localhost:8000/docs`
- Redoc documentation: `http://localhost:8000/redoc`

## API Endpoints

- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`)
- `POST /api/auth/login` — Sign in (`email`, `password`)
- `GET /api/auth/me` — Current authenticated user profile
- `PATCH /api/users/me` — Update current user's profile (`name`, `bio`, `avatarUrl`)
- `GET /api/users/{id}` — Get public author profile
- `GET /api/posts` — Feed of published posts (`page`, `limit`, `search`, `authorId`)
- `GET /api/posts/mine` — Author's own posts, including drafts
- `POST /api/posts` — Create a post/draft (`title`, `content`, `excerpt`, `coverImage`, `status`)
- `GET /api/posts/{slug}` — Read post by slug (drafts return 404 to other users)
- `PATCH /api/posts/{id}` — Update post (owner only)
- `DELETE /api/posts/{id}` — Delete post and cascade delete comments (owner only)
- `GET /api/posts/{postId}/comments` — List threaded comment tree
- `POST /api/posts/{postId}/comments` — Add a comment or reply (`content`, optional `parentId`)
- `DELETE /api/comments/{id}` — Delete comment and its replies (comment author or post author)
- `GET /health` & `GET /health/deep` — Health and database readiness check
