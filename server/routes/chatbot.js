// server/routes/chatbot.js
const express = require("express");
const router = express.Router();
require("dotenv").config();

// fetch helper for CommonJS (works across Node versions)
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn("Warning: GEMINI_API_KEY not found in environment!");
}

// Use the model you said worked in Python (match your Streamlit)
const MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// Utility: ask Gemini to reply with short "text" and a JSON object (machine-readable)
function buildPrompt(userMessage, city, weather) {
  // keep prompt concise; tell model to return JSON in "meta" field as strict JSON
  return `
You are WeatherLink Assistant — a friendly helpful AI.

GOAL:
1) Answer the user's question in a short, friendly sentence or two.
2) ALSO produce a compact JSON object named "meta" with these optional fields if relevant:
   - mood: one-word detected mood ("happy","sad","stressed","bored","tired","hungry","romantic","neutral")
   - clothing: short clothing recommendation string (e.g. "light cotton T-shirt, shorts")
   - skincare: short skincare tip (e.g. "apply SPF50 sunscreen", "use thick moisturizer at night")
   - food: 1-3 food/drink suggestions
   - traffic: brief traffic advice if weather might affect travel
   - movies: 2 movie/2 series suggestions (short list)
   - recipe: when user asks for a recipe, include {name, ingredients[], steps[]}
Rules:
- Reply first with a concise human-friendly answer under "reply:".
- THEN on a new line output ONLY valid JSON (no extra text) with key "meta" containing the fields above when applicable.
- Keep the human reply <= 2 sentences.
- If you cannot fill a field, set it to null or empty array.

Context:
User city: ${city || "unknown"}
Weather JSON: ${JSON.stringify(weather || {}, null, 0)}

User message: ${userMessage}

Produce output EXACTLY as described (human reply, newline, then JSON).
`;
}

router.post("/", async (req, res) => {
  try {
    const { message, city, weather } = req.body;
    const userMessage = (message || "").trim();

    if (!userMessage) {
      return res.json({ success: false, reply: "Please type something 😊" });
    }

    const prompt = buildPrompt(userMessage, city, weather);

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    console.log("GEMINI RAW:", JSON.stringify(json, null, 2));

    // read text candidate
    let text =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't process that 😅";

    // attempt to split human reply and JSON meta (model should follow instruction)
    // strategy: find last newline then parse JSON from the remainder
    let humanReply = text;
    let meta = null;

    // try to find JSON on the last newline
    const lastNewline = text.lastIndexOf("\n");
    if (lastNewline !== -1) {
      const possibleJson = text.slice(lastNewline + 1).trim();
      try {
        const parsed = JSON.parse(possibleJson);
        // If parsed and contains meta field, accept
        if (parsed && typeof parsed === "object" && ("meta" in parsed || Object.keys(parsed).length > 0)) {
          // if model wrapped keys under "meta", use it; else assume parsed is the meta object
          meta = parsed.meta ? parsed.meta : parsed;
          humanReply = text.slice(0, lastNewline).trim();
        } else {
          // try if the JSON is embedded earlier (search for first '{')
          const firstBrace = text.indexOf("{");
          if (firstBrace !== -1) {
            const jsonCandidate = text.slice(firstBrace);
            try {
              const p2 = JSON.parse(jsonCandidate);
              meta = p2.meta ? p2.meta : p2;
              humanReply = text.slice(0, firstBrace).trim();
            } catch {}
          }
        }
      } catch (e) {
        // fallback: try to locate JSON anywhere
        const firstBrace = text.indexOf("{");
        if (firstBrace !== -1) {
          const jsonCandidate = text.slice(firstBrace);
          try {
            const p2 = JSON.parse(jsonCandidate);
            meta = p2.meta ? p2.meta : p2;
            humanReply = text.slice(0, firstBrace).trim();
          } catch {}
        }
      }
    } else {
      // no newline — try extracting JSON by first brace
      const firstBrace = text.indexOf("{");
      if (firstBrace !== -1) {
        const jsonCandidate = text.slice(firstBrace);
        try {
          const p2 = JSON.parse(jsonCandidate);
          meta = p2.meta ? p2.meta : p2;
          humanReply = text.slice(0, firstBrace).trim();
        } catch {}
      }
    }

    // normalize meta defaults
    if (!meta) {
      meta = {
        mood: null,
        clothing: null,
        skincare: null,
        food: [],
        traffic: null,
        movies: [],
        recipe: null,
      };
    } else {
      meta = {
        mood: meta.mood ?? null,
        clothing: meta.clothing ?? null,
        skincare: meta.skincare ?? null,
        food: meta.food ?? (Array.isArray(meta.food) ? meta.food : (meta.food ? [meta.food] : [])),
        traffic: meta.traffic ?? null,
        movies: meta.movies ?? (Array.isArray(meta.movies) ? meta.movies : (meta.movies ? [meta.movies] : [])),
        recipe: meta.recipe ?? null,
      };
    }

    return res.json({ success: true, reply: humanReply, meta });
  } catch (err) {
    console.error("GEMINI ERROR:", err);
    return res.json({
      success: false,
      reply: "Server error: Gemini failed.",
      meta: null,
    });
  }
});

module.exports = router;
