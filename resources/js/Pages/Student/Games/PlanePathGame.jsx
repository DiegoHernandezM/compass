import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function PlanePathGame() {
  const [planeY, setPlaneY] = useState(130);
  const [pathOffset, setPathOffset] = useState(0);
  const [score, setScore] = useState(0);
  const [totalTicks, setTotalTicks] = useState(0);
  const [startTime] = useState(Date.now());
  const gameHeight = 300;
  const gameWidth = 300;
  const planeHeight = 20;
  const offsetY = 55; // distancia desde el centro hacia arriba y abajo

  // Movimiento del avión
  const moveUp = () => setPlaneY((prev) => Math.max(0, prev - 20));
  const moveDown = () => setPlaneY((prev) => Math.min(gameHeight - planeHeight, prev + 20));

  // Control por teclado
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowUp') moveUp();
      else if (e.key === 'ArrowDown') moveDown();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Movimiento del camino + score
  useEffect(() => {
    const interval = setInterval(() => {
      setPathOffset((prev) => prev + 5);
      setTotalTicks((prev) => prev + 1);

      const waveCenter = 130 + Math.sin((pathOffset + 50) / 30) * 60;
      const inPath = planeY > waveCenter - offsetY && planeY < waveCenter + offsetY;

      if (inPath) {
        setScore((prev) => prev + 1);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [planeY, pathOffset]);

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

        {/* Avión */}
        <div
          style={{
            position: 'absolute',
            left: 20,
            top: planeY,
            width: 30,
            height: planeHeight,
            backgroundColor: 'white',
            borderRadius: 4,
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
      <div className="mt-4 text-sm text-gray-200">
        <p>Score: {score}</p>
        <p>Ticks totales: {totalTicks}</p>
      </div>

      {/* Botón para enviar resultados al backend */}
      {/* <button onClick={sendResult} className="mt-2 px-4 py-1 bg-blue-500 text-white rounded">
        Enviar resultados
      </button> */}
    </div>
  );
}
