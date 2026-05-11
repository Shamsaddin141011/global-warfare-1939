# Global Warfare 1939

A real-time multiplayer WW2 grand strategy game. Play as Germany, USSR, UK, USA, Japan, or others — command your armies using natural language, fight AI opponents, and conquer Europe.

## Setup

```bash
git clone https://github.com/Shamsaddin141011/global-warfare-1939
cd global-warfare-1939
npm install
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3001

## Optional: AI narration

Create `server/.env`:

```
ANTHROPIC_API_KEY=your_key_here
USE_LLM_NARRATION=true
```

Without this file the game works fully — narration is just disabled.

## How to play

1. Click **Solo vs AI** for an instant game as Germany
2. Type commands in the bar at the bottom of the map:
   - `attack France with 10 divisions`
   - `reinforce Berlin`
   - `build 5 infantry`
   - `research armor`
   - `declare war on the Soviet Union`
3. Click **End Turn** to submit your orders
4. Click any territory to inspect it in the right panel

## Stack

- React 18 + Vite + Tailwind CSS + Framer Motion (client)
- Node.js + Express + Socket.IO v4 (server)
- npm workspaces monorepo (`client/` `server/` `shared/` `data/`)
