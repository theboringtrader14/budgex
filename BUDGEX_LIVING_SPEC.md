# BUDGEX Living Spec

## Current Version: v0.3
## Last Updated: 2026-04-09

### Architecture
Mobile App (voice input) → BUDGEX API → BUDGEX DB → Web (dashboard view only)
Web = read-only dashboard. No voice input on web.
Mobile app is the ONLY expense input method.

### Status
Backend: ✅ Live on budgex-api.lifexos.co.in (port 8002)
Frontend: ✅ Live on budgex.lifexos.co.in (port 3002)
DB: ✅ budgex_db on server PostgreSQL

### Pages (all built ✅)
- Dashboard: 6 sections (summary, trend, categories, recent, subscriptions, accounts)
- Expenses: Full list with filters + Add form
- Budget: Monthly budget per category, progress bars (NEW)
- Analytics: Monthly trends, category breakdown, Gemma AI insights
- Subscriptions: Due date tracker with yearly total + due alerts
- Accounts: Manual balance tracking

### Brand
Color: #7C3AED purple
Domain: budgex.lifexos.co.in
Port: 8002 (backend), 3002 (frontend)

### Category Colors (consistent across LIFEX)
Food:        #FF6B35 orange
Travel:      #4488FF blue
Bills:       #FFD700 gold
Shopping:    #FF4488 pink
Health:      #22DD88 green
Others:      rgba(232,232,248,0.4) muted

### API Endpoints
POST /api/v1/parse — voice text → structured expense
POST /api/v1/expenses — save expense (auth required)
GET  /api/v1/expenses — list with filters
GET  /api/v1/expenses/summary — dashboard data
POST /api/v1/accounts — add account
GET  /api/v1/accounts — list accounts
POST /api/v1/subscriptions — add subscription
GET  /api/v1/subscriptions — list subscriptions
GET  /api/v1/budgets — list budgets
POST /api/v1/budgets — create/update budget
GET  /api/v1/budgets/status — budget vs actual
GET  /api/v1/analytics/insights — Gemma AI insights

### Security
- CORS: explicit origins only
- Auth: BUDGEX_API_KEY header on all write endpoints
- SQL: parameterized queries throughout

### Parser Features
- Digit amounts: "Swiggy 350" → ₹350
- Word amounts: "coffee fifty" → ₹50
- Yesterday/today date parsing
- Category inference from keywords

### Start Commands
cd ~/STAXX/budgex/backend && uvicorn app.main:app --host 0.0.0.0 --port 8002
cd ~/STAXX/budgex/frontend && npm run dev -- --port 3002

### Pending
- Default categories seeding
- Balance history tracking
- Mobile web optimisation
- FINEX integration (feed expense data to FINEX dashboard)

### Commits
- 63a60dc: Rich dashboard, CORS fix, auth, word-numbers
- Latest: Budget page, Analytics enhancements, Subscriptions improvements
