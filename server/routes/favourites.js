const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

// ------------------------
// ADD FAVOURITE
// ------------------------
router.post("/favourites", auth, async (req, res) => {
  try {
    const { name } = req.body;

    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { favourites: name } }
    );

    const updated = await User.findById(req.user.id);
    res.json({ success: true, favourites: updated.favourites });

  } catch (err) {
    console.log("FAV ERROR:", err);
    res.status(500).json({ success: false, error: "Failed to add favourite" });
  }
});

// ------------------------
// GET FAVOURITES
// ------------------------
router.get("/favourites", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, favourites: user.favourites });
});

// ------------------------
// ADD RECENT SEARCH
// ------------------------
router.post("/recents", auth, async (req, res) => {
  try {
    const { name } = req.body;

    // Add at top
    await User.updateOne(
      { _id: req.user.id },
      {
        $push: {
          recents: { $each: [{ name }], $position: 0 }
        }
      }
    );

    // Limit to 10
    await User.updateOne(
      { _id: req.user.id },
      { $push: { recents: { $each: [], $slice: 10 } } }
    );

    const updated = await User.findById(req.user.id);
    res.json({ success: true, recents: updated.recents });

  } catch (err) {
    console.log("RECENTS ERROR:", err);
    res.status(500).json({ success: false, error: "Failed to add recent search" });
  }
});

// ------------------------
// GET RECENTS
// ------------------------
router.get("/recents", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, recents: user.recents });
});

module.exports = router;
