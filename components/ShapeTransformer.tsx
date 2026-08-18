"use client";

import { useEffect, useRef } from "react";
import { Transformer as KonvaTransformer } from "react-konva";
import { Node } from "konva/lib/Node";
import { useCanvasStore } from "@/store/canvasStore";

interface ShapeTransformerProps {
  selectedShapeRef: React.RefObject<Node | null>;
}

export default function ShapeTransformer({ selectedShapeRef }: ShapeTransformerProps) {
  const transformerRef = useRef<any>(null);
  const { selectedIds, updateShape, shapes, saveToHistory } = useCanvasStore();

  // Attach transformer to selected shape
  useEffect(() => {
    const transformer = transformerRef.current;
    const shapeNode = selectedShapeRef.current;

    if (transformer && shapeNode) {
      // Attach the transformer to the selected node
      transformer.nodes([shapeNode]);
      transformer.getLayer()?.batchDraw();
    }
  }, [selectedIds, selectedShapeRef]);

  // Update connected connectors when a shape moves
  const updateConnectedConnectors = (shapeId: string) => {
    const connectedConnectors = shapes.filter(
      (shape) => shape.type === "connector" && (shape.connectorStartId === shapeId || shape.connectorEndId === shapeId)
    );

    connectedConnectors.forEach((connector) => {
      // The connector will automatically recalculate its points when re-rendered
      // because it reads the connected shapes' positions from the store
      // We just need to trigger a re-render by updating a property
      updateShape(connector.id, { points: connector.points });
    });
  };

  // Handle transform end - update shape in store
  const handleTransformEnd = () => {
    const shapeNode = selectedShapeRef.current;
    if (!shapeNode) return;

    const id = shapeNode.id();
    if (!id) return;

    // Save state before transforming
    saveToHistory();

    // Get the node's attributes after transformation
    const scaleX = shapeNode.scaleX();
    const scaleY = shapeNode.scaleY();

    // Get the original dimensions from the shape
    const shapeNodeAttrs = shapeNode.attrs;
    let originalWidth = shapeNodeAttrs.width || 100;
    let originalHeight = shapeNodeAttrs.height || 100;

    // For lines, we need different handling
    if (shapeNodeAttrs.type === "line") {
      // Lines use points array, need to calculate scale
      const originalPoints = shapeNodeAttrs.points || [0, 0, 100, 0];
      const newPoints = [
        originalPoints[0] * scaleX,
        originalPoints[1] * scaleY,
        originalPoints[2] * scaleX,
        originalPoints[3] * scaleY,
      ];

      updateShape(id, {
        x: shapeNode.x(),
        y: shapeNode.y(),
        points: newPoints,
        width: Math.abs(newPoints[2] - newPoints[0]),
        height: Math.abs(newPoints[3] - newPoints[1]),
      });

      // Reset scale for lines
      shapeNode.scaleX(1);
      shapeNode.scaleY(1);
      // Update connected connectors
      updateConnectedConnectors(id);
      return;
    }

    // Calculate new dimensions
    const newWidth = Math.max(5, originalWidth * scaleX);
    const newHeight = Math.max(5, originalHeight * scaleY);

    // Update shape in store
    updateShape(id, {
      x: shapeNode.x(),
      y: shapeNode.y(),
      width: newWidth,
      height: newHeight,
      rotation: shapeNode.rotation(),
    });

    // Reset the node's scale (we've baked it into width/height)
    shapeNode.scaleX(1);
    shapeNode.scaleY(1);

    // Update connected connectors
    updateConnectedConnectors(id);
  };

  // Handle drag end - update shape position in store
  const handleDragEnd = () => {
    const shapeNode = selectedShapeRef.current;
    if (!shapeNode) return;

    const id = shapeNode.id();
    if (!id) return;

    // Save state before dragging
    saveToHistory();

    updateShape(id, {
      x: shapeNode.x(),
      y: shapeNode.y(),
    });

    // Update connected connectors
    updateConnectedConnectors(id);
  };

  // Only show transformer when shapes are selected
  if (selectedIds.length === 0) return null;

  return (
    <KonvaTransformer
      ref={transformerRef}
      flipEnabled={false}
      boundBoxFunc={(oldBox, newBox) => {
        // Limit minimum size
        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
          return oldBox;
        }
        return newBox;
      }}
      onTransformEnd={handleTransformEnd}
      onDragEnd={handleDragEnd}
      // Customize handle appearance
      anchorFill="#ffffff"
      anchorStroke="#333333"
      anchorSize={10}
      anchorCornerRadius={2}
      borderStroke="#0066FF"
      borderStrokeWidth={1}
      rotateEnabled={true}
    />
  );
}