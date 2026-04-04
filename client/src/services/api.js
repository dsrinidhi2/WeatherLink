import axios from "axios";

// --------------------------------------------------
// BASE URL TO BACKEND
// --------------------------------------------------
const api = axios.create({
  baseURL: "https://weatherlink.onrender.com",
});

// --------------------------------------------------
// AUTO-ATTACH TOKEN FOR ALL REQUESTS
// --------------------------------------------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("weatherlink_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --------------------------------------------------
// AUTH
// --------------------------------------------------
export const registerUser = (data) =>
  api.post("/api/auth/register", data);

export const loginUser = async (data) => {
  const res = await api.post("/api/auth/login", data);

  if (res.data?.token) {
    localStorage.setItem("weatherlink_token", res.data.token);
  }

  return res;
};

// --------------------------------------------------
// WEATHER
// --------------------------------------------------
export const fetchWeatherForCity = (city) =>
  api.get(`/api/weather/${encodeURIComponent(city)}`);

export const detectCityFromCoords = (lat, lon) =>
  api.get(`/api/weather/geo/${lat}/${lon}`);

// --------------------------------------------------
// USER FAVOURITES + RECENTS
// --------------------------------------------------
export const addFavourite = (city) =>
  api.post("/api/user/favourites", { city });

export const getFavourites = () =>
  api.get("/api/user/favourites");

export const addRecent = (city) =>
  api.post("/api/user/recents", { name: city });

export const getRecents = () =>
  api.get("/api/user/recents");

// --------------------------------------------------
// NEWS
// --------------------------------------------------
export const fetchNews = () =>
  api.get("/api/news");

// --------------------------------------------------
// CHATBOT
// --------------------------------------------------
export const askChatbot = (message) =>
  api.post("/api/chat", { message });

// --------------------------------------------------
// WEATHER TRENDS
// --------------------------------------------------
export const fetchWeatherTrends = (city) =>
  api.get(`/api/weather/trends?city=${encodeURIComponent(city)}`);
// DELETE single favourite
export const deleteFavourite = (city) =>
  api.delete(`/api/user/favourites/${encodeURIComponent(city)}`);

// DELETE all favourites
export const clearFavourites = () =>
  api.delete("/api/user/favourites");

// DELETE single recent
export const deleteRecent = (city) =>
  api.delete(`/api/user/recents/${encodeURIComponent(city)}`);

// DELETE all recents
export const clearRecents = () =>
  api.delete("/api/user/recents");
// CLOUDCREW / ALERTS
export const getContacts = () => api.get("/api/alerts/contacts");
export const addContact = (data) => api.post("/api/alerts/contacts", data);
export const deleteContact = (id) => api.delete(`/api/alerts/contacts/${id}`);

export const createAlert = (data) => api.post("/api/alerts/alerts", data); // data: {title,body,severity,forCloudCrew,recipients,exclusive}
export const getAlerts = () => api.get("/api/alerts/alerts");
export const getExclusiveAlerts = () => api.get("/api/alerts/alerts/exclusive");
export const getCloudCrewAlerts = () => api.get("/api/alerts/alerts/cloudcrew");
export const markAlertRead = (id, read = true) => api.put(`/api/alerts/alerts/${id}/read`, { read });
export const deleteAlert = (id) => api.delete(`/api/alerts/alerts/${id}`);

export const getAlertCounts = () => api.get("/api/alerts/counts");

export default api;
