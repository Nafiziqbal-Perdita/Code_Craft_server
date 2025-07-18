# CodeCraft Brain

A backend service for generating, managing, and delivering code artifacts using Large Language Models (LLMs). Designed to power modern code generation workflows and integrate seamlessly with frontend development environments.

---

## Features

- **LLM-Powered Code Generation:** Uses state-of-the-art LLMs to generate code, project files, and development artifacts on demand.
- **RESTful API:** Exposes endpoints for project type detection and interactive chat/code generation.

- **React & Node.js Support:** Can generate both React (frontend) and Node.js (backend) project templates.
- **Configurable & Extensible:** Easily adapt prompts, models, and project templates.

---

## Getting Started

### Prerequisites
- Node.js v18 or higher
- npm
- A valid Groq API key (for LLM access)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd codecraft/server
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and add your Groq API key:
     ```sh
     cp .env.example .env
     # Edit .env and set GROQ_API_KEY
     ```

### Running the Server

```sh
npm start
```

The server will start on [http://localhost:3000](http://localhost:3000).

---

## API Endpoints

### `POST /template`
Detects the project type (Node.js or React) based on a prompt and returns relevant code generation prompts.

**Request Body:**
```json
{
  "prompt": "Create a simple web server"
}
```

**Response:**
```json
{
  "prompts": [ ... ],
  "uiPrompts": [ ... ]
}
```

---

### `POST /chat`
Generates code artifacts and project files based on a conversation or prompt history.

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Build a todo app in React" }
  ]
}
```

**Response:**
```json
{
  "response": "<boltArtifact>...</boltArtifact>"
}
```

The response contains code files and shell commands in a structured format for easy parsing and project setup.

---

## Project Structure

- `index.js` — Main server file, sets up API endpoints and LLM integration
- `defaults/` — Contains prompt templates, constraints, and base project templates
- `.env.example` — Example environment variable file
- `.gitignore` — Standard Node.js and project ignores

---

## Improving Results

> **Note:** The quality and efficiency of code generation depend heavily on the LLM API used. For best results, use a high-quality, up-to-date LLM API with strong code generation capabilities. Better models will yield more accurate, robust, and production-ready code artifacts.

---

## License

MIT
