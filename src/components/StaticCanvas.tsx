"use client";

import { useEffect, useRef } from "react";

// Low-res noise scaled up by CSS reads as authentic analog snow and is
// cheap enough to redraw every frame.
const WIDTH = 240;
const HEIGHT = 180;
const FPS = 30;

export default function StaticCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const image = ctx.createImageData(WIDTH, HEIGHT);
    const pixels = new Uint32Array(image.data.buffer);
    let raf = 0;
    let last = 0;
    let rollY = 0;

    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 1000 / FPS) return;
      last = t;

      // A slow bright band rolling down the screen, like a detuned signal.
      rollY = (rollY + 2) % (HEIGHT + 40);
      for (let y = 0; y < HEIGHT; y++) {
        const band = Math.max(0, 1 - Math.abs(y - rollY + 20) / 20) * 60;
        const row = y * WIDTH;
        for (let x = 0; x < WIDTH; x++) {
          const v = Math.min(255, ((Math.random() * 255) | 0) + band);
          // ABGR, little-endian
          pixels[row + x] = 0xff000000 | (v << 16) | (v << 8) | v;
        }
      }
      ctx.putImageData(image, 0, 0);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} width={WIDTH} height={HEIGHT} className={className} aria-hidden />;
}
