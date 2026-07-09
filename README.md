# TanSeek AI

TanSeek AI is a production-ready AI chat application inspired by DeepSeek and ChatGPT,
built with its own visual identity — dark-mode-first, minimal, and premium.

![TanSeek AI](./src/assets/logo_icon.svg)

---

## ✨ Features

- **Authentication** — Email/password + Google OAuth (BetterAuth)
- **AI Chat** — Real-time streaming responses via Groq (OpenAI-compatible API)
- **Markdown & Code** — Full markdown rendering, syntax-highlighted code blocks with
  copy button, table support
- **Chat History** — Create, rename, pin, delete, and search conversations
- **Edit & Resubmit** — Edit a previously sent message and regenerate the response
  from that point, truncating the outdated branch
- **Regenerate & Stop** — Regenerate the last AI response, or stop generation mid-stream
- **Responsive** — Persistent sidebar on desktop, slide-in drawer on mobile
- **Dark / Light / System theme** — via `next-themes`
- **Settings** — Account info, theme switcher, logout

---

## 🛠 Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | JavaScript |
| Styling | Tailwind CSS v4 + `@tailwindcss/typography` |
| Database | MongoDB |
| Auth | BetterAuth (email/password + Google OAuth) |
| Animation | Framer Motion |
| Markdown | react-markdown + remark-gfm |
| Code Highlighting | react-syntax-highlighter |
| Icons | Lucide React |
| AI | Vercel AI SDK + Groq (OpenAI-compatible endpoint) |
| Toasts | Sonner |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.js
│   │   └── signup/page.js
│   ├── api/
│   │   ├── auth/[...all]/route.js       # BetterAuth handler
│   │   ├── chat/route.js                 # streaming AI responses
│   │   └── chats/
│   │       ├── route.js                   # list / create chats
│   │       └── [chatId]/
│   │           ├── route.js               # get / rename / pin / delete
│   │           └── messages/[messageId]/route.js  # delete for edit-resubmit
│   ├── chat/
│   │   ├── layout.js                      # sidebar shell
│   │   ├── page.js                        # new chat
│   │   ├── error.js
│   │   └── [chatId]/page.js               # existing conversation
│   ├── settings/
│   │   ├── layout.js
│   │   └── page.js
│   ├── layout.js
│   ├── error.js
│   ├── page.js                            # redirects based on session
│   └── globals.css
├── assets/                                 # logo, icons
├── components/
│   ├── chat/       # ChatInput, MessageBubble, CodeBlock, EmptyState, TypingIndicator
│   ├── shared/      # Sidebar, Topbar, UserMenu, ChatListItem, AuthCard
│   └── ui/          # Skeleton, AuthInput, AuthButton, GoogleButton
├── lib/
│   ├── auth.js / auth-client.js
│   ├── db.js
│   ├── ai-client.js
│   └── events.js
├── models/
│   ├── Chat.js
│   └── Message.js
├── hooks/
│   ├── useChat.js
│   └── useChatList.js
├── providers/
│   ├── SidebarProvider.js
│   └── ThemeProvider.js
└── proxy.js                                 # route protection (formerly middleware)
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/tanseek_ai_db?appName=Cluster0

# BetterAuth
BETTER_AUTH_SECRET=<random-string>          # e.g. openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (Google Cloud Console → Credentials)
# Authorized redirect URI: http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# AI (Groq — https://console.groq.com)
AI_API_KEY=gsk_...
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=llama-3.3-70b-versatile
```

> ⚠️ The database name must be explicitly included in `MONGODB_URI` (right after the
> cluster host, before the `?` query params) — otherwise MongoDB silently writes to a
> default `test` database.

---

## 🚀 Getting Started

```bash
npm install
```

Set up `.env` as described above, then:

```bash
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to `/login` or `/chat` depending
on whether you have an active session.

---

## 🗄 Database Collections (MongoDB)

BetterAuth manages `user`, `session`, `account`, and `verification` automatically.
The app additionally uses:

```js
// chats
{ _id, userId, title, pinned, createdAt, updatedAt }

// messages
{ _id, chatId, userId, role: "user" | "assistant", content, model, createdAt }
```

---

## 🔑 Key Architectural Decisions

- **No separate backend** — everything runs through Next.js Route Handlers
  (`app/api/**`), since BetterAuth and the AI SDK's streaming both work natively
  inside Next.js without needing a separate Express/JWKS layer.
- **Groq via chat completions endpoint** — the AI SDK defaults to OpenAI's newer
  Responses API, which Groq doesn't support; the client is explicitly pinned to
  `.chat()` for compatibility.
- **`cookieCache` disabled** in BetterAuth session config to avoid intermittent
  session-verification failures observed during development.
- **Client-side typewriter effect** smooths out uneven network-delivered stream
  chunks into a steady reveal speed, decoupled from raw network timing.
- **Plain-text rendering during active streaming**, switching to full markdown only
  once a response completes — avoids layout jumps from incomplete syntax (headers,
  code fences) appearing mid-stream.

---

## 📌 Known Limitations

- The AI model has a training cutoff and no real-time knowledge of current events;
  it's instructed to acknowledge this rather than guess. Full real-time awareness
  would require a web search integration (not yet implemented — noted as a possible
  future enhancement).
- Google OAuth consent screen is in "Testing" mode by default — only test users
  added in Google Cloud Console can sign in until the app is verified for production.

---

## 🧭 Roadmap / Possible Future Work

- Web search / live data integration for current-events questions
- Rate limiting on `/api/chat`
- Message timestamps, scroll-to-bottom button
- Regenerate variations (more concise / more detailed)
- Production deployment hardening (Vercel + MongoDB Atlas IP allowlist, etc.)
