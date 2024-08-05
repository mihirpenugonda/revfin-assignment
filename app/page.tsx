"use client";

import { useCallback, useState } from "react";
import { createContext } from "react";
import { Camera, CanvasState, CanvasMode, LayerType, Layer } from "@/lib/types";
import { LayerPreview } from "./_components/layerPreview";
import { pointerEventToCanvasPoint } from "@/lib/utils";
import { Toolbar } from "./_components/toolbar";
import { v4 as uuidv4 } from "uuid";

interface CanvasContextType {
  camera: Camera;
  layerDetails: Layer[];
}

export const CanvasContext = createContext<CanvasContextType>({
  camera: { x: 0, y: 0 },
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

  const insertLayer = useCallback(
    (
      layerType: LayerType,
      point: {
        x: number;
        y: number;
      }
    ) => {
      const layerId = uuidv4();

      let layer: Layer | null = null;

      if (layerType == LayerType.Rectangle) {
        layer = {
          id: layerId.toString(),
          type: layerType,
          x: point.x,
          y: point.y,
          width: 100,
          height: 100,
        };
      }

      if (!layer) return;

      setLayerDetails((layerDetails) => [...layerDetails, layer]);
    },
    []
  );

  const handleImageInsert = useCallback(
    (imgSrc: string) => {
      const layerId = uuidv4();

      const layer: Layer = {
        id: layerId.toString(),
        type: LayerType.Image,
        x: 0,
        y: 0,
        image: imgSrc,
      };

      setLayerDetails((layerDetails) => [...layerDetails, layer]);
    },
    [camera]
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();

      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode == CanvasMode.Translating) {
      } else if (canvasState.mode == CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      }
    },
    [canvasState]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Inserting) return;

      setCanvasState({
        origin: point,
        mode: CanvasMode.Pressing,
      });
    },
    [camera, canvasState.mode, setCanvasState]
  );

  const handleLayerPointerDown = useCallback(
    (e: React.PointerEvent, layerId: string) => {
      if (canvasState.mode === CanvasMode.Inserting) {
        return;
      }

      e.stopPropagation();

      const point = pointerEventToCanvasPoint(e, camera);

      setCanvasState({
        mode: CanvasMode.Translating,
        current: point,
      });
    },
    [canvasState.mode, camera, setCanvasState]
  );

  return (
    <CanvasContext.Provider value={{ camera, layerDetails }}>
      <main className="h-full w-full relative bg-neutral-100 touch-none">
        <Toolbar
          canvasState={canvasState}
          setCanvasState={setCanvasState}
          handleImageInsert={handleImageInsert}
        />

        <svg
          className="h-[100vh] w-[100vw]"
          onWheel={handleWheel}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerDown={handlePointerDown}
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
                onLayerPointerDown={handleLayerPointerDown}
              />
            ))}
          </g>
        </svg>
      </main>
    </CanvasContext.Provider>
  );
}
