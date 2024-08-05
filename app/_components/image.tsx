import { ImageLayer } from "@/lib/types";
import Image from "next/image";

interface ImageProps {
  id: string;
  layer: ImageLayer;
}

export const ImageElement = ({ id, layer }: ImageProps) => {
  const { x, y, image } = layer;

  return (
    <Image
      draggable={false}
      fill
      alt="image"
      className="!relative"
      id={id}
      // style={{scale: 0.5}}
      // x={0}
      // y={0}
      src={image}
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    />
  );
};
