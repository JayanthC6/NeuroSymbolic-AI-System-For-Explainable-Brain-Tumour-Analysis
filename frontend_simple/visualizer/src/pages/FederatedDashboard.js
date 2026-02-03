import React, { useState } from "react";
import { BrainIcon } from "../components/Icons";
import { useToast } from "../context/ToastContext";

export default function FederatedDashboard({ navigateTo }) {
    const [nodes, setNodes] = useState([
        { id: "HOSP-01", name: "Apollo Hospital", status: "Idle", progress: 0, weights: "v1.0" },
        { id: "HOSP-02", name: "AIIMS Delhi", status: "Idle", progress: 0, weights: "v1.2" },
        { id: "HOSP-03", name: "NIMHANS", status: "Idle", progress: 0, weights: "v1.1" }
    ]);
    const [globalRound, setGlobalRound] = useState(1);
    const [isTraining, setIsTraining] = useState(false);
    const [logs, setLogs] = useState([]);
    const { addToast } = useToast();

    const addLog = (msg) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

    const startFederatedRound = () => {
        setIsTraining(true);
        addLog(`🚀 Starting Federated Round ${globalRound}...`);

        // Simulate training on nodes
        nodes.forEach((node, index) => {
            setTimeout(() => {
                setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: "Training...", progress: 20 } : n));
                addLog(`${node.name}: Started local training on private data.`);
            }, index * 1000);

            setTimeout(() => {
                setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: "Uploading Gradients", progress: 80 } : n));
            }, 3000 + (index * 1000));

            setTimeout(() => {
                setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: "Synced", progress: 100, weights: `v${globalRound + 1}.0` } : n));
                addLog(`${node.name}: Weights aggregated securely.`);
            }, 6000);
        });

        setTimeout(() => {
            setIsTraining(false);
            setGlobalRound(prev => prev + 1);
            addLog(`✅ Global Model Updated to Version ${globalRound + 1}.0`);
            addToast("Federated Round Complete! Global Model Updated.", "success");
        }, 7000);
    };

    return (
        <div className="space-y-6">
            {/* Educational Disclaimer */}
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <h4 className="font-bold text-amber-300 mb-1">Educational Simulation</h4>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            This demonstrates the <strong>concept</strong> of Federated Learning.
                            In production, this would involve real distributed training across hospitals
                            with secure aggregation protocols (FedAvg), differential privacy, and encrypted communication.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Federated Learning Hub</h2>
                    <p className="text-slate-400">Train global AI models without sharing patient data (Privacy-Preserving).</p>
                </div>
                <button onClick={startFederatedRound} disabled={isTraining} className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg ${isTraining ? 'bg-slate-700' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                    {isTraining ? "Round in Progress..." : "Start Federated Round"}
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {nodes.map(node => (
                    <div key={node.id} className="bg-slate-900 border border-slate-700 p-6 rounded-2xl relative overflow-hidden">
                        <div className={`absolute top-0 left-0 h-1 bg-indigo-500 transition-all duration-1000`} style={{ width: `${node.progress}%` }}></div>
                        <div className="flex justify-between mb-4">
                            <h3 className="font-bold text-white">{node.name}</h3>
                            <span className="text-xs font-mono text-slate-500">{node.id}</span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Status</span>
                                <span className={node.status === "Synced" ? "text-emerald-400" : "text-amber-400"}>{node.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Local Weights</span>
                                <span className="font-mono text-indigo-300">{node.weights}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Aggregation Server Visualization */}
            <div className="bg-black/40 border border-indigo-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/20">
                    <BrainIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Global Aggregation Server</h3>
                <p className="text-slate-400 text-sm max-w-lg mt-2">
                    Uses Secure Aggregation (FedAvg) to combine weights from Apollo, AIIMS, and NIMHANS.
                    Patient data never leaves the local hospitals.
                </p>
                <div className="mt-4 w-full max-w-md h-32 bg-slate-900 rounded-xl border border-slate-800 p-3 overflow-y-auto text-xs text-left font-mono text-green-400">
                    {logs.map((l, i) => <div key={i}>{l}</div>)}
                </div>
            </div>
        </div>
    );
}
