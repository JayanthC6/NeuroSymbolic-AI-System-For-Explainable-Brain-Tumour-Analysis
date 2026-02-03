import React, { useState, useEffect, useRef } from "react";
import { LoaderIcon, ChevronRightIcon } from "./Icons";
import { getImageUrl, axiosInstance } from "../utils/api";

export function InteractiveDiagnosis() {
    const [step, setStep] = useState("start"); // start, guess, draw, result
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [score, setScore] = useState(null);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [guessedType, setGuessedType] = useState(null);

    const fetchCase = async () => {
        setLoading(true); setStep("guess"); setScore(null); setGuessedType(null);
        try { const res = await axiosInstance.get("/api/quiz/next-case"); setCaseData(res.data); } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchCase(); }, []);

    // Drawing Logic for Student
    const getPos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return { x: (e.clientX - rect.left) * (256 / rect.width), y: (e.clientY - rect.top) * (256 / rect.height) };
    };
    const draw = (e) => {
        if (!isDrawing) return; const ctx = canvasRef.current.getContext("2d");
        const { x, y } = getPos(e); ctx.lineWidth = 15; ctx.lineCap = "round"; ctx.strokeStyle = "white"; ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y);
    };

    const submitDrawing = async () => {
        if (!canvasRef.current) return;
        canvasRef.current.toBlob(async (blob) => {
            const fd = new FormData(); fd.append("mask_url", caseData.maskUri); fd.append("drawing", blob, "draw.png");
            try {
                const res = await axiosInstance.post("/api/quiz/score", fd);
                setScore(res.data); setStep("result");
            } catch { alert("Scoring failed. Check backend."); }
        });
    };

    const handleGuess = (type) => {
        setGuessedType(type);
        setStep("draw");
    };

    if (loading) return <div className="text-white text-center p-10"><LoaderIcon className="mx-auto w-8 h-8 animate-spin" /> Generating Case...</div>;
    if (!caseData) return <div className="text-red-400 text-center p-10 border border-red-500/30 rounded-xl">Error loading case. Make sure backend quiz route is active.</div>;

    return (
        <section className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-6 mt-8">
            <div className="flex justify-between mb-6 items-center border-b border-indigo-500/20 pb-4">
                <h2 className="text-2xl text-white font-bold flex items-center gap-2"><span className="text-3xl">⚡</span> Diagnosis Challenge</h2>
                {step === "result" && (
                    <div className={`px-4 py-2 rounded-full font-bold border ${score?.accuracy > 70 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-amber-500/20 text-amber-400 border-amber-500/50'}`}>
                        Score: {score?.accuracy}% (IoU: {score?.iou.toFixed(2)})
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Left Side: Image / Canvas */}
                <div>
                    {step === "draw" ? (
                        <div className="relative w-full aspect-square mx-auto bg-black border-2 border-indigo-500/50 rounded-xl overflow-hidden group shadow-2xl">
                            <img src={getImageUrl(caseData.imageUri)} className="absolute inset-0 w-full h-full opacity-60 pointer-events-none object-cover" alt="mri" />
                            <canvas ref={canvasRef} width={256} height={256} className="absolute inset-0 w-full h-full cursor-crosshair" onMouseDown={(e) => { setIsDrawing(true); draw(e) }} onMouseUp={() => { setIsDrawing(false); canvasRef.current.getContext("2d").beginPath() }} onMouseMove={draw} />
                            <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                                <span className="bg-black/70 text-white text-xs px-3 py-1 rounded-full border border-white/20">Draw a circle around the tumor area</span>
                            </div>
                        </div>
                    ) : (
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-slate-700 bg-black shadow-inner group">
                            <img src={getImageUrl(step === "result" ? caseData.gradCamUri : caseData.imageUri)} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="scan" />
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md border border-white/10 text-xs text-white font-mono shadow-xl">
                                VIEW: <span className="text-indigo-300 font-bold">{step === "result" ? "AI HEATMAP" : "MRI SCAN"}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Controls & Feedback */}
                <div className="flex flex-col justify-center space-y-6">
                    {step === "guess" && (
                        <div className="animate-in slide-in-from-right duration-500">
                            <h3 className="text-xl font-bold text-white mb-4">Phase 1: Identify Tumor Type</h3>
                            <p className="text-slate-400 text-sm mb-6">Examine the MRI scan on the left. Based on its location and texture, what is your diagnosis?</p>
                            <div className="space-y-3">
                                {["Glioma", "Meningioma", "Pituitary"].map(opt => (
                                    <button key={opt} onClick={() => handleGuess(opt)} className="w-full p-4 text-left rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-indigo-600 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all group">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-slate-200 group-hover:text-white">{opt} Tumor</span>
                                            <span className="text-slate-500 group-hover:text-indigo-200 transition-transform group-hover:translate-x-1">Select →</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === "draw" && (
                        <div className="animate-in slide-in-from-right duration-500">
                            <h3 className="text-xl font-bold text-white mb-4">Phase 2: Locate Tumor</h3>
                            <div className="mb-6 p-4 bg-indigo-900/30 border border-indigo-500/30 rounded-xl">
                                <p className="text-sm text-indigo-300">Your Guess: <span className="font-bold text-white">{guessedType}</span></p>
                            </div>
                            <p className="text-slate-400 text-sm mb-6">Now, use your mouse/finger to draw a boundary circle around the suspected tumor region on the MRI canvas.</p>
                            <div className="flex gap-4">
                                <button onClick={() => canvasRef.current.getContext("2d").clearRect(0, 0, 256, 256)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors border border-slate-600">Clear Canvas</button>
                                <button onClick={submitDrawing} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all">Submit Drawing</button>
                            </div>
                        </div>
                    )}

                    {step === "result" && (
                        <div className="animate-in zoom-in duration-500">
                            {/* Guess Result Header */}
                            <div className={`p-4 rounded-xl mb-6 border flex justify-between items-center ${guessedType === caseData.type ? "bg-emerald-900/30 border-emerald-500/50" : "bg-red-900/30 border-red-500/50"}`}>
                                <div>
                                    <p className="text-xs font-bold uppercase mb-1 opacity-70">Diagnosis Result</p>
                                    <p className={`text-lg font-bold ${guessedType === caseData.type ? "text-emerald-300" : "text-red-300"}`}>
                                        {guessedType === caseData.type ? "✔ Correct Type" : `✖ Incorrect (It was ${caseData.type})`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 mb-1">AI Confidence</p>
                                    <p className="font-mono font-bold text-white">{(caseData.confidence * 100).toFixed(1)}%</p>
                                </div>
                            </div>

                            {/* Drawing Feedback */}
                            <div className={`p-5 rounded-xl mb-6 border shadow-lg ${score?.accuracy > 70 ? 'bg-emerald-900/20 text-emerald-200 border-emerald-500/30' : 'bg-amber-900/20 text-amber-200 border-amber-500/30'}`}>
                                <h4 className="font-bold text-lg mb-2">{score?.feedback}</h4>
                                <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-1000 ease-out ${score?.accuracy > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${score?.accuracy}%` }}></div>
                                </div>
                                <p className="text-xs text-right mt-1 opacity-70">IoU Accuracy: {score?.accuracy}%</p>
                            </div>

                            {/* AI Reasoning Info */}
                            <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-700 mb-6">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">AI Neuro-Symbolic Reasoning</p>
                                <p className="text-sm text-slate-300 italic leading-relaxed">"{caseData.explanation}"</p>
                            </div>

                            <button onClick={fetchCase} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
                                <span>Next Random Case</span>
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
