import React, { useEffect, useRef, useState } from 'react';
import planeImg from '@/assets/images/plane.png';

export default function PlanePathGame({
  onFinish,          // (pct:number) => void
  durationSec = 25,  // duración del juego en segundos
  tickMs = 140,      // intervalo del loop
  speed = 5,         // avance horizontal del “camino” por tick
}) {
  // ===== Constantes de juego =====
  const gameHeight = 300;
  const gameWidth  = 300;

  // Posición X fija del avión
  const PLANE_LEFT = 20;

  // ===== Estado del avión (dinámico según imagen) =====
  const [planeW, setPlaneW] = useState(120); // ancho visual deseado
  const [planeH, setPlaneH] = useState(60);  // altura visual calculada al cargar imagen

  // Corredor
  const offsetY   = 70; // semialtura del corredor
  const HITBOX_PAD = 6; // tolerancia extra

  // ===== Estado de juego =====
  const [planeY, setPlaneY] = useState(130);
  const [pathOffset, setPathOffset] = useState(0);
  const [score, setScore] = useState(0);
  const [totalTicks, setTotalTicks] = useState(0);

  // Para finalizar por tiempo
  const MAX_TICKS = Math.round((durationSec * 1000) / tickMs);

  // ===== Refs para lecturas “fresh” en el loop =====
  const planeYRef   = useRef(planeY);
  const scoreRef    = useRef(score);
  const ticksRef    = useRef(totalTicks);
  const finishedRef = useRef(false);
  const loopRef     = useRef(null);

  useEffect(() => { planeYRef.current = planeY; }, [planeY]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { ticksRef.current = totalTicks; }, [totalTicks]);

  // ===== Controles =====
  const moveUp = () => setPlaneY(prev => Math.max(0, prev - 20));
  const moveDown = () => setPlaneY(prev => Math.min(gameHeight - planeH, prev + 20));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowUp')   moveUp();
      if (e.key === 'ArrowDown') moveDown();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [planeH]);

  // ===== Loop principal =====
  const finishGame = (finalScore = scoreRef.current, finalTicks = ticksRef.current) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (loopRef.current) clearInterval(loopRef.current);

    const pct = finalTicks > 0 ? Math.round((finalScore / finalTicks) * 100) : 0;
    if (typeof onFinish === 'function') onFinish(pct);
  };

  useEffect(() => {
    // Centro X “real” del avión (para alinear el seno con la posición del avión)
    const planeCenterX = PLANE_LEFT + planeW / 2;

    loopRef.current = setInterval(() => {
      // Avanza el offset del camino
      setPathOffset(prevOffset => {
        const nextOffset = prevOffset + speed;

        // Centro del corredor justo en X del avión
        const waveCenter = 130 + Math.sin((nextOffset + planeCenterX) / 30) * 60;

        // Hitbox vertical del avión
        const top    = planeYRef.current;
        const bottom = top + planeH;

        // Límites del corredor
        const laneTop    = waveCenter - offsetY - HITBOX_PAD;
        const laneBottom = waveCenter + offsetY + HITBOX_PAD;

        // ¿Hay solape vertical con el corredor?
        const inPath = bottom > laneTop && top < laneBottom;

        // Score/ticks consistentes (usar refs para siguiente cálculo de finish)
        if (inPath) {
          const nextScore = scoreRef.current + 1;
          scoreRef.current = nextScore;
          setScore(nextScore);
        }

        const nextTicks = ticksRef.current + 1;
        ticksRef.current = nextTicks;
        setTotalTicks(nextTicks);

        // Fin por tiempo
        if (nextTicks >= MAX_TICKS) {
          // pasamos los valores “next” para evitar lag de estado
          finishGame(scoreRef.current, nextTicks);
        }

        return nextOffset;
      });
    }, tickMs);

    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
    // deps: cambian sólo si afecta geometría/cálculo
  }, [planeW, planeH, offsetY, tickMs, speed]);

  // ===== Imagen del avión con altura calculada =====
  const handleImgLoad = (e) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      const ratio = img.naturalHeight / img.naturalWidth;
      const h = Math.round(planeW * ratio);
      setPlaneH(h);
      // Ajustar Y si ahora se sale del canvas
      setPlaneY(prev => Math.min(prev, gameHeight - h));
    }
  };

  return (
    <div>
      <div
        style={{
          width: gameWidth,
          height: gameHeight,
          background: 'black',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 8,
        }}
      >
        {/* Camino ondulado punteado */}
        {Array.from({ length: 40 }).map((_, i) => {
          const left = i * 10;
          const waveCenter = 130 + Math.sin((pathOffset + left) / 30) * 60;
          return (
            <React.Fragment key={i}>
              <div
                style={{
                  position: 'absolute',
                  top: waveCenter - offsetY,
                  left,
                  width: 4,
                  height: 4,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: waveCenter + offsetY,
                  left,
                  width: 4,
                  height: 4,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                }}
              />
            </React.Fragment>
          );
        })}

        {/* Avión */}
        <img
          src={planeImg}
          alt="Plane"
          onLoad={handleImgLoad}
          style={{
            position: 'absolute',
            left: PLANE_LEFT,
            top: planeY,
            width: planeW,
            height: planeH,       // altura real según ratio de la imagen
            objectFit: 'contain',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      </div>

      {/* Controles opcionales */}
      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={moveUp}
          className="px-4 py-2 bg-gray-700 text-white rounded shadow"
        >
          ⬆ Subir
        </button>
        <button
          onClick={moveDown}
          className="px-4 py-2 bg-gray-700 text-white rounded shadow"
        >
          Bajar ⬇
        </button>
      </div>

      {/* HUD */}
      <div className="mt-4 text-sm">
        <p>Score: {score}</p>
        <p>Ticks: {totalTicks} / {MAX_TICKS}</p>
        <p>Tiempo restante: {Math.max(0, Math.ceil((MAX_TICKS - totalTicks) * tickMs / 1000))}s</p>
      </div>
    </div>
  );
}
