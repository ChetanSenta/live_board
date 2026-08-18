"use client";

import Canvas from "@/components/Canvas";
import Toolbar from "@/components/Toolbar";
import ZoomControls from "@/components/ZoomControls";
import PropertiesPanel from "@/components/PropertiesPanel";

export default function Home() {
  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Toolbar - positioned absolutely within */}
      <Toolbar />

      {/* Main canvas area */}
      <Canvas />

      {/* Zoom controls */}
      <ZoomControls />

      {/* Properties panel */}
      <PropertiesPanel />
    </main>
  );
}
