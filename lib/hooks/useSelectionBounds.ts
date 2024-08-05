import { Layer, LayerType, XYWH } from "../types";

const boundingBox = (layers: Layer[], selectedLayerId: string): XYWH | null => {
  const first = layers.find((layer) => layer.id === selectedLayerId);

  if (!first) return null;

  if (first.type != LayerType.Rectangle) return null;

  let left = first.x;
  let right = first.x + first.width;
  let top = first.y;
  let bottom = first.y + first.height;

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};

export const useSelectionBounds = (
  layers: Layer[],
  selectedLayerId: string | null
) => {
  if (selectedLayerId === null) return null;

  const bounds = boundingBox(layers, selectedLayerId);

  return bounds;
};
