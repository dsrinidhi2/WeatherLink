const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

/* ---------------------------------------
   ADD FAVOURITE
--------------------------------------- */
router.post("/favourites", auth, async (req, res) => {
  try {
    const { city } = req.body;

    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { favourites: city } }
    );

    const updated = await User.findById(req.user.id);
    res.json({ success: true, favourites: updated.favourites });
  } catch (err) {
    console.log("ADD FAV ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/* ---------------------------------------
   GET FAVOURITES
--------------------------------------- */
router.get("/favourites", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, favourites: user.favourites });
});

/* ---------------------------------------
   DELETE ONE FAVOURITE
--------------------------------------- */
router.delete("/favourites/:city", auth, async (req, res) => {
  try {
    const city = decodeURIComponent(req.params.city);

    await User.updateOne(
      { _id: req.user.id },
      { $pull: { favourites: city } }
    );

    const updated = await User.findById(req.user.id);
    res.json({ success: true, favourites: updated.favourites });
  } catch (err) {
    console.log("DELETE FAV ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/* ---------------------------------------
   DELETE ALL FAVOURITES
--------------------------------------- */
router.delete("/favourites", auth, async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user.id },
      { $set: { favourites: [] } }
    );

    res.json({ success: true, favourites: [] });
  } catch (err) {
    console.log("DELETE ALL FAVS ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/* ---------------------------------------
   ADD RECENT
--------------------------------------- */
router.post("/recents", auth, async (req, res) => {
  try {
    const { name } = req.body;

    await User.updateOne(
      { _id: req.user.id },
      { $push: { recents: { $each: [{ name }], $position: 0 } } }
    );

    // Keep max 10 recents
    await User.updateOne(
      { _id: req.user.id },
      { $push: { recents: { $each: [], $slice: 10 } } }
    );

    const updated = await User.findById(req.user.id);
    res.json({ success: true, recents: updated.recents });
  } catch (err) {
    console.log("RECENT ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/* ---------------------------------------
   GET RECENTS
--------------------------------------- */
router.get("/recents", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, recents: user.recents });
});

/* ---------------------------------------
   DELETE ONE RECENT
--------------------------------------- */
router.delete("/recents/:city", auth, async (req, res) => {
  try {
    const city = decodeURIComponent(req.params.city);

    await User.updateOne(
      { _id: req.user.id },
      { $pull: { recents: { name: city } } }
    );

    const updated = await User.findById(req.user.id);
    res.json({ success: true, recents: updated.recents });
  } catch (err) {
    console.log("DELETE RECENT ERROR:", err);
    res.status(500).json({ success: false });
  }
});

/* ---------------------------------------
   DELETE ALL RECENTS
--------------------------------------- */
router.delete("/recents", auth, async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user.id },
      { $set: { recents: [] } }
    );

    res.json({ success: true, recents: [] });
  } catch (err) {
    console.log("DELETE ALL RECENTS ERROR:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
