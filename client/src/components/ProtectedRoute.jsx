// client/src/components/ProtectedRoute.jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { loading, token } = useContext(AuthContext);

  if (loading) return <p style={{ color: "white" }}>Loading...</p>;

  if (!token) return <Navigate to="/login" replace />;

  return children;
}
