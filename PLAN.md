# TanSeek AI — Full Project Plan

## 1. Overview

TanSeek AI is a production-ready AI chat application inspired by DeepSeek and ChatGPT,
built with its own visual identity. Dark-mode-first, minimal, premium UI.

---

## 2. Tech Stack

| Layer     | Choice                                               |
| --------- | ---------------------------------------------------- |
| Framework | Next.js 16 (App Router)                              |
| Language  | JavaScript (no TypeScript)                           |
| Styling   | Tailwind CSS v4                                      |
| Database  | MongoDB                                              |
| Auth      | BetterAuth (email/password + Google OAuth)           |
| Animation | Framer Motion                                        |
| Markdown  | React Markdown + code syntax highlighting            |
| Icons     | Lucide React + custom SVG assets                     |
| AI        | Vercel AI SDK, OpenAI-compatible endpoint → **Groq** |
| Toasts    | Sonner                                               |

---

## 3. Architecture Decisions

### 3.1 No separate Express backend

Everything backend-related lives in Next.js **Route Handlers** (`src/app/api/**`).

**Why:** BetterAuth already runs in-process inside Next.js (session checks don't need a
network hop like the JWKS pattern used in HireLoop/LifeVault). AI streaming (SSE) is
native to Route Handlers + the Vercel AI SDK. One deployment target, fewer moving parts,
faster to ship for a solo-built chat app. If a heavy background worker is ever needed
(batch embeddings, cron), it can be added later as a separate small service — not needed
for MVP.

### 3.2 AI Provider: Groq

OpenAI-compatible API (matches the brief), fast inference (good for streaming UX),
inexpensive, free tier to start. Swapping to OpenAI/DeepSeek/any compatible provider
later is a one-line `AI_BASE_URL` change.

### 3.3 Component strategy: custom Tailwind + shadcn for complex primitives

Simple components (Button, Input, AuthCard) stay hand-rolled custom Tailwind, already
built in Phase 1. From Phase 2 onward, complex interactive primitives — Dropdown, Modal,
Command palette (chat search), Tooltip — use **shadcn** (Radix-based, copy-paste into
`components/ui/`, not an npm black box) for accessibility (keyboard nav, focus trap, ESC
to close) while still styled entirely with our own color tokens, so it never looks like
a generic shadcn template.

### 3.4 Route protection: `proxy.js`

Next.js 16 renamed `middleware.js` → `proxy.js` (function `proxy` instead of
`middleware`). Used to guard `/chat/*` and redirect logged-in users away from
`/login`/`/signup`.

---

## 4. Brand Identity

- **Logo:** circular gradient badge (blue `#3B82F6` → `#1D4ED8`), white 4-point spark
  in the center, thin tilted orbit ring — represents AI intelligence + search, no
  literal lettering (distinct from DeepSeek's whale mark).
- **Wordmark:** "TanSeek" in `#F9FAFB`, "AI" accent in `#2563EB`.
- **Colors:** Background `#0F172A` · Surface `#111827` · Border `#1F2937` ·
  Primary `#2563EB` · Text `#F9FAFB` · Muted `#9CA3AF`
- **Fonts:** Plus Jakarta Sans (UI) · Geist Mono (code)

---

## 5. Folder Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.js
│   │   └── signup/page.js
│   ├── api/
│   │   ├── auth/[...all]/route.js       → BetterAuth handler
│   │   ├── chat/route.js                 → send message, stream AI reply
│   │   └── chats/
│   │       ├── route.js                   → list / create chats
│   │       └── [chatId]/route.js          → get / rename / delete / pin
│   ├── chat/
│   │   ├── page.js                        → chat home (new chat)
│   │   └── [chatId]/page.js               → specific chat view
│   ├── settings/page.js
│   ├── layout.js
│   ├── globals.css
│   └── favicon.ico
├── assets/                                 → logo, icons, svgs
├── components/
│   ├── chat/                               → MessageBubble, ChatInput, StreamingText,
│   │                                          CodeBlock, MessageActions (copy/regenerate)
│   ├── shared/                             → AuthCard, Sidebar, Topbar, EmptyState
│   └── ui/                                 → Button, Input, Modal, Dropdown, Tooltip
├── lib/
│   ├── auth.js / auth-client.js / auth-session.js
│   ├── db.js                               → MongoDB client singleton
│   └── ai-client.js                        → AI SDK provider setup
├── models/
│   ├── Chat.js                             → query helpers
│   └── Message.js
├── services/
│   └── ai-stream.js                        → prompt building + streaming call
├── actions/
│   └── chat-actions.js                     → "use server" (rename/delete/pin)
├── hooks/
│   ├── useChat.js                          → streaming state, send/stop/regenerate
│   └── useChatList.js                      → sidebar history state
├── constants/
│   └── index.js                            → route paths, model list, limits
├── providers/
│   └── SessionProvider.js (if needed)
└── proxy.js                                 → route protection
```

---

## 6. Data Models (MongoDB)

BetterAuth owns `user`, `session`, `account`, `verification` — not touched directly.

```js
// chats
{
  _id: ObjectId,
  userId: string,
  title: string,
  pinned: boolean,
  createdAt: Date,
  updatedAt: Date,
}

// messages
{
  _id: ObjectId,
  chatId: ObjectId,
  userId: string,
  role: "user" | "assistant",
  content: string,
  model: string,
  createdAt: Date,
}
```

Separate collections (not embedded) so chats can grow long without hitting MongoDB's
16MB document limit, and messages can be paginated.

---

## 7. API Routes

| Method   | Route                 | Purpose                                               |
| -------- | --------------------- | ----------------------------------------------------- |
| `*`      | `/api/auth/[...all]`  | BetterAuth (login/signup/session/OAuth)               |
| `POST`   | `/api/chats`          | Create new chat                                       |
| `GET`    | `/api/chats`          | List current user's chats                             |
| `GET`    | `/api/chats/[chatId]` | Load messages for a chat                              |
| `PATCH`  | `/api/chats/[chatId]` | Rename / pin / unpin                                  |
| `DELETE` | `/api/chats/[chatId]` | Delete chat + its messages                            |
| `POST`   | `/api/chat`           | Send message → stream AI response, persist both sides |

Every route checks `getSession()` + verifies `chat.userId === session.user.id`.

---

## 8. Environment Variables

```
# MongoDB
MONGODB_URI=

# BetterAuth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI (Groq)
AI_API_KEY=
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.3-70b-versatile
```

---

## 9. Development Phases

### ✅ Phase 0 — Foundation (done)

Logo, favicon, Tailwind theme tokens, fonts wired into `layout.js`.

### ✅ Phase 1 — Authentication (done)

BetterAuth + MongoDB, email/password + Google OAuth, login/signup UI,
`proxy.js` route protection, session helpers.

### ⬜ Phase 2 — Chat UI Layout

- Sidebar: chat list (static/mock first), new chat button, search input, collapse toggle
- Sidebar bottom: user avatar (photo if set via `avatarUrl`, else initials fallback like
  "MT") + dropdown menu (Settings, Logout) — same pattern as claude.ai's sidebar
- Topbar: model indicator, settings/profile menu
- Main chat window shell: empty state, message list container, input bar
- Fully responsive (mobile drawer sidebar, desktop persistent sidebar)

### ⬜ Phase 3 — AI Chat Engine

- Wire `/api/chat` + Groq streaming
- Markdown rendering + code syntax highlight (Geist Mono)
- Copy message, Regenerate, Stop generation (AbortController)
- Auto-scroll, loading/typing indicator

### ⬜ Phase 4 — Chat History Management

- Wire `/api/chats` CRUD into sidebar (real data)
- Rename chat (inline edit), Delete (confirm), Pin
- Search across chat history
- Auto-generate chat title from first message

### ⬜ Phase 5 — Settings & Polish

- Settings page (account info, theme, sign out)
- Dark mode toggle (dark-first, light optional)
- Empty states, error states, skeleton loaders
- Final Framer Motion polish (page transitions, message entrance)

### ⬜ Phase 6 — Production Readiness

- Rate limiting on `/api/chat`
- Error boundaries, clean error messages (no raw stack traces)
- Env var review for deployment (Vercel)
- Final QA pass across mobile/desktop

---

## 10. Working Rules (carried through every phase)

- Explain **what** + **why** before generating code.
- Wait for approval before moving to the next phase.
- No unnecessary files — only what the feature needs.
- Complete, working code files (not fragments).
- Git commit message suggested at the end of each session.
- Sonner for all toasts, clean minimal UI over decoration.
