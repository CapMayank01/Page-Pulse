# Page Pulse — Master Website Audit & SEO Health Scanner

Page Pulse is a full-stack website auditing platform that takes a target URL, analyzes its HTTP health, load time, and core SEO metrics (title, meta description, H1 heading count, missing image alt text, word count), and calculates a composite 0–100 health score with an assigned letter grade. Users can also log in to automatically persist audit logs and monitor site performance trends through visual analytics charts.

---

## Mandatory Requirement — Footer

Every page on Page Pulse (Home, Login, Register, Dashboard) renders the mandatory footer text:

```
Built for Digital Heroes Training Task
```

Implemented via a single shared `<Footer />` component mounted in the root layout (`App.tsx`) outside `<Routes>` so it persists across all routes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express, TypeScript |
| **Parsing** | Cheerio |
| **HTTP Fetch** | Axios (with 10s timeout, 5MB content-length cap, signal abort) |
| **Database** | PostgreSQL / SQLite + Prisma ORM |
| **Auth** | JWT (`jsonwebtoken`) + `bcrypt` password hashing |
| **Rate Limiting** | `express-rate-limit` (10/min anon, 30/min auth for audit; 5/min for auth) |
| **Logging** | `pino` + `pino-http` |
| **Frontend** | React, Vite, TypeScript |
| **Analytics Charts** | Recharts |
| **Design / Icons** | Glassmorphism Vanilla CSS, Lucide Icons |

---

## API Contract & Error Table

### `POST /api/audit`
- **Headers**: `Authorization: Bearer <token>` (optional)
- **Body**: `{ "url": "https://example.com" }`

#### Success Response (`200 OK`)
```json
{
  "url": "https://example.com",
  "status": 200,
  "responseTimeMs": 342,
  "title": "Example Domain",
  "metaDescription": "This domain is for use in illustrative examples...",
  "h1Count": 1,
  "imagesMissingAlt": 3,
  "wordCount": 187,
  "contentType": "text/html",
  "score": 78,
  "grade": "B",
  "savedToHistory": true
}
```

#### Standardized Error Response Shape
```json
{
  "error": {
    "code": "TIMEOUT",
    "message": "The site took too long to respond (>10s)."
  }
}
```

| Code | HTTP | Trigger Description |
|---|---|---|
| `INVALID_URL` | 400 | Malformed URL / non-http(s) protocol |
| `BLOCKED_HOST` | 400 | SSRF guard triggered (localhost, 127.0.0.1, private IP ranges) |
| `UNREACHABLE` | 502 | DNS resolution failure or network connection failure |
| `TIMEOUT` | 504 | Target host did not respond within 10s timeout |
| `NON_HTML` | 415 | Response content-type isn't text/html |
| `TOO_LARGE` | 413 | Response payload exceeds 5MB size limit |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `UNAUTHORIZED` | 401 | Missing/invalid JWT on protected route |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Auth & History Endpoints

| Endpoint | Method | Auth Required | Description |
|---|---|---|---|
| `/api/auth/register` | POST | No | `{ email, password }` → Creates account & returns JWT |
| `/api/auth/login` | POST | No | `{ email, password }` → Authenticates & returns JWT |
| `/api/history` | GET | Yes | Paginated list of user's past audits |
| `/api/history/:id` | GET | Yes | Retrieve full audit record details |
| `/api/history/:id` | DELETE | Yes | Delete a specific saved audit record |

---

## Scoring Formula Breakdown

| Metric Check | Maximum Points | Scoring Rule |
|---|---|---|
| **Title Tag** | 15 pts | Present & non-empty |
| **Meta Description** | 15 pts | Present & non-empty |
| **H1 Heading Count** | 20 pts | Exactly 1 H1 (0 or 2+ gets 0 pts) |
| **Image Alt Text** | 20 pts | 20 pts max; −5 per image missing alt (floor 0) |
| **Response Time** | 20 pts | 20 pts if <500ms; linearly scales to 0 pts at ≥3000ms |
| **Word Count** | 20 pts | Word count ≥ 300 words |

**Grade Scale**: **A** (90–100), **B** (75–89), **C** (60–74), **D** (40–59), **F** (<40).

---

## Local Setup & Development

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173` and proxy requests to `http://localhost:3000`.

---

## Running Tests

Run backend unit tests for scoring calculations, Cheerio HTML analyzer, and API integration paths:

```bash
cd backend
npm test
```

---

## Deployment Instructions

1. **Backend**: Deploy to Render / Railway. Set environment variables (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `NODE_ENV=production`).
2. **Database**: Use Render Postgres, Supabase, or Railway Postgres. Run `npx prisma migrate deploy` in build/deploy command.
3. **Frontend**: Deploy to Vercel or Netlify. Set `VITE_API_URL` to your deployed backend URL.

---

## Known Limitations & Future Work

- **Instagram/Social Platform Blocks**: Instagram content checks may show partial results due to platform-level anti-automation measures; this is expected and explained in the diagnostic output.
- **JavaScript SPA Crawling**: Currently uses cheerio on raw HTML responses; headless browser rendering (e.g. Puppeteer/Playwright) could be added for client-rendered SPAs.
- **Deep Link Crawling**: Currently audits a single page; multi-page link crawling can be supported in future versions.
