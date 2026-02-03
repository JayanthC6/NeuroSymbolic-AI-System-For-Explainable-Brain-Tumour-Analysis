import React, { useState, useEffect, useRef } from "react";
import { BrainIcon, PaperClipIcon } from "./Icons";
import { axiosInstance } from "../utils/api";

export function NeuroEduBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            from: "bot",
            text: "Hi! I'm NeuroEdu Bot. Ask me questions or upload an MRI/diagram for me to explain!",
        },
    ]);
    const [input, setInput] = useState("");
    const [image, setImage] = useState(null); // Store base64 image
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const send = async () => {
        if ((!input.trim() && !image) || loading) return;

        const q = input.trim();
        const userMsg = { from: "user", text: q, image: image };
        setMessages((prev) => [...prev, userMsg]);

        const payload = { question: q || "Analyze this image." };
        if (image) payload.image = image;

        setInput("");
        setImage(null);
        setLoading(true);

        try {
            const res = await axiosInstance.post("/api/edu/chat", payload);
            setMessages((prev) => [...prev, { from: "bot", text: res.data.answer }]);
        } catch (e) {
            console.error(e);
            setMessages((prev) => [
                ...prev,
                { from: "bot", text: "Connection error. Please check the backend." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {open ? (
                <div className="w-80 sm:w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-xl flex flex-col overflow-hidden shadow-2xl">
                    <div className="bg-indigo-600 p-3 flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-2">
                            <BrainIcon className="w-5 h-5 text-white" />
                            <div>
                                <p className="text-white font-bold text-sm">NeuroEdu Bot</p>
                                <p className="text-[10px] text-indigo-200">Vision Enabled</p>
                            </div>
                        </div>
                        <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white font-bold">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex flex-col ${m.from === "user" ? "items-end" : "items-start"}`}>
                                <div
                                    className={`p-3 rounded-xl text-xs max-w-[85%] shadow-sm ${m.from === "user"
                                        ? "bg-indigo-600 text-white rounded-br-none"
                                        : "bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none"
                                        }`}
                                >
                                    {m.image && (
                                        <img src={m.image} alt="User upload" className="w-full h-32 object-cover rounded-lg mb-2 border border-white/20" />
                                    )}
                                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex items-center gap-1 text-xs text-slate-500 ml-2">
                                <span className="animate-bounce">●</span>
                                <span className="animate-bounce delay-75">●</span>
                                <span className="animate-bounce delay-150">●</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-slate-950 border-t border-slate-800">
                        {image && (
                            <div className="flex items-center gap-2 mb-2 bg-slate-800 p-2 rounded-lg border border-indigo-500/50 w-max">
                                <img src={image} alt="Preview" className="w-8 h-8 rounded object-cover" />
                                <span className="text-[10px] text-indigo-300">Image attached</span>
                                <button onClick={() => setImage(null)} className="text-slate-400 hover:text-red-400 ml-2">✕</button>
                            </div>
                        )}

                        <div className="flex gap-2 items-end">
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="p-2 bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-lg border border-slate-700 transition-colors"
                                title="Upload Image"
                            >
                                <PaperClipIcon className="w-5 h-5" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileSelect}
                            />

                            <textarea
                                rows={1}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        send();
                                    }
                                }}
                                className="flex-1 bg-slate-800 border-none rounded-lg text-xs px-3 py-2.5 text-white focus:ring-1 focus:ring-indigo-500 resize-none"
                                placeholder="Ask or attach image..."
                                style={{ maxHeight: "80px" }}
                            />

                            <button
                                onClick={send}
                                disabled={loading || (!input.trim() && !image)}
                                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600"
                            >
                                <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-lg shadow-indigo-500/40 transition-transform hover:scale-105"
                >
                    <span className="text-xl">💬</span>
                </button>
            )}
        </div>
    );
}
