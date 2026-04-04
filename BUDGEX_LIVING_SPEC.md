# BUDGEX Living Specification
**Last Updated:** 2026-03-28
**Status:** Backend complete, Frontend in progress (Claude Code)

---

## Overview
BUDGEX is a personal expense tracking module under the Life OS platform.
Part of the ecosystem: STAAX (trading) · INVEX (investments) · BUDGEX (expenses) · FINEX (future)

**Ports:** Backend 8002 · Frontend 3002
**DB:** budgex_db on PostgreSQL port 5433 (Docker container: budgex_db)
**Repo:** github.com/theboringtrader14/budgex (to be created)
**Root:** ~/STAXX/budgex/

---

## Start Commands
```bash
# DB (if container stopped)
docker start budgex_db

# Terminal 5 — Backend
cd ~/STAXX/budgex/backend && uvicorn app.main:app --host 0.0.0.0 --port 8002

# Terminal 6 — Frontend
cd ~/STAXX/budgex/frontend && npm run dev -- --port 3002
```

---

## Architecture
- **Backend:** FastAPI + SQLAlchemy async + asyncpg
- **Frontend:** React + TypeScript + Vite (port 3002)
- **DB:** PostgreSQL 16 (Docker, port 5433)
- **Design:** Glassmorphism dark theme, purple accent (#7C3AED)

---

## Database Schema
```
expenses        — id, amount, category, note, date, created_at
categories      — id, name, icon, created_at
bank_accounts   — id, name, current_balance, updated_at
subscriptions   — id, name, amount, billing_cycle, next_due_date, created_at
```

---

## API Endpoints
```
GET/POST        /api/v1/expenses/
PUT/DELETE      /api/v1/expenses/{id}
GET/POST        /api/v1/expenses/categories
GET/POST/PUT    /api/v1/accounts/
GET/POST/PUT/DELETE /api/v1/subscriptions/
GET             /api/v1/dashboard/summary
POST            /api/v1/voice/parse
```

---

## Features
### Complete ✅
- [x] DB schema (expenses, categories, bank_accounts, subscriptions)
- [x] All backend API endpoints
- [x] Dashboard summary API
- [x] Voice text parsing (regex-based NLP)
- [x] Docker DB on port 5433

### In Progress 🔄
- [x] Frontend built by Claude Code
- [x] UI redesign to match INVEX style ✅ (DM Sans, solid colors, 216px sidebar)

### Pending 📋
- [x] GitHub repo creation — pending (create at github.com/theboringtrader14/budgex)
- [ ] Voice input UI (Web Speech API)
- [ ] Mobile web optimization
- [ ] Default categories seeding
- [ ] Balance history tracking (future)

---

## Design System
- **Brand color:** #7C3AED (purple)
- **Background:** #0a0a0f
- **Cards:** rgba(255,255,255,0.05) + blur(20px)
- **Font:** Inter
- **Style:** Glassmorphism premium

---

## Future Integration
- BUDGEX → feeds FINEX (financial overview)
- Keep schema simple and structured for clean data pipeline
- No automation, no rules — manual-first

---

## Key Principles
- Simple over complex
- Fast entry (< 3 sec)
- Mobile-first
- No bank integrations
- Manual control always

---

## Phase Roadmap
- **Phase 1 (Now):** Core expense tracking + dashboard + voice
- **Phase 2:** Bank balance tracking + subscription alerts
- **Phase 3:** FINEX integration + reporting
- **Phase 4 (Future):** Native mobile app (iOS/Android)

