"use client";

import { useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Rect, Line, Circle } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useCanvasStore } from "@/store/canvasStore";
import Shape from "./Shape";

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);

  // Get state and actions from store
  const {
    shapes,
    selectedIds,
    tool,
    zoom,
    panOffset,
    stageSize,
    setZoom,
    setPanOffset,
    setStageSize,
    selectShape,
    addShape,
    clearSelection,
  } = useCanvasStore();

  // Update stage size when container resizes
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setStageSize({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [setStageSize]);

  // Handle mouse wheel zoom - zoom centered on cursor
  const handleWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;

      // Get mouse position on screen
      const mousePointTo = {
        x: stage.getPointerPosition()!.x / zoom - panOffset.x / zoom,
        y: stage.getPointerPosition()!.y / zoom - panOffset.y / zoom,
      };

      // Determine zoom direction and calculate new zoom
      const scaleBy = 1.1;
      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newZoom = direction > 0 ? zoom * scaleBy : zoom / scaleBy;

      // Clamp zoom between 10% and 500%
      const clampedZoom = Math.max(0.1, Math.min(5, newZoom));

      // Calculate new pan offset to zoom into cursor position
      const newPanOffset = {
        x: -(mousePointTo.x - stage.getPointerPosition()!.x / clampedZoom) * clampedZoom,
        y: -(mousePointTo.y - stage.getPointerPosition()!.y / clampedZoom) * clampedZoom,
      };

      setZoom(clampedZoom);
      setPanOffset(newPanOffset);
    },
    [zoom, panOffset, setZoom, setPanOffset]
  );

  // Handle click on empty canvas area
  const handleStageClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      // If clicked on empty area (not on a shape)
      if (e.target === e.target.getStage()) {
        if (tool === "select") {
          // In select mode, clear selection
          clearSelection();
        } else {
          // In shape mode, create new shape at click position
          const stage = stageRef.current;
          const pointerPos = stage.getPointerPosition();

          // Convert screen coordinates to world coordinates
          const worldX = (pointerPos.x - panOffset.x) / zoom;
          const worldY = (pointerPos.y - panOffset.y) / zoom;

          // Default shape properties
          const shapeWidth = 100;
          const shapeHeight = 100;

          // Random colors for visual variety (can be customized later with color picker)
          const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];

          if (tool === "rectangle") {
            addShape({
              type: "rectangle",
              x: worldX - shapeWidth / 2,
              y: worldY - shapeHeight / 2,
              width: shapeWidth,
              height: shapeHeight,
              fill: randomColor,
              stroke: "#333",
              strokeWidth: 2,
              rotation: 0,
            });
          } else if (tool === "circle") {
            addShape({
              type: "circle",
              x: worldX,
              y: worldY,
              width: shapeWidth,
              height: shapeHeight,
              fill: randomColor,
              stroke: "#333",
              strokeWidth: 2,
              rotation: 0,
            });
          } else if (tool === "line") {
            addShape({
              type: "line",
              x: worldX,
              y: worldY,
              width: 100,
              height: 0,
              fill: "",
              stroke: randomColor,
              strokeWidth: 3,
              rotation: 0,
              points: [0, 0, 100, 0],
            });
          }
        }
      }
    },
    [tool, zoom, panOffset, clearSelection, addShape]
  );

  // Handle pan (dragging the stage when in select mode)
  const handleStageDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      const stage = e.target;
      if (stage === stageRef.current) {
        setPanOffset({
          x: stage.x(),
          y: stage.y(),
        });
      }
    },
    [setPanOffset]
  );

  // Handle shape selection
  const handleShapeClick = useCallback(
    (id: string, e: KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true; // Prevent stage click

      const isShiftPressed = e.evt.shiftKey;
      selectShape(id, isShiftPressed);
    },
    [selectShape]
  );

  return (
    <div ref={containerRef} className="flex-1 bg-neutral-100 overflow-hidden">
      {/* Infinite Canvas Stage */}
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={handleStageClick}
        draggable={tool === "select"} // Only allow dragging in select mode
        onDragEnd={handleStageDragEnd}
        x={panOffset.x}
        y={panOffset.y}
        scaleX={zoom}
        scaleY={zoom}
        className="cursor-grab"
      >
        {/* Background grid (optional visual guide) */}
        <Layer>
          {/* Grid pattern will be added here */}
        </Layer>

        {/* Main shapes layer */}
        <Layer>
          {shapes.map((shape) => (
            <Shape
              key={shape.id}
              shape={shape}
              isSelected={selectedIds.includes(shape.id)}
              onSelect={(e) => handleShapeClick(shape.id, e)}
            />
          ))}
        </Layer>
      </Stage>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded-lg shadow-md text-sm font-medium">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
