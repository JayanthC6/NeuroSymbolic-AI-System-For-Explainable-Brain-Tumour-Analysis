import React from "react";
import { BrainIcon } from "./Icons";

export function Navbar({ currentUser, handleLogout, navigateTo }) {
    if (!currentUser) return null;
    const isDoc = currentUser.role === "doctor";

    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => navigateTo(isDoc ? "dashboard" : "learningLab")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateTo(isDoc ? "dashboard" : "learningLab")}
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <BrainIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-white">NeuroSymbolic AI</h1>
                        <p className="text-[10px] uppercase tracking-widest text-indigo-300 font-semibold">
                            {isDoc ? "Doctor Portal" : "Student Learning Lab"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {isDoc && (
                        <div className="hidden md:flex gap-4">
                            <button onClick={() => navigateTo("dashboard")} className="text-sm font-medium text-slate-400 hover:text-white">Patients</button>
                            <button onClick={() => navigateTo("analyze")} className="text-sm font-medium text-indigo-400 hover:text-indigo-300">+ New Analysis</button>
                            <button onClick={() => navigateTo("federated")} className="flex items-center gap-1 text-sm font-medium text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full bg-emerald-500/10">
                                <span className="text-xs">🌐</span> Federated AI
                            </button>
                        </div>
                    )}
                    {!isDoc && (
                        <div className="hidden md:flex gap-4">
                            <button onClick={() => navigateTo("learningLab")} className="text-sm font-medium text-slate-400 hover:text-white">Dashboard</button>
                            <button onClick={() => navigateTo("learning_anatomy")} className="text-sm font-medium text-slate-400 hover:text-white">Anatomy</button>
                            <button onClick={() => navigateTo("learning_tumors")} className="text-sm font-medium text-slate-400 hover:text-white">Tumors</button>
                        </div>
                    )}

                    <div className="flex items-center gap-3 pl-6 border-l border-white/10">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-slate-200">{currentUser.full_name}</p>
                            <p className="text-xs text-slate-500 capitalize">{currentUser.role}</p>
                        </div>
                        <button onClick={handleLogout} className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
