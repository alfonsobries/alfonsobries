import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef } from "react";

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
  const bboxLensLeftRef = useRef<DOMRect | null>(null);
  const bboxLensRightRef = useRef<DOMRect | null>(null);
  const bboxIrisLeftRef = useRef<DOMRect | null>(null);
  const bboxIrisRightRef = useRef<DOMRect | null>(null);

  // Función para mover los iris
  const moveIris = useCallback((event: MouseEvent) => {
    if (
      !svgRef.current ||
      !lensLeftRef.current ||
      !lensRightRef.current ||
      !irisLeftRef.current ||
      !irisRightRef.current
    ) {
      return;
    }

    // Obtener la posición del mouse en la pantalla
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Obtener posición y dimensiones del SVG en la ventana
    const bboxSvg = svgRef.current.getBoundingClientRect();
    const svgX = bboxSvg.left + window.scrollX;
    const svgY = bboxSvg.top + window.scrollY;

    // Convertir la posición del mouse al sistema de coordenadas del SVG
    const relativeX = ((mouseX - svgX) / bboxSvg.width) * 347; // 347 es el ancho del viewBox
    const relativeY = ((mouseY - svgY) / bboxSvg.height) * 482; // 482 es el alto del viewBox

    // Calcular el desplazamiento para el iris izquierdo
    if (centerLensLeftRef.current && centerLensRightRef.current) {
      let moveXLeft = (relativeX - centerLensLeftRef.current.x) * 0.1; // Factor 0.1 para suavizar
      let moveYLeft = (relativeY - centerLensLeftRef.current.y) * 0.1;

      // Calcular el desplazamiento para el iris derecho
      let moveXRight = (relativeX - centerLensRightRef.current.x) * 0.1;
      let moveYRight = (relativeY - centerLensRightRef.current.y) * 0.1;

      // Definir el desplazamiento máximo permitido (en píxeles del SVG)
      const maxMove = 8; // Límite fijo de 8 unidades

      // Limitar el movimiento dentro del desplazamiento máximo
      moveXLeft = Math.max(-maxMove, Math.min(maxMove, moveXLeft));
      moveYLeft = Math.max(-maxMove, Math.min(maxMove, moveYLeft));
      moveXRight = Math.max(-maxMove, Math.min(maxMove, moveXRight));
      moveYRight = Math.max(-maxMove, Math.min(maxMove, moveYRight));

      // Aplicar el movimiento a los iris
      irisLeftRef.current.setAttribute(
        "transform",
        `translate(${moveXLeft}, ${moveYLeft})`
      );
      irisRightRef.current.setAttribute(
        "transform",
        `translate(${moveXRight}, ${moveYRight})`
      );
    }
  }, []);

  // Función para inicializar o re-inicializar los elementos
  const initializeEyes = useCallback(() => {
    if (!svgRef.current) {
      return;
    }

    const svg = svgRef.current;

    // Seleccionar los elementos
    const lensLeft = svg.querySelector(
      '[id^="LenteIzquierdo"]'
    ) as SVGPathElement;
    const lensRight = svg.querySelector(
      '[id^="LenteDerecho"]'
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
        "No se encontraron los elementos del SVG con los IDs especificados."
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
    const bboxIrisLeft = irisLeft.getBBox();
    const bboxIrisRight = irisRight.getBBox();

    bboxLensLeftRef.current = bboxLensLeft;
    bboxLensRightRef.current = bboxLensRight;
    bboxIrisLeftRef.current = bboxIrisLeft;
    bboxIrisRightRef.current = bboxIrisRight;

    // Calcular los centros de los lentes
    const centerLensLeft = {
      x: bboxLensLeft.x + bboxLensLeft.width / 2,
      y: bboxLensLeft.y + bboxLensLeft.height / 2,
    };
    const centerLensRight = {
      x: bboxLensRight.x + bboxLensRight.width / 2,
      y: bboxLensRight.y + bboxLensRight.height / 2,
    };

    centerLensLeftRef.current = centerLensLeft;
    centerLensRightRef.current = centerLensRight;
  }, []);

  // Función onReady para manejar la carga inicial del SVG
  const onReady = useCallback(
    (error: { cause?: unknown } | null, svg?: SVGElement) => {
      if (error || !svg) {
        console.error("Error al cargar el SVG:", error?.cause);
        return;
      }

      svgRef.current = svg;

      // Inicializar los elementos por primera vez
      initializeEyes();

      // Añadir el listener para el movimiento del mouse
      document.addEventListener("mousemove", moveIris);
    },
    [initializeEyes, moveIris]
  );

  // Re-inicializar cuando cambie el resolvedTheme
  useEffect(() => {
    if (svgRef.current) {
      initializeEyes();
    }
  }, [resolvedTheme, initializeEyes]);

  // Retornar la función onReady
  return { onReady };
}
