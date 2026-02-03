import React from "react";

export const ImgCard = ({ title, src }) => (
    <div className="text-center">
        <p className="text-xs text-slate-400 mb-2">{title}</p>
        {src ? <img src={src} crossOrigin="anonymous" className="w-full rounded-lg border border-white/10" alt={title} /> : <div className="h-32 bg-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-500">No Image</div>}
    </div>
);

export const ConceptCard = ({ title, badge, description, color = "indigo" }) => {
    const colors = {
        blue: "bg-blue-600", indigo: "bg-indigo-600", purple: "bg-purple-600", pink: "bg-pink-600", emerald: "bg-emerald-600", amber: "bg-amber-600", cyan: "bg-cyan-600"
    };
    const bgColor = colors[color] || colors.indigo;

    return (
        <div className="bg-slate-900/80 border border-white/5 p-6 rounded-2xl shadow-lg hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <span className={`text-xs ${bgColor} text-white px-2 py-1 rounded-full font-medium`}>{badge}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
        </div>
    );
}
