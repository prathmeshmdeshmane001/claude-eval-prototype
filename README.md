# Claude Evaluation Checklist — UI Prototype

> **Solution 2:** Expertise-Aware Evaluation Workflow for Claude

## Demo

**Live URL:** *(deploy to Vercel or Netlify — see Deploy section below)*

**Local:** `npm run dev` → `http://localhost:5173`

---

## Demo Flow (60-90 seconds)

1. **`/`** — Conversation view (junior's perspective). You'll see Alex's Python question and Claude's response on the left, with the Evaluation Checklist panel on the right.
2. **Click through the 6 checklist items.** Item 3 has a pre-populated note. Item 5 has a "Run check" button — click it for an inline validation result.
3. **Once all 6 are checked**, a "Share evaluation log with team" button appears at the bottom of the panel. Click it.
4. **Review the Share modal** — note the prominent privacy notice explaining that only the checklist is shared, not the conversation.
5. **Click "Share log"** to confirm.
6. **Navigate to `/manager-view`** — click the "Open manager view →" link in the header, or click the avatar in the sidebar, or go directly to `http://localhost:5173/manager-view`.
7. **Manager's perspective** — see the privacy banner at top, Alex's completed evaluation log, and Priya's seed comment. You can add follow-up comments.

> **For best demo experience:** Complete the conversation view flow first (steps 1–5), then open `/manager-view` to see the team-lead perspective.

---

## Product Description

This prototype demonstrates an evaluation layer built into the Claude experience. When a user receives a high-stakes AI response (here: generated code), a structured, expertise-calibrated checklist appears alongside it — giving the user a clear path through evaluation. After completing the checklist, the user can share the evaluation *log* with a team senior, without sharing the conversation itself. This turns individual verification into organizational accountability infrastructure, while keeping the user's prompts and Claude's outputs completely private.

---

## Intentional Limitations

This is a **UI prototype only**. It has:
- No real AI calls — all content is hardcoded
- No real authentication — users are hardcoded as "Alex" (junior) and "Priya" (manager)
- No real persistence — state lives in React memory, resets on refresh
- Desktop layout only
- No mobile-responsive design

---

## Deploy

```bash
# Vercel (one-click)
npx vercel --prod

# Netlify
npm run build && npx netlify deploy --prod --dir=dist
```

---

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** (dark theme, custom color tokens)
- **React Router v6** (two routes: `/` and `/manager-view`)
- **Lucide React** for icons
- **react-syntax-highlighter** (Python code block, `atomOneDark` style)
- Zero backend, zero API calls, zero localStorage
