"use client";

import { forwardRef, useEffect } from "react";
import { Rect, Circle, Line, Text, Layer } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Shape as ShapeType } from "@/store/canvasStore";
import { useCanvasStore } from "@/store/canvasStore";

interface ShapeProps {
  shape: ShapeType;
  isSelected: boolean;
  onSelect: (e: KonvaEventObject<any>) => void;
}

// Connector component - renders a line that connects two shapes
const Connector = forwardRef<any, { shape: ShapeType; isSelected: boolean; onSelect: (e: KonvaEventObject<any>) => void }>(
  ({ shape, isSelected, onSelect }, ref) => {
    const { shapes } = useCanvasStore();

    // Get connected shapes
    const startShape = shape.connectorStartId ? shapes.find((s) => s.id === shape.connectorStartId) : null;
    const endShape = shape.connectorEndId ? shapes.find((s) => s.id === shape.connectorEndId) : null;

    // Calculate connector points
    const getPoints = () => {
      if (!startShape || !endShape) {
        return shape.points || [0, 0, 100, 0];
      }

      const startCenter = {
        x: startShape.x + startShape.width / 2,
        y: startShape.y + startShape.height / 2,
      };
      const endCenter = {
        x: endShape.x + endShape.width / 2,
        y: endShape.y + endShape.height / 2,
      };

      // Calculate connection points on the edges of shapes
      const dx = endCenter.x - startCenter.x;
      const dy = endCenter.y - startCenter.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) {
        return [0, 0, 0, 0];
      }

      // Unit vector
      const ux = dx / distance;
      const uy = dy / distance;

      // Calculate edge intersection points for start shape
      let startEdgeX = startCenter.x;
      let startEdgeY = startCenter.y;

      if (startShape.type === "rectangle" || startShape.type === "sticky") {
        const hw = startShape.width / 2;
        const hh = startShape.height / 2;
        const tx = (dx / distance) * hw;
        const ty = (dy / distance) * hh;
        const t = Math.min(hw / Math.abs(dx || 1), hh / Math.abs(dy || 1));
        startEdgeX = startCenter.x + ux * (hw * t);
        startEdgeY = startCenter.y + uy * (hh * t);
      } else if (startShape.type === "circle") {
        const r = startShape.width / 2;
        startEdgeX = startCenter.x + ux * r;
        startEdgeY = startCenter.y + uy * r;
      }

      // Calculate edge intersection points for end shape
      let endEdgeX = endCenter.x;
      let endEdgeY = endCenter.y;

      if (endShape.type === "rectangle" || endShape.type === "sticky") {
        const hw = endShape.width / 2;
        const hh = endShape.height / 2;
        const tx = (-dx / distance) * hw;
        const ty = (-dy / distance) * hh;
        const t = Math.min(hw / Math.abs(dx || 1), hh / Math.abs(dy || 1));
        endEdgeX = endCenter.x - ux * (hw * t);
        endEdgeY = endCenter.y - uy * (hh * t);
      } else if (endShape.type === "circle") {
        const r = endShape.width / 2;
        endEdgeX = endCenter.x - ux * r;
        endEdgeY = endCenter.y - uy * r;
      }

      // Convert to relative coordinates from start shape center
      const relStartX = startEdgeX - startCenter.x;
      const relStartY = startEdgeY - startCenter.y;
      const relEndX = endEdgeX - startCenter.x;
      const relEndY = endEdgeY - startCenter.y;

      return [relStartX, relStartY, relEndX, relEndY];
    };

    const points = getPoints();
    const startCenterX = startShape ? startShape.x + startShape.width / 2 : shape.x;
    const startCenterY = startShape ? startShape.y + startShape.height / 2 : shape.y;

    // Common props for the connector line
    const commonProps = {
      ref,
      id: shape.id,
      onClick: onSelect,
      onTap: onSelect,
      draggable: false,
      // Make the line thicker for easier clicking
      hitStrokeWidth: 16,
    };

    return (
      <Line
        {...commonProps}
        x={startCenterX}
        y={startCenterY}
        points={points}
        stroke={isSelected ? "#0066FF" : shape.stroke}
        strokeWidth={isSelected ? 3 : shape.strokeWidth}
        lineCap="round"
        lineJoin="round"
        // Add arrow head at the end
        pointerLength={10}
        pointerWidth={8}
        pointerAtEnding={true}
        pointerType="2"
      />
    );
  }
);

Connector.displayName = "Connector";

const Shape = forwardRef<any, ShapeProps>(({ shape, isSelected, onSelect }, ref) => {
  // Common props for all shapes
  const commonProps = {
    ref,
    id: shape.id,
    onClick: onSelect,
    onTap: onSelect,
    shadowColor: "black",
    shadowBlur: isSelected ? 10 : 0,
    shadowOpacity: 0.3,
    draggable: true,
    // When dragging, prevent stage from being dragged
    onDragStart: (e: KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true;
    },
  };

  // Render shape based on type
  const renderShape = () => {
    switch (shape.type) {
      case "rectangle":
        return (
          <Rect
            {...commonProps}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            fill={shape.fill}
            stroke={isSelected ? "#0066FF" : shape.stroke}
            strokeWidth={isSelected ? 2 : shape.strokeWidth}
            rotation={shape.rotation}
            cornerRadius={4}
          />
        );

      case "circle":
        return (
          <Circle
            {...commonProps}
            x={shape.x}
            y={shape.y}
            radius={shape.width / 2}
            fill={shape.fill}
            stroke={isSelected ? "#0066FF" : shape.stroke}
            strokeWidth={isSelected ? 2 : shape.strokeWidth}
            rotation={shape.rotation}
          />
        );

      case "line":
        return (
          <Line
            {...commonProps}
            x={shape.x}
            y={shape.y}
            points={shape.points || [0, 0, shape.width, 0]}
            stroke={isSelected ? "#0066FF" : shape.stroke}
            strokeWidth={isSelected ? 4 : shape.strokeWidth}
            lineCap="round"
            lineJoin="round"
            hitStrokeWidth={12}
          />
        );

      case "text":
        return (
          <Text
            {...commonProps}
            x={shape.x}
            y={shape.y}
            text={shape.text || ""}
            fontSize={shape.fontSize || 20}
            fontFamily={shape.fontFamily || "Arial"}
            fill={shape.textColor || shape.fill || "#333"}
            align={shape.textAlign || "left"}
            width={shape.width}
            height={shape.height}
            wrap="word"
            draggable={true}
            rotation={shape.rotation}
            // Make text selectable/editable on double-click
            onDblClick={(e) => {
              e.cancelBubble = true;
            }}
          />
        );

      case "sticky":
        const stickyColor = shape.stickyColor || shape.fill || "#FFEAA7";
        return (
          <>
            {/* Sticky note background */}
            <Rect
              {...commonProps}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              fill={stickyColor}
              stroke={isSelected ? "#0066FF" : shape.stroke}
              strokeWidth={isSelected ? 2 : shape.strokeWidth}
              cornerRadius={4}
              shadowColor="black"
              shadowBlur={isSelected ? 10 : 2}
              shadowOpacity={0.2}
              shadowOffsetX={2}
              shadowOffsetY={2}
            />
            {/* Sticky note text content */}
            <Text
              {...commonProps}
              x={shape.x + 10}
              y={shape.y + 10}
              text={shape.text || ""}
              fontSize={shape.fontSize || 16}
              fontFamily={shape.fontFamily || "Arial"}
              fill="#333"
              align="left"
              width={shape.width - 20}
              height={shape.height - 20}
              wrap="word"
              draggable={false}
              rotation={0}
              // Prevent text from being selected separately
              listening={false}
            />
          </>
        );

      case "connector":
        return <Connector shape={shape} isSelected={isSelected} onSelect={onSelect} />;

      default:
        return null;
    }
  };

  return renderShape();
});

Shape.displayName = "Shape";

export default Shape;