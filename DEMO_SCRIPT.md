# Demo Video Script (2–5 min)

A suggested flow for the submission video. Practice once, then record.

## Setup before recording

1. Have **two browser windows** ready (one regular, one incognito) so you can show two roles side-by-side.
2. Pre-create accounts so you don't waste video time typing:
   - **alice@demo.com** / password123 — role **Admin**
   - **bob@demo.com** / password123 — role **Member**
3. Have one project pre-created with 2–3 tasks in different statuses.
4. Close noisy tabs; use full-screen browser. Use a screen recorder (Loom is easiest — gives a shareable link instantly).

## Script (~3 min target)

### 0:00–0:20 — Intro & overview
> "This is Tessera, a team task manager I built for the assessment. It's a full-stack app with Node/Express and MongoDB on the backend, React with Tailwind on the frontend, deployed to Railway as a single service. Let me walk through what it does."

Show the live URL in the address bar. Land on the login page.

### 0:20–0:50 — Auth & signup
> "Auth is JWT-based with bcrypt-hashed passwords and server-side validation."

- Click **Create account**, sign up a fresh user as **Member**.
- Get redirected to dashboard.
> "Notice the empty state — no projects, because Members can't create them. That's the role-based access at work."

### 0:50–1:30 — Admin creates a project
- Sign out. Log in as the Admin.
> "Admins can create projects and manage members."
- Click **New project**, name it "Q4 Launch", add a description, create.
- Open it. Show the kanban with three columns: Todo, In Progress, Done.

### 1:30–2:15 — Tasks & assignment
- Click **New task**. Fill in title, description, set assignee (Bob), priority High, a due date in the past for the demo.
> "Tasks have title, description, assignee, priority, status, and due date. Notice anything past due is flagged as overdue."
- Create 1–2 more tasks across different statuses.
- Click and drag isn't implemented — instead show the **inline status dropdown** on a card to move it Todo → In Progress.

### 2:15–2:45 — Members tab
- Click the **Members** tab.
> "Adding a member is by email — they need an existing account. Each member has a per-project role: Admin or Member."
- Add Bob by email, role Member.
- Show the role dropdown next to him; flip him briefly to Admin and back.

### 2:45–3:15 — Member view (RBAC in action)
- Switch to the incognito window logged in as Bob.
- Open the same project.
> "Bob is a Member, not an Admin in this project. Notice — no New Task button, no Add Member, no edit/delete on cards. He can only update the status of the task that's assigned to him."
- Show Bob changing the status of his task to "Done".

### 3:15–3:40 — Dashboard
- Back to the Admin window, go to Dashboard.
> "The dashboard aggregates across all your projects: total counts, status breakdown, overdue tasks highlighted, your assigned tasks, and recent activity."

### 3:40–4:00 — Wrap
> "Code is on GitHub at [URL], deployed on Railway at [URL]. Thanks for watching."

## Tips

- **Speak slowly.** Most demo videos talk too fast.
- **Don't apologize** for missing features. State what it does.
- **Cut dead air** — Loom has built-in trim. Aim for 2:30–3:30 final length.
- If something glitches mid-recording, just keep going and edit later. Don't restart from zero.
