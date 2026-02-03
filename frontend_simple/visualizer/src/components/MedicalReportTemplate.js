import React from "react";
import { Line } from "react-chartjs-2";
import { getImageUrl } from "../utils/api";

const ReportImage = ({ src, label }) => (
    <div className="text-center">
        <div className="h-24 w-full bg-slate-100 border border-slate-300 rounded flex items-center justify-center overflow-hidden">
            {src ? <img src={src} crossOrigin="anonymous" alt={label} className="h-full w-full object-contain" /> : <span className="text-xs text-slate-400">No Img</span>}
        </div>
        <p className="text-[10px] uppercase mt-1 text-slate-500">{label}</p>
    </div>
);

export const MedicalReportTemplate = React.forwardRef(({ patient, studies, chartData }, ref) => {
    if (!patient) return null;

    const reportChartOptions = {
        responsive: true,
        animation: false,
        plugins: {
            legend: { position: 'top', labels: { color: '#000', font: { size: 10 } } },
            title: { display: true, text: 'Tumor Volume Progression (cm²)', color: '#000', font: { size: 14 } }
        },
        scales: {
            y: { ticks: { color: '#000' }, grid: { color: '#ccc' }, title: { display: true, text: 'Volume (cm²)' } },
            x: { ticks: { color: '#000' }, grid: { color: '#ccc' } }
        }
    };

    return (
        <div ref={ref} className="bg-white text-black p-10 max-w-[800px] mx-auto hidden-on-screen">
            {/* Header */}
            <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">NEUROSYMBOLIC AI</h1>
                    <p className="text-sm text-slate-600 uppercase tracking-widest">Medical Diagnosis Report</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-500">Report Date</p>
                    <p className="font-mono font-bold">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Patient Info Grid */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg mb-8">
                <h2 className="text-sm font-bold uppercase text-slate-500 mb-3 border-b border-slate-200 pb-1">Patient Details</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-slate-500 text-xs">Full Name</p><p className="font-semibold text-lg">{patient.full_name}</p></div>
                    <div><p className="text-slate-500 text-xs">Patient ID</p><p className="font-mono font-semibold">{patient.patient_id}</p></div>
                    <div><p className="text-slate-500 text-xs">Date of Birth</p><p className="font-medium">{patient.date_of_birth}</p></div>
                    <div><p className="text-slate-500 text-xs">Total Scans</p><p className="font-medium">{studies.length}</p></div>
                </div>
            </div>

            {/* Progression Chart */}
            {chartData && (
                <div className="mb-8 p-4 border border-slate-200 rounded-lg bg-white">
                    <h2 className="text-sm font-bold uppercase text-slate-500 mb-4">Recovery Progression Analysis</h2>
                    <div className="h-64">
                        <Line data={chartData} options={reportChartOptions} />
                    </div>
                </div>
            )}

            {/* Studies Table */}
            <div>
                <h2 className="text-sm font-bold uppercase text-slate-500 mb-4 border-b border-slate-200 pb-1">Analysis History</h2>
                <div className="space-y-6">
                    {studies.map((s, i) => (
                        <div key={i} className="border border-slate-200 rounded-lg p-4 page-break-inside-avoid">
                            <div className="flex justify-between bg-slate-50 p-2 rounded mb-3">
                                <span className="font-mono text-sm font-bold">{new Date(s.study_date).toLocaleDateString()}</span>
                                <span className="text-sm font-bold text-indigo-900">
                                    {s.ai_facts.predicted_class.toUpperCase()} ({(s.ai_facts.confidence * 100).toFixed(1)}%)
                                </span>
                            </div>
                            {/* Genomic Data in PDF */}
                            <div className="flex gap-4 mb-3 text-xs border-b border-slate-100 pb-2">
                                <span className="font-bold text-slate-500">Genomics:</span>
                                <span>IDH: {s.idh_status || "N/A"}</span>
                                <span>MGMT: {s.mgmt_status || "N/A"}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <ReportImage src={getImageUrl(s.mri_image_path)} label="MRI" />
                                <ReportImage src={getImageUrl(s.grad_cam_path)} label="Grad-CAM" />
                                <ReportImage src={getImageUrl(s.seg_mask_path)} label="Mask" />
                            </div>
                            <div className="grid grid-cols-2 gap-6 text-sm">
                                <div>
                                    <p className="text-xs font-bold text-slate-500">AI Analysis</p>
                                    <p className="text-slate-800">Vol: {s.ai_facts.tumor_volume_cm2} cm²</p>
                                    <p className="text-slate-700 text-xs mt-1 italic">"{s.final_explanation}"</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500">Doctor's Note</p>
                                    <p className="text-slate-800 min-h-[20px]">{s.doctor_notes || "—"}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});
