"use client";

import { pointerEventToCanvasPoint } from "@/lib/utils";
import { useCallback, useState } from "react";
import { createContext } from "react";
import { Camera, CanvasState, CanvasMode, LayerType, Layer } from "@/lib/types";
import { LayerPreview } from "./_components/layerPreview";

interface CanvasContextType {
  camera: Camera;
  canvasState: CanvasState;
  layerDetails: Layer[];
}

export const CanvasContext = createContext<CanvasContextType>({
  camera: { x: 0, y: 0 },
  canvasState: { mode: CanvasMode.None },
  layerDetails: [],
});

export default function Home() {
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [layerDetails, setLayerDetails] = useState<Layer[]>([]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }));
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    e.preventDefault();

    const current = pointerEventToCanvasPoint(e, camera);
  }, []);

  const onLayerPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();

    console.log("pointer down");
  };

  return (
    <CanvasContext.Provider value={{ camera, canvasState, layerDetails }}>
      <main className="h-full w-full relative bg-neutral-100 touch-none">
        <svg
          className="h-[100vh] w-[100vw]"
          onWheel={handleWheel}
          onPointerMove={handlePointerMove}
        >
          <g
            style={{
              transform: `translate(${camera.x}px, ${camera.y}px)`,
            }}
          >
            {layerDetails.map((layer) => (
              <LayerPreview
                key={layer.id}
                id={layer.id}
                onLayerPointerDown={onLayerPointerDown}
              />
            ))}
          </g>
        </svg>
      </main>
    </CanvasContext.Provider>
  );
}
