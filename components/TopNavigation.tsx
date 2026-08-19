"use client";

import { useCanvasStore, ToolType } from "@/store/canvasStore";
import {
  Menu,
  MousePointer2,
  Square,
  Circle,
  Minus,
  Type,
  StickyNote,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolItem {
  id: ToolType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tools: ToolItem[] = [
  { id: "select", label: "Select", icon: MousePointer2 },
  { id: "rectangle", label: "Rectangle", icon: Square },
  { id: "circle", label: "Circle", icon: Circle },
  { id: "line", label: "Line", icon: Minus },
  { id: "text", label: "Text", icon: Type },
  { id: "sticky", label: "Sticky Note", icon: StickyNote },
];

export default function TopNavigation() {
  const { tool, setTool, selectedIds, deleteSelected } = useCanvasStore();

  return (
    <>
      {/* Top-Center: Main Toolbar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 px-2 py-1.5 flex items-center gap-0.5">
          {tools.map((t) => {
            const Icon = t.icon;
            const isActive = tool === t.id;

            return (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-150",
                  isActive ? "bg-[#E0DFFF] text-[#6965DB]" : "text-neutral-600 hover:bg-neutral-100"
                )}
                title={t.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}

          {/* Divider */}
          <div className="w-px h-6 bg-neutral-200 mx-1" />

          {/* Delete button - show when shapes are selected */}
          {selectedIds.length > 0 && (
            <button
              onClick={deleteSelected}
              className="p-2.5 rounded-xl transition-all duration-150 text-red-600 hover:bg-red-50"
              title="Delete selected"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}

          {/* More menu */}
          <button
            className="p-2.5 rounded-xl transition-all duration-150 text-neutral-600 hover:bg-neutral-100"
            title="More tools"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
