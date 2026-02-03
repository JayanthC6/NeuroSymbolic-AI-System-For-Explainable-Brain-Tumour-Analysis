import React from "react";

export function GenomicPanel({ study }) {
    if (!study) return null;

    // Extract from doctor_notes if not in separate fields
    const extractFromNotes = (notes, marker) => {
        if (!notes) return "Unknown";
        const match = notes.match(new RegExp(`${marker}-([^,\\s]+)`, 'i'));
        return match ? match[1] : "Unknown";
    };

    const idh = study.idh_status || extractFromNotes(study.doctor_notes, "IDH");
    const mgmt = study.mgmt_status || extractFromNotes(study.doctor_notes, "MGMT");

    // Only show if we have genetic data
    if (idh === "Unknown" && mgmt === "Unknown") return null;

    const getIDHIndicator = (status) => {
        if (status === "Mutant") return { icon: "✅", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "Better Prognosis" };
        if (status === "Wildtype") return { icon: "⚠️", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "Aggressive" };
        return { icon: "❓", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/30", label: "Not Tested" };
    };

    const getMGMTIndicator = (status) => {
        if (status === "Methylated") return { icon: "✅", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", label: "Chemo-Responsive" };
        if (status === "Unmethylated") return { icon: "⚠️", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", label: "Resistant" };
        return { icon: "❓", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/30", label: "Not Tested" };
    };

    const idhInfo = getIDHIndicator(idh);
    const mgmtInfo = getMGMTIndicator(mgmt);

    return (
        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <span className="text-xl">🧬</span>
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">Molecular Profile</h3>
                    <p className="text-xs text-purple-300 uppercase tracking-widest">Multi-modal Analysis</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {/* IDH Status Card */}
                <div className={`${idhInfo.bg} border ${idhInfo.border} p-4 rounded-xl`}>
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">IDH Mutation</p>
                            <p className={`text-lg font-bold ${idhInfo.color} mt-1`}>{idh}</p>
                        </div>
                        <span className="text-2xl">{idhInfo.icon}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-slate-300">
                            <span className="font-bold">Impact:</span> {idhInfo.label}
                        </p>
                        {idh === "Mutant" && (
                            <p className="text-[10px] text-slate-400 mt-1 italic">Associated with better treatment response</p>
                        )}
                        {idh === "Wildtype" && (
                            <p className="text-[10px] text-slate-400 mt-1 italic">Suggests Glioblastoma-like behavior</p>
                        )}
                    </div>
                </div>

                {/* MGMT Status Card */}
                <div className={`${mgmtInfo.bg} border ${mgmtInfo.border} p-4 rounded-xl`}>
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">MGMT Methylation</p>
                            <p className={`text-lg font-bold ${mgmtInfo.color} mt-1`}>{mgmt}</p>
                        </div>
                        <span className="text-2xl">{mgmtInfo.icon}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-slate-300">
                            <span className="font-bold">Impact:</span> {mgmtInfo.label}
                        </p>
                        {mgmt === "Methylated" && (
                            <p className="text-[10px] text-slate-400 mt-1 italic">Better response to Temozolomide</p>
                        )}
                        {mgmt === "Unmethylated" && (
                            <p className="text-[10px] text-slate-400 mt-1 italic">May require alternative chemotherapy</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Clinical Significance Note */}
            <div className="mt-4 p-3 bg-black/30 rounded-lg border border-white/5">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                    <span className="text-purple-400 font-bold">ℹ️ Clinical Note:</span> Genomic biomarkers provide critical information for treatment planning.
                    IDH status helps classify glioma grade, while MGMT methylation predicts chemotherapy response.
                </p>
            </div>
        </div>
    );
}
