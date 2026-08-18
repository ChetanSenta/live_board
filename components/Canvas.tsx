"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Stage, Layer, Rect, Circle, Line } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useCanvasStore, Shape as ShapeType } from "@/store/canvasStore";
import Shape from "./Shape";
import ShapeTransformer from "./ShapeTransformer";

// Preview shape state during drawing
interface PreviewShape {
  type: "rectangle" | "circle" | "line" | "text" | "sticky";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  points?: number[];
}

// Connector creation state
interface ConnectorCreationState {
  startShapeId: string | null;
  startPoint: { x: number; y: number } | null;
  currentPoint: { x: number; y: number } | null;
}

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);

  // Get state and actions from store (must be first)
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
    updateShape,
    deleteShape,
    deleteSelected,
    clearSelection,
    saveToHistory,
    undo,
    redo,
  } = useCanvasStore();

  // Track drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [previewShape, setPreviewShape] = useState<PreviewShape | null>(null);

  // Track connector creation state
  const [connectorState, setConnectorState] = useState<ConnectorCreationState>({
    startShapeId: null,
    startPoint: null,
    currentPoint: null,
  });

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // Track refs for all shapes (for transformer)
  const shapeRefs = useRef<Map<string, React.RefObject<any>>>(new Map());

  // Ensure refs exist for all shapes
  useEffect(() => {
    shapes.forEach((shape) => {
      if (!shapeRefs.current.has(shape.id)) {
        shapeRefs.current.set(shape.id, { current: null } as React.RefObject<any>);
      }
    });
  }, [shapes]);

  // Get ref for selected shape
  const selectedShapeRef = selectedIds.length === 1
    ? shapeRefs.current.get(selectedIds[0]) || { current: null }
    : { current: null };

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

  // Convert screen coordinates to world coordinates
  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      return {
        x: (screenX - panOffset.x) / zoom,
        y: (screenY - panOffset.y) / zoom,
      };
    },
    [zoom, panOffset]
  );

  // Get random color for shapes
  const getRandomColor = useCallback(() => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#74B9FF", "#A29BFE"];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  // Handle mouse down - start drawing shape or connector
  const handleMouseDown = useCallback(
    (e: KonvaEventObject<any>) => {
      // Only handle if clicked on stage (empty area) and not in select mode
      if (tool === "select" || e.target !== e.target.getStage()) return;

      const stage = stageRef.current;
      const pointerPos = stage.getPointerPosition();
      const worldPos = screenToWorld(pointerPos.x, pointerPos.y);

      // For text and sticky notes, create immediately on click (no drag-to-size)
      if (tool === "text" || tool === "sticky") {
        // Save state before creating shape
        saveToHistory();

        const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#74B9FF", "#A29BFE"];
        const stickyColors = ["#FFEAA7", "#FFB3BA", "#BAFFC9", "#BAE1FF", "#FFFFBA", "#FFDFBA", "#E0BBE4", "#BAFFDE"];
        const randomColor = tool === "sticky"
          ? stickyColors[Math.floor(Math.random() * stickyColors.length)]
          : colors[Math.floor(Math.random() * colors.length)];

        if (tool === "text") {
          addShape({
            type: "text",
            x: worldPos.x,
            y: worldPos.y,
            width: 200,
            height: 50,
            fill: "#333",
            stroke: "transparent",
            strokeWidth: 0,
            rotation: 0,
            text: "Double-click to edit",
            fontSize: 20,
            fontFamily: "Arial",
            textColor: "#333",
            textAlign: "left",
          });
        } else if (tool === "sticky") {
          addShape({
            type: "sticky",
            x: worldPos.x,
            y: worldPos.y,
            width: 200,
            height: 200,
            fill: randomColor,
            stroke: "#333",
            strokeWidth: 1,
            rotation: 0,
            text: "",
            fontSize: 16,
            fontFamily: "Arial",
            stickyColor: randomColor,
          });
        }
        return;
      }

      // For connector tool, handle shape clicks (not stage clicks)
      if (tool === "connector") {
        // Connectors are handled in handleShapeClick for shape-to-shape connections
        return;
      }

      setIsDrawing(true);
      setStartPoint(worldPos);

      // Create preview shape
      const preview: PreviewShape = {
        type: tool as "rectangle" | "circle" | "line",
        x: worldPos.x,
        y: worldPos.y,
        width: 0,
        height: 0,
        fill: tool !== "line" ? getRandomColor() : "",
        stroke: tool === "line" ? getRandomColor() : "#333",
        strokeWidth: tool === "line" ? 3 : 2,
      };

      if (tool === "line") {
        preview.points = [0, 0, 0, 0];
      }

      setPreviewShape(preview);
    },
    [tool, screenToWorld, getRandomColor, addShape]
  );

  // Handle mouse move - update preview shape while drawing, or connector preview
  const handleMouseMove = useCallback(
    (e: KonvaEventObject<any>) => {
      const stage = stageRef.current;
      const pointerPos = stage.getPointerPosition();
      const worldPos = screenToWorld(pointerPos.x, pointerPos.y);

      // Handle connector preview - update current point while creating connector
      if (tool === "connector" && connectorState.startShapeId) {
        setConnectorState({
          ...connectorState,
          currentPoint: worldPos,
        });
        return;
      }

      if (!isDrawing || !startPoint || !previewShape) return;

      // Calculate dimensions based on start and current position
      const width = Math.abs(worldPos.x - startPoint.x);
      const height = Math.abs(worldPos.y - startPoint.y);
      const minX = Math.min(worldPos.x, startPoint.x);
      const minY = Math.min(worldPos.y, startPoint.y);

      // Update preview shape
      if (previewShape.type === "rectangle") {
        setPreviewShape({
          ...previewShape,
          x: minX,
          y: minY,
          width,
          height,
        });
      } else if (previewShape.type === "circle") {
        // For circle, use the center and radius
        const radius = Math.max(width, height) / 2;
        const centerX = (worldPos.x + startPoint.x) / 2;
        const centerY = (worldPos.y + startPoint.y) / 2;
        setPreviewShape({
          ...previewShape,
          x: centerX,
          y: centerY,
          width: radius * 2,
          height: radius * 2,
        });
      } else if (previewShape.type === "line") {
        setPreviewShape({
          ...previewShape,
          x: startPoint.x,
          y: startPoint.y,
          points: [0, 0, worldPos.x - startPoint.x, worldPos.y - startPoint.y],
        });
      }
    },
    [isDrawing, startPoint, previewShape, screenToWorld, tool, connectorState]
  );

  // Handle mouse up - finalize shape creation
  const handleMouseUp = useCallback(
    (e: KonvaEventObject<any>) => {
      if (!isDrawing || !previewShape) return;

      // Only create shape if it has some size (not just a click)
      const hasSize = previewShape.type === "line"
        ? (previewShape.points && (Math.abs(previewShape.points[2]) > 5 || Math.abs(previewShape.points[3]) > 5))
        : (previewShape.width > 5 && previewShape.height > 5);

      if (hasSize) {
        // Save state before creating shape
        saveToHistory();

        // Create the actual shape
        if (previewShape.type === "line") {
          addShape({
            type: "line",
            x: previewShape.x,
            y: previewShape.y,
            width: Math.abs(previewShape.points?.[2] || 0),
            height: Math.abs(previewShape.points?.[3] || 0),
            fill: "",
            stroke: previewShape.stroke,
            strokeWidth: previewShape.strokeWidth,
            rotation: 0,
            points: previewShape.points,
          });
        } else if (previewShape.type === "rectangle") {
          addShape({
            type: "rectangle",
            x: previewShape.x,
            y: previewShape.y,
            width: previewShape.width,
            height: previewShape.height,
            fill: previewShape.fill,
            stroke: previewShape.stroke,
            strokeWidth: previewShape.strokeWidth,
            rotation: 0,
          });
        } else if (previewShape.type === "circle") {
          addShape({
            type: "circle",
            x: previewShape.x,
            y: previewShape.y,
            width: previewShape.width,
            height: previewShape.height,
            fill: previewShape.fill,
            stroke: previewShape.stroke,
            strokeWidth: previewShape.strokeWidth,
            rotation: 0,
          });
        }
      }

      // Reset drawing state
      setIsDrawing(false);
      setStartPoint(null);
      setPreviewShape(null);
    },
    [isDrawing, previewShape, addShape, saveToHistory]
  );

  // Handle click on empty canvas area (for selection only now)
  const handleStageClick = useCallback(
    (e: KonvaEventObject<any>) => {
      // If clicked on empty area (not on a shape) and in select mode
      if (e.target === e.target.getStage() && tool === "select") {
        clearSelection();
      }
    },
    [tool, clearSelection]
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

  // Handle shape selection and connector creation
  const handleShapeClick = useCallback(
    (id: string, e: KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true; // Prevent stage click

      // Handle connector creation: click first shape, then click second shape
      if (tool === "connector") {
        if (!connectorState.startShapeId) {
          // First click - start creating connector
          const startShape = shapes.find((s) => s.id === id);
          if (startShape) {
            setConnectorState({
              startShapeId: id,
              startPoint: { x: startShape.x + startShape.width / 2, y: startShape.y + startShape.height / 2 },
              currentPoint: { x: startShape.x + startShape.width / 2, y: startShape.y + startShape.height / 2 },
            });
          }
        } else if (connectorState.startShapeId && connectorState.startShapeId !== id) {
          // Second click on different shape - complete connector
          const startShape = shapes.find((s) => s.id === connectorState.startShapeId);
          const endShape = shapes.find((s) => s.id === id);

          if (startShape && endShape) {
            const startCenter = {
              x: startShape.x + startShape.width / 2,
              y: startShape.y + startShape.height / 2,
            };
            const endCenter = {
              x: endShape.x + endShape.width / 2,
              y: endShape.y + endShape.height / 2,
            };

            // Save state before creating connector
            saveToHistory();

            addShape({
              type: "connector",
              x: startCenter.x,
              y: startCenter.y,
              width: endCenter.x - startCenter.x,
              height: endCenter.y - startCenter.y,
              fill: "",
              stroke: "#333",
              strokeWidth: 2,
              rotation: 0,
              points: [0, 0, endCenter.x - startCenter.x, endCenter.y - startCenter.y],
              connectorStartId: connectorState.startShapeId,
              connectorEndId: id,
            });
          }

          // Reset connector state
          setConnectorState({
            startShapeId: null,
            startPoint: null,
            currentPoint: null,
          });
        }
        return;
      }

      const isShiftPressed = e.evt.shiftKey;
      selectShape(id, isShiftPressed);
    },
    [tool, connectorState, shapes, selectShape, addShape, saveToHistory]
  );

  // Render preview shape while drawing
  const renderPreviewShape = () => {
    if (!previewShape) return null;

    if (previewShape.type === "rectangle") {
      return (
        <Rect
          x={previewShape.x}
          y={previewShape.y}
          width={previewShape.width}
          height={previewShape.height}
          fill={previewShape.fill}
          stroke={previewShape.stroke}
          strokeWidth={previewShape.strokeWidth}
          opacity={0.7}
          dash={[5, 5]}
        />
      );
    } else if (previewShape.type === "circle") {
      return (
        <Circle
          x={previewShape.x}
          y={previewShape.y}
          radius={previewShape.width / 2}
          fill={previewShape.fill}
          stroke={previewShape.stroke}
          strokeWidth={previewShape.strokeWidth}
          opacity={0.7}
          dash={[5, 5]}
        />
      );
    } else if (previewShape.type === "line") {
      return (
        <Line
          x={previewShape.x}
          y={previewShape.y}
          points={previewShape.points}
          stroke={previewShape.stroke}
          strokeWidth={previewShape.strokeWidth}
          opacity={0.7}
          dash={[5, 5]}
          lineCap="round"
          lineJoin="round"
        />
      );
    }
    return null;
  };

  // Render connector preview while creating
  const renderConnectorPreview = () => {
    if (!connectorState.startShapeId || !connectorState.startPoint || !connectorState.currentPoint) return null;

    return (
      <Line
        x={connectorState.startPoint.x}
        y={connectorState.startPoint.y}
        points={[0, 0, connectorState.currentPoint.x - connectorState.startPoint.x, connectorState.currentPoint.y - connectorState.startPoint.y]}
        stroke="#333"
        strokeWidth={2}
        opacity={0.7}
        dash={[5, 5]}
        lineCap="round"
        lineJoin="round"
      />
    );
  };

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
        onMouseDown={handleMouseDown as any}
        onMouseMove={handleMouseMove as any}
        onMouseUp={handleMouseUp as any}
        onMouseLeave={handleMouseUp as any}
        onTouchStart={handleMouseDown as any}
        onTouchMove={handleMouseMove as any}
        onTouchEnd={handleMouseUp as any}
        draggable={tool === "select" && !isDrawing} // Only allow dragging in select mode and not while drawing
        onDragEnd={handleStageDragEnd}
        x={panOffset.x}
        y={panOffset.y}
        scaleX={zoom}
        scaleY={zoom}
        className={tool === "select" ? "cursor-grab" : "cursor-crosshair"}
      >
        {/* Main shapes layer */}
        <Layer>
          {shapes.map((shape) => {
            const isSelected = selectedIds.includes(shape.id);

            // Get or create ref for this shape
            let shapeRef = shapeRefs.current.get(shape.id);
            if (!shapeRef) {
              shapeRef = { current: null };
              shapeRefs.current.set(shape.id, shapeRef);
            }

            return (
              <Shape
                key={shape.id}
                ref={shapeRef}
                shape={shape}
                isSelected={isSelected}
                onSelect={(e) => handleShapeClick(shape.id, e)}
              />
            );
          })}

          {/* Preview shape while drawing */}
          {previewShape && renderPreviewShape()}

          {/* Connector preview while creating */}
          {renderConnectorPreview()}

          {/* Shape transformer for selected shapes */}
          {selectedIds.length === 1 && (
            <ShapeTransformer selectedShapeRef={selectedShapeRef} />
          )}
        </Layer>
      </Stage>

      {/* Zoom indicator - removed since we have ZoomControls component */}
    </div>
  );
}
