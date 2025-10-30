# Policy Compliance Checker - FReMP Stack

📘 **Overview**  
The Policy Compliance Checker web application evaluates user accounts against dynamically defined security policies. The stack uses **FastAPI** for the backend, **React (Vite)** for the frontend, and **SQLite** for persistent storage.

---

## 🔧 Stack
- **Backend:** FastAPI + SQLite  
- **Frontend:** React (Vite)  
- **Language:** Python 3.10+ (backend), Node.js 18+ (frontend)  
- **Optional:** Docker

---

## Backend (FastAPI + SQLite)

**Requirements:** Python 3.10+, `pip`, SQLite, optional Docker

**Setup Commands**
```bash
cd backend
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# macOS / Linux
# source .venv/bin/activate
pip install -r requirements.txt
```

**Run Server**
```bash
uvicorn app.main:app --reload --port 8000
```

**API Endpoints**
- `POST /api/policies` – Upload or update policies in JSON format  
- `POST /api/users` – Register or update users with policy attributes  
- `GET  /api/compliance` – Check compliance score per user  
- `GET  /api/history` – Retrieve compliance history over time

---

## Frontend (React + Vite)

**Requirements:** Node.js 18+, `npm` or `yarn`

**Setup Commands**
```bash
cd frontend
npm install
npm run dev
```

**Build Production**
```bash
npm run build
```

---

## 🚧 Project Structure
```
project_root/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── database.py
│   │   └── routers/
│   │       ├── policies.py
│   │       └── compliance.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── README.md
```

---

## Notes & Tips
- Use environment variables (or a `.env` file) to store secrets and configuration.  
- For production, replace SQLite with a managed database (Postgres, MySQL) and run behind a proper ASGI server + reverse proxy.  
- Consider adding automated tests for policy validation logic and API endpoints.  
- Add CI/CD in GitHub Actions (or similar) to run linting, tests, and production builds.