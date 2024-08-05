"use client";

import { useCallback, useRef, useState } from "react";
import { createContext } from "react";
import {
  Camera,
  CanvasState,
  CanvasMode,
  LayerType,
  Layer,
  Side,
  XYWH,
  Point,
} from "@/lib/types";
import { LayerPreview } from "./_components/layerPreview";
import { pointerEventToCanvasPoint, resizeBounds } from "@/lib/utils";
import { Toolbar } from "./_components/toolbar";
import { v4 as uuidv4 } from "uuid";
import { SelectionBox } from "./_components/selectionBox";

interface CanvasContextType {
  camera: Camera;
  layerDetails: Layer[];
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
}

export const CanvasContext = createContext<CanvasContextType>({
  camera: { x: 0, y: 0 },
  layerDetails: [],
  selectedLayerId: null,
  setSelectedLayerId: () => {},
});

export default function Home() {
  const [camera, setCamera] = useState({
    x: screen.width / 2,
    y: 0,
    scale: 0.5,
  });
  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [layerDetails, setLayerDetails] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  const containerRef = useRef<any>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      setCamera((prev) => ({
        ...prev,
        x: prev.x + (e.clientX - dragStart.x) / prev.scale,
        y: prev.y + (e.clientY - dragStart.y) / prev.scale,
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, dragStart]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const scaleFactor = 1 - e.deltaY * 0.001;
      const newScale = Math.max(0.1, Math.min(10, camera.scale * scaleFactor));

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / camera.scale - camera.x;
      const mouseY = (e.clientY - rect.top) / camera.scale - camera.y;

      setCamera((prev) => ({
        scale: newScale,
        x: mouseX - (mouseX - prev.x) * (newScale / prev.scale),
        y: mouseY - (mouseY - prev.y) * (newScale / prev.scale),
      }));
    },
    [camera]
  );

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

  const translateSelectedLayer = useCallback(
    (point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) return;

      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      setLayerDetails((prevLayers) =>
        prevLayers.map((layer) => {
          console.log(layer);

          if (layer.id === selectedLayerId) {
            return {
              ...layer,
              x: layer.x + offset.x,
              y: layer.y + offset.y,
            };
          }
          return layer;
        })
      );

      setCanvasState({
        mode: CanvasMode.Translating,
        current: point,
      });
    },
    [canvasState, selectedLayerId]
  );

  const resizeSelectedLayer = useCallback(
    (point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }

      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point
      );

      setLayerDetails((prevLayers) =>
        prevLayers.map((layer) => {
          if (layer.id === selectedLayerId) {
            return {
              ...layer,
              x: bounds.x,
              y: bounds.y,
              width: bounds.width,
              height: bounds.height,
            };
          }
          return layer;
        })
      );
    },
    [canvasState]
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


      setCamera((prev) => ({
        x: window.screen.width / 2,
        y: 0,
        scale: 0.5,
      }));
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

      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        unselectLayer();
        setCanvasState({
          mode: CanvasMode.None,
        });
      } else if (canvasState.mode == CanvasMode.Translating) {
        translateSelectedLayer(point);
      } else if (canvasState.mode == CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else if (canvasState.mode == CanvasMode.Resizing) {
        resizeSelectedLayer(point);
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

      setSelectedLayerId(layerId);

      console.log(selectedLayerId, "selectedLayerId");

      setCanvasState({
        mode: CanvasMode.Translating,
        current: point,
      });
    },
    [canvasState.mode, camera, setCanvasState]
  );

  const handleResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [history]
  );

  const unselectLayer = useCallback(() => {
    setSelectedLayerId(null);
  }, [setSelectedLayerId]);

  return (
    <CanvasContext.Provider
      value={{ camera, layerDetails, selectedLayerId, setSelectedLayerId }}
    >
      <main className="h-screen w-full relative overflow-hidden bg-neutral-100 touch-none">
        <Toolbar
          canvasState={canvasState}
          setCanvasState={setCanvasState}
          handleImageInsert={handleImageInsert}
        />

        <div
          ref={containerRef}
          className="absolute h-full w-full"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onWheel={handleWheel}
          onPointerUp={handlePointerUp}
          onPointerDown={handlePointerDown}
        >
          <div
            style={{
              transform: `translate(${camera.x * camera.scale}px, ${
                camera.y * camera.scale
              }px) scale(${camera.scale})`,
              transformOrigin: "0 0",
            }}
          >
            {layerDetails.map((layer) => (
              <LayerPreview
                key={layer.id}
                id={layer.id}
                onLayerPointerDown={handleLayerPointerDown}
              />
            ))}

            <SelectionBox
              layers={layerDetails}
              onResizeHandlePointerDown={handleResizeHandlePointerDown}
            />
          </div>
        </div>
      </main>
    </CanvasContext.Provider>
  );
}
