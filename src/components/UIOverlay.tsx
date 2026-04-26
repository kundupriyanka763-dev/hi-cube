
import React from 'react';
import { 
  CubeState, 
  Color, 
  COLORS, 
  COLOR_MAP, 
  validateColorCounts 
} from '../utils/cubeLogic';
import { 
  RotateCcw, 
  Play, 
  AlertCircle, 
  Settings2, 
  XCircle, 
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface UIOverlayProps {
  cubeState: CubeState;
  selectedColor: Color;
  setSelectedColor: (color: Color) => void;
  onSolve: () => void;
  onReset: () => void;
  onShuffle: () => void;
  isSolving: boolean;
  error: string | null;
  solveSpeed: number;
  setSolveSpeed: (speed: number) => void;
  solution: string[];
}

export default function UIOverlay({
  cubeState,
  selectedColor,
  setSelectedColor,
  onSolve,
  onReset,
  onShuffle,
  isSolving,
  error,
  solveSpeed,
  setSolveSpeed,
  solution
}: UIOverlayProps) {
  const isValidCount = validateColorCounts(cubeState);

  const getColorCount = (color: Color) => {
    let count = 0;
    Object.values(cubeState).forEach(face => {
      face.forEach(c => {
        if (c === color) count++;
      });
    });
    return count;
  };

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col overflow-hidden font-sans">
      {/* Top Bar */}
      <header className="pointer-events-auto h-16 glass flex items-center justify-between px-8 border-b border-white/5 shrink-0">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            CUBEX <span className="font-light opacity-60">SOLVER</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 border",
                  error.includes('❌') 
                    ? "bg-red-500/10 text-red-400 border-red-500/20" 
                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                {error.replace('❌ ', '')}
              </motion.div>
            ) : (
                <div className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 border transition-colors",
                    isSolving 
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                        : "bg-green-500/10 text-green-400 border-green-500/20"
                )}>
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]",
                        isSolving && "animate-pulse"
                    )} />
                    {isSolving ? 'Solving Algorithm' : 'System Ready'}
                </div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="flex-1 grid grid-cols-[280px_1fr_280px] gap-6 p-6 overflow-hidden">
        
        {/* Left Panel: Inputs & Stats */}
        <aside className="pointer-events-auto glass rounded-2xl p-6 flex flex-col gap-8">
          <div>
            <span className="block text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-4">Color Palette</span>
            <div className="grid grid-cols-3 gap-3">
              {COLORS.map(color => {
                const count = getColorCount(color);
                const isSelected = selectedColor === color;
                
                return (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    disabled={isSolving}
                    className={cn(
                      "aspect-square rounded-lg border-2 transition-all duration-200 relative group",
                      isSelected ? "border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]" : "border-transparent",
                      isSolving && "opacity-50 cursor-not-allowed"
                    )}
                    style={{ backgroundColor: COLOR_MAP[color] }}
                  >
                    <span className={cn(
                        "absolute bottom-1 right-1.5 text-[9px] font-bold",
                        color === 'white' || color === 'yellow' ? "text-slate-800" : "text-white/80"
                    )}>
                      {count}/9
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
             <span className="block text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-4">Cube Statistics</span>
             <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-mono text-[10px]">VERIFICATION</span>
                    <span className={cn("font-bold text-[11px]", isValidCount ? "text-green-400" : "text-red-400")}>
                        {isValidCount ? 'VERIFIED' : 'DETECTION ERROR'}
                    </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-mono text-[10px]">COMPLEXITY</span>
                    <span className="text-slate-200 font-bold text-[11px]">HIGH</span>
                </div>
             </div>
          </div>

          <div className="mt-auto">
             <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-center">
                <p className="text-[10px] text-slate-400 mb-1 font-bold tracking-widest">DIAGNOSTICS</p>
                <p className="text-[11px] leading-relaxed text-slate-300">
                    Use mouse to explore cube geometry. Click facelets to override colors.
                </p>
             </div>
          </div>
        </aside>

        {/* Center: Viewport Spacer */}
        <div className="relative" />

        {/* Right Panel: Solution & Controls */}
        <aside className="pointer-events-auto glass rounded-2xl p-6 flex flex-col overflow-hidden">
          <span className="block text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-4">Playback Parameters</span>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] text-slate-400 font-medium">Step Delay</span>
              <span className="text-[11px] font-mono text-blue-400">{solveSpeed}ms</span>
            </div>
            <div className="relative flex items-center gap-4">
                <input 
                    type="range" 
                    min="100" 
                    max="2000" 
                    step="100"
                    value={solveSpeed} 
                    onChange={(e) => setSolveSpeed(Number(e.target.value))}
                    disabled={isSolving}
                    className="flex-1 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <span className="block text-[10px] uppercase tracking-[0.15em] text-slate-400 font-bold mb-4">Solution Sequence</span>
            <div className="flex-1 bg-black/20 rounded-xl p-4 font-mono text-[13px] overflow-y-auto scrollbar-hide border border-white/5">
                {solution.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {solution.map((move, i) => (
                           <span key={i} className={cn(
                             "px-2 py-0.5 rounded text-xs font-bold",
                             isSolving ? "text-blue-400" : "text-green-400"
                           )}>
                             {move}
                           </span>
                        ))}
                    </div>
                ) : (
                    <div className="text-slate-600 italic leading-relaxed text-[11px]">
                        {isSolving ? 'Calculating optimal path...' : 'Configure cube state to generate solution sequence...'}
                    </div>
                )}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={onSolve}
              disabled={isSolving || !isValidCount}
              className={cn(
                "w-full py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-lg",
                isValidCount && !isSolving 
                  ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20" 
                  : "bg-white/5 text-slate-500 opacity-50 cursor-not-allowed"
              )}
            >
              {isSolving ? "Sequence Running" : "SOLVE CUBE"}
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onShuffle}
                disabled={isSolving}
                className="py-3 rounded-xl text-[11px] font-semibold text-slate-300 hover:text-white transition-colors border border-white/10 bg-white/5 uppercase tracking-widest"
              >
                Shuffle
              </button>
              <button
                onClick={onReset}
                disabled={isSolving}
                className="py-3 rounded-xl text-[11px] font-semibold text-slate-400 hover:text-white transition-colors border border-white/5 uppercase tracking-widest"
              >
                Reset
              </button>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
