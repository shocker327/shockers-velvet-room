# The Velvet Suite

**Premium AI Companion Chat App** — Intimate, uncensored conversations with AI companions.

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + tRPC
- **Database:** SQLite (better-sqlite3)
- **AI:** OpenAI API (gpt-4.1-mini)
- **Auth:** Anonymous (localStorage-based UUID)

## Features

- 🔞 Age verification gate (18+)
- 💜 4 unique AI companions (Serena, Alex, Luna, Victoria)
- 🔓 Uncensored adult chat with persistent history
- 💰 Pricing page with waitlist signup
- 📜 Terms of Service & Privacy Policy
- 🎨 Dark luxury design with gold accents

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/shocker327/shockers-velvet-room.git
cd shockers-velvet-room

# Install dependencies
npm install

# Set environment variables
export OPENAI_API_KEY=your_openai_api_key_here

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
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI chat |
| `PORT` | No | Server port (default: 3000, Railway provides automatically) |

## Deployment (Railway)

1. Connect this repo to Railway
2. Add `OPENAI_API_KEY` environment variable
3. Optionally mount a volume at `/data` for persistent SQLite storage
4. Deploy — Railway will automatically build and start the app

The `railway.json` is pre-configured with build and start commands.

## Project Structure

```
/
├── package.json          # Root package with scripts
├── railway.json          # Railway deployment config
├── client/               # React frontend
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/        # Landing, Companions, Chat, Pricing, Terms, Privacy
│   │   ├── components/   # Header, Footer, AgeGate, CompanionCard, ChatInterface
│   │   └── utils/        # anonymousUser.ts, trpc.ts
│   └── vite.config.ts
├── server/               # Express + tRPC backend
│   ├── index.ts          # Server entry point
│   ├── router.ts         # tRPC API routes
│   ├── db.ts             # SQLite database setup
│   └── companions.ts     # Companion definitions
└── tsconfig.server.json  # Server TypeScript config
```

## Contact

support@shockersvelvetsuite.shop

## License

© 2026 Shocker Studios. All rights reserved.
