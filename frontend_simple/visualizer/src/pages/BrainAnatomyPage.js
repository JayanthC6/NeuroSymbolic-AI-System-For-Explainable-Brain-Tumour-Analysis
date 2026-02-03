import React, { useState } from "react";
import { BrainIcon } from "../components/Icons";

// Import brain images
import brainLateralImg from "../assets/brain_lateral.png";
import brainSagittalImg from "../assets/brain_sagittal.png";

export default function BrainAnatomyPage({ navigateTo }) {
    const [view, setView] = useState("lateral"); // 'lateral', 'sagittal', or 'neuron'
    const [selectedPart, setSelectedPart] = useState(null);
    const [hoveredPart, setHoveredPart] = useState(null);

    // Data: Brain Regions - Lateral View
    const lateralBrainParts = [
        {
            id: "frontal",
            label: "Frontal Lobe",
            color: "#3b82f6",
            desc: "The frontal lobe is the largest lobe of the brain and controls higher cognitive functions including reasoning, planning, problem-solving, and emotional regulation. It also houses the motor cortex which controls voluntary movements.",
            funFact: "Damage to the frontal lobe can result in personality changes, as famously documented in the case of Phineas Gage.",
            // SVG path for clickable region (approximate coordinates for lateral brain view)
            path: "M 100 80 L 280 60 L 320 120 L 300 200 L 200 220 L 120 180 Z"
        },
        {
            id: "parietal",
            label: "Parietal Lobe",
            color: "#eab308",
            desc: "The parietal lobe processes sensory information from the body including touch, temperature, and pain. It's crucial for spatial awareness, navigation, and integrating sensory input with visual information.",
            funFact: "The parietal lobe helps you know where your body parts are without looking - a sense called proprioception.",
            path: "M 280 60 L 420 80 L 440 160 L 380 200 L 320 120 Z"
        },
        {
            id: "occipital",
            label: "Occipital Lobe",
            color: "#ef4444",
            desc: "The occipital lobe is the visual processing center of the brain. It receives and processes visual information from the eyes, enabling us to perceive shapes, colors, and motion. Damage here can cause blindness even with healthy eyes.",
            funFact: "The occipital lobe processes visual information upside-down - your brain flips it right-side up!",
            path: "M 420 80 L 480 140 L 460 220 L 400 240 L 380 200 L 440 160 Z"
        },
        {
            id: "temporal",
            label: "Temporal Lobe",
            color: "#22c55e",
            desc: "The temporal lobe is essential for processing auditory information and is crucial for memory formation and language comprehension. It contains the hippocampus, vital for converting short-term memories into long-term storage.",
            funFact: "The temporal lobe helps you recognize faces and understand speech - damage here can make familiar faces seem like strangers.",
            path: "M 120 180 L 200 220 L 300 200 L 340 260 L 280 300 L 160 280 Z"
        },
        {
            id: "cerebellum",
            label: "Cerebellum",
            color: "#a855f7",
            desc: "The cerebellum coordinates voluntary movements, maintains posture and balance, and helps with motor learning. Despite being only 10% of the brain's volume, it contains over 50% of the brain's neurons.",
            funFact: "The cerebellum contains more neurons than the rest of the brain combined and is crucial for playing musical instruments.",
            path: "M 340 260 L 420 280 L 440 340 L 380 380 L 300 360 L 280 300 Z"
        },
        {
            id: "brainstem",
            label: "Brain Stem",
            color: "#64748b",
            desc: "The brainstem controls vital life functions including breathing, heart rate, blood pressure, and consciousness. It serves as the connection between the brain and spinal cord, relaying signals throughout the body.",
            funFact: "The brainstem is sometimes called the 'reptilian brain' because it controls our most primitive survival functions.",
            path: "M 280 300 L 300 360 L 280 400 L 240 400 L 220 360 L 240 300 Z"
        }
    ];

    // Data: Brain Regions - Sagittal View (internal structures)
    const sagittalBrainParts = [
        {
            id: "corpus_callosum",
            label: "Corpus Callosum",
            color: "#60a5fa",
            desc: "The corpus callosum is a thick bundle of nerve fibers that connects the left and right hemispheres of the brain, allowing them to communicate and share information.",
            funFact: "The corpus callosum contains about 200-250 million axonal projections.",
            path: "M 200 120 L 380 120 L 380 140 L 200 140 Z"
        },
        {
            id: "thalamus",
            label: "Thalamus",
            color: "#a855f7",
            desc: "The thalamus acts as the brain's relay station, processing and transmitting sensory and motor signals to the cerebral cortex. It plays a key role in consciousness, sleep, and alertness.",
            funFact: "Almost all sensory information passes through the thalamus before reaching other parts of the brain.",
            path: "M 260 160 L 320 160 L 320 200 L 260 200 Z"
        },
        {
            id: "hypothalamus",
            label: "Hypothalamus",
            color: "#ec4899",
            desc: "The hypothalamus regulates body temperature, hunger, thirst, sleep, and circadian rhythms. It also controls the pituitary gland, linking the nervous system to the endocrine system.",
            funFact: "Despite being the size of an almond, the hypothalamus controls many vital bodily functions.",
            path: "M 260 200 L 320 200 L 310 230 L 270 230 Z"
        },
        {
            id: "pituitary",
            label: "Pituitary Gland",
            color: "#f97316",
            desc: "The pituitary gland is the 'master gland' that produces hormones controlling growth, blood pressure, metabolism, and reproduction. It's controlled by the hypothalamus.",
            funFact: "The pituitary gland is only about the size of a pea but controls most of your hormonal functions.",
            path: "M 280 230 L 300 230 L 300 250 L 280 250 Z"
        },
        {
            id: "cerebellum_sag",
            label: "Cerebellum",
            color: "#a855f7",
            desc: "Visible in cross-section, the cerebellum shows its distinctive folded structure that maximizes surface area for neural processing of motor coordination.",
            funFact: "The cerebellum's folded structure gives it a surface area almost as large as the cerebral cortex.",
            path: "M 340 280 L 440 280 L 440 380 L 340 380 Z"
        },
        {
            id: "brainstem_sag",
            label: "Brain Stem",
            color: "#64748b",
            desc: "In sagittal view, you can see the brainstem's connection between the brain and spinal cord, including the midbrain, pons, and medulla oblongata.",
            funFact: "The brainstem is one of the oldest parts of the brain in evolutionary terms.",
            path: "M 260 280 L 340 280 L 340 400 L 260 400 Z"
        }
    ];

    // Data: Neuron Parts
    const neuronParts = [
        { id: "soma", label: "Soma (Cell Body)", x: 150, y: 200, r: 60, desc: "The core of the neuron. Contains the nucleus and maintains the cell's health. It integrates incoming signals and generates outgoing signals.", funFact: "A single neuron can receive input from thousands of other neurons." },
        { id: "nucleus", label: "Nucleus", x: 150, y: 200, r: 20, desc: "Contains the genetic material (DNA) of the neuron cell. It controls all cellular activities and protein synthesis.", funFact: "The nucleus contains all the instructions needed for the neuron to function throughout your lifetime." },
        { id: "axon", label: "Axon", path: "M 210 200 L 400 200", desc: "Carries nerve impulses away from the cell body to other neurons or muscles. Some axons can be over a meter long!", funFact: "Signals can travel down an axon at speeds up to 120 meters per second." },
        { id: "myelin", label: "Myelin Sheath", path: "M 220 180 h 40 v 40 h -40 z M 270 180 h 40 v 40 h -40 z M 320 180 h 40 v 40 h -40 z", desc: "Fatty insulation that surrounds the axon, dramatically increasing signal transmission speed. Gaps between myelin (nodes of Ranvier) allow signals to 'jump'.", funFact: "Multiple sclerosis is caused by damage to the myelin sheath." },
        { id: "dendrites", label: "Dendrites", path: "M 100 150 L 150 200 L 100 250 M 150 200 L 150 100 M 150 200 L 200 100", desc: "Branch-like structures that receive chemical signals from other neurons and convert them into electrical signals for the cell body.", funFact: "A single neuron can have thousands of dendritic branches to receive signals." },
        { id: "terminals", label: "Axon Terminals", path: "M 400 200 L 450 170 M 400 200 L 450 230", desc: "Release neurotransmitters into the synapse to communicate with the next neuron. This is where chemical communication between neurons occurs.", funFact: "There are over 100 different types of neurotransmitters in the human brain." }
    ];

    const activeData = view === "lateral"
        ? lateralBrainParts.find(p => p.id === (selectedPart || hoveredPart))
        : view === "sagittal"
            ? sagittalBrainParts.find(p => p.id === (selectedPart || hoveredPart))
            : neuronParts.find(p => p.id === (selectedPart || hoveredPart));

    const currentBrainParts = view === "lateral" ? lateralBrainParts : sagittalBrainParts;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <button onClick={() => navigateTo("learningLab")} className="text-slate-400 hover:text-white mb-4 transition-colors flex items-center gap-2">
                <span>←</span> Back to Lab
            </button>

            <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">3D Brain Anatomy Atlas</h2>
                    <p className="text-slate-400 mt-1">Click on any part of the brain to explore its structure and function.</p>
                </div>
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 mt-4 md:mt-0 gap-1">
                    <button
                        onClick={() => { setView("lateral"); setSelectedPart(null); setHoveredPart(null); }}
                        className={`px-3 py-2 text-xs font-bold rounded-md transition-all ${view === "lateral" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                        Lateral View
                    </button>
                    <button
                        onClick={() => { setView("sagittal"); setSelectedPart(null); setHoveredPart(null); }}
                        className={`px-3 py-2 text-xs font-bold rounded-md transition-all ${view === "sagittal" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                        Sagittal View
                    </button>
                    <button
                        onClick={() => { setView("neuron"); setSelectedPart(null); setHoveredPart(null); }}
                        className={`px-3 py-2 text-xs font-bold rounded-md transition-all ${view === "neuron" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                        Neuron (Micro)
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-12 gap-8">

                {/* LEFT: INTERACTIVE 3D BRAIN */}
                <div className="md:col-span-7 relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center p-8 min-h-[500px] shadow-2xl overflow-hidden">

                    {view === "lateral" || view === "sagittal" ? (
                        // --- 3D BRAIN VIEW WITH IMAGE ---
                        <div className="relative w-full h-full flex items-center justify-center">
                            <svg viewBox="0 0 600 500" className="w-full h-full max-w-2xl drop-shadow-2xl">
                                {/* Background brain image */}
                                <image
                                    href={view === "lateral" ? brainLateralImg : brainSagittalImg}
                                    x="50"
                                    y="50"
                                    width="500"
                                    height="400"
                                    className="opacity-90"
                                />

                                {/* Interactive overlay regions */}
                                <g className="interactive-regions">
                                    {currentBrainParts.map((part) => (
                                        <g key={part.id}>
                                            {/* Clickable region */}
                                            <path
                                                d={part.path}
                                                fill={part.color}
                                                opacity={(selectedPart === part.id || hoveredPart === part.id) ? 0.4 : 0}
                                                stroke={(selectedPart === part.id || hoveredPart === part.id) ? part.color : "transparent"}
                                                strokeWidth="3"
                                                className="cursor-pointer transition-all duration-300 hover:opacity-40"
                                                onClick={() => setSelectedPart(part.id === selectedPart ? null : part.id)}
                                                onMouseEnter={() => setHoveredPart(part.id)}
                                                onMouseLeave={() => setHoveredPart(null)}
                                                style={{
                                                    filter: (selectedPart === part.id || hoveredPart === part.id)
                                                        ? `drop-shadow(0 0 10px ${part.color})`
                                                        : 'none'
                                                }}
                                            />

                                            {/* Label that appears on hover/select */}
                                            {(selectedPart === part.id || hoveredPart === part.id) && (
                                                <text
                                                    x={part.path.match(/M (\d+)/)?.[1] || 100}
                                                    y={part.path.match(/M \d+ (\d+)/)?.[1] - 10 || 100}
                                                    fill="white"
                                                    fontSize="14"
                                                    fontWeight="bold"
                                                    className="pointer-events-none drop-shadow-lg"
                                                    style={{ textShadow: `0 0 10px ${part.color}` }}
                                                >
                                                    {part.label}
                                                </text>
                                            )}
                                        </g>
                                    ))}
                                </g>
                            </svg>

                            <div className="absolute bottom-4 right-4 text-xs text-slate-400 bg-black/60 px-3 py-2 rounded-lg backdrop-blur-sm border border-slate-700">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span>Click regions to explore</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // --- NEURON CELL VIEW ---
                        <svg viewBox="0 0 500 400" className="w-full h-full drop-shadow-2xl max-w-lg">
                            {/* Dendrites */}
                            <path
                                d={neuronParts.find(p => p.id === 'dendrites').path}
                                fill="none"
                                stroke={(selectedPart === 'dendrites' || hoveredPart === 'dendrites') ? "#818cf8" : "#94a3b8"}
                                strokeWidth="4"
                                className="cursor-pointer transition-all"
                                onClick={() => setSelectedPart('dendrites')}
                                onMouseEnter={() => setHoveredPart('dendrites')}
                                onMouseLeave={() => setHoveredPart(null)}
                            />

                            {/* Axon Line */}
                            <path
                                d={neuronParts.find(p => p.id === 'axon').path}
                                fill="none"
                                stroke={(selectedPart === 'axon' || hoveredPart === 'axon') ? "#e0e7ff" : "#cbd5e1"}
                                strokeWidth="8"
                                className="cursor-pointer transition-all"
                                onClick={() => setSelectedPart('axon')}
                                onMouseEnter={() => setHoveredPart('axon')}
                                onMouseLeave={() => setHoveredPart(null)}
                            />

                            {/* Axon Terminals */}
                            <path
                                d={neuronParts.find(p => p.id === 'terminals').path}
                                fill="none"
                                stroke={(selectedPart === 'terminals' || hoveredPart === 'terminals') ? "#818cf8" : "#94a3b8"}
                                strokeWidth="4"
                                onClick={() => setSelectedPart('terminals')}
                                className="cursor-pointer transition-all"
                                onMouseEnter={() => setHoveredPart('terminals')}
                                onMouseLeave={() => setHoveredPart(null)}
                            />

                            {/* Myelin Sheath */}
                            <path
                                d={neuronParts.find(p => p.id === 'myelin').path}
                                fill={(selectedPart === 'myelin' || hoveredPart === 'myelin') ? "#fde047" : "#fcd34d"}
                                stroke="#b45309"
                                strokeWidth="2"
                                onClick={() => setSelectedPart('myelin')}
                                className="cursor-pointer transition-all"
                                onMouseEnter={() => setHoveredPart('myelin')}
                                onMouseLeave={() => setHoveredPart(null)}
                            />

                            {/* Soma (Body) */}
                            <circle
                                cx={neuronParts[0].x} cy={neuronParts[0].y} r={neuronParts[0].r}
                                fill={(selectedPart === 'soma' || hoveredPart === 'soma') ? '#818cf8' : '#6366f1'}
                                stroke="#4338ca"
                                strokeWidth="4"
                                className="cursor-pointer transition-all"
                                onClick={() => setSelectedPart('soma')}
                                onMouseEnter={() => setHoveredPart('soma')}
                                onMouseLeave={() => setHoveredPart(null)}
                            />

                            {/* Nucleus */}
                            <circle
                                cx={neuronParts[1].x} cy={neuronParts[1].y} r={neuronParts[1].r}
                                fill={(selectedPart === 'nucleus' || hoveredPart === 'nucleus') ? '#c7d2fe' : '#e0e7ff'}
                                className="cursor-pointer transition-all"
                                onClick={() => setSelectedPart('nucleus')}
                                onMouseEnter={() => setHoveredPart('nucleus')}
                                onMouseLeave={() => setHoveredPart(null)}
                            />

                            {/* Labels */}
                            <text x="150" y="120" textAnchor="middle" fill="white" fontSize="12" className="pointer-events-none">Dendrites</text>
                            <text x="150" y="205" textAnchor="middle" fill="#1e1b4b" fontSize="10" fontWeight="bold" className="pointer-events-none">Nucleus</text>
                            <text x="300" y="170" textAnchor="middle" fill="white" fontSize="12" className="pointer-events-none">Myelin Sheath</text>
                            <text x="450" y="250" textAnchor="middle" fill="white" fontSize="12" className="pointer-events-none">Terminals</text>
                        </svg>
                    )}
                </div>

                {/* RIGHT: INFO CARD */}
                <div className="md:col-span-5 flex flex-col justify-center">
                    <div className={`p-6 rounded-2xl border transition-all duration-500 ${activeData ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-indigo-500/50 shadow-xl shadow-indigo-500/20' : 'bg-slate-900/50 border-slate-800 border-dashed'}`}>
                        {activeData ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <span
                                        className="w-5 h-5 rounded-full shadow-lg"
                                        style={{
                                            backgroundColor: activeData.color || '#6366f1',
                                            boxShadow: `0 0 15px ${activeData.color || '#6366f1'}`
                                        }}
                                    ></span>
                                    <h3 className="text-2xl font-bold text-white">{activeData.label}</h3>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-indigo-400 uppercase font-bold mb-2 tracking-wide">Function</p>
                                        <p className="text-slate-300 leading-relaxed text-sm">
                                            {activeData.desc}
                                        </p>
                                    </div>

                                    {activeData.funFact && (
                                        <div className="mt-4 p-4 bg-gradient-to-br from-indigo-950/50 to-purple-950/30 rounded-lg border border-indigo-500/20 backdrop-blur-sm">
                                            <p className="text-xs text-indigo-400 uppercase font-bold mb-2 flex items-center gap-2">
                                                <span className="text-base">💡</span> Did you know?
                                            </p>
                                            <p className="text-xs text-slate-300 leading-relaxed">
                                                {activeData.funFact}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 py-12">
                                <BrainIcon className="w-16 h-16 mx-auto mb-4 opacity-20 animate-pulse" />
                                <p className="text-sm">Click on any region of the brain<br />to learn about its function</p>
                                <p className="text-xs mt-2 text-slate-600">Interactive 3D visualization</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
