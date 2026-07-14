# 🌤️ WeatherLink

**Live Demo:** [weatherlink-gamma.vercel.app](https://weatherlink-gamma.vercel.app)
**Backend API:** [weatherlink.onrender.com](https://weatherlink.onrender.com)

> ⚠️ Note: The backend is hosted on Render's free tier, which spins down after periods of inactivity. The first request after idle time may take 30–50 seconds to respond while the server wakes up.

A full-stack MERN weather platform combining live weather data, AI-powered chat, real-time social alerts, and data visualization — built as a mini-project to explore end-to-end application development, third-party API orchestration, and production deployment.

---

## ✨ Features

- **Live Weather Dashboard** — current conditions, hourly/weekly forecasts, sunrise/sunset, dynamic weather-based backgrounds, and automatic geolocation detection
- **Rule-Based Assistant Tips** — a lightweight heuristic engine that generates contextual advice (umbrella reminders, sunscreen tips, night-driving hazard warnings) directly from weather data, with no LLM cost
- **Weather Trends** — interactive Recharts visualizations for temperature, humidity, precipitation, and wind, with support for both city-name and geolocation-based lookup
- **AI Chatbot** — a Google Gemini–powered assistant that answers weather questions and returns structured suggestions (clothing, skincare, food, traffic, movies) via custom prompt engineering
- **CloudCrew Alerts** — add trusted contacts and send them weather alerts in real time via Socket.io, plus email notifications via the Resend API
- **Personal Alerts** — private, user-scoped notifications delivered through dedicated Socket.io rooms
- **Favourites & Recents** — save frequently checked cities and revisit search history
- **Local Weather News** — recent news articles for a searched city via Google News RSS
- **JWT Authentication** — secure register/login with persistent sessions and protected routes

---

## 🛠️ Tech Stack

**Frontend**
- React (Create React App), React Router
- Axios for API communication
- Recharts for data visualization
- Socket.io Client for real-time updates

**Backend**
- Node.js, Express.js
- MongoDB with Mongoose (hosted on MongoDB Atlas)
- Socket.io for real-time, room-scoped notifications
- JWT (jsonwebtoken) + bcryptjs for authentication

**External APIs**
- [OpenWeatherMap](https://openweathermap.org/) — current conditions, geocoding, air quality
- [Open-Meteo](https://open-meteo.com/) — hourly and weekly forecasts (no API key required)
- [Google Gemini API](https://ai.google.dev/) — conversational assistant
- Google News RSS — local weather news
- [Resend](https://resend.com/) — transactional email delivery

**Deployment**
- Frontend: [Vercel](https://vercel.com/)
- Backend: [Render](https://render.com/)
- Database: [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## 🏗️ Architecture Notes

A few design decisions worth calling out:

- **Dual weather-API strategy** — OpenWeatherMap's free tier doesn't provide full hourly/daily forecast data, so forecasts are sourced from Open-Meteo instead, while OpenWeatherMap handles current conditions, geocoding, and air quality. Both are fetched in parallel with `Promise.all` for performance, with fallback logic if one source is missing data.
- **Resilient LLM parsing** — since Gemini doesn't enforce a strict JSON schema on this endpoint, the chatbot route includes a multi-strategy parser that reliably separates the human-readable reply from the structured metadata, even if the model's formatting varies.
- **SMTP → HTTPS email migration** — the CloudCrew email feature was originally built with Nodemailer over Gmail SMTP, which worked locally but failed silently in production. Investigation traced this to Render's free tier blocking outbound SMTP traffic (a common anti-abuse restriction on PaaS platforms). The fix was to switch to Resend, which delivers email over HTTPS instead of raw SMTP.
- **Known limitation** — CloudCrew's real-time Socket.io broadcast currently notifies all connected users rather than being scoped to the sender's specific contacts (unlike the email delivery, which is correctly scoped). A future improvement would map contacts to registered accounts to scope the socket room properly.

---

## 📂 Project Structure

```
WeatherLink/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # Auth context/provider
│       ├── pages/          # Route-level pages
│       ├── services/       # API layer (axios instance + endpoints)
│       └── utils/          # Helper functions
└── server/                  # Express backend
    ├── middleware/          # JWT auth middleware
    ├── models/              # Mongoose schemas (User, Alert, Contact)
    ├── routes/              # API route handlers
    └── utils/               # Email (Resend) helper
```

---

## ⚙️ Environment Variables

**Server (`server/.env`)**
```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
OPENWEATHER_API_KEY=your_openweathermap_key
NEWSAPI_KEY=your_newsapi_key
GEMINI_API_KEY=your_gemini_api_key
RESEND_API_KEY=your_resend_api_key
```

**Client (`client/.env`)**
```
REACT_APP_API_URL=https://weatherlink.onrender.com
```

---

## 🚀 Running Locally

**Backend**
```bash
cd server
npm install
node index.js
```

**Frontend** (in a separate terminal)
```bash
cd client
npm install
npm start
```

The frontend will run on `http://localhost:3000` and the backend on `http://localhost:5000`.

---

## 📌 Roadmap / Possible Improvements

- Scope CloudCrew's real-time broadcast to specific contacts rather than all connected users
- Add per-alert recipient selection instead of notifying all saved contacts at once
- Add multi-turn conversation memory to the chatbot
- Verify a custom domain with Resend to remove free-tier email delivery restrictions
- Extract duplicated geocoding logic (shared between the weather and trends routes) into a common utility