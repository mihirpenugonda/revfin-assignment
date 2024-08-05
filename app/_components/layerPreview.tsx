"use client";

import { LayerType } from "@/lib/types";
import { memo, useContext } from "react";
import { CanvasContext } from "../page";
import { Rectangle } from "./rectangle";
import { Image } from "./image";

interface LayerPreviewProps {
  id: string;
  onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
}

export const LayerPreview = memo(
  ({ id, onLayerPointerDown }: LayerPreviewProps) => {
    const whiteboardContext = useContext(CanvasContext);
    const layer = whiteboardContext.layerDetails.find(
      (layer) => layer.id === id
    );

    if (!layer) return null;

    switch (layer.type) {
      case LayerType.Rectangle:
        return (
          <Rectangle id={id} layer={layer} onPointerDown={onLayerPointerDown} />
        );

      case LayerType.Image:
        return <Image id={id} layer={layer} />;

      default:
        console.warn("Unknown layer type", layer);
        return null;
    }
  }
);

LayerPreview.displayName = "LayerPreview";
