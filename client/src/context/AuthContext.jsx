import { createContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "../services/api";
import api from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("weatherlink_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // AUTO LOGIN ON REFRESH
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.success) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.log("AUTO LOGIN ERROR:", err);
        setUser(null);
      }

      setLoading(false);
    }

    loadUser();
  }, [token]);

  // LOGIN
  const login = async (email, password) => {
    try {
      const res = await loginUser({ email, password });

      if (res.data.success) {
        localStorage.setItem("weatherlink_token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }

      return { success: false };
    } catch (err) {
      console.log("LOGIN ERR:", err);
      return { success: false };
    }
  };

  // REGISTER
  const register = async (name, email, password) => {
    try {
      const res = await registerUser({ name, email, password });
      return res.data;
    } catch (err) {
      console.log("REGISTER ERR:", err);
      return { success: false };
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("weatherlink_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
