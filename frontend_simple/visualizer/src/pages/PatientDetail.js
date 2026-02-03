import React, { useState, useEffect, useRef } from "react";
import { LayoutIcon, SpeakerIcon, PDFIcon, LoaderIcon } from "../components/Icons";
import { getImageUrl, axiosInstance } from "../utils/api";
import { MedicalReportTemplate } from "../components/MedicalReportTemplate";
import { GenomicPanel } from "../components/GenomicPanel";
import { MaskEditor } from "../components/MaskEditor";
import { ImgCard } from "../components/Shared";
import { Line } from "react-chartjs-2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "../context/ToastContext";

export default function PatientDetail({ patientId, navigateTo }) {
    const [patient, setPatient] = useState(null);
    const [studies, setStudies] = useState([]);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const [compareMode, setCompareMode] = useState(false);
    const [selectedBaseId, setSelectedBaseId] = useState("");
    const [selectedFollowUpId, setSelectedFollowUpId] = useState("");

    const [diffStats, setDiffStats] = useState({ growth: 0, shrinkage: 0 });
    const [editingStudyId, setEditingStudyId] = useState(null);
    const { addToast } = useToast();

    const reportRef = useRef();
    const canvasRef = useRef(null);

    const getSafeId = (s) => s.id || s._id;

    useEffect(() => {
        axiosInstance.get(`/patients/${patientId}`).then(res => {
            setPatient(res.data.patient);
            const sortedStudies = res.data.studies.sort((a, b) => new Date(a.study_date) - new Date(b.study_date));
            setStudies(sortedStudies);

            if (sortedStudies.length >= 2) {
                setSelectedBaseId(getSafeId(sortedStudies[0]));
                setSelectedFollowUpId(getSafeId(sortedStudies[sortedStudies.length - 1]));
            }
        });
        return () => window.speechSynthesis.cancel();
    }, [patientId]);

    const saveMask = async (blob) => {
        if (!editingStudyId) { addToast("Error: No study selected.", "error"); return; }
        const formData = new FormData();
        formData.append("file", blob, "mask.png");
        try {
            await axiosInstance.post(`/studies/${editingStudyId}/update-mask`, formData);
            addToast("Mask updated! Tumor volume recalculated.", "success");
            const res = await axiosInstance.get(`/patients/${patientId}`);
            setPatient(res.data.patient);
            setStudies(res.data.studies.sort((a, b) => new Date(a.study_date) - new Date(b.study_date)));
            setEditingStudyId(null);
        } catch (err) { addToast("Failed to save mask.", "error"); }
    };

    useEffect(() => {
        if (compareMode && selectedBaseId && selectedFollowUpId && canvasRef.current) {
            const base = studies.find(s => getSafeId(s) === selectedBaseId);
            const follow = studies.find(s => getSafeId(s) === selectedFollowUpId);

            if (base && follow) {
                const ctx = canvasRef.current.getContext('2d');
                const img1 = new Image();
                const img2 = new Image();
                const cacheBuster = "?t=" + new Date().getTime();

                img1.crossOrigin = "Anonymous";
                img2.crossOrigin = "Anonymous";

                img1.src = getImageUrl(base.seg_mask_path) + cacheBuster;
                img2.src = getImageUrl(follow.seg_mask_path) + cacheBuster;

                let loaded = 0;
                const onLoad = () => {
                    loaded++;
                    if (loaded === 2) {
                        try {
                            canvasRef.current.width = 256;
                            canvasRef.current.height = 256;
                            const tempCanvas = document.createElement('canvas');
                            tempCanvas.width = 256; tempCanvas.height = 256;
                            const tCtx = tempCanvas.getContext('2d');

                            tCtx.drawImage(img1, 0, 0, 256, 256);
                            const data1 = tCtx.getImageData(0, 0, 256, 256).data;
                            tCtx.clearRect(0, 0, 256, 256);
                            tCtx.drawImage(img2, 0, 0, 256, 256);
                            const data2 = tCtx.getImageData(0, 0, 256, 256).data;

                            const diffData = tCtx.createImageData(256, 256);
                            let growthPixels = 0;
                            let shrinkPixels = 0;

                            for (let i = 0; i < data1.length; i += 4) {
                                const val1 = data1[i];
                                const val2 = data2[i];

                                if (val1 > 100 && val2 < 100) {
                                    diffData.data[i] = 0; diffData.data[i + 1] = 255; diffData.data[i + 2] = 255; diffData.data[i + 3] = 200;
                                    shrinkPixels++;
                                } else if (val1 < 100 && val2 > 100) {
                                    diffData.data[i] = 255; diffData.data[i + 1] = 0; diffData.data[i + 2] = 0; diffData.data[i + 3] = 200;
                                    growthPixels++;
                                } else if (val1 > 100 && val2 > 100) {
                                    diffData.data[i] = 255; diffData.data[i + 1] = 255; diffData.data[i + 2] = 255; diffData.data[i + 3] = 80;
                                } else {
                                    diffData.data[i + 3] = 0;
                                }
                            }
                            ctx.putImageData(diffData, 0, 0);

                            const PIXEL_FACTOR = 500;
                            setDiffStats({
                                growth: (growthPixels / PIXEL_FACTOR).toFixed(2),
                                shrinkage: (shrinkPixels / PIXEL_FACTOR).toFixed(2)
                            });

                        } catch (e) { console.error("Canvas Error:", e); }
                    }
                };
                img1.onload = onLoad;
                img2.onload = onLoad;
            }
        }
    }, [compareMode, selectedBaseId, selectedFollowUpId, studies]);

    const downloadPDF = async () => {
        if (!patient) return;
        setIsGeneratingPdf(true);
        // Use requestAnimationFrame to let UI update before blocking
        requestAnimationFrame(() => {
            setTimeout(async () => {
                const element = reportRef.current;
                if (element) {
                    try {
                        const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
                        const imgData = canvas.toDataURL("image/png");
                        const pdf = new jsPDF("p", "mm", "a4");
                        const pdfWidth = pdf.internal.pageSize.getWidth();
                        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                        pdf.save(`Report_${patient.full_name}.pdf`);
                        addToast("PDF generated successfully!", "success");
                    } catch (e) { addToast("Could not generate PDF.", "error"); }
                }
                setIsGeneratingPdf(false);
            }, 500);
        });
    };

    const handleVoiceReport = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        if (!studies.length) return;

        const latest = studies[studies.length - 1];

        const textToRead = `
      Medical Report for Patient ${patient.full_name}.
      Date: ${new Date(latest.study_date).toLocaleDateString()}.
      Diagnosis: ${latest.ai_facts.predicted_class}.
      Confidence: ${(latest.ai_facts.confidence * 100).toFixed(0)} percent.
      Tumor Volume: ${latest.ai_facts.tumor_volume_cm2} square centimeters.
      AI Reasoning: ${latest.final_explanation}.
      Recommended Action: ${latest.treatment?.action || "Review required"}.
    `;

        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = 0.9;
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    const getStudy = (id) => studies.find(s => getSafeId(s) === id);

    if (!patient) return <div className="text-center py-20"><LoaderIcon className="w-8 h-8 mx-auto" /></div>;

    const chartData = {
        labels: studies.map(s => new Date(s.study_date).toLocaleDateString()),
        datasets: [{
            label: 'Tumor Volume (cm²)',
            data: studies.map(s => s.ai_facts.tumor_volume_cm2),
            borderColor: '#818cf8',
            backgroundColor: 'rgba(129, 140, 248, 0.2)',
            tension: 0.3,
            fill: true
        }]
    };

    const baseStudy = getStudy(selectedBaseId);
    const followUpStudy = getStudy(selectedFollowUpId);

    let comparisonResult = null;
    if (baseStudy && followUpStudy) {
        const v1 = baseStudy.ai_facts.tumor_volume_cm2;
        const v2 = followUpStudy.ai_facts.tumor_volume_cm2;
        const diff = v2 - v1;
        const pct = v1 > 0 ? ((diff / v1) * 100).toFixed(1) : 0;
        comparisonResult = { diff: diff.toFixed(2), pct, isBad: diff > 0 };
    }

    const latestStudy = studies.length > 0 ? studies[studies.length - 1] : null;
    const treatment = latestStudy?.treatment || { severity_score: 0, action: "N/A", follow_up: "N/A", protocol: [] };

    return (
        <div className="space-y-8">
            {/* Hidden PDF Template */}
            <div className={isGeneratingPdf ? "fixed inset-0 z-[100] bg-white" : "hidden"}><MedicalReportTemplate ref={reportRef} patient={patient} studies={studies} chartData={chartData} /></div>

            <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <button onClick={() => navigateTo("dashboard")} className="text-sm text-slate-400 hover:text-white">← Back to Dashboard</button>

                <div className="flex gap-3">
                    <button onClick={() => setCompareMode(!compareMode)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg ${compareMode ? 'bg-blue-600 text-white ring-2 ring-blue-400' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                        <LayoutIcon className="w-4 h-4" /> {compareMode ? "Exit Comparison" : "Compare Scans"}
                    </button>
                    <button onClick={handleVoiceReport} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg ${isSpeaking ? 'bg-red-600 animate-pulse text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
                        <SpeakerIcon className="w-4 h-4" isSpeaking={isSpeaking} /> {isSpeaking ? "Stop" : "Listen"}
                    </button>
                    <button onClick={downloadPDF} disabled={isGeneratingPdf} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg disabled:opacity-50">
                        {isGeneratingPdf ? <LoaderIcon className="w-4 h-4" /> : <PDFIcon className="w-4 h-4" />} {isGeneratingPdf ? "Generating..." : "PDF Report"}
                    </button>
                </div>
            </div>

            {latestStudy && !compareMode && (
                <section className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                    {/* Severity Meter */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${treatment.severity_score > 70 ? 'bg-red-500' : treatment.severity_score > 40 ? 'bg-yellow-500' : 'bg-emerald-500'}`}></div>
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">AI Risk Assessment</h3>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-bold text-white">{treatment.severity_score}</span>
                            <span className="text-sm text-slate-400 mb-1">/ 100</span>
                        </div>
                        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-3">
                            <div className={`h-full transition-all duration-1000 ${treatment.severity_score > 70 ? 'bg-red-500' : treatment.severity_score > 40 ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: `${treatment.severity_score}%` }}></div>
                        </div>
                        <p className={`text-xs font-bold uppercase tracking-wider ${treatment.severity_score > 70 ? 'text-red-400' : treatment.severity_score > 40 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                            {treatment.severity_score > 70 ? 'Critical Attention' : treatment.severity_score > 40 ? 'Moderate Risk' : 'Low Risk'}
                        </p>
                    </div>

                    {/* Treatment Protocol */}
                    <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-white font-bold text-lg">Recommended Treatment Protocol</h3>
                                <p className="text-xs text-indigo-400 uppercase tracking-widest mt-1">NCCN Guideline Based</p>
                            </div>
                            <span className="bg-slate-800 text-white px-3 py-1 rounded-lg text-sm border border-slate-700">
                                Action: <b>{treatment.action}</b>
                            </span>

                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase mb-2">Primary Protocol</p>
                                <ul className="space-y-2">
                                    {treatment.protocol?.map((step, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                                            <span className="text-indigo-500">✓</span> {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase mb-2">Follow-up Plan</p>
                                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm text-slate-300">
                                    📅 {treatment.follow_up}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-3 italic">Note: AI suggestions must be verified by a specialist.</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* --- GENOMIC PANEL (Multi-modal) --- */}
            {latestStudy && !compareMode && (
                <GenomicPanel study={latestStudy} />
            )}

            {/* --- COMPARE MODE VIEW --- */}
            {compareMode && studies.length >= 2 ? (
                <section className="bg-slate-900/80 border border-indigo-500/30 p-6 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><span className="text-2xl">⚖️</span> Longitudinal Comparison</h3>
                        {comparisonResult && (
                            <div className={`px-4 py-2 rounded-lg border ${comparisonResult.isBad ? 'bg-red-500/10 border-red-500/50 text-red-300' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'}`}>
                                <span className="font-bold text-lg mr-2">{comparisonResult.diff > 0 ? '▲' : '▼'} {Math.abs(comparisonResult.diff)} cm²</span>
                                <span className="text-sm">({comparisonResult.pct}%) Since baseline</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase">Baseline Scan</label>
                            <select value={selectedBaseId} onChange={(e) => setSelectedBaseId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500">
                                {studies.map(s => <option key={getSafeId(s)} value={getSafeId(s)}>{new Date(s.study_date).toLocaleDateString()} - {s.ai_facts.predicted_class}</option>)}
                            </select>
                            {baseStudy && (
                                <div className="p-4 bg-black/40 rounded-xl border border-white/10">
                                    <img src={getImageUrl(baseStudy.seg_mask_path)} className="w-full h-48 object-contain rounded-lg mb-2 opacity-80" alt="Base Mask" />
                                    <p className="text-center text-xs text-slate-400">Vol: <span className="text-white">{baseStudy.ai_facts.tumor_volume_cm2} cm²</span></p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 flex flex-col justify-end">
                            <label className="text-xs font-bold text-indigo-400 uppercase text-center">Change Heatmap</label>
                            <div className="p-4 bg-black/60 rounded-xl border border-indigo-500/50 shadow-inner flex flex-col items-center justify-center h-full">
                                <canvas ref={canvasRef} className="w-full h-48 object-contain rounded-lg mb-2" />

                                <div className="w-full grid grid-cols-2 gap-2 text-[10px] font-bold mt-2">
                                    <div className="flex flex-col items-center text-red-400 bg-red-900/20 p-1 rounded">
                                        <span>■ GROWTH</span>
                                        <span className="text-xs">+{diffStats.growth} cm²</span>
                                    </div>
                                    <div className="flex flex-col items-center text-cyan-400 bg-cyan-900/20 p-1 rounded">
                                        <span>■ SHRINKAGE</span>
                                        <span className="text-xs">-{diffStats.shrinkage} cm²</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase">Follow-up Scan</label>
                            <select value={selectedFollowUpId} onChange={(e) => setSelectedFollowUpId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500">
                                {studies.map(s => <option key={getSafeId(s)} value={getSafeId(s)}>{new Date(s.study_date).toLocaleDateString()} - {s.ai_facts.predicted_class}</option>)}
                            </select>
                            {followUpStudy && (
                                <div className="p-4 bg-black/40 rounded-xl border border-white/10">
                                    <img src={getImageUrl(followUpStudy.seg_mask_path)} className="w-full h-48 object-contain rounded-lg mb-2 opacity-80" alt="New Mask" />
                                    <p className="text-center text-xs text-slate-400">Vol: <span className="text-white">{followUpStudy.ai_facts.tumor_volume_cm2} cm²</span></p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            ) : compareMode && (
                <div className="p-6 bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl text-center">
                    Need at least 2 scans to compare progression.
                </div>
            )}

            {/* --- STANDARD PATIENT INFO --- */}
            <section className="bg-slate-900/50 border border-white/10 p-6 rounded-2xl">
                <h1 className="text-3xl font-bold text-white mb-1">{patient.full_name}</h1>
                <p className="text-slate-400 text-sm mb-4">ID: {patient.patient_id} | DOB: {patient.date_of_birth}</p>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                    <h4 className="text-xs font-bold uppercase text-indigo-400 mb-1">Medical History</h4>
                    <p className="text-sm text-slate-300">{patient.medical_history_summary || "No prior history notes."}</p>
                </div>
            </section>

            {studies.length > 0 && (
                <section className="bg-slate-900/50 border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-lg font-bold text-white mb-4">Recovery Progress (Tumor Volume)</h3>
                    <Line data={chartData} options={{ responsive: true, scales: { y: { grid: { color: '#334155' } }, x: { grid: { color: '#334155' } } } }} />
                </section>
            )}

            <section>
                <h3 className="text-xl font-bold text-white mb-4">MRI Analysis History</h3>
                <div className="space-y-6">
                    {studies.slice().reverse().map((s) => {
                        const studyId = getSafeId(s);
                        return (
                            <div key={studyId} className="bg-slate-900/80 border border-white/10 p-6 rounded-2xl shadow-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="text-sm text-indigo-400 font-mono">{new Date(s.study_date).toLocaleDateString()} <span>{s.ai_facts.predicted_class}</span></div>
                                    {/* NEW: DISPLAY GENOMIC DATA IN HISTORY CARD */}
                                    <div className="flex gap-2">
                                        {s.idh_status && s.idh_status !== "Unknown" && (
                                            <span className="text-xs bg-purple-900/40 text-purple-300 px-2 py-1 rounded border border-purple-500/30">
                                                🧬 IDH: {s.idh_status}
                                            </span>
                                        )}
                                        {s.mgmt_status && s.mgmt_status !== "Unknown" && (
                                            <span className="text-xs bg-pink-900/40 text-pink-300 px-2 py-1 rounded border border-pink-500/30">
                                                💊 MGMT: {s.mgmt_status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <ImgCard title="MRI Scan" src={getImageUrl(s.mri_image_path)} />
                                    <ImgCard title="AI Attention" src={getImageUrl(s.grad_cam_path)} />

                                    {/* --- EDITABLE MASK SECTION --- */}
                                    {editingStudyId === studyId ? (
                                        <MaskEditor
                                            src={getImageUrl(s.seg_mask_path)}
                                            onSave={saveMask}
                                            onCancel={() => setEditingStudyId(null)}
                                        />
                                    ) : (
                                        <div className="relative group">
                                            <ImgCard title="Tumor Mask" src={getImageUrl(s.seg_mask_path)} />
                                            <button
                                                onClick={() => setEditingStudyId(studyId)}
                                                className="absolute top-6 right-2 bg-slate-800/90 hover:bg-indigo-600 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all text-[10px] font-bold border border-slate-600 shadow-lg"
                                            >
                                                ✏️ Edit
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 p-4 bg-slate-950/50 rounded-xl border border-white/5">
                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">AI Explanation</p>
                                    <p className="text-sm text-slate-300 italic">"{s.final_explanation}"</p>
                                    <p className="text-xs font-bold text-slate-500 uppercase mt-3 mb-1">Doctor's Note</p>
                                    <p className="text-sm text-slate-300">{s.doctor_notes || "No notes."}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
