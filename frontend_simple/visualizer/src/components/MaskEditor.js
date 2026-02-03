import React, { useState, useEffect, useRef } from "react";

export function MaskEditor({ src, onSave, onCancel }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState("brush");
    const [brushSize, setBrushSize] = useState(10);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = src;
        img.onload = () => {
            ctx.drawImage(img, 0, 0, 256, 256);
        };
    }, [src]);

    const getPos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (256 / rect.width),
            y: (e.clientY - rect.top) * (256 / rect.height)
        };
    };

    const startDraw = (e) => { setIsDrawing(true); draw(e); };
    const stopDraw = () => { setIsDrawing(false); canvasRef.current.getContext("2d").beginPath(); };
    const draw = (e) => {
        if (!isDrawing) return;
        const ctx = canvasRef.current.getContext("2d");
        const { x, y } = getPos(e);
        ctx.lineWidth = brushSize; ctx.lineCap = "round";
        ctx.strokeStyle = tool === "brush" ? "white" : "black";
        ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y);
    };

    const handleSave = () => {
        canvasRef.current.toBlob((blob) => onSave(blob));
    };

    return (
        <div className="flex flex-col items-center bg-slate-900 p-4 rounded-xl border border-indigo-500/50">
            <h4 className="text-white font-bold mb-2">Manual Mask Correction</h4>
            <div className="flex gap-4 mb-2">
                <button onClick={() => setTool("brush")} className={`px-3 py-1 rounded text-xs font-bold ${tool === "brush" ? "bg-white text-black" : "bg-slate-700 text-white"}`}>🖌️ Add</button>
                <button onClick={() => setTool("eraser")} className={`px-3 py-1 rounded text-xs font-bold ${tool === "eraser" ? "bg-white text-black" : "bg-slate-700 text-white"}`}>🧽 Erase</button>
                <input type="range" min="2" max="20" value={brushSize} onChange={(e) => setBrushSize(e.target.value)} className="w-20" />
            </div>
            <canvas ref={canvasRef} width={256} height={256} onMouseDown={startDraw} onMouseUp={stopDraw} onMouseMove={draw} onMouseLeave={stopDraw} className="border border-slate-600 cursor-crosshair bg-black w-64 h-64" />
            <div className="flex gap-2 mt-4">
                <button onClick={onCancel} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-xs">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold">Save</button>
            </div>
        </div>
    );
}
