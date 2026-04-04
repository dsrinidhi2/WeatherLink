require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// SOCKET.IO ADDITIONS 🔥🔥
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const weatherRoutes = require("./routes/weather");
const newsRoutes = require("./routes/news");
const userRoutes = require("./routes/user");
const chatbotRoutes = require("./routes/chatbot");
const trendsRoutes = require("./routes/trends");
const alertsRoutes = require("./routes/alerts");

const app = express();

// CREATE SERVER FOR SOCKET.IO
const server = http.createServer(app);

// SOCKET.IO SERVER
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// MAKE IO GLOBAL
global._io = io;

// HANDLE CONNECTION
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

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🍃 MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/trends", trendsRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatbotRoutes);
app.use("/api/alerts", alertsRoutes);

app.get("/", (req, res) => {
  res.send("WeatherLink API running…");
});

const PORT = process.env.PORT || 5000;

// START SERVER (SOCKET + EXPRESS)
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
