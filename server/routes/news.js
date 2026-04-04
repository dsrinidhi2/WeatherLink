// server/routes/news.js
const express = require("express");
const axios = require("axios");
const router = express.Router();
const xml2js = require("xml2js");

// CLEAN HTML → plain text only
function cleanHTML(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")        // remove all HTML tags
    .replace(/&nbsp;/g, " ")        // replace HTML entities
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")           // collapse extra spaces
    .trim();
}

router.get("/:city", async (req, res) => {
  try {
    const city = req.params.city;

    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
      city + " weather"
    )}&hl=en-IN&gl=IN&ceid=IN:en`;

    const response = await axios.get(url, { responseType: "text" });

    xml2js.parseString(response.data, (err, result) => {
      if (err) return res.json({ success: false, articles: [] });

      const items =
        result.rss.channel[0].item?.map((item) => ({
          title: item.title[0],
          link: item.link[0],
          pubDate: item.pubDate ? item.pubDate[0] : "Unknown",

          // CLEANED DESCRIPTION (no <a>, no html)
          description: cleanHTML(item.description?.[0] || ""),
        })) || [];

      // Last 30 days
      const oneMonth = new Date();
      oneMonth.setDate(oneMonth.getDate() - 30);

      const filtered = items.filter(
        (a) => new Date(a.pubDate) >= oneMonth
      );

      res.json({
        success: true,
        articles: filtered.slice(0, 12),
      });
    });
  } catch (err) {
    console.log("RSS ERROR:", err.message);
    res.json({ success: false, articles: [] });
  }
});

module.exports = router;
