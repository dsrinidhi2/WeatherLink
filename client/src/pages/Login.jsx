// client/src/pages/Login.jsx
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await login(form.email, form.password);

    if (res.success) {
      navigate("/dashboard");
    } else {
      alert("Invalid credentials.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card wider-auth"> {/* added wider */ }
        <h2 className="auth-title">Sign In</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button type="submit" className="auth-btn">Login</button>
        </form>

        <p className="auth-switch">
          Don’t have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
