// Import required modules and configuration
import express from "express"; // Express web framework
import { ChatGroq } from "@langchain/groq"; // LLM integration
import { ChatPromptTemplate } from "@langchain/core/prompts"; // Prompt templating
import dotenv from "dotenv"; // Environment variable loader

// Import prompt templates and base prompts
import { BASE_PROMPT, getSystemPrompt } from "./defaults/prompt.js";
import { basePrompt as nodeBasePrompt } from "./defaults/node.js";
import { basePrompt as reactBasePrompt } from "./defaults/react.js";
import cors from "cors";
// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const port = 3001;

// ✅ Enable CORS for all origins (or specify allowed origin)
const allowedOrigins = [
  // "http://localhost:5173",
  "https://code-craft-ui.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Middleware to parse JSON request bodies
app.use(express.json());

// POST /template endpoint: Determines project type (node or react) using LLM and returns appropriate prompts
app.post("/template", async (req, res) => {
  // Extract prompt from request body
  const prompt = req.body.prompt;

  console.log("prompt", prompt); // Log incoming prompt

  // Initialize the language model with configuration
  const llm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0.5,
    maxTokens: 200,
    maxRetries: 2,
  });

  // Create a prompt template to ask the LLM to classify the project
  const promtTemplate = ChatPromptTemplate.fromMessages([
    [
      "system",
      "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
    ],
    ["user", "{topic}"],
  ]);

  // Format the prompt with the user's topic
  const formattedMessages = await promtTemplate.formatMessages({
    topic: prompt,
  });

  // Invoke the LLM with the formatted messages
  const response = await llm.invoke(formattedMessages);
  console.log("LLM response:", response.content); // Log LLM response

  // Extract and normalize the answer from the LLM response
  const answer = response.content?.trim().toLowerCase();

  console.log("ans", answer); // Log the answer

  // If the answer is 'react', return React-specific prompts
  if (answer === "react") {
    res.json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [reactBasePrompt],
    });
    return;
  }

  // If the answer is 'node', return Node.js-specific prompts
  if (answer === "node") {
    res.json({
      prompts: [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [nodeBasePrompt],
    });
    return;
  }

  // If the answer is neither 'node' nor 'react', return a 403 error
  res.status(403).json({ message: "You cant access this" });
});

app.post("/chat", async (req, res) => {
  console.log(`i got a work...\n\n let me do that`);
  try {
    const messages = req.body.messages;

    // console.log("Received messages:", messages);

    // Initialize the language model with configuration
    const llm = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      maxTokens: 8000,
      maxRetries: 1,
    });

    // Create messages array starting with system prompt
    // Get the system prompt and escape any curly braces to avoid template parsing errors
    const systemPrompt = getSystemPrompt()
      .replace(/\{/g, "{{")
      .replace(/\}/g, "}}");

    // Build the full messages array with system prompt + user messages
    // Escape curly braces in all message content to avoid template parsing errors
    const allMessages = [
      ["system", systemPrompt],
      ...messages.map((msg) => [
        msg.role || "user",
        (msg.content || "").replace(/\{/g, "{{").replace(/\}/g, "}}"),
      ]),
    ];

    const promtTemplate = ChatPromptTemplate.fromMessages(allMessages);

    // Format and invoke the LLM (no variables to format since we're using direct messages)
    const formattedMessages = await promtTemplate.formatMessages({});

    const response = await llm.invoke(formattedMessages);

    console.log("Chat response:", response.content);

    res.json({
      response: response.content,
    });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

// GET / endpoint: Simple health check route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start the Express server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
