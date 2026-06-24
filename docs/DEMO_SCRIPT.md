# PriorityFeed — 5-Minute Demo Script

Companion to `PriorityFeed-Demo.pptx`. Full speaker notes also live in each slide's
notes pane. Timings are targets, not hard limits.

## Before you start (setup checklist)
- [ ] App running and reachable (live Render URL or `npm start` locally).
- [ ] Logged **out** so you can demo sign-in fresh.
- [ ] A Slack workspace with a few real course-style messages to sync.
- [ ] Have one rule in mind to add live (e.g. keyword `deadline` → Critical).
- [ ] Browser zoom so cards are legible on a projector.
- [ ] Backup: slides 6–8 are screenshots — if live breaks, narrate those.

## Flow (≈5:00)

| Time | Slide | Say / Do |
|------|-------|----------|
| 0:00–0:30 | 1 Title | Name + one-liner: "Connects to Slack and re-sorts course messages so what matters shows first." |
| 0:30–1:10 | 2 Problem | Hundreds of msgs/week; instructor announcements buried in a chronological feed → missed deadlines. |
| 1:10–1:50 | 3 Solution | The 3 steps: connect Slack → define rules → surface by tier. **You** control what's important. |
| 1:50–2:20 | 4 How it works | Transparent rules engine: highest-priority match wins, else Normal. Re-runs on every sync / rule change. |
| 2:20–2:35 | 5 Demo agenda | Tee up the 5 demo beats, then switch to the live app. |
| 2:35–4:20 | **LIVE** | See the live demo beats below. |
| 4:20–4:50 | 9 Architecture | SPA → Express → Slack API + MongoDB; 3 collections, each owns one concern. |
| 4:50–5:00 | 10 Close | Recap value, show links, invite questions. |

## Live demo beats (the core ~1:45)
1. **Log in** — single card toggles login/sign-up; token-based auth.
2. **Sync Slack** — click Sync; messages flow into the dashboard, already tiered.
3. **Add a rule** — Rules page → keyword `deadline` → Critical → save. Return to
   dashboard and show that matching messages jumped to Critical (red border). This
   is the wow moment — make sure it's visible.
4. **Work the feed** — filter by priority, filter by channel, bookmark one, mark one
   read, dismiss one. Point out the colored left borders (red/amber/blue).
5. **Unread summary** — top-of-page counts by priority: "this is your catch-up view."

## If the live demo fails
Switch to slides 6 (Login), 7 (Dashboard), 8 (Rules) and narrate the same 5 beats
over the screenshots. No dead air.

## Likely Q&A
- **Why rules instead of ML?** Transparent and explainable; the student controls
  priority. No training data or black box.
- **When are messages re-prioritized?** On every Slack sync and whenever a rule is
  added or removed.
- **What if no rule matches?** Defaults to Normal.
- **Data model?** 3 MongoDB collections — users, messages, rules — each owning a
  single concern (auth / ingestion+status / prioritization).
