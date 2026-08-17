"use client";

import { useCanvasStore } from "@/store/canvasStore";
import { Plus, Minus, Maximize } from "lucide-react";

export default function ZoomControls() {
  const { zoom, setZoom, setPanOffset } = useCanvasStore();

  const handleZoomIn = () => {
    setZoom(zoom * 1.2);
  };

  const handleZoomOut = () => {
    setZoom(zoom / 1.2);
  };

  const handleFitToScreen = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg px-1 py-1 flex items-center gap-1 z-10">
      <button
        onClick={handleZoomOut}
        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors active:scale-95"
        title="Zoom out"
      >
        <Minus className="w-4 h-4" />
      </button>

      <span className="px-2 py-1 min-w-[60px] text-center text-sm font-medium">
        {Math.round(zoom * 100)}%
      </span>

      <button
        onClick={handleZoomIn}
        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors active:scale-95"
        title="Zoom in"
      >
        <Plus className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-neutral-200" />

      <button
        onClick={handleFitToScreen}
        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors active:scale-95"
        title="Fit to screen"
      >
        <Maximize className="w-4 h-4" />
      </button>
    </div>
  );
}
