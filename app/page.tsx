"use client";

import Canvas from "@/components/Canvas";
import Toolbar from "@/components/Toolbar";
import ZoomControls from "@/components/ZoomControls";

export default function Home() {
  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Toolbar - positioned absolutely within */}
      <Toolbar />

      {/* Main canvas area */}
      <Canvas />

      {/* Zoom controls */}
      <ZoomControls />
    </main>
  );
}
