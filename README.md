# 🖋️ Written — 3-Tier Publishing Platform & Docker Mastery

> A full-stack publishing web application built with **React 19**, **FastAPI**, and **MySQL 8.0**, crafted as a real-world case study for **complete production Docker containerization, multi-service orchestration, CI/CD automation, and cloud-ready operations**.

---

## 📑 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Repository Structure](#-repository-structure)
- [Running Guide](#-running-guide)
  - [1. Running Locally (Host Machine / Zero Docker)](#1-running-locally-host-machine)
  - [2. Running with Standalone Docker Containers](#2-running-with-standalone-docker-containers)
  - [3. Running with Docker Compose (Recommended)](#3-running-with-docker-compose-recommended)
- [Demo Credentials](#-demo-credentials)
- [Docker Mastery Series](#-docker-mastery-series)
  - [🐳 Day 1: Docker Fundamentals & Image Optimization](#-day-1-docker-fundamentals--container-optimization)
  - [🚀 Day 2: Multi-Service Orchestration & Networking](#-day-2-multi-service-orchestration--troubleshooting)
  - [🛡️ Day 3: CI/CD Automation, Hardening & Rollback](#️-day-3-cicd-automation-security-hardening-observability--rollback-strategy)

---

## 🛠️ Tech Stack

### Frontend Client
| Technology | Badge / Icon | Purpose |
|---|---|---|
| **React 19** | ![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB) | Single-page application UI with concurrent features |
| **Vite 6** | ![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=flat-square&logo=vite&logoColor=white) | Next-generation ultra-fast frontend build tooling |
| **TypeScript** | ![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white) | End-to-end static type safety |
| **Tailwind CSS 4** | ![Tailwind](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) | Modern utility-first styling with dark/light themes |
| **TanStack Query 5**| ![React Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=react-query&logoColor=white) | Asynchronous server state and API caching |

### Backend API Server
| Technology | Badge / Icon | Purpose |
|---|---|---|
| **Python 3.13** | ![Python](https://img.shields.io/badge/Python_3.13-3776AB?style=flat-square&logo=python&logoColor=white) | Modern, fast runtime environment |
| **FastAPI** | ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) | High-performance asynchronous REST API framework |
| **SQLAlchemy 2.0**| ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy_2.0-D71F00?style=flat-square&logo=python&logoColor=white) | Python SQL toolkit and Object Relational Mapper |
| **Pydantic v2** | ![Pydantic](https://img.shields.io/badge/Pydantic_v2-E92063?style=flat-square&logo=pydantic&logoColor=white) | High-speed data parsing and validation |
| **Uvicorn** | ![Uvicorn](https://img.shields.io/badge/Uvicorn-499848?style=flat-square&logo=gunicorn&logoColor=white) | Lightning-fast ASGI server implementation |

### Database, Reverse Proxy & DevOps
| Technology | Badge / Icon | Purpose |
|---|---|---|
| **MySQL 8.0** | ![MySQL](https://img.shields.io/badge/MySQL_8.0-4479A1?style=flat-square&logo=mysql&logoColor=white) | ACID-compliant relational database with foreign keys |
| **Nginx** | ![Nginx](https://img.shields.io/badge/Nginx_Alpine-009639?style=flat-square&logo=nginx&logoColor=white) | Unprivileged reverse proxy and static asset web server |
| **Docker** | ![Docker](https://img.shields.io/badge/Docker_26+-2496ED?style=flat-square&logo=docker&logoColor=white) | Multi-stage image builds, BuildKit caching & layer tuning |
| **Docker Compose**| ![Compose](https://img.shields.io/badge/Docker_Compose_v2-2496ED?style=flat-square&logo=docker&logoColor=white) | Multi-tier network segmentation & resource management |
| **GitHub Actions**| ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white) | Automated CI/CD pipeline, image verification & publishing |
| **Docker Hub** | ![Docker Hub](https://img.shields.io/badge/Docker_Hub-2496ED?style=flat-square&logo=docker&logoColor=white) | Immutable SHA-tagged container image registry |

---

## 🏛️ Project Architecture

```mermaid
graph TD
    User["Host Browser (http://localhost:3000)"] -->|Port 3000:3000| Client["written-client (React SPA + Nginx)"]
    Client -->|Reverse Proxy /api/*| Server["written-server (FastAPI Backend :8080)"]
    Server -->|Internal DNS db:3306| DB[("written-db (MySQL 8.0 :3306)")]
    DB --- Volume[("Named Volume: db_data")]

    subgraph "Frontend Tier (frontend-tier network)"
        Client
        Server
    end

    subgraph "Backend Tier (backend-tier network)"
        Server
        DB
    end

    classDef network fill:#f9f9f9,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;
    classDef service fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef db fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    class Client,Server service;
    class DB,Volume db;
```

---

## 📂 Repository Structure

```
.
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # Automated CI/CD: lint, test, SHA-tag & Docker Hub push
├── client/                     # React 19 Frontend
│   ├── src/                    # Components, pages, context, hooks
│   ├── nginx.conf              # Reverse proxy config (/api -> server:8080)
│   ├── Dockerfile.single       # Baseline single-stage build (~1.15 GB)
│   ├── Dockerfile.multi        # Multi-stage build
│   ├── Dockerfile.optimize     # Production build: non-root nginx UID 101 (~28 MB)
│   └── package.json
│
├── server/                     # FastAPI Backend
│   ├── app/                    # Routers, models, schemas, database, auth
│   ├── seed.py                 # Idempotent demo database seeder
│   ├── Dockerfile.single       # Baseline single-stage build (~580 MB)
│   ├── Dockerfile.multi        # Multi-stage build
│   ├── Dockerfile.optimize     # Production build: non-root appuser UID 10001 (~210 MB)
│   └── requirements.txt
│
├── docker-compose.yaml         # Production 3-tier compose with healthchecks & cgroups
├── .dockerignore               # Build context exclusions (node_modules, venv, .env)
├── .env.example                # Centralized environment variable template
└── .gitignore                  # Strict secret, credential & cache ignore rules
```

---

## 🚀 Running Guide

### 1. Running Locally (Host Machine)
Run this application directly on your local system without Docker.

#### Prerequisites
- Node.js 22+ & npm
- Python 3.13+
- MySQL 8.0 running locally on port `3306`

#### Step A: Setup Backend (`server/`)
```bash
cd server

# 1. Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create local environment file
cp .env.example .env
# Ensure DATABASE_URL in .env points to your local MySQL instance

# 4. Seed database tables and demo accounts
python seed.py

# 5. Start the FastAPI development server
uvicorn app.main:app --reload --port 8080
```
- Server API: `http://localhost:8080`
- Interactive Swagger API Docs: `http://localhost:8080/docs`

#### Step B: Setup Frontend (`client/`)
```bash
cd client

# 1. Install dependencies
npm ci

# 2. Start Vite dev server (proxies /api to localhost:8080)
npm run dev
```
- Open browser at: **`http://localhost:5173`**

---

### 2. Running with Standalone Docker Containers
Build and run each service independently using native Docker commands.

#### Step A: Create a Bridge Network
```bash
docker network create written-net
```

#### Step B: Start MySQL Container
```bash
docker run -d \
  --name written-db \
  --network written-net \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=written_db \
  -v written_db_data:/var/lib/mysql \
  mysql:8.0
```

#### Step C: Build & Run Server
```bash
# Build optimized image
docker build -t written-server:latest -f server/Dockerfile.optimize server/

# Run container
docker run -d \
  --name written-server \
  --network written-net \
  -e DATABASE_URL=mysql+pymysql://root:secret@written-db:3306/written_db \
  -e JWT_SECRET=supersecretkeyformasterydockerseries123456 \
  written-server:latest

# Run seeder inside container
docker exec -it written-server python seed.py
```

#### Step D: Build & Run Client
```bash
# Build optimized image
docker build -t written-client:latest -f client/Dockerfile.optimize client/

# Run container exposed on host port 3000
docker run -d \
  --name written-client \
  --network written-net \
  -p 3000:3000 \
  written-client:latest
```
- Access application: **`http://localhost:3000`**

---

### 3. Running with Docker Compose (Recommended)
Orchestrates the entire 3-tier stack with a single command.

```bash
# 1. Prepare environment variables
cp .env.example .env

# 2. Build and start all services in detached mode
docker compose up -d --build

# 3. Seed demo accounts & sample essays
docker compose exec server python seed.py

# 4. Verify running services and health status
docker compose ps

# 5. View live container logs
docker compose logs -f

# 6. Stop all services (preserves database data in volume)
docker compose down

# 7. Stop all services AND delete volumes (complete reset)
docker compose down -v
```

---

## 🔑 Demo Credentials

The database seeder (`server/seed.py`) provisions demo users with pre-populated essays and nested comments:

| User | Email | Password | Role & Permissions |
|---|---|---|---|
| **Alice Mercer** | `alice@example.com` | `Password123!` | **Author** (Published essays, drafts, dashboard) |
| **Bob Chen** | `bob@example.com` | `Password123!` | **Reader** (Commenter & discussion participant) |

---

## 📚 Docker Mastery Series

---

### 🐳 Day 1: Docker Fundamentals & Container Optimization

Focuses on Dockerfile mechanics, layer caching, security boundaries, and multi-stage size reduction.

#### Checklist of Milestones
- [x] **Single-stage baseline builds**: Created developer Dockerfiles to analyze unoptimized baseline sizes.
- [x] **Multi-stage builds & layer ordering**: Separated heavy build environments from minimal runtimes. Placed dependency manifests before source code for high cache hits.
- [x] **Non-root user execution**: Enforced least privilege (`USER nginx` UID 101 on client; `USER appuser` UID 10001 on server).
- [x] **Context exclusion (`.dockerignore`)**: Prevented `node_modules`, `venv`, `.env`, and git histories from polluting build contexts.
- [x] **BuildKit cache mounts**: Added `--mount=type=cache` for `npm` and `pip` to accelerate repeated builds.
- [x] **Container observability & flags**: Configured `PYTHONUNBUFFERED=1`, `PYTHONDONTWRITEBYTECODE=1`, and native container health checks.
- [x] **Size reduction verification**: Cut image footprint by up to 97.5%.

#### Image Footprint Comparison

| Application | Single-Stage (`Dockerfile.single`) | Optimized Multi-Stage (`Dockerfile.optimize`) | Footprint Reduction | Key Optimization |
|---|---|---|---|---|
| **Client** (React / Vite) | **~1.15 GB** | **~28 MB** | **~97.5%** | Stripped Node.js runtime & build tools; served static assets via Alpine Nginx. |
| **Server** (FastAPI / Python) | **~580 MB** | **~210 MB** | **~64%** | Stripped wheel builds & pip caches; isolated dependencies in `/opt/venv`. |

---

### 🚀 Day 2: Multi-Service Orchestration & Troubleshooting

Focuses on declarative multi-container stacks, network segmentation, persistent volumes, and deliberate chaos troubleshooting.

#### Checklist of Milestones
- [x] **Declarative Compose Stack**: Created `docker-compose.yaml` coordinating `client`, `server`, and `db`.
- [x] **Service Decoupling**: Separated web, API, and database into dedicated single-responsibility containers.
- [x] **Reverse Proxy Ingress**: Configured Nginx on port `3000` to serve the React SPA and internally route `/api/*` to the backend.
- [x] **Volume Persistence**: Attached named volume `db_data` to `/var/lib/mysql` to survive container recreation.
- [x] **Centralized Configuration**: Sourced secrets via `.env` with Compose variable interpolation.
- [x] **Startup Dependencies & Health Probes**: Enforced `mysqladmin ping` probe on `db` and bound `server` with `condition: service_healthy`.
- [x] **Zero Host Port Exposure for Database**: Omitted host `ports:` on MySQL—accessible strictly via internal Docker network.
- [x] **Persistence Lifecycle Test**: Destroyed (`docker compose down`) and recreated containers; verified all database records persisted.
- [x] **Chaos Troubleshooting Drills**: Diagnosed and solved internal DNS failures, authentication mismatches, and host port collisions.

#### Production Features Implemented
1. **Multi-Tier Network Segmentation**:
   - `frontend-tier`: Connects `client` $\leftrightarrow$ `server`.
   - `backend-tier`: Connects `server` $\leftrightarrow$ `db`.
   - *Result*: The web client has **zero network route** to MySQL, preventing lateral attacks.
2. **Log Rotation**: Bound logging driver to `json-file` with `max-size: "10m"` and `max-file: "3"` (capped at 30 MB max disk usage per container).
3. **Resource Quotas (cgroups)**: Implemented CPU and RAM hard limits and reservations to prevent out-of-memory (OOM) host crashes.
4. **Graceful Shutdown**: Added `stop_grace_period` (45s for DB, 20s for Server) to flush active database transactions cleanly.

---

### 🛡️ Day 3: CI/CD Automation, Security Hardening, Observability & Rollback Strategy

Focuses on the transition from local development to production operations: automated delivery pipelines, immutable image tagging, least-privilege runtime security, exit-code troubleshooting, and deterministic rollbacks.

#### Continuous Delivery Pipeline

```mermaid
flowchart LR
    Dev["Developer Git Commit"] -->|Push to main| GHA["GitHub Actions CI/CD"]

    subgraph "Stage 1: Quality Gates"
        GHA --> CheckClient["Client: Lint & Typecheck (tsc)"]
        GHA --> CheckServer["Server: Syntax & Unit Check"]
    end

    subgraph "Stage 2: Secure Build & Tagging"
        CheckClient --> DockerBuild["Docker Buildx Multi-Stage"]
        CheckServer --> DockerBuild
        DockerBuild --> Tagging["Tag: sha-<git-sha> & latest"]
    end

    subgraph "Stage 3: Authenticated Registry"
        DockerBuild --> RegistryAuth["Auth via GitHub Secrets"]
        RegistryAuth --> Registry[("Docker Hub Registry")]
    end

    subgraph "Stage 4: Production Deployment"
        Registry --> Deploy["Deploy: docker compose up -d"]
        Deploy --> HealthMonitor["Healthchecks & Restart Policy"]
        Deploy --> Hardening["Non-root & cgroups Limits"]
    end

    subgraph "Emergency Rollback"
        HealthMonitor -->|Failure Detected| Rollback["Instant Rollback to Prior SHA Tag"]
    end
```

#### Checklist of Milestones
- [x] **Tag images with a commit SHA rather than relying only on `latest`**
  - Eliminated the non-deterministic `:latest` anti-pattern.
  - Implemented immutable short Git commit SHA tagging (`sha-<commit-sha>`) alongside pointer tags.
  - Parameterized `docker-compose.yaml` with dynamic `${IMAGE_TAG:-latest}` and `${IMAGE_REGISTRY}`.
- [x] **Authenticate to Docker Hub using GitHub Actions secrets**
  - Configured secure authentication via `docker/login-action@v3` using repository secrets (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`).
  - Zero hardcoded credentials across source control.
- [x] **Publish images only when relevant checks pass**
  - Configured [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) with strict dependency stages (`needs: [verify-client, verify-server]`).
  - Pull Requests only verify builds; image pushes occur exclusively on merged commits to `main`.
- [x] **Configure health checks and restart policies**
  - Standardized on `restart: unless-stopped` across all services to survive host reboots while respecting manual administrative shutdowns.
  - Configured native health checks for database, backend API, and reverse proxy.
- [x] **Restricted privileges and resource limits**
  - Enforced unprivileged users in runtime containers (`appuser:10001` and `nginx:101`).
  - Blocked privilege escalation with `security_opt: [no-new-privileges:true]`.
  - Capped maximum container memory and CPU via cgroups to prevent host OOM panics.
- [x] **Simulate failed deployment and investigate logs**
  - Executed diagnostic drills: unhandled startup crashes, broken health probes, and OOM terminations.
  - Mastered targeted container diagnostics using `docker inspect`, `docker logs --tail`, and exit code analysis.
- [x] **Document rollback procedure using previous image tag**
  - Established a 30-second zero-rebuild rollback runbook restoring service availability by pointing to a known stable Git SHA image tag.

---

### 🧠 Day 3 Deep Dive & Practical Guide

#### 1. Why `:latest` is an Anti-Pattern in Production

| Dimension | `:latest` Tag | Immutable Commit SHA (`sha-a1b2c3d`) |
|---|---|---|
| **Determinism** | **Non-deterministic**: points to whatever was pushed last. | **100% Deterministic**: points to an exact Git commit. |
| **Auditability** | Impossible to know what source code is running inside. | Direct 1-to-1 link to Git commit history. |
| **Rollback Speed** | Rollbacks require rebuilding or guessing past images. | **Instantaneous**: update the tag variable and restart. |
| **Docker Cache** | Nodes may skip pulling because the tag name hasn't changed. | Nodes always pull new layer blobs because the tag is unique. |

---

#### 2. Container Diagnostic Toolbelt & Exit Codes

When diagnosing crashed or misbehaving containers:

```bash
# 1. View container exit status
docker ps -a --filter "name=written-server" --format "table {{.Names}}\t{{.Status}}"

# 2. Extract detailed health probe history
docker inspect --format='{{json .State.Health}}' written-server | jq

# 3. Stream recent logs
docker compose logs --tail 50 -f server
```

| Exit Code | Meaning | Common Root Cause & Fix |
|---|---|---|
| **0** | Clean Exit | Normal for one-off tasks (e.g. database seeders or migrations). |
| **1** | Application Error | Unhandled Python exception, invalid syntax, or missing env variable. Check `docker logs`. |
| **127** | Command Not Found | The `CMD` or `ENTRYPOINT` binary does not exist in the minimal base image. |
| **137** | `SIGKILL` / **OOM Killed** | Container exceeded `limits.memory` and was terminated by the Linux kernel OOM killer. Check `docker inspect <container> --format '{{.State.OOMKilled}}'`. |
| **143** | `SIGTERM` | Graceful shutdown requested by host or `docker compose down`. |

---

#### 3. Production Rollback Runbook

If a faulty build (`sha-badcommit`) is deployed and breaks production, roll back to the previous stable release (`sha-goodcommit`) in **under 30 seconds** without rebuilding:

```bash
# Step 1: Identify previous stable Git commit SHA
git log -n 5 --oneline
# Example: 7a8f9b2 (origin/main) fix: database index (STABLE)

# Step 2: Deploy previous image tag via environment variable
export IMAGE_TAG=sha-7a8f9b2
docker compose pull server client
docker compose up -d

# Step 3: Verify system restoration & health
docker compose ps
docker compose logs --tail 20 server client
curl -I http://localhost:3000/api/health

# Step 4: Persist the rollback in Git
git revert HEAD --no-edit
git push origin main
```
