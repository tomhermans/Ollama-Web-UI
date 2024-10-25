# Ollama Web UI
# Quick Start Guide

## 1. One-line Setup

Copy and paste these commands:

```bash
# Create project structure
mkdir ollama-web-ui && cd ollama-web-ui
mkdir backend frontend

# Setup backend
cd backend
npm init -y
npm install express cors
curl -o server.js https://raw.githubusercontent.com/[your-repo]/main/backend/server.js

# Setup frontend
cd ../frontend
npx create-next-app@latest . --no-typescript --tailwind --eslint --src-dir --app --no-import-alias
npm install lucide-react
curl -o src/app/page.js https://raw.githubusercontent.com/[your-repo]/main/frontend/src/app/page.js
```

## 2. Start the Services

1. Make sure Ollama is running:
```bash
ollama serve
```

2. Start the backend (new terminal):
```bash
cd backend
node server.js
```

3. Start the frontend (new terminal):
```bash
cd frontend
npm run dev
```

## 3. Open in Browser

Visit `http://localhost:3000`

That's it! Start chatting with your local Ollama model.