const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Contact = require("../models/Contact");
const Alert = require("../models/Alert");

// -------------------------
// CONTACTS
// -------------------------
router.get("/contacts", auth, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, contacts });
  } catch (err) {
    console.error("CONTACTS GET ERR:", err);
    res.status(500).json({ success: false, error: "Failed to load contacts" });
  }
});

router.post("/contacts", auth, async (req, res) => {
  try {
    const { name, relation, city, phone } = req.body;
    if (!name) return res.status(400).json({ success: false, error: "Name required" });

    const c = new Contact({ user: req.user.id, name, relation, city, phone });
    await c.save();
    res.json({ success: true, contact: c });
  } catch (err) {
    console.error("CONTACT ADD ERR:", err);
    res.status(500).json({ success: false, error: "Failed to add contact" });
  }
});

router.delete("/contacts/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    await Contact.deleteOne({ _id: id, user: req.user.id });
    res.json({ success: true });
  } catch (err) {
    console.error("CONTACT DEL ERR:", err);
    res.status(500).json({ success: false, error: "Failed to delete contact" });
  }
});

// -------------------------
// ALERTS
// -------------------------
router.post("/alerts", auth, async (req, res) => {
  try {
    const { title, body, severity, forCloudCrew = false, recipients = [], exclusive = false } = req.body;

    const a = new Alert({
      user: req.user.id,
      title,
      body,
      severity: severity || "info",
      forCloudCrew,
      recipients,
      exclusive,
    });

    await a.save();

    // BROOO — REAL-TIME ALERTS HERE 🔥
    if (forCloudCrew) {
      global._io.emit("new-alert", { type: "cloudcrew", alert: a });
    }
    if (exclusive) {
      global._io.to(req.user.id.toString()).emit("new-alert", { type: "exclusive", alert: a });
    }

    res.json({ success: true, alert: a });
  } catch (err) {
    console.error("ALERT CREATE ERR:", err);
    res.status(500).json({ success: false, error: "Failed to create alert" });
  }
});

router.get("/alerts", auth, async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, alerts });
  } catch (err) {
    console.error("ALERTS GET ERR:", err);
    res.status(500).json({ success: false, error: "Failed to load alerts" });
  }
});

router.get("/alerts/exclusive", auth, async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user.id, exclusive: true }).sort({ createdAt: -1 });
    res.json({ success: true, alerts });
  } catch (err) {
    console.error("EXCL ALERTS ERR:", err);
    res.status(500).json({ success: false, error: "Failed to load exclusive alerts" });
  }
});

router.get("/alerts/cloudcrew", auth, async (req, res) => {
  try {
    const alerts = await Alert.find({ user: req.user.id, forCloudCrew: true }).sort({ createdAt: -1 });
    res.json({ success: true, alerts });
  } catch (err) {
    console.error("CLOUDCREW ALERTS ERR:", err);
    res.status(500).json({ success: false, error: "Failed to load cloudcrew alerts" });
  }
});

router.put("/alerts/:id/read", auth, async (req, res) => {
  try {
    const id = req.params.id;
    const { read } = req.body;
    const a = await Alert.findOneAndUpdate({ _id: id, user: req.user.id }, { read: !!read }, { new: true });
    res.json({ success: true, alert: a });
  } catch (err) {
    console.error("ALERT READ ERR:", err);
    res.status(500).json({ success: false, error: "Failed to update alert" });
  }
});

router.delete("/alerts/:id", auth, async (req, res) => {
  try {
    const id = req.params.id;
    await Alert.deleteOne({ _id: id, user: req.user.id });
    res.json({ success: true });
  } catch (err) {
    console.error("ALERT DEL ERR:", err);
    res.status(500).json({ success: false, error: "Failed to delete alert" });
  }
});

router.get("/counts", auth, async (req, res) => {
  try {
    const exclusiveCount = await Alert.countDocuments({ user: req.user.id, exclusive: true, read: false });
    const cloudcrewCount = await Alert.countDocuments({ user: req.user.id, forCloudCrew: true, read: false });
    res.json({ success: true, counts: { exclusive: exclusiveCount, cloudcrew: cloudcrewCount } });
  } catch (err) {
    console.error("COUNTS ERR:", err);
    res.status(500).json({ success: false, error: "Failed to get counts" });
  }
});

module.exports = router;
