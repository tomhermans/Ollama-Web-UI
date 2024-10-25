# Ollama Web UI

A simple web interface for interacting with Ollama language models. This project provides a chat interface similar to ChatGPT but connects to your locally running Ollama instance.

![Ollama Web UI Screenshot](/api/placeholder/800/400)

## Features

- 🚀 Real-time streaming responses
- 💻 Code syntax highlighting
- 🎨 Clean, modern interface
- 📱 Responsive design
- 🔄 Easy-to-use chat interface

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm (Node Package Manager)
- Ollama (with at least one model installed)

## Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd ollama-web-ui
```

2. Set up the backend:
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install express cors

# Start the backend server
node server.js
```

3. Set up the frontend:
```bash
# Open a new terminal
# Navigate to the frontend directory
cd frontend

# Create a new Next.js app
npx create-next-app@latest .

# When prompted, choose:
# - No to TypeScript
# - Yes to ESLint
# - Yes to Tailwind CSS
# - Yes to `src/` directory
# - Yes to App Router
# - No to customize import alias

# Install additional dependencies
npm install lucide-react

# Start the development server
npm run dev
```

## Configuration

1. Make sure Ollama is running with your preferred model:
```bash
# Check if Ollama is running
ollama list

# Pull a model if needed
ollama pull llama3.2
```

2. The backend server runs on port 3001 by default
3. The frontend runs on port 3000 by default

## Usage

1. Start Ollama (if not already running):
```bash
ollama serve
```

2. Start the backend server:
```bash
cd backend
node server.js
```

3. Start the frontend development server:
```bash
cd frontend
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
ollama-web-ui/
├── backend/
│   ├── server.js          # Express server handling Ollama communication
│   └── package.json       # Backend dependencies
└── frontend/
    ├── src/
    │   └── app/
    │       ├── page.js    # Main chat interface
    │       └── globals.css # Global styles
    ├── package.json       # Frontend dependencies
    └── tailwind.config.js # Tailwind CSS configuration
```

## Development

- Backend runs on `http://localhost:3001`
- Frontend runs on `http://localhost:3000`
- Ollama API runs on `http://localhost:11434`

## Contributing

Feel free to open issues and pull requests!

## License

MIT License - feel free to use this project however you'd like.

## Acknowledgments

- Built with Next.js and Express.js
- Uses Ollama for AI model inference
- Tailwind CSS for styling