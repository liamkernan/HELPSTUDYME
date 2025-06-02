// Notepad.js — “Clear Drawing” is now a neat X icon button
import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Notepad({ questionKey, className = '' }) {
    const canvasRef = useRef(null);
    const wrapRef   = useRef(null);
    const [isDrawing, setIsDrawing]   = useState(false);
    const [currentColor, setCurrentColor] = useState('#000000');
    const [notes, setNotes]   = useState('');
    const [mode,  setMode]    = useState('text');   // 'text' | 'draw'

    const colors = [
        '#000000', '#FF0000', '#0000FF', '#00FF00',
        '#FF00FF', '#FFA500', '#800080', '#008080'
    ];

    /* Reset canvas & textarea on new question */
    useEffect(() => {
        setNotes('');
        if (canvasRef.current) {
            const c = canvasRef.current.getContext('2d');
            c.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }, [questionKey]);

    /* Make <canvas> fill wrapper */
    useEffect(() => {
        const fit = () => {
            if (!wrapRef.current || !canvasRef.current) return;
            canvasRef.current.width  = wrapRef.current.clientWidth;
            canvasRef.current.height = wrapRef.current.clientHeight;
        };
        fit();
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    }, []);

    /* Drawing helpers */
    const getXY = (e) => {
        const r = canvasRef.current.getBoundingClientRect();
        const sx = canvasRef.current.width  / r.width;
        const sy = canvasRef.current.height / r.height;
        return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
    };
    const start = (e) => {
        if (mode !== 'draw') return;
        setIsDrawing(true);
        const { x, y } = getXY(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath(); ctx.moveTo(x, y);
    };
    const move = (e) => {
        if (!isDrawing || mode !== 'draw') return;
        const { x, y } = getXY(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(x, y);
        ctx.strokeStyle = currentColor;
        ctx.lineWidth   = 2;
        ctx.lineCap     = 'round';
        ctx.stroke();
    };
    const stop = () => setIsDrawing(false);
    const clearCanvas = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    return (
        <div className={`bg-white rounded-lg shadow-md p-4 flex flex-col min-h-0 ${className}`}>
            {/* Mode switch */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Notepad</h3>
                <div className="flex space-x-2">
                    {['text', 'draw'].map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={`px-3 py-1 rounded text-sm font-medium transition ${
                                mode === m
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {m === 'text' ? 'Text' : 'Draw'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ---------- TEXT MODE ---------- */}
            {mode === 'text' ? (
                <div className="flex flex-col flex-1 min-h-0">
          <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Type your notes here..."
              className="w-full flex-1 min-h-0 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={() => setNotes('')}
                            className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition"
                        >
                            Clear Text
                        </button>
                    </div>
                </div>
            ) : (
                /* ---------- DRAW MODE ---------- */
                <div className="flex flex-col flex-1 min-h-0">
                    {/* Palette + clear (X) */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {colors.map((c) => (
                            <button
                                key={c}
                                onClick={() => setCurrentColor(c)}
                                className={`w-7 h-7 rounded-full border-2 transition ${
                                    currentColor === c ? 'border-gray-800 scale-110' : 'border-gray-300'
                                }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                        <button
                            onClick={clearCanvas}
                            aria-label="Clear drawing"
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 border border-red-200 text-red-700 transition"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Canvas */}
                    <div ref={wrapRef} className="flex-1 min-h-0">
                        <canvas
                            ref={canvasRef}
                            onMouseDown={start}
                            onMouseMove={move}
                            onMouseUp={stop}
                            onMouseLeave={stop}
                            className="w-full h-full border border-gray-300 rounded-lg cursor-crosshair bg-white"
                            style={{ touchAction: 'none' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}