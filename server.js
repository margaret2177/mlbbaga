import express from "express";
import cors from "cors";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const CACHE_FILE = "./cache.json";
let cache = fs.existsSync(CACHE_FILE)
  ? JSON.parse(fs.readFileSync(CACHE_FILE))
  : {};
app.get("/", async (req, res) => {
  res.send("Welcome to mlbbaga");
});
app.post("/api/explain", async (req, res) => {
  const { teamA, teamB } = req.body;
  const cacheKey = JSON.stringify({ teamA, teamB });
  if (cache[cacheKey]) return res.json(cache[cacheKey]);

  const prompt = `
You are a friendly Mobile Legends coach.
Your job: Suggest the best next pick and explain why, based on both team comps.

Team A: ${teamA.join(", ")}
Team B: ${teamB.join(", ")}

Respond briefly (2–3 sentences), in a positive coaching tone.
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  cache[cacheKey] = { text };
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  res.json({ text });
});

app.listen(3000, () => console.log("Server running on port 3000"));
