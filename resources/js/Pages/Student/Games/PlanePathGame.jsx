import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import planeImg from '@/assets/images/plane.png';

export default function PlanePathGame() {
  // ----- Constantes de juego / avión -----
  const gameHeight = 300;
  const gameWidth = 300;

  const planeHeight = 20;     // altura base (lógica)
  const PLANE_SCALE = 4;      // escala visual
  const PLANE_WIDTH = 120;    // ancho visual de la imagen
  const planeHeightPx = planeHeight * PLANE_SCALE; // altura visual real

  const offsetY = 55;         // semiancho del corredor (desde el centro)
  const HITBOX_PAD = 0;       // puedes poner 5-10 si quieres tolerancia

  // ----- Estado -----
  const [planeY, setPlaneY] = useState(130);
  const [pathOffset, setPathOffset] = useState(0);
  const [score, setScore] = useState(0);
  const [totalTicks, setTotalTicks] = useState(0);
  const [startTime] = useState(Date.now());

  // Movimiento del avión
  const moveUp = () =>
    setPlaneY(prev => Math.max(0, prev - 20));

  const moveDown = () =>
    setPlaneY(prev => Math.min(gameHeight - planeHeightPx, prev + 20)); // usa altura visual

  // Control por teclado
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowUp') moveUp();
      else if (e.key === 'ArrowDown') moveDown();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Movimiento del camino + score (ajustado al tamaño real del avión)
  useEffect(() => {
    const interval = setInterval(() => {
      // Calcula el próximo offset para usarlo en el seno
      const nextOffset = pathOffset + 5;
      setPathOffset(nextOffset);
      setTotalTicks(prev => prev + 1);

      // Centro del corredor "ondulado"
      const waveCenter = 130 + Math.sin((nextOffset + 50) / 30) * 60;

      // Hitbox vertical del avión (top/bottom)
      const planeTop = planeY;
      const planeBottom = planeY + planeHeightPx;

      // Límites del corredor (con tolerancia opcional)
      const laneTop = waveCenter - offsetY - HITBOX_PAD;
      const laneBottom = waveCenter + offsetY + HITBOX_PAD;

      // Está dentro si cualquier parte del rectángulo vertical del avión
      // se solapa con el corredor
      const inPath = planeBottom > laneTop && planeTop < laneBottom;

      if (inPath) {
        setScore(prev => prev + 1);
      }
    }, 140);

    return () => clearInterval(interval);
  }, [planeY, pathOffset, planeHeightPx, offsetY]);

  // Envío al backend (llámalo cuando termine el juego)
  const sendResult = async () => {
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);

    try {
      await axios.post(route('student.plane.store'), {
        score,
        duration,
        total: totalTicks,
      });
      console.log('Resultado enviado');
    } catch (error) {
      console.error('Error al guardar', error);
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
          const waveCenter = 130 + Math.sin((pathOffset + i * 10) / 30) * 60;

          return (
            <React.Fragment key={i}>
              {/* Línea superior */}
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
              {/* Línea inferior */}
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

        {/* Avión (imagen) */}
        <img
          src={planeImg}
          alt="Plane"
          style={{
            position: 'absolute',
            left: 20,
            top: planeY,
            width: PLANE_WIDTH,
            height: planeHeightPx,
            objectFit: 'contain',
            pointerEvents: 'none', // evita seleccionar la imagen al clickear
            userSelect: 'none',
          }}
        />
      </div>

      {/* Botones físicos */}
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

      {/* Información de puntuación */}
      <div className="mt-4 text-sm">
        <p>Score: {score}</p>
        <p>Ticks totales: {totalTicks}</p>
      </div>

      {/* <button onClick={sendResult} className="mt-2 px-4 py-1 bg-blue-500 text-white rounded">
        Enviar resultados
      </button> */}
    </div>
  );
}
