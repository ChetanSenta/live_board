"use client";

import { useCanvasStore } from "@/store/canvasStore";
import {
  MousePointer2,
  Square,
  Circle,
  Minus,
  Type,
  StickyNote,
  Link2,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  { id: "select" as const, label: "Select", icon: MousePointer2 },
  { id: "rectangle" as const, label: "Rectangle", icon: Square },
  { id: "circle" as const, label: "Circle", icon: Circle },
  { id: "line" as const, label: "Line", icon: Minus },
  { id: "text" as const, label: "Text", icon: Type },
  { id: "sticky" as const, label: "Sticky Note", icon: StickyNote },
  { id: "connector" as const, label: "Connector", icon: Link2 },
];

export default function Toolbar() {
  const { tool, setTool, deleteSelected, selectedIds, undo, redo, canUndo, canRedo } = useCanvasStore();

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg px-2 py-1.5 flex items-center gap-1 z-10">
      {/* Undo/Redo buttons */}
      <button
        onClick={undo}
        disabled={!canUndo()}
        className={cn(
          "p-2.5 rounded-lg transition-all duration-150",
          "hover:bg-neutral-100 active:scale-95",
          canUndo() ? "text-neutral-700" : "text-neutral-300 cursor-not-allowed"
        )}
        title="Undo (Ctrl+Z)"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo()}
        className={cn(
          "p-2.5 rounded-lg transition-all duration-150",
          "hover:bg-neutral-100 active:scale-95",
          canRedo() ? "text-neutral-700" : "text-neutral-300 cursor-not-allowed"
        )}
        title="Redo (Ctrl+Y)"
      >
        <RotateCw className="w-5 h-5" />
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-neutral-200 mx-1" />

      {tools.map((t) => {
        const Icon = t.icon;
        const isActive = tool === t.id;

        return (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={cn(
              "p-2.5 rounded-lg transition-all duration-150",
              "hover:bg-neutral-100 active:scale-95",
              isActive && "bg-blue-100 text-blue-600 hover:bg-blue-100"
            )}
            title={t.label}
          >
            <Icon className="w-5 h-5" />
          </button>
        );
      })}

      {/* Divider */}
      <div className="w-px h-6 bg-neutral-200 mx-1" />

      {/* Delete button - only show when shapes are selected */}
      {selectedIds.length > 0 && (
        <button
          onClick={deleteSelected}
          className="p-2.5 rounded-lg transition-all duration-150 hover:bg-red-100 text-red-600 active:scale-95"
          title="Delete selected"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
          </svg>
        </button>
      )}
    </div>
  );
}
