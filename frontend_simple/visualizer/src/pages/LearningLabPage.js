import React from "react";
import { ConceptCard } from "../components/Shared";
import { InteractiveDiagnosis } from "../components/InteractiveDiagnosis";

export default function LearningLabPage({ navigateTo }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Header Section */}
            <section className="relative overflow-hidden bg-gray-900/80 border border-gray-800 rounded-2xl p-8 shadow-xl">
                <div className="absolute -right-10 -top-10 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -left-10 bottom-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold text-white mb-2">Student Learning Lab</h2>
                    <p className="text-lg text-gray-300 mb-4 max-w-2xl">
                        Welcome to the educational module. Explore AI concepts and run virtual diagnoses using the NeuroEdu Bot.
                    </p>
                </div>
            </section>

            {/* AI Concepts Cards */}
            <section className="grid md:grid-cols-3 gap-6">
                <ConceptCard
                    title="Classification"
                    badge="CNN"
                    description="AI prediction of tumor type."
                    color="blue"
                />
                <ConceptCard
                    title="Segmentation"
                    badge="U-Net"
                    description="Isolating tumor boundaries."
                    color="purple"
                />
                <ConceptCard
                    title="Explainability"
                    badge="XAI"
                    description="Visualizing AI attention (Grad-CAM)."
                    color="pink"
                />
            </section>

            {/* INTERACTIVE DIAGNOSIS CHALLENGE (The new component) */}
            <InteractiveDiagnosis />

            {/* NEW: Navigational Cards to detailed pages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    onClick={() => navigateTo("learning_anatomy")}
                    className="cursor-pointer transition-transform hover:scale-105"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateTo("learning_anatomy")}
                >
                    <ConceptCard title="Brain Anatomy" desc="Explore brain regions & functions." badge="Interactive" color="emerald" />
                </div>
                <div
                    onClick={() => navigateTo("learning_tumors")}
                    className="cursor-pointer transition-transform hover:scale-105"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateTo("learning_tumors")}
                >
                    <ConceptCard title="Tumor Types" desc="Glioma vs Meningioma vs Pituitary." badge="Library" color="amber" />
                </div>
                <div
                    onClick={() => navigateTo("learning_ai")}
                    className="cursor-pointer transition-transform hover:scale-105"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigateTo("learning_ai")}
                >
                    <ConceptCard title="AI Pipeline" desc="How CNN & U-Net work together." badge="Technical" color="cyan" />
                </div>
            </div>
        </div>
    );
}
