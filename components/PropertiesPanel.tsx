"use client";

import { useEffect } from "react";
import { useCanvasStore, Shape } from "@/store/canvasStore";
import { cn } from "@/lib/utils";

export default function PropertiesPanel() {
  const { selectedIds, shapes, updateShape, saveToHistory } = useCanvasStore();

  // Get the first selected shape
  const selectedShape = selectedIds.length === 1
    ? shapes.find((s) => s.id === selectedIds[0])
    : null;

  // Handle input changes
  const handleChange = (property: keyof Shape, value: string | number) => {
    if (!selectedShape) return;
    saveToHistory();
    updateShape(selectedShape.id, { [property]: value });
  };

  // Handle color change
  const handleColorChange = (property: "fill" | "stroke", value: string) => {
    if (!selectedShape) return;
    saveToHistory();
    updateShape(selectedShape.id, { [property]: value });
  };

  // Handle connector property changes (start/end shape)
  const handleConnectorChange = (property: "connectorStartId" | "connectorEndId", value: string) => {
    if (!selectedShape || selectedShape.type !== "connector") return;
    saveToHistory();
    updateShape(selectedShape.id, { [property]: value });
  };

  if (!selectedShape) {
    return (
      <div className="absolute top-4 right-4 w-72 h-[calc(100%-80px)] bg-white rounded-xl shadow-lg p-4">
        <div className="text-center text-neutral-500 py-8">
          <svg
            className="w-12 h-12 mx-auto mb-3 opacity-30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">Select a shape to edit properties</p>
        </div>
      </div>
    );
  }

  // Determine type-specific badge color
  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case "line": return "bg-blue-100 text-blue-700";
      case "rectangle": return "bg-green-100 text-green-700";
      case "circle": return "bg-purple-100 text-purple-700";
      case "text": return "bg-orange-100 text-orange-700";
      case "sticky": return "bg-yellow-100 text-yellow-700";
      case "connector": return "bg-pink-100 text-pink-700";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <div className="absolute top-4 right-4 w-72 h-[calc(100%-80px)] bg-white rounded-xl shadow-lg p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Properties</h3>
        <span className={cn("px-2 py-0.5 rounded text-xs font-medium capitalize", getTypeBadgeClass(selectedShape.type))}>
          {selectedShape.type}
        </span>
      </div>

      {/* Position & Size */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-2">
          Position & Size
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">X</label>
            <input
              type="number"
              value={Math.round(selectedShape.x)}
              onChange={(e) => handleChange("x", Number(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              step="1"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Y</label>
            <input
              type="number"
              value={Math.round(selectedShape.y)}
              onChange={(e) => handleChange("y", Number(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              step="1"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Width</label>
            <input
              type="number"
              value={Math.round(selectedShape.width)}
              onChange={(e) => handleChange("width", Number(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              step="1"
              min="5"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Height</label>
            <input
              type="number"
              value={Math.round(selectedShape.height)}
              onChange={(e) => handleChange("height", Number(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              step="1"
              min="5"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-neutral-500 mb-1">Rotation</label>
            <input
              type="number"
              value={Math.round(selectedShape.rotation)}
              onChange={(e) => handleChange("rotation", Number(e.target.value))}
              className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              step="1"
              min="0"
              max="360"
            />
          </div>
        </div>
      </div>

      {/* Text Properties - for text and sticky notes */}
      {(selectedShape.type === "text" || selectedShape.type === "sticky") && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-2">
            Text
          </h4>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Content</label>
              <textarea
                value={selectedShape.text || ""}
                onChange={(e) => handleChange("text", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Font Size</label>
                <input
                  type="number"
                  value={selectedShape.fontSize || 16}
                  onChange={(e) => handleChange("fontSize", Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  step="1"
                  min="8"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Font Family</label>
                <select
                  value={selectedShape.fontFamily || "Arial"}
                  onChange={(e) => handleChange("fontFamily", e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-xs text-neutral-500 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={selectedShape.textColor || "#333"}
                    onChange={(e) => handleChange("textColor", e.target.value)}
                    className="w-full h-8 rounded border border-neutral-300 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">Alignment</label>
                  <select
                    value={selectedShape.textAlign || "left"}
                    onChange={(e) => handleChange("textAlign", e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-xs text-neutral-500 mb-1">Sticky Color</label>
                <input
                  type="color"
                  value={selectedShape.stickyColor || selectedShape.fill}
                  onChange={(e) => handleChange("stickyColor", e.target.value)}
                  className="w-full h-8 rounded border border-neutral-300 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Colors - for shapes */}
      {(selectedShape.type === "rectangle" || selectedShape.type === "circle" || selectedShape.type === "line" || selectedShape.type === "connector") && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-2">
            Colors
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {selectedShape.type !== "connector" && selectedShape.type !== "line" && (
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Fill</label>
                <input
                  type="color"
                  value={selectedShape.fill}
                  onChange={(e) => handleColorChange("fill", e.target.value)}
                  className="w-full h-8 rounded border border-neutral-300 cursor-pointer"
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Stroke</label>
              <input
                type="color"
                value={selectedShape.stroke}
                onChange={(e) => handleColorChange("stroke", e.target.value)}
                className="w-full h-8 rounded border border-neutral-300 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Stroke Width */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-2">
          Stroke
        </h4>
        <input
          type="number"
          value={selectedShape.strokeWidth}
          onChange={(e) => handleChange("strokeWidth", Number(e.target.value))}
          className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          step="0.5"
          min="0.5"
          max="20"
        />
      </div>

      {/* Connector Properties */}
      {selectedShape.type === "connector" && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-2">
            Connection
          </h4>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Start Shape</label>
              <select
                value={selectedShape.connectorStartId || ""}
                onChange={(e) => handleConnectorChange("connectorStartId", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-xs text-neutral-500 mb-1">End Shape</label>
              <select
                value={selectedShape.connectorEndId || ""}
                onChange={(e) => handleConnectorChange("connectorEndId", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Quick Actions */}
      <div className="border-t border-neutral-200 pt-4">
        <button
          onClick={() => {
            // Could add delete confirmation here
          }}
          className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Delete Shape
        </button>
      </div>
    </div>
  );
}