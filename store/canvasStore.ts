import { create } from "zustand";
import { nanoid } from "nanoid";

// Shape types that the canvas supports
export type ShapeType = "rectangle" | "circle" | "line";

// Tool types available in the toolbar
export type ToolType = "select" | "rectangle" | "circle" | "line";

// Shape data structure - represents one object on canvas
export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation: number;
  // For lines specifically - end point coordinates
  points?: number[];
}

// Store state interface
interface CanvasState {
  // All shapes on the canvas
  shapes: Shape[];

  // Currently selected shape IDs (array for multi-select later)
  selectedIds: string[];

  // Currently active tool
  tool: ToolType;

  // Zoom level (1 = 100%, 0.5 = 50%, 2 = 200%)
  zoom: number;

  // Pan offset (how much the canvas has been moved)
  panOffset: { x: number; y: number };

  // Stage size (canvas dimensions for calculations)
  stageSize: { width: number; height: number };

  // Actions
  setTool: (tool: ToolType) => void;
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  setStageSize: (size: { width: number; height: number }) => void;
  selectShape: (id: string | null, addToSelection?: boolean) => void;
  clearSelection: () => void;

  // Shape CRUD operations
  addShape: (shape: Omit<Shape, "id">) => string;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  deleteSelected: () => void;

  // Utility
  getShapeById: (id: string) => Shape | undefined;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  // Initial state
  shapes: [],
  selectedIds: [],
  tool: "select",
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  stageSize: { width: 800, height: 600 },

  // Tool actions
  setTool: (tool) => set({ tool }),

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

  setPanOffset: (offset) => set({ panOffset: offset }),

  setStageSize: (size) => set({ stageSize: size }),

  // Selection actions
  selectShape: (id, addToSelection = false) => {
    if (id === null) {
      set({ selectedIds: [] });
      return;
    }

    if (addToSelection) {
      const current = get().selectedIds;
      const isSelected = current.includes(id);
      if (isSelected) {
        // Remove from selection
        set({ selectedIds: current.filter((sid) => sid !== id) });
      } else {
        // Add to selection
        set({ selectedIds: [...current, id] });
      }
    } else {
      set({ selectedIds: [id] });
    }
  },

  clearSelection: () => set({ selectedIds: [] }),

  // Shape CRUD
  addShape: (shapeData) => {
    const id = nanoid();
    const newShape: Shape = {
      ...shapeData,
      id,
    };
    set((state) => ({
      shapes: [...state.shapes, newShape],
    }));
    return id;
  },

  updateShape: (id, updates) => {
    set((state) => ({
      shapes: state.shapes.map((shape) =>
        shape.id === id ? { ...shape, ...updates } : shape
      ),
    }));
  },

  deleteShape: (id) => {
    set((state) => ({
      shapes: state.shapes.filter((shape) => shape.id !== id),
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
    }));
  },

  deleteSelected: () => {
    const selectedIds = get().selectedIds;
    set((state) => ({
      shapes: state.shapes.filter((shape) => !selectedIds.includes(shape.id)),
      selectedIds: [],
    }));
  },

  getShapeById: (id) => {
    return get().shapes.find((shape) => shape.id === id);
  },
}));
