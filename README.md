# PriorityFeed — Academic Communication Prioritizer

PriorityFeed is a full-stack web app that connects to Slack and helps students
cut through the noise of high-volume course channels. Instead of a chronological
feed, it sorts messages into **Critical / Important / Normal** based on rules you
define (by channel, sender, or keyword), so the announcements that matter surface
first.

- **Author:** Harini Thirunavukkarasan
- **Class:** Web Development (Online) — Northeastern University
- **Live app:** (https://priorityfeed.onrender.com)
- **Demo video:** <!-- TODO: paste public narrated video link here -->

---

## Project Objective

In large online courses, important instructor and TA announcements get lost among
hundreds of weekly Slack messages. PriorityFeed lets each student define
prioritization rules and then collects, stores, and ranks their course Slack
messages — reducing information overload and missed deadlines.

---

## Screenshots

> Login
>
> ![Login](docs/screenshots/login.png)

> Dashboard with prioritized messages
>
> ![Dashboard](docs/screenshots/dashboard-1.png)
> ![Dashboard](docs/screenshots/dashboard-2.png)
> ![Dashboard](docs/screenshots/dashboard-3.png)

> Prioritization rules
>
> ![Rules](docs/screenshots/rules.png)


---

## Features

- **Email/password accounts** — sign up and log in (token-based auth).
- **Slack sync** — pull recent messages from every channel you belong to.
- **Prioritization rules** — match by channel, sender, or keyword → Critical /
  Important / Normal. Rules re-apply automatically when added or removed.
- **Dashboard** — filter by priority, channel, or bookmarks; bookmark messages
  and mark them read; readable rendering of Slack mentions and links.
- **Unread summary** — counts of unread messages by priority.

---

## Tech Stack

- **Frontend:** Vanilla JavaScript (ES6 modules), HTML, CSS — client-side rendering
- **Backend:** Node.js + Express (ESM, no CommonJS)
- **Database:** MongoDB (native Node.js driver) — `users`, `messages`, `rules`
- **External API:** Slack Web API
- **Tooling:** ESLint, Prettier

---

## Project Structure

```
PriorityFeed/
├── server.js                 Express entry; routes + DB indexes
├── src/
│   ├── db/connection.js      MongoDB connector module
│   ├── auth/auth.js          password hashing + signed tokens
│   ├── collections/          users.js · messages.js · rules.js (CRUD)
│   ├── services/             prioritize.js · reprioritize.js
│   ├── slack/slack.js        Slack fetch + mention resolution
│   └── routes/               auth · messages · rules · slack
└── public/
    ├── index.html            SPA shell
    ├── js/                   api · auth · dashboard · rules · main
    └── css/                  base · auth · dashboard · rules
```

---

## Build & Run Locally

### Prerequisites

- Node.js 20+ and npm
- A MongoDB Atlas cluster (free tier works)
- A Slack user token (see below)

### 1. Clone and install

```bash
git clone https://github.com/harini0-0/Project-2-PriorityFeed.git
cd Project-2-PriorityFeed
npm install
```

### 2. Configure environment

Copy the example and fill in your values:

```bash
cp .env.example .env
```

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=priorityfeed
SLACK_TOKEN=xoxp-your-user-token
SESSION_SECRET=any-long-random-string
PORT=3000
```

> `.env` is gitignored — never commit your credentials.

### 3. Get a Slack token

1. Create an app at <https://api.slack.com/apps> → **From a manifest** → select
   your workspace.
2. Use these **User Token Scopes**: `channels:history`, `channels:read`,
   `groups:history`, `groups:read`, `users:read`.
3. **Install to Workspace**, then copy the **User OAuth Token** (`xoxp-…`) into
   `SLACK_TOKEN`.

### 4. Run

```bash
npm start          # or: npm run dev  (auto-reload)
```

Open <http://localhost:3000>, sign up, add a rule, and click **Sync Slack**.

### Scripts

```bash
npm run lint       # ESLint
npm run format     # Prettier
```

---

## Deployment (Render)

The app runs as a standard Node web service.

- **Build command:** `npm install`
- **Start command:** `npm start`
- **Environment variables:** set `MONGODB_URI`, `MONGODB_DB`, `SLACK_TOKEN`,
  `SESSION_SECRET` in the Render dashboard.
- In **MongoDB Atlas → Network Access**, allow `0.0.0.0/0` so the host can reach
  your database.

A `render.yaml` blueprint is included for one-click setup.

---

## License

[MIT](LICENSE) © 2026 Harini Thirunavukkarasan
