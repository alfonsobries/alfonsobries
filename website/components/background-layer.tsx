import { useEffect, useRef } from "react";

const STEP = 24;
const INFLUENCE = 160;

type Point = { x: number; y: number; ox: number; oy: number };

const BackgroundLayer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let points: Point[] = [];
    let raf = 0;

    const computePoints = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const out: Point[] = [];
      for (let x = STEP / 2; x < w; x += STEP) {
        for (let y = STEP / 2; y < h; y += STEP) {
          out.push({ x, y, ox: x, oy: y });
        }
      }
      return out;
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      points = computePoints();
    };

    const isDark = () =>
      document.documentElement.classList.contains("dark");

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const dark = isDark();
      const dotColor = dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.22)";

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of points) {
        const dx = mx - p.ox;
        const dy = my - p.oy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let tx = p.ox;
        let ty = p.oy;
        if (dist < INFLUENCE && dist > 0.01) {
          const force = 1 - dist / INFLUENCE;
          const magnitude = force * force * 18;
          tx = p.ox + (dx / dist) * magnitude;
          ty = p.oy + (dy / dist) * magnitude;
        }
        p.x += (tx - p.x) * 0.18;
        p.y += (ty - p.y) * 0.18;
      }

      ctx.fillStyle = dotColor;
      for (const p of points) {
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1.5, 1.5);
      }

      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
};

export default BackgroundLayer;
