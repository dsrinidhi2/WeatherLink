const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/summary", async (req, res) => {
  try {
    const { text } = req.body;

    const result = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Summarize in 1–2 sentences." },
          { role: "user", content: text }
        ]
      },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_KEY}` } }
    );

    res.json({ summary: result.data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "AI summary failed" });
  }
});

module.exports = router;
