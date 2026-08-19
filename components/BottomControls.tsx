"use client";

import { useCanvasStore } from "@/store/canvasStore";
import { Plus, Minus, RotateCcw, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomControls() {
  const { zoom, setZoom, undo, redo, canUndo, canRedo } = useCanvasStore();

  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.1));
  };

  return (
    <>
      {/* Top-Left: Zoom & History Controls in One Line */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-white rounded-2xl shadow-md border border-neutral-200 px-1 py-1 flex items-center gap-0.5">
          {/* Zoom Controls */}
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
            title="Zoom out"
          >
            <Minus className="w-4 h-4 text-neutral-700" />
          </button>

          <span className="px-3 py-1 min-w-[50px] text-center text-sm font-medium text-neutral-700">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={handleZoomIn}
            className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
            title="Zoom in"
          >
            <Plus className="w-4 h-4 text-neutral-700" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-neutral-200 mx-1" />

          {/* Undo/Redo Controls */}
          <button
            onClick={undo}
            disabled={!canUndo()}
            className={cn(
              "p-2 rounded-xl transition-colors",
              canUndo() ? "hover:bg-neutral-100 text-neutral-700" : "text-neutral-300 cursor-not-allowed"
            )}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={redo}
            disabled={!canRedo()}
            className={cn(
              "p-2 rounded-xl transition-colors",
              canRedo() ? "hover:bg-neutral-100 text-neutral-700" : "text-neutral-300 cursor-not-allowed"
            )}
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}
