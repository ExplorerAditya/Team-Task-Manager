# Tessera — Team Task Manager

A full-stack team task manager with project workspaces, role-based access control, and a clean dashboard. Built as a hiring assessment with the goal of being deployment-ready, well-structured, and pleasant to use.

**Live demo:** https://team-task-manager-production-91fd.up.railway.app
**Demo video:** _add Loom URL here after recording_

---

## Features

**Authentication**
- Email/password signup and login
- JWT-based session (7-day token, stored in `localStorage`)
- Bcrypt password hashing
- Server-side validation with `express-validator`

**Projects & teams**
- Admins create projects; each project has its own member list
- Add members by email, assign per-project roles (Admin / Member)
- Project owner is always Admin and cannot be demoted or removed
- Delete a project cascades to its tasks

**Tasks**
- Title, description, assignee, priority (Low/Medium/High), due date
- Status: Todo → In Progress → Done (kanban board view)
- Overdue detection (server-side virtual + UI highlight)
- Inline status changes
- Project Admins manage all tasks; assigned Members can update their own task's status

**Dashboard**
- Total projects, total tasks, in-progress count, overdue count
- Status breakdown bar (Todo / In Progress / Done with percentages)
- "My tasks" panel — everything assigned to the current user
- Recent tasks across all accessible projects

**Role-Based Access Control (two layers)**
- **Global role** (on the `User`): Admin can see all projects; Member sees only projects they're a member of
- **Project role** (on the project membership): Admin manages tasks/members within that project; Member can update status of tasks assigned to them

---

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Node.js, Express, MongoDB (Mongoose), JWT, bcrypt |
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, lucide-react |
| Database | MongoDB (Atlas free tier in production) |
| Deployment | Railway — single service serves API + built React static files |

---

## Project structure

```
team-task-manager/
├── server/
│   ├── index.js                  # Express entry, mongo connect, static serve in prod
│   ├── controllers/              # auth, project, task, user, dashboard
│   ├── models/                   # User, Project, Task (Mongoose)
│   ├── routes/                   # /api/auth, /api/projects, /api/tasks, etc.
│   └── middleware/               # auth (JWT), projectAccess (RBAC)
├── client/
│   ├── src/
│   │   ├── pages/                # Login, Signup, Dashboard, Projects, ProjectDetail
│   │   ├── components/           # Layout, AuthShell, Modal, badges, Loader, PageHeader
│   │   ├── contexts/AuthContext.jsx
│   │   ├── lib/api.js            # axios instance with token interceptor
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── package.json                  # root scripts; postinstall builds client
├── railway.json                  # Railway deployment config
├── .env.example
└── README.md
```

---

## Local setup

**Prerequisites**
- Node.js 18+
- MongoDB running locally (or a MongoDB Atlas connection string)

**Steps**

```bash
# 1. Clone and enter
git clone <your-repo-url>
cd team-task-manager

# 2. Install dependencies (root + client)
npm install        # also runs postinstall which installs/builds client
# OR for development:
npm run install-all

# 3. Set up environment
cp .env.example .env
# Edit .env and set MONGO_URI and JWT_SECRET

# 4. Run in development (backend + frontend in parallel with hot reload)
npm run dev
# - API runs on http://localhost:5000
# - Vite dev server on http://localhost:5173 (proxies /api to backend)
```

Open `http://localhost:5173`. Sign up — pick the **Admin** role on the first user so you can create projects.

**Run only the backend:**
```bash
npm run server
```

**Build for production locally:**
```bash
npm run build       # builds client into client/dist
NODE_ENV=production npm start
# Then open http://localhost:5000
```

---

## API reference

All authenticated endpoints expect `Authorization: Bearer <token>`.

### Auth
| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | `{ name, email, password, role? }` | Create account, returns `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` | Returns `{ token, user }` |
| GET  | `/api/auth/me` | — | Current user |

### Projects
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/projects` | any | List projects user belongs to (Admins see all) |
| POST | `/api/projects` | any | Create project (creator becomes Admin) |
| GET | `/api/projects/:id` | member | Get project |
| PUT | `/api/projects/:id` | project Admin | Update name/description |
| DELETE | `/api/projects/:id` | project Admin | Delete project + its tasks |
| POST | `/api/projects/:id/members` | project Admin | `{ email, role }` — add by email |
| PUT | `/api/projects/:id/members/:userId` | project Admin | `{ role }` — change role |
| DELETE | `/api/projects/:id/members/:userId` | project Admin | Remove member |

### Tasks
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/tasks/project/:projectId` | member | List tasks |
| POST | `/api/tasks/project/:projectId` | project Admin | Create task |
| PUT | `/api/tasks/project/:projectId/:taskId` | Admin OR assignee | Update (Members limited to status) |
| DELETE | `/api/tasks/project/:projectId/:taskId` | project Admin | Delete |

### Dashboard
| Method | Path | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Stats, my tasks, recent tasks |

### Users
| Method | Path | Description |
|---|---|---|
| GET | `/api/users?search=` | List users (for assignee/member search) |

### Health
- `GET /api/health` — `{ status: 'ok' }`

---

## Deployment to Railway

Railway runs this as a **single service**: `postinstall` builds the React app, `npm start` runs the Express server which serves the API on `/api/*` and the built React app on everything else.

### Step 1 — MongoDB Atlas (free tier)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas), create a free M0 cluster.
2. **Database Access** → add a database user with a password.
3. **Network Access** → add IP `0.0.0.0/0` (allow from anywhere — required for Railway).
4. **Connect** → "Drivers" → copy the connection string. Replace `<password>` with your actual password and add a database name (e.g. `/tessera`):
   ```
   mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/tessera?retryWrites=true&w=majority
   ```

### Step 2 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Tessera task manager"
git branch -M main
git remote add origin https://github.com/<you>/team-task-manager.git
git push -u origin main
```

### Step 3 — Deploy to Railway
1. Go to [railway.app](https://railway.app), sign in with GitHub.
2. **New Project** → **Deploy from GitHub repo** → pick this repo.
3. After it spins up, go to the service → **Variables** → add:
   - `MONGO_URI` = your Atlas connection string from Step 1
   - `JWT_SECRET` = a long random string (e.g. `openssl rand -hex 32`)
   - `NODE_ENV` = `production`
4. **Settings** → **Networking** → click **Generate Domain**.
5. Wait for the deploy to finish. Visit your Railway URL — the app should be live.

If the build fails, check the deploy logs. Most common issues: bad `MONGO_URI` or the Atlas IP allowlist not set to `0.0.0.0/0`.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Secret for signing JWTs |
| `PORT` | no | Defaults to `5000`. Railway sets this automatically. |
| `NODE_ENV` | no | Set to `production` on Railway to enable static serving |

---

## Validations & data integrity

- **User**: name 2–60 chars, email format + uniqueness, password ≥6 chars
- **Project**: name 1–100 chars, description ≤1000 chars; owner auto-added to members as Admin
- **Task**: title 1–200 chars, status/priority enum-validated, dueDate ISO 8601, assignee must be a project member
- **Cascading**: deleting a project deletes its tasks
- **Invariants**: project owner cannot be removed or demoted; task assignee must be a project member

---

## What I'd add with more time

- Comments / activity log per task
- Drag-and-drop between status columns (e.g., dnd-kit)
- Email invites for members who don't have an account yet
- Filtering & search on the project board
- Refresh tokens with httpOnly cookies (currently localStorage for simplicity)
- Test suite (Jest + supertest for API, React Testing Library for UI)

---

## License

MIT
