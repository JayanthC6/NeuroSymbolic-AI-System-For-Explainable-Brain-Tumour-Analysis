import React, { useState, useEffect } from "react";
import { BrainIcon } from "../components/Icons";
import { axiosInstance } from "../utils/api";
import { useToast } from "../context/ToastContext";

export default function AnalysisPage({ navigateTo }) {
    const [file, setFile] = useState(null);
    const [patients, setPatients] = useState([]);
    const [selectedPid, setSelectedPid] = useState("");

    // NEW: Genomic Inputs
    const [idhStatus, setIdhStatus] = useState("Unknown");
    const [mgmtStatus, setMgmtStatus] = useState("Unknown");

    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        axiosInstance.get("/patients").then(res => setPatients(res.data));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !selectedPid) return addToast("Please select patient and file", "error");
        setLoading(true);

        const fd = new FormData();
        fd.append("patient_id", selectedPid);
        fd.append("file", file);
        // Append Multi-modal Data
        fd.append("idh_status", idhStatus);
        fd.append("mgmt_status", mgmtStatus);

        try {
            await axiosInstance.post("/studies/upload", fd);
            addToast("Analysis Complete.", "success");
            navigateTo("patientDetail", selectedPid);
        } catch (err) { addToast("Analysis failed.", "error"); }
        finally { setLoading(false); }
    };

    return (
        <div className="max-w-3xl mx-auto bg-slate-900/80 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-600 rounded-lg"><BrainIcon className="w-6 h-6 text-white" /></div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Multi-modal Analysis</h2>
                    <p className="text-sm text-slate-400">Combine MRI Imaging (Neuro) with Genomic Data (Symbolic)</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient & File */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">1. Patient</label>
                        <select className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200" onChange={e => setSelectedPid(e.target.value)}>
                            <option value="">-- Select --</option>
                            {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.full_name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">2. MRI Scan</label>
                        <input type="file" accept=".png,.jpg,.dcm" onChange={e => setFile(e.target.files[0])} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-indigo-600 file:text-white" />
                    </div>
                </div>

                {/* NEW: Genomic Data Section */}
                <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">🧬 Genomic Biomarkers (Optional)</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">IDH Mutation Status</label>
                            <select value={idhStatus} onChange={e => setIdhStatus(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                                <option value="Unknown">Unknown</option>
                                <option value="Mutant">Mutant (Better Prognosis)</option>
                                <option value="Wildtype">Wildtype (Aggressive)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1">MGMT Promoter Methylation</label>
                            <select value={mgmtStatus} onChange={e => setMgmtStatus(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                                <option value="Unknown">Unknown</option>
                                <option value="Methylated">Methylated (Responsive)</option>
                                <option value="Unmethylated">Unmethylated (Resistant)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all">
                    {loading ? "Running Neurosymbolic Pipeline..." : "Run Multi-modal Analysis"}
                </button>
            </form>
        </div>
    );
}
