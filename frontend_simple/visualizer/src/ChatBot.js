// src/ChatBot.js
import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi, I am NeuroEdu Bot. Ask me anything about brain tumors, MRI, or how this project works. (For learning only, not real medical advice.)",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMessage = { sender: "user", text: userText };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/edu/chat`, {
        message: userText,
      });

      const botMessage = {
        sender: "bot",
        text: res.data.reply || "I couldn't generate a response.",
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, the AI tutor is not responding right now. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-indigo-700 text-sm font-semibold"
      >
        💬 Ask NeuroEdu
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col text-xs text-gray-100">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
            <div>
              <p className="font-semibold text-sm text-white">NeuroEdu Bot</p>
              <p className="text-[10px] text-gray-400">
                Educational use only – not a diagnosis tool.
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-200 text-sm"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 max-h-64 overflow-y-auto px-2 py-2 space-y-2 bg-gray-950">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[75%] whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-700 text-gray-100"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-[10px] text-gray-400 mt-1">Thinking…</div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-800 px-2 py-2 flex space-x-2">
            <textarea
              rows={2}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-2 py-1 text-gray-100 text-[11px] resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Example: Explain difference between glioma and meningioma in simple words."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-3 py-1 bg-indigo-600 text-white rounded-md text-[11px] font-semibold hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed self-end"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBot;
