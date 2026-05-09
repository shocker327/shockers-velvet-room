# The Velvet Suite

**Premium AI Companion Chat App** — Intimate, uncensored conversations with AI companions.

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + tRPC
- **Database:** SQLite (better-sqlite3)
- **AI:** [OpenRouter](https://openrouter.ai) API (`mistralai/mistral-small-3.1-24b-instruct` by default)
- **Auth:** Anonymous (localStorage-based UUID)

## Features

- 🔞 Age verification gate (18+)
- 💜 4 unique AI companions (Serena, Alex, Luna, Victoria)
- 🔓 Uncensored adult chat with persistent history
- 💰 Pricing page with waitlist signup
- 📜 Terms of Service & Privacy Policy
- 🎨 Dark luxury design with gold accents
- 🔊 Voice messages — each companion has a unique TTS voice (OpenAI TTS)

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- An [OpenRouter](https://openrouter.ai) API key (free tier available)
- An [OpenAI](https://platform.openai.com) API key (for TTS voice messages)

### Installation

```bash
# Clone the repository
git clone https://github.com/shocker327/shockers-velvet-room.git
cd shockers-velvet-room

# Install dependencies
npm install

# Set environment variables
export OPENROUTER_API_KEY=your_openrouter_api_key_here
export OPENAI_API_KEY=your_openai_api_key_here  # for TTS voice messages

# Run in development mode
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | **Yes** | OpenRouter API key for AI chat (get one free at openrouter.ai) |
| `OPENAI_API_KEY` | **Yes** | OpenAI API key — used for TTS voice messages (also fallback for chat if OPENROUTER_API_KEY is missing) |
| `MODEL_NAME` | No | Override the AI model (default: `mistralai/mistral-small-3.1-24b-instruct`) |
| `PORT` | No | Server port (default: 3000; Railway provides this automatically) |

### Voice Messages (TTS)

Each companion has a unique voice powered by OpenAI's TTS API:

| Companion | Voice | Character |
|-----------|-------|----------|
| Serena | `shimmer` | Soft, warm |
| Alex | `nova` | Energetic, bright |
| Luna | `alloy` | Smooth, gentle |
| Victoria | `onyx` | Deep, commanding |

Voice messages require `OPENAI_API_KEY` to be set. If not configured, the Listen button will show an error.

### Why OpenRouter?

The app uses [OpenRouter](https://openrouter.ai) instead of OpenAI directly because OpenAI's content policy blocks explicit/NSFW content regardless of system prompts. OpenRouter provides access to uncensored models (such as Mistral) that honour adult system prompts without filtering.

The OpenRouter API is fully OpenAI-SDK-compatible — only the `baseURL` and API key differ.

### Recommended Models on OpenRouter

| Model | Notes |
|-------|-------|
| `mistralai/mistral-small-3.1-24b-instruct` | Default — fast, uncensored, good quality |
| `nousresearch/hermes-3-llama-3.1-70b` | Higher quality, slower |
| `mistralai/mistral-nemo` | Lightweight, very fast |

Set `MODEL_NAME` in Railway environment variables to switch models without redeploying.

## Deployment (Railway)

1. Connect this repo (`shocker327/shockers-velvet-room`) to Railway
2. Add environment variable: `OPENROUTER_API_KEY` (from [openrouter.ai](https://openrouter.ai))
3. Optionally set `MODEL_NAME` to override the default model
4. Optionally mount a volume at `/data` for persistent SQLite storage
5. Deploy — Railway will automatically run `npm install && npm run build` then `node dist/server/index.js`

The `railway.json` is pre-configured with build and start commands.

## Project Structure

```
/
├── package.json              # Root package with scripts
├── railway.json              # Railway deployment config
├── client/                   # React frontend
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/            # Landing, Companions, Chat, Pricing, Terms, Privacy
│   │   ├── components/       # Header, Footer, AgeGate, CompanionCard, ChatInterface
│   │   └── utils/            # anonymousUser.ts, trpc.ts
│   └── vite.config.ts
├── server/                   # Express + tRPC backend
│   ├── index.ts              # Server entry point
│   ├── router.ts             # tRPC API routes (OpenRouter integration)
│   ├── db.ts                 # SQLite database setup
│   └── companions.ts         # Companion definitions & system prompts
└── tsconfig.server.json      # Server TypeScript config
```

## Contact

support@shockersvelvetsuite.shop

## License

© 2026 Shocker Studios. All rights reserved.
