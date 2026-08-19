import { create } from "zustand";
import { nanoid } from "nanoid";

// History state for undo/redo - only stores serializable data, not functions
interface CanvasSnapshot {
  shapes: Shape[];
  selectedIds: string[];
  tool: ToolType;
  zoom: number;
  panOffset: { x: number; y: number };
  stageSize: { width: number; height: number };
}

interface HistoryState {
  past: CanvasSnapshot[];
  future: CanvasSnapshot[];
}

// Shape types that the canvas supports
export type ShapeType = "rectangle" | "circle" | "line" | "text" | "sticky" | "connector";

// Tool types available in the toolbar
export type ToolType = "select" | "rectangle" | "circle" | "line" | "text" | "sticky" | "connector";

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
  // For lines and connectors - start and end point coordinates
  points?: number[];
  // For text and sticky notes - text content
  text?: string;
  // For text - font size
  fontSize?: number;
  // For text - font family
  fontFamily?: string;
  // For text - text color
  textColor?: string;
  // For text - text alignment
  textAlign?: "left" | "center" | "right";
  // For sticky notes - sticky note color
  stickyColor?: string;
  // For connectors - IDs of connected shapes
  connectorStartId?: string;
  connectorEndId?: string;
  // For connectors - whether the connector is being created
  isCreatingConnector?: boolean;
  // Opacity (0-1)
  opacity?: number;
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

  // History state (internal)
  _history: HistoryState;

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

  // Undo/Redo actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: () => void;
}

// Create a shallow copy of state for history (excluding functions)
const getStateForHistory = (state: CanvasState) => ({
  shapes: state.shapes,
  selectedIds: state.selectedIds,
  tool: state.tool,
  zoom: state.zoom,
  panOffset: state.panOffset,
  stageSize: state.stageSize,
});

export const useCanvasStore = create<CanvasState>((set, get) => ({
  // Initial state
  shapes: [],
  selectedIds: [],
  tool: "select",
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  stageSize: { width: 800, height: 600 },

  // History state
  _history: { past: [], future: [] } as HistoryState,

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

  // Undo/Redo actions
  saveToHistory: () => {
    const state = get();
    const history = state._history;
    const newPast = [...history.past, getStateForHistory(state)];
    // Limit history size to prevent memory issues
    const limitedPast = newPast.slice(-50);
    set((state) => ({
      ...state,
      _history: { ...history, past: limitedPast, future: [] },
    }));
  },

  undo: () => {
    const state = get();
    const history = state._history;
    if (history.past.length === 0) return;

    const previousState = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);
    const newFuture = [getStateForHistory(state), ...history.future];

    set((state) => ({
      ...state,
      ...previousState,
      _history: { past: newPast, future: newFuture },
    }));
  },

  redo: () => {
    const state = get();
    const history = state._history;
    if (history.future.length === 0) return;

    const nextState = history.future[0];
    const newFuture = history.future.slice(1);
    const newPast = [...history.past, getStateForHistory(state)];

    set((state) => ({
      ...state,
      ...nextState,
      _history: { past: newPast, future: newFuture },
    }));
  },

  canUndo: () => {
    const history = get()._history;
    return history.past.length > 0;
  },

  canRedo: () => {
    const history = get()._history;
    return history.future.length > 0;
  },
}));
