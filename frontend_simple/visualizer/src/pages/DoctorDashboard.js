import React, { useState, useEffect } from "react";
import { LoaderIcon, TrashIcon } from "../components/Icons";
import { axiosInstance } from "../utils/api";
import { CreatePatientModal } from "../components/CreatePatientModal";
import { useToast } from "../context/ToastContext";

export default function DoctorDashboard({ navigateTo }) {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const { addToast } = useToast();

    const fetchPatients = () => {
        setLoading(true);
        axiosInstance
            .get("/patients")
            .then((res) => setPatients(res.data))
            .catch((err) => {
                console.error(err);
                addToast("Failed to load patients", "error");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleDelete = async (patientId, e) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete patient ${patientId}? This will delete all their scan history.`)) {
            return;
        }
        try {
            await axiosInstance.delete(`/patients/${patientId}`);
            setPatients((prev) => prev.filter((p) => p.patient_id !== patientId));
            addToast("Patient deleted successfully", "success");
        } catch (err) {
            console.error(err);
            addToast("Failed to delete patient", "error");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white">Patient Records</h2>
                    <p className="text-slate-400 mt-1">
                        Track progress and manage MRI analysis.
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-500/20 transition-all font-bold"
                >
                    + Add Patient
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <LoaderIcon className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
                    <p className="text-slate-400 animate-pulse">Loading patient records...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patients.map((p) => (
                        <div
                            key={p.patient_id}
                            onClick={() => navigateTo("patientDetail", p.patient_id)}
                            className="group bg-slate-900/50 border border-white/5 hover:border-indigo-500/50 p-5 rounded-2xl cursor-pointer transition-all hover:shadow-xl hover:shadow-indigo-500/10 backdrop-blur-sm relative"
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateTo("patientDetail", p.patient_id)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold text-sm">
                                    {p.full_name.charAt(0)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md">
                                        ID: {p.patient_id}
                                    </span>
                                    <button
                                        onClick={(e) => handleDelete(p.patient_id, e)}
                                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                        title="Delete Patient"
                                        aria-label={`Delete patient ${p.full_name}`}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                {p.full_name}
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">DOB: {p.date_of_birth}</p>
                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-xs text-slate-500">
                                    Click to track progress →
                                </span>
                            </div>
                        </div>
                    ))}
                    {patients.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-white/5 rounded-2xl">
                            No patients found. Add one to start tracking.
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <CreatePatientModal
                    onClose={() => setShowModal(false)}
                    refresh={fetchPatients}
                />
            )}
        </div>
    );
}
