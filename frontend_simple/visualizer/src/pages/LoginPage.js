import React, { useState } from "react";
import { BrainIcon, LoaderIcon } from "../components/Icons";
import { API_URL } from "../utils/api";
import axios from "axios";

export default function LoginPage({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showDemoHelp, setShowDemoHelp] = useState(false);

    const fillDemoCredentials = (role) => {
        if (role === "doctor") {
            setUsername("doctor1");
            setPassword("doctor123");
            return;
        }
        setUsername("student1");
        setPassword("student123");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError("");
        try {
            const formData = new URLSearchParams();
            formData.append("username", username);
            formData.append("password", password);
            const res = await axios.post(`${API_URL}/auth/token`, formData);
            const userRes = await axios.get(`${API_URL}/auth/users/me`, { headers: { Authorization: `Bearer ${res.data.access_token}` } });
            onLogin(res.data.access_token, userRes.data);
        } catch (err) {
            setError("Invalid credentials");
        } finally { setLoading(false); }
    };

    return (
        <div className="flex items-center justify-center h-[80vh]">
            <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-4">
                        <BrainIcon className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                    <p className="text-slate-400 text-sm mt-2">Sign in to access the Neurosymbolic System</p>
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={() => setShowDemoHelp((prev) => !prev)}
                            className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 underline underline-offset-2"
                        >
                            {showDemoHelp ? "Hide demo login details" : "Need demo login credentials?"}
                        </button>

                        {showDemoHelp && (
                            <div className="mt-3 text-left bg-slate-950/70 border border-indigo-500/30 rounded-xl p-3 space-y-3">
                                <div className="text-[11px] text-indigo-200 font-semibold">Test Demo Login</div>

                                <div className="flex items-center justify-between gap-3 bg-slate-900/70 border border-white/10 rounded-lg px-3 py-2">
                                    <div>
                                        <p className="text-xs text-white font-semibold">Doctor</p>
                                        <p className="text-[11px] text-slate-300">doctor1 / doctor123</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fillDemoCredentials("doctor")}
                                        className="text-[11px] px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                                    >
                                        Use
                                    </button>
                                </div>

                                <div className="flex items-center justify-between gap-3 bg-slate-900/70 border border-white/10 rounded-lg px-3 py-2">
                                    <div>
                                        <p className="text-xs text-white font-semibold">Student</p>
                                        <p className="text-[11px] text-slate-300">student1 / student123</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fillDemoCredentials("student")}
                                        className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                                    >
                                        Use
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Username</label>
                        <input className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white"
                            value={username} onChange={e => setUsername(e.target.value)} placeholder="doctor or student" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Password</label>
                        <input type="password" className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white"
                            value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" />
                    </div>
                    {error && <div className="text-red-400 text-xs text-center bg-red-500/10 py-2 rounded-lg">{error}</div>}
                    <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50">
                        {loading ? <LoaderIcon className="w-5 h-5 mx-auto" /> : "Access Portal"}
                    </button>
                </form>
            </div>
        </div>
    );
}
