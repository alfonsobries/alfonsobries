import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef } from "react";

// Estado de un eje del resorte: posición actual y velocidad.
type SpringAxis = { value: number; velocity: number };
type EyeState = {
  x: SpringAxis;
  y: SpringAxis;
  targetX: number;
  targetY: number;
};

const createEyeState = (): EyeState => ({
  x: { value: 0, velocity: 0 },
  y: { value: 0, velocity: 0 },
  targetX: 0,
  targetY: 0,
});

export function useEyes() {
  const { resolvedTheme } = useTheme();

  // Referencias para los elementos del SVG y valores calculados
  const svgRef = useRef<SVGElement | null>(null);
  const lensLeftRef = useRef<SVGPathElement | null>(null);
  const lensRightRef = useRef<SVGPathElement | null>(null);
  const irisLeftRef = useRef<SVGPathElement | null>(null);
  const irisRightRef = useRef<SVGPathElement | null>(null);
  const centerLensLeftRef = useRef<{ x: number; y: number } | null>(null);
  const centerLensRightRef = useRef<{ x: number; y: number } | null>(null);

  // Estado del resorte por ojo (objetivo vs posición animada)
  const eyeLeftRef = useRef<EyeState>(createEyeState());
  const eyeRightRef = useRef<EyeState>(createEyeState());

  // Control del loop de animación
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  // Parámetros del resorte. Más stiffness = más rápido; menos damping = más
  // rebote. Estos valores dan un seguimiento ágil con un overshoot leve.
  const STIFFNESS = 120;
  const DAMPING = 13;
  const MAX_MOVE = 8; // Desplazamiento máximo del iris (unidades del viewBox)

  // Integra un eje del resorte hacia su objetivo en un paso de tiempo dt.
  const stepSpring = useCallback(
    (axis: SpringAxis, target: number, dt: number) => {
      const force =
        -STIFFNESS * (axis.value - target) - DAMPING * axis.velocity;
      axis.velocity += force * dt;
      axis.value += axis.velocity * dt;
    },
    [],
  );

  // Loop de animación: acerca cada iris a su objetivo cuadro a cuadro.
  const animate = useCallback(
    (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      // dt en segundos, acotado para evitar saltos al volver de una pestaña
      // inactiva o tras un frame muy lento.
      const dt = Math.min((time - lastTimeRef.current) / 1000, 1 / 30);
      lastTimeRef.current = time;

      const left = eyeLeftRef.current;
      const right = eyeRightRef.current;

      stepSpring(left.x, left.targetX, dt);
      stepSpring(left.y, left.targetY, dt);
      stepSpring(right.x, right.targetX, dt);
      stepSpring(right.y, right.targetY, dt);

      if (irisLeftRef.current) {
        irisLeftRef.current.setAttribute(
          "transform",
          `translate(${left.x.value.toFixed(2)}, ${left.y.value.toFixed(2)})`,
        );
      }
      if (irisRightRef.current) {
        irisRightRef.current.setAttribute(
          "transform",
          `translate(${right.x.value.toFixed(2)}, ${right.y.value.toFixed(2)})`,
        );
      }

      rafRef.current = requestAnimationFrame(animate);
    },
    [stepSpring],
  );

  const ensureLoop = useCallback(() => {
    if (rafRef.current === null) {
      lastTimeRef.current = null;
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  // Aplica un objetivo directo (sin animar) — para reduced motion.
  const snapTo = useCallback(
    (
      eye: EyeState,
      targetX: number,
      targetY: number,
      iris: SVGPathElement | null,
    ) => {
      eye.x.value = targetX;
      eye.x.velocity = 0;
      eye.y.value = targetY;
      eye.y.velocity = 0;
      iris?.setAttribute("transform", `translate(${targetX}, ${targetY})`);
    },
    [],
  );

  // Función para actualizar el objetivo de los iris según el mouse.
  const moveIris = useCallback(
    (event: MouseEvent) => {
      if (
        !svgRef.current ||
        !centerLensLeftRef.current ||
        !centerLensRightRef.current
      ) {
        return;
      }

      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // Posición y dimensiones del SVG en la ventana
      const bboxSvg = svgRef.current.getBoundingClientRect();
      const svgX = bboxSvg.left + window.scrollX;
      const svgY = bboxSvg.top + window.scrollY;

      // Mouse en el sistema de coordenadas del SVG (viewBox 347x482)
      const relativeX = ((mouseX - svgX) / bboxSvg.width) * 347;
      const relativeY = ((mouseY - svgY) / bboxSvg.height) * 482;

      const clamp = (v: number) => Math.max(-MAX_MOVE, Math.min(MAX_MOVE, v));

      const targetXLeft = clamp(
        (relativeX - centerLensLeftRef.current.x) * 0.1,
      );
      const targetYLeft = clamp(
        (relativeY - centerLensLeftRef.current.y) * 0.1,
      );
      const targetXRight = clamp(
        (relativeX - centerLensRightRef.current.x) * 0.1,
      );
      const targetYRight = clamp(
        (relativeY - centerLensRightRef.current.y) * 0.1,
      );

      const left = eyeLeftRef.current;
      const right = eyeRightRef.current;

      if (reducedMotionRef.current) {
        snapTo(left, targetXLeft, targetYLeft, irisLeftRef.current);
        snapTo(right, targetXRight, targetYRight, irisRightRef.current);
        return;
      }

      // Solo guardamos el objetivo; el loop hace el seguimiento suave.
      left.targetX = targetXLeft;
      left.targetY = targetYLeft;
      right.targetX = targetXRight;
      right.targetY = targetYRight;

      ensureLoop();
    },
    [ensureLoop, snapTo],
  );

  // Función para inicializar o re-inicializar los elementos
  const initializeEyes = useCallback(() => {
    if (!svgRef.current) {
      return;
    }

    const svg = svgRef.current;

    // Seleccionar los elementos
    const lensLeft = svg.querySelector(
      '[id^="LenteIzquierdo"]',
    ) as SVGPathElement;
    const lensRight = svg.querySelector(
      '[id^="LenteDerecho"]',
    ) as SVGPathElement;

    const irisLefts = svg.querySelectorAll('[id^="IrisIzquierdo"]');
    const irisLeft = Array.from(irisLefts).find((elemento) => {
      const estilo = getComputedStyle(elemento); // Obtiene los estilos aplicados
      return estilo.display !== "none" && estilo.visibility !== "hidden";
    }) as SVGPathElement;

    const irisRights = svg.querySelectorAll('[id^="IrisDerecho"]');
    const irisRight = Array.from(irisRights).find((elemento) => {
      const estilo = getComputedStyle(elemento); // Obtiene los estilos aplicados
      return estilo.display !== "none" && estilo.visibility !== "hidden";
    }) as SVGPathElement;

    if (!lensLeft || !lensRight || !irisLeft || !irisRight) {
      console.error(
        "No se encontraron los elementos del SVG con los IDs especificados.",
      );
      return;
    }

    // Almacenar referencias
    lensLeftRef.current = lensLeft;
    lensRightRef.current = lensRight;
    irisLeftRef.current = irisLeft;
    irisRightRef.current = irisRight;

    // Calcular las cajas delimitadoras
    const bboxLensLeft = lensLeft.getBBox();
    const bboxLensRight = lensRight.getBBox();

    // Calcular los centros de los lentes
    centerLensLeftRef.current = {
      x: bboxLensLeft.x + bboxLensLeft.width / 2,
      y: bboxLensLeft.y + bboxLensLeft.height / 2,
    };
    centerLensRightRef.current = {
      x: bboxLensRight.x + bboxLensRight.width / 2,
      y: bboxLensRight.y + bboxLensRight.height / 2,
    };

    // Conservar la posición actual del iris recién seleccionado (puede haber
    // cambiado de variante al alternar el tema).
    irisLeft.setAttribute(
      "transform",
      `translate(${eyeLeftRef.current.x.value.toFixed(2)}, ${eyeLeftRef.current.y.value.toFixed(2)})`,
    );
    irisRight.setAttribute(
      "transform",
      `translate(${eyeRightRef.current.x.value.toFixed(2)}, ${eyeRightRef.current.y.value.toFixed(2)})`,
    );
  }, []);

  // Función onReady para manejar la carga inicial del SVG
  const onReady = useCallback(
    (svg: SVGSVGElement) => {
      svgRef.current = svg;

      // Detectar preferencia de movimiento reducido.
      reducedMotionRef.current =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      initializeEyes();

      // Listener para el movimiento del mouse
      document.addEventListener("mousemove", moveIris);
    },
    [initializeEyes, moveIris],
  );

  // Re-inicializar cuando cambie el resolvedTheme
  useEffect(() => {
    if (svgRef.current) {
      initializeEyes();
    }
  }, [resolvedTheme, initializeEyes]);

  // Limpieza al desmontar: quitar listener y detener el loop.
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", moveIris);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [moveIris]);

  // Retornar la función onReady
  return { onReady };
}
