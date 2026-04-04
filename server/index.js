require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// SOCKET.IO
const http = require("http");
const { Server } = require("socket.io");

// ROUTES
const authRoutes = require("./routes/auth");
const weatherRoutes = require("./routes/weather");
const newsRoutes = require("./routes/news");
const userRoutes = require("./routes/user");
const chatbotRoutes = require("./routes/chatbot");
const trendsRoutes = require("./routes/trends");
const alertsRoutes = require("./routes/alerts");

const app = express();

// CREATE SERVER
const server = http.createServer(app);

// 🔥 SOCKET.IO SETUP
const io = new Server(server, {
  cors: {
    origin: "*", // ✅ allow all (fixes your issue)
    methods: ["GET", "POST"]
  }
});

// MAKE IO GLOBAL
global._io = io;

// SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("🔥 User connected:", socket.id);

  socket.on("join-user", (userId) => {
    socket.join(userId);
    console.log("User joined room:", userId);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// 🔥 EXPRESS MIDDLEWARE
app.use(cors({
  origin: "*", // ✅ IMPORTANT FIX
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// 🔥 MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🍃 MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// 🔥 ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/trends", trendsRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatbotRoutes);
app.use("/api/alerts", alertsRoutes);

// 🔥 TEST ROUTE
app.get("/", (req, res) => {
  res.send("WeatherLink API running...");
});

// 🔥 PORT
const PORT = process.env.PORT || 5000;

// START SERVER
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});