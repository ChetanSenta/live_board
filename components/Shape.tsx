"use client";

import { Rect, Circle, Line } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Shape as ShapeType } from "@/store/canvasStore";

interface ShapeProps {
  shape: ShapeType;
  isSelected: boolean;
  onSelect: (e: KonvaEventObject<MouseEvent>) => void;
}

export default function Shape({ shape, isSelected, onSelect }: ShapeProps) {
  // Common props for all shapes
  const commonProps = {
    onClick: onSelect,
    onTap: onSelect,
    shadowColor: "black",
    shadowBlur: isSelected ? 10 : 0,
    shadowOpacity: 0.3,
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
            strokeWidth={isSelected ? 3 : shape.strokeWidth}
            rotation={shape.rotation}
            cornerRadius={4}
            draggable={true}
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
            strokeWidth={isSelected ? 3 : shape.strokeWidth}
            rotation={shape.rotation}
            draggable={true}
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
            draggable={true}
          />
        );

      default:
        return null;
    }
  };

  return renderShape();
}
