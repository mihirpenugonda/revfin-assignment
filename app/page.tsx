import { pointerEventToCanvasPoint } from "@/lib/utils";
import { useCallback, useState } from "react";

export default function Home() {
  const [camera, setCamera] = useState({ x: 0, y: 0 });

  const handleWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }));
  }, []);

  return (
    <main className="h-full w-full relative bg-neutral-100 touch-none">
      <svg className="h-[100vh] w-[100vw]" onWheel={handleWheel}>
        <g
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px)`,
          }}
        ></g>
      </svg>
    </main>
  );
}
