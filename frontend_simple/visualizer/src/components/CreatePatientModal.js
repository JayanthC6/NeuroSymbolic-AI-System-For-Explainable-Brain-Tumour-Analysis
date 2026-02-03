import React, { useState } from "react";
import { axiosInstance } from "../utils/api";

export function CreatePatientModal({ onClose, refresh }) {
    const [data, setData] = useState({ patient_id: "", full_name: "", date_of_birth: "", medical_history_summary: "" });
    const submit = async (e) => {
        e.preventDefault();
        await axiosInstance.post("/patients", data);
        refresh(); onClose();
    };
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form onSubmit={submit} className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
                <h3 className="text-xl font-bold text-white">New Patient</h3>
                <input required placeholder="ID (e.g. 101)" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white" onChange={e => setData({ ...data, patient_id: e.target.value })} />
                <input required placeholder="Full Name" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white" onChange={e => setData({ ...data, full_name: e.target.value })} />
                <input required type="date" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white" onChange={e => setData({ ...data, date_of_birth: e.target.value })} />
                <textarea placeholder="History" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white" onChange={e => setData({ ...data, medical_history_summary: e.target.value })} />
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                    <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium">Create</button>
                </div>
            </form>
        </div>
    );
}
