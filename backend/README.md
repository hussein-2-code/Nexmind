# Nexmind API

Backend for **Nexmind** — a platform connecting clients with freelancers, with real-time messaging and AI-powered features.

## Stack

- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **JWT** authentication & role-based access (user / freelancer / admin)
- **Socket.io** for real-time chat
- **AI**: **DeepSeek** or **Groq** for dashboard UI generation (configurable via env)
- Security: Helmet, rate limiting, CORS, sanitization

## Main features

- User auth (signup, login, password reset)
- Projects (client ↔ freelancer)
- Conversations & messages (real-time)
- AI endpoints (e.g. generate dashboard UI from description)
- Admin: user management, dashboard

## Run locally

```bash
npm install
cp config.env.example config.env   # then fill in your env vars
npm run start:dev
```

Defaults: `PORT=8000`, MongoDB from `DATABASE` or `MONGO_URI` in `config.env`.

### AI provider (Generate UI)

The **Generate UI Concept** feature uses an LLM. You can use either:

| Provider   | Env variable       | Notes |
|-----------|--------------------|--------|
| **DeepSeek** | `DEEPSEEK_API_KEY` | [Get key](https://platform.deepseek.com). Pay-as-you-go (very cheap); new accounts may get free credits. If set, this is used first. |
| **Groq**    | `GROQ_API_KEY`     | Used when `DEEPSEEK_API_KEY` is not set. |

Set **one** (or both). If both are set, DeepSeek is used.

## Scripts

- `npm run start:dev` — development (nodemon)
- `npm run start:prod` — production
- `npm run seed:demo` — seed demo users
- `npm test` — run tests
