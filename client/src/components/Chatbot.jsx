// client/src/components/Chatbot.jsx
import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import "./Chatbot.css";

export default function Chatbot({ city, weather }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Ask me anything about weather 🌤️" }
  ]);
  const [input, setInput] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingReply]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { sender: "user", text: userMsg }]);
    setInput("");
    setLoadingReply(true);

    try {
      const res = await api.post("/api/chat", {
        message: userMsg,
        city,
        weather,
      });

      const data = res.data;
      if (!data || !data.success) {
        setMessages((m) => [...m, { sender: "bot", text: data?.reply || "Server error. Try again." }]);
      } else {
        // create nicely formatted bot text, then attach meta as a second message that frontend will render as cards
        setMessages((m) => [...m, { sender: "bot", text: data.reply, meta: data.meta }]);
      }
    } catch (err) {
      console.error("CHAT ERR:", err);
      setMessages((m) => [...m, { sender: "bot", text: "Server error. Try again." }]);
    } finally {
      setLoadingReply(false);
    }
  }

  // render helper for meta card area
  function renderMeta(meta) {
    if (!meta) return null;
    return (
      <div className="chat-meta">
        {meta.clothing && (
          <div className="meta-card">
            <h4>Clothing</h4>
            <p>{meta.clothing}</p>
          </div>
        )}
        {meta.skincare && (
          <div className="meta-card">
            <h4>Skincare</h4>
            <p>{meta.skincare}</p>
          </div>
        )}
        {meta.food && meta.food.length > 0 && (
          <div className="meta-card">
            <h4>Food / Drink</h4>
            <ul>{meta.food.map((f, i) => <li key={i}>{f}</li>)}</ul>
          </div>
        )}
        {meta.traffic && (
          <div className="meta-card">
            <h4>Traffic</h4>
            <p>{meta.traffic}</p>
          </div>
        )}
        {meta.movies && meta.movies.length > 0 && (
          <div className="meta-card">
            <h4>Movies / Series</h4>
            <ul>{meta.movies.map((m, i) => <li key={i}>{m}</li>)}</ul>
          </div>
        )}
        {meta.recipe && (
          <div className="meta-card">
            <h4>Recipe: {meta.recipe.name || "Recipe"}</h4>
            {meta.recipe.ingredients && (
              <>
                <strong>Ingredients</strong>
                <ul>{meta.recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ul>
              </>
            )}
            {meta.recipe.steps && (
              <>
                <strong>Steps</strong>
                <ol>{meta.recipe.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button className="chatbot-btn" onClick={() => setOpen(!open)}>💬</button>

      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>WeatherLink Assistant</span>
            <button className="close-btn" onClick={() => setOpen(false)}>✖</button>
          </div>

          <div className="chatbot-body">
            {messages.map((m, i) => (
              <div key={i} className={m.sender === "user" ? "chat-msg user" : "chat-msg bot"}>
                <div className="msg-text">{m.text}</div>
                {m.meta && renderMeta(m.meta)}
              </div>
            ))}

            {loadingReply && (
              <div className="chat-msg bot">
                <div className="msg-text">typing…</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about weather, clothes, recipes, traffic, movies..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} disabled={loadingReply}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}