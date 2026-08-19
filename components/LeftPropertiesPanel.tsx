"use client";

import { useCanvasStore, Shape } from "@/store/canvasStore";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp,
} from "lucide-react";

const strokeColors = [
  { color: "#1E1E1E", label: "Black" },
  { color: "#E03131", label: "Red" },
  { color: "#2F9E44", label: "Green" },
  { color: "#1971C2", label: "Blue" },
  { color: "#E8590C", label: "Orange" },
  { color: "#F59F00", label: "Yellow" },
];

const backgroundColors = [
  { color: "transparent", label: "Transparent" },
  { color: "#FFECF3", label: "Pink" },
  { color: "#D0EBFF", label: "Light Blue" },
  { color: "#FFF3BF", label: "Light Yellow" },
  { color: "#C3FAE8", label: "Mint Green" },
];

const strokeWidths = [
  { id: "thin", width: 1, label: "Thin" },
  { id: "normal", width: 2, label: "Normal" },
  { id: "bold", width: 4, label: "Bold" },
];

export default function LeftPropertiesPanel() {
  const { selectedIds, shapes, updateShape, saveToHistory } = useCanvasStore();

  const selectedShape = selectedIds.length === 1
    ? shapes.find((s) => s.id === selectedIds[0])
    : null;

  const handleChange = (property: keyof Shape, value: string | number) => {
    if (!selectedShape) return;
    saveToHistory();
    updateShape(selectedShape.id, { [property]: value });
  };

  if (!selectedShape) {
    return (
      <div className="absolute top-20 left-4 w-60 bg-white rounded-2xl shadow-lg border border-neutral-200 p-4 z-20">
        <h3 className="font-semibold text-sm text-neutral-800 mb-4">Properties</h3>
        <div className="text-center text-neutral-400 py-8">
          <p className="text-sm">Select a shape to edit properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-20 left-4 w-60 bg-white rounded-2xl shadow-lg border border-neutral-200 p-4 z-20 max-h-[calc(100vh-120px)] overflow-y-auto">
      <h3 className="font-semibold text-sm text-neutral-800 mb-4">Properties</h3>

      {/* Stroke Colors */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-neutral-500 mb-2">Stroke</label>
        <div className="flex gap-1.5 flex-wrap">
          {strokeColors.map(({ color, label }) => (
            <button
              key={color}
              onClick={() => handleChange("stroke", color)}
              className={cn(
                "color-swatch",
                selectedShape?.stroke === color && "active"
              )}
              style={{ backgroundColor: color }}
              title={label}
            />
          ))}
        </div>
      </div>

      {/* Background Colors - only for shapes with fill */}
      {(selectedShape.type === "rectangle" || selectedShape.type === "circle") && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-neutral-500 mb-2">Background</label>
          <div className="flex gap-1.5 flex-wrap">
            {backgroundColors.map(({ color, label }) => (
              <button
                key={color}
                onClick={() => handleChange("fill", color)}
                className={cn(
                  "bg-swatch",
                  selectedShape?.fill === color && "active"
                )}
                style={{
                  backgroundColor: color === "transparent" ? "white" : color,
                }}
                title={label}
              >
                {color === "transparent" && (
                  <div className="w-full h-full checkerboard rounded-md" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stroke Width */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-neutral-500 mb-2">Stroke Width</label>
        <div className="flex gap-1">
          {strokeWidths.map(({ id, width, label }) => (
            <button
              key={id}
              onClick={() => handleChange("strokeWidth", width)}
              className={cn(
                "w-16 h-9 rounded-lg border border-neutral-200 flex items-center justify-center transition-colors",
                selectedShape?.strokeWidth === width ? "bg-[#E0DFFF] border-[#6965DB]" : "hover:bg-neutral-50"
              )}
              title={label}
            >
              <div
                className="bg-neutral-700 rounded-full"
                style={{ width: width * 3 + 4, height: width * 3 + 4 }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-neutral-500 mb-2">Opacity</label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400">0</span>
          <input
            type="range"
            min="0"
            max="100"
            value={selectedShape ? (selectedShape.opacity ?? 1) * 100 : 100}
            onChange={(e) => handleChange("opacity", Number(e.target.value) / 100)}
            className="flex-1"
            style={{
              background: `linear-gradient(to right, #6965DB ${(selectedShape.opacity ?? 1) * 100}%, #E5E5E5 ${(selectedShape.opacity ?? 1) * 100}%)`
            }}
          />
          <span className="text-xs text-neutral-600 font-medium min-w-[32px] text-right">
            {selectedShape ? Math.round((selectedShape.opacity ?? 1) * 100) : 100}
          </span>
        </div>
      </div>

      {/* Position & Size */}
      <div className="mb-4 border-t border-neutral-200 pt-4">
        <label className="block text-xs font-medium text-neutral-500 mb-2">Position & Size</label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-neutral-400 mb-1">X</label>
            <input
              type="number"
              value={Math.round(selectedShape.x)}
              onChange={(e) => handleChange("x", Number(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:ring-1 focus:ring-[#6965DB] focus:border-[#6965DB] outline-none"
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-1">Y</label>
            <input
              type="number"
              value={Math.round(selectedShape.y)}
              onChange={(e) => handleChange("y", Number(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:ring-1 focus:ring-[#6965DB] focus:border-[#6965DB] outline-none"
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-1">Width</label>
            <input
              type="number"
              value={Math.round(selectedShape.width)}
              onChange={(e) => handleChange("width", Number(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:ring-1 focus:ring-[#6965DB] focus:border-[#6965DB] outline-none"
              min="5"
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-1">Height</label>
            <input
              type="number"
              value={Math.round(selectedShape.height)}
              onChange={(e) => handleChange("height", Number(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:ring-1 focus:ring-[#6965DB] focus:border-[#6965DB] outline-none"
              min="5"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-neutral-400 mb-1">Rotation</label>
            <input
              type="number"
              value={Math.round(selectedShape.rotation)}
              onChange={(e) => handleChange("rotation", Number(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:ring-1 focus:ring-[#6965DB] focus:border-[#6965DB] outline-none"
              min="0"
              max="360"
            />
          </div>
        </div>
      </div>

      {/* Text Properties - for text and sticky notes */}
      {(selectedShape.type === "text" || selectedShape.type === "sticky") && (
        <div className="mb-4 border-t border-neutral-200 pt-4">
          <label className="block text-xs font-medium text-neutral-500 mb-2">Text</label>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Content</label>
              <textarea
                value={selectedShape.text || ""}
                onChange={(e) => handleChange("text", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:ring-1 focus:ring-[#6965DB] focus:border-[#6965DB] outline-none"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Font Size</label>
                <input
                  type="number"
                  value={selectedShape.fontSize || 16}
                  onChange={(e) => handleChange("fontSize", Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:ring-1 focus:ring-[#6965DB] focus:border-[#6965DB] outline-none"
                  min="8"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Font Family</label>
                <select
                  value={selectedShape.fontFamily || "Arial"}
                  onChange={(e) => handleChange("fontFamily", e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:ring-1 focus:ring-[#6965DB] focus:border-[#6965DB] outline-none"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>
            </div>
            {selectedShape.type === "text" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={selectedShape.textColor || "#333"}
                    onChange={(e) => handleChange("textColor", e.target.value)}
                    className="w-full h-8 rounded-lg border border-neutral-200 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Alignment</label>
                  <select
                    value={selectedShape.textAlign || "left"}
                    onChange={(e) => handleChange("textAlign", e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:ring-1 focus:ring-[#6965DB] focus:border-[#6965DB] outline-none"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            )}
            {selectedShape.type === "sticky" && (
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Sticky Color</label>
                <input
                  type="color"
                  value={selectedShape.stickyColor || selectedShape.fill}
                  onChange={(e) => handleChange("stickyColor", e.target.value)}
                  className="w-full h-8 rounded-lg border border-neutral-200 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connector Properties */}
      {selectedShape.type === "connector" && (
        <div className="mb-4 border-t border-neutral-200 pt-4">
          <label className="block text-xs font-medium text-neutral-500 mb-2">Connection</label>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Start Shape</label>
              <select
                value={selectedShape.connectorStartId || ""}
                onChange={(e) => {
                  saveToHistory();
                  updateShape(selectedShape.id, { connectorStartId: e.target.value });
                }}
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:ring-1 focus:ring-[#6965DB] focus:border-[#6965DB] outline-none"
              >
                <option value="">None</option>
                {shapes
                  .filter((s) => s.id !== selectedShape.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.type} ({s.id.slice(0, 8)})
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">End Shape</label>
              <select
                value={selectedShape.connectorEndId || ""}
                onChange={(e) => {
                  saveToHistory();
                  updateShape(selectedShape.id, { connectorEndId: e.target.value });
                }}
                className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg focus:ring-1 focus:ring-[#6965DB] focus:border-[#6965DB] outline-none"
              >
                <option value="">None</option>
                {shapes
                  .filter((s) => s.id !== selectedShape.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.type} ({s.id.slice(0, 8)})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
