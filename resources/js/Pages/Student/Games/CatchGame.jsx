import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

export default function CatchGame() {
  const [bucketX, setBucketX] = useState(130);
  const [balls, setBalls] = useState([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [total, setTotal] = useState(0);
  const [startTime] = useState(Date.now());

  const intervalRef = useRef(null);

  const moveLeft = () => {
    setBucketX((prev) => Math.max(0, prev - 20));
  };

  const moveRight = () => {
    setBucketX((prev) => Math.min(260, prev + 20));
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') moveLeft();
      else if (e.key === 'ArrowRight') moveRight();
    };

    window.addEventListener('keydown', handleKey);

    intervalRef.current = setInterval(() => {
      setBalls((prev) => [
        ...prev,
        { x: Math.random() * 280, y: 0, id: Date.now() },
      ]);
      setTotal((prev) => prev + 1);
    }, 1500);

    return () => {
      window.removeEventListener('keydown', handleKey);
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBalls((prevBalls) =>
        prevBalls
          .map((ball) => ({ ...ball, y: ball.y + 5 }))
          .filter((ball) => {
            const caught =
              ball.y > 260 &&
              ball.x >= bucketX &&
              ball.x <= bucketX + 60;

            if (caught) {
              setScore((prev) => prev + 1);
            }

            const outOfBounds = ball.y > 300;
            if (!caught && outOfBounds) {
              setMissed((prev) => prev + 1);
            }

            return !caught && !outOfBounds;
          })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [bucketX]);

  const sendGameResult = async () => {
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);

    try {
      await axios.post(route('student.game.store'), {
        score,
        missed,
        total,
        duration,
      });
      console.log('Resultados enviados al backend.');
    } catch (error) {
      console.error('Error al guardar los resultados:', error);
    }
  };

  return (
    <div>
      <div
        style={{
          width: 300,
          height: 300,
          background: 'black',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 8,
        }}
      >
        {balls.map((ball) => (
          <div
            key={ball.id}
            style={{
              position: 'absolute',
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: 'white',
              top: ball.y,
              left: ball.x,
            }}
          />
        ))}

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: bucketX,
            width: 60,
            height: 20,
            backgroundColor: 'white',
            borderRadius: '0 0 10px 10px',
          }}
        />
      </div>

      {/* Botones físicos */}
      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={moveLeft}
          className="px-4 py-2 bg-gray-700 text-white rounded shadow"
        >
          ◀ Left
        </button>
        <button
          onClick={moveRight}
          className="px-4 py-2 bg-gray-700 text-white rounded shadow"
        >
          Right ▶
        </button>
      </div>

      {/* Estadísticas (puedes ocultarlas después) */}
      <div className="mt-4 text-sm text-gray-700">
        <p>Atrapadas: {score}</p>
        <p>Falladas: {missed}</p>
        <p>Total: {total}</p>
      </div>
    </div>
  );
}
