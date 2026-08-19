"use client";

import Canvas from "@/components/Canvas";
import TopNavigation from "@/components/TopNavigation";
import LeftPropertiesPanel from "@/components/LeftPropertiesPanel";
import BottomControls from "@/components/BottomControls";

export default function Home() {
  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden bg-white">
      {/* Top Navigation - Menu, Toolbar, Share */}
      <TopNavigation />

      {/* Main canvas area */}
      <Canvas />

      {/* Left Sidebar - Properties Panel */}
      <LeftPropertiesPanel />

      {/* Bottom Controls - Zoom, Undo/Redo, Help */}
      <BottomControls />
    </main>
  );
}
