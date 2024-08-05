import { ImageLayer } from "@/lib/types";

interface ImageProps {
  id: string;
  layer: ImageLayer;
}

export const Image = ({ id, layer }: ImageProps) => {
  const { x, y, image } = layer;

  return (
    <image
      id={id}
      x={0}
      y={0}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      xlinkHref={image}
    />
  );
};
