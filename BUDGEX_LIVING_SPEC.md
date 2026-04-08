# BUDGEX Living Spec

## Current Version: v0.2
## Last Updated: 2026-04-09

### Architecture
Mobile App (voice input) → BUDGEX API → BUDGEX DB
→ BUDGEX Web (dashboard view only)

BUDGEX web = read-only dashboard. No voice input on web.
Mobile app is the ONLY expense input method.

### Status
Backend: ✅ Live on budgex-api.lifexos.co.in
Frontend: ✅ Live on budgex.lifexos.co.in
DB: ✅ budgex_db on server PostgreSQL

### Pages
- Dashboard: ✅ 6 sections (summary, trend, categories,
  recent, subscriptions, accounts)
- Expenses: ✅ Full list with filters + Add form
- Accounts: ✅ Manual balance tracking
- Subscriptions: ✅ Due date tracker
- Analytics: ✅ Monthly trends, category breakdown
- Voice: ❌ Removed (mobile handles this)

### API Endpoints
POST /api/v1/parse — voice text → structured expense
POST /api/v1/expenses — save expense (auth required)
GET  /api/v1/expenses — list with filters
GET  /api/v1/expenses/summary — dashboard data
POST /api/v1/accounts — add account (auth required)
GET  /api/v1/accounts — list accounts
POST /api/v1/subscriptions — add subscription
GET  /api/v1/subscriptions — list subscriptions

### Security
- CORS: explicit origins only
- Auth: BUDGEX_API_KEY header on all write endpoints
- SQL: parameterized queries throughout

### Parser Features
- Digit amounts: "Swiggy 350" → ₹350
- Word amounts: "coffee fifty" → ₹50
- Yesterday/today date parsing
- Category inference from keywords

### Commits
- 63a60dc: Rich dashboard, CORS fix, auth, word-numbers

### Pending (Next)
- BUDGEX revamp (brainstorm in progress)
- Default categories seeding
- Balance history tracking
- Mobile web optimization
