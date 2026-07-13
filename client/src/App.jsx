// client/src/App.jsx
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import CloudCrew from "./pages/CloudCrew";
import MyAlerts from "./pages/MyAlerts";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Trends from "./pages/Trends";
import Insights from "./pages/Insights";
import News from "./pages/News";
import FavouritesPage from "./pages/FavouritesPage";
import RecentsPage from "./pages/RecentsPage";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Navbar from "./components/navbar/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Navbar />

      <Routes>
        
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/news" element={<News />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/cloudcrew"
          element={
            <ProtectedRoute>
              <CloudCrew />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-alerts"
          element={
            <ProtectedRoute>
              <MyAlerts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/favourites"
          element={
            <ProtectedRoute>
              <FavouritesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recents"
          element={
            <ProtectedRoute>
              <RecentsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;