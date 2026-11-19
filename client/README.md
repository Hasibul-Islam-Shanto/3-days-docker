# Written Frontend Client (React + Vite + Tailwind CSS)

A clean, responsive, and accessible React frontend for the Written publishing platform.

## Features
- **Reader Feed**: Browse published essays with search, pagination, reading time estimates, and author bylines.
- **Markdown Editor**: Write essays and drafts with a live side-by-side preview.
- **Draft Management**: Save private drafts, publish them, or withdraw published posts to draft.
- **Threaded Comments**: Read and reply to discussions in nested trees; moderation support for authors.
- **Author Dashboard**: View statistics (published count, draft count, responses count) and manage articles.
- **Settings**: Update name, bio, and avatar URL.
- **Dark/Light Theme**: Persistent theme switcher with custom typographic styling.

## Local Setup & Development

### 1. Requirements
- Node.js 18+ (tested on Node 22+)
- npm 9+

### 2. Install Dependencies
```bash
cd client
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

The Vite dev server proxies `/api` calls directly to the FastAPI server running on `http://localhost:8000`. You can customize the backend URL with:
```bash
VITE_API_URL=http://localhost:8000 npm run dev
```

### 4. Build for Production
```bash
npm run build
```
Build output will be generated in `client/dist/`.
