// import dotenv from "dotenv";
// import type { Request, Response } from "express";
// import express from "express";
// import OpenAI from "openai";

// dotenv.config();

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const app = express();
// app.use(express.json());

// const port = process.env.PORT || 3000;

// app.get("/", (req: Request, res: Response) => {
//   res.send("Hello, World!");
// });

// app.get("/api/hello", (req: Request, res: Response) => {
//   res.json({ message: "Hello, Server World!" });
// });

// let lastResponseId: string | null = null;

// app.post("/api/chat", async (req: Request, res: Response) => {
//   const { prompt } = req.body;

//   const response = await client.responses.create({
//     model: "gpt-40-mini",
//     input : prompt
//     temperature: 0.2,
//     max_output_tokens: 100,
//     previous_response_id: lastResponseId;
//   });
//   lastResponseId = response.id;
//   res.json({ message: response.output_text });
// });

// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });

//..............From MOSH .......................

//..............From here the workable .......................

// import dotenv from "dotenv";
// import type { Request, Response } from "express";
// import express from "express";
// import OpenAI from "openai";

// dotenv.config();

// const client = new OpenAI({
//   apiKey: process.env.HUGGINGFACE_API_KEY,
//   baseURL: "https://router.huggingface.co/v1",
// });

// const app = express();
// app.use(express.json());

// const port = process.env.PORT || 3000;

// app.get("/", (req: Request, res: Response) => {
//   res.send("Hello, World!");
// });

// app.get("/api/hello", (req: Request, res: Response) => {
//   res.json({ message: "Hello, Server World!" });
// });

// app.post("/api/chat", async (req: Request, res: Response) => {
//   const { prompt } = req.body;

//   const response = await client.chat.completions.create({
//     model: "openai/gpt-oss-120b:cerebras",
//     messages: [{ role: "user", content: prompt }],
//     temperature: 0.2,
//     max_tokens: 100,
//   });
//   const reply = response.choices[0]?.message?.content || "No response";
//   res.json({ response: reply });
// });

// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });

//.................

// import { InferenceClient } from "@huggingface/inference";
// import "dotenv/config";
// import express, { type Request, type Response } from "express";

// const app = express();
// app.use(express.json());

// const port = process.env.PORT || 3000;

// // HF Token check
// const HF_TOKEN = process.env.HF_API_KEY;
// if (!HF_TOKEN) {
//   throw new Error("HF_API_KEY is not set in .env");
// }

// // Hugging Face SDK client
// const client = new InferenceClient(HF_TOKEN);

// app.get("/", (_req: Request, res: Response) => {
//   res.send("Hello, Hugging Face SDK!");
// });

// app.post("/api/chat", async (req: Request, res: Response) => {
//   const { prompt } = req.body;

//   if (!prompt) {
//     return res.status(400).json({ error: "Prompt is required" });
//   }

//   try {
//     // ChatCompletion call
//     const chatCompletion = await client.chatCompletion({
//       provider: "featherless-ai",
//       model: "mistralai/Mistral-7B-Instruct-v0.2",
//       messages: [
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//       parameters: {
//         max_new_tokens: 20,
//         temperature: 0.2,
//       },
//     });

//     // ✅ Direct string output
//     const message =
//       chatCompletion.choices?.[0]?.message?.content ||
//       "No response from model.";

//     res.json({ message });
//   } catch (err: any) {
//     console.error("Error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

// app.listen(port, () => {
//   console.log(`🚀 Server running on http://localhost:${port}`);
// });

//.....................

import { InferenceClient } from "@huggingface/inference";
import cookieParser from "cookie-parser"; // session id handling
import "dotenv/config";
import express, { type Request, type Response } from "express";

const app = express();
app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 3000;

// HF Token check
const HF_TOKEN = process.env.HF_API_KEY;
if (!HF_TOKEN) throw new Error("HF_API_KEY is not set in .env");

// Hugging Face SDK client
const client = new InferenceClient(HF_TOKEN);

// In-memory session storage
// sessionId -> conversation array
const sessionHistory: Record<
  string,
  { role: "user" | "assistant"; content: string }[]
> = {};

// Helper to get or create session
function getSession(req: Request): {
  sessionId: string;
  history: { role: "user" | "assistant"; content: string }[];
} {
  let sessionId = req.cookies.sessionId;
  if (!sessionId) {
    sessionId = Date.now().toString(); // simple unique id
    req.res?.cookie("sessionId", sessionId, { httpOnly: true });
  }
  if (!sessionHistory[sessionId]) sessionHistory[sessionId] = [];
  return { sessionId, history: sessionHistory[sessionId]! };
}

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello, Hugging Face Short Answer + Context API!");
});

app.post("/api/chat", async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const { history } = getSession(req);

    // Add user message to session history
    history.push({
      role: "user",
      content: `Answer in one sentence: ${prompt}`,
    });

    // Call Hugging Face ChatCompletion
    const chatCompletion = await client.chatCompletion({
      provider: "featherless-ai",
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: history,
      parameters: {
        max_new_tokens: 20, // keep it short
        temperature: 0.2,
      },
    });

    const message =
      chatCompletion.choices?.[0]?.message?.content?.trim() ||
      "No response from model.";

    // Add assistant response to session history
    history.push({ role: "assistant", content: message });

    res.json({ message });
  } catch (err: any) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
