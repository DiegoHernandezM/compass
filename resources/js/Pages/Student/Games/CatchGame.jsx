import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

/**
 * Props:
 * - onFinish?: (percent: number) => void   // callback al terminar, 0..100
 * - durationSec?: number                   // duración del juego en segundos (default 30)
 * - autoSendResult?: boolean               // si deseas enviar al backend al terminar (default false)
 */
export default function CatchGame({ onFinish, durationSec = 300, autoSendResult = false }) {
  const W = 300;           // ancho canvas
  const H = 300;           // alto canvas
  const bucketW = 60;
  const bucketH = 20;
  const ballSize = 10;

  const [bucketX, setBucketX] = useState((W - bucketW) / 2);
  const [balls, setBalls] = useState([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [total, setTotal] = useState(0);

  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(true); // cuando false, se detiene y dispara onFinish

  const startTimeRef = useRef(Date.now());
  const spawnerRef = useRef(null);
  const moverRef = useRef(null);
  const timerRef = useRef(null);

  const moveLeft  = () => setBucketX(prev => Math.max(0, prev - 20));
  const moveRight = () => setBucketX(prev => Math.min(W - bucketW, prev + 20));

  // Control por teclado
  useEffect(() => {
    const handleKey = (e) => {
      if (!isRunning) return;
      if (e.key === 'ArrowLeft') moveLeft();
      else if (e.key === 'ArrowRight') moveRight();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isRunning]);

  // Spawner de bolas (cada 1.5s)
  useEffect(() => {
    if (!isRunning) return;
    spawnerRef.current = setInterval(() => {
      setBalls(prev => [...prev, { x: Math.random() * (W - ballSize), y: 0, id: Date.now() }]);
      setTotal(prev => prev + 1);
    }, 1500);
    return () => clearInterval(spawnerRef.current);
  }, [isRunning]);

  // Movimiento de bolas (cada 50ms)
  useEffect(() => {
    if (!isRunning) return;
    moverRef.current = setInterval(() => {
      setBalls(prevBalls =>
        prevBalls
          .map(b => ({ ...b, y: b.y + 5 }))
          .filter(b => {
            // atrapada si toca el “suelo” dentro del ancho del balde
            const caught = b.y > (H - bucketH - ballSize) && b.x >= bucketX && b.x <= bucketX + bucketW;
            if (caught) setScore(prev => prev + 1);

            const out = b.y > H;
            if (!caught && out) setMissed(prev => prev + 1);

            return !caught && !out;
          })
      );
    }, 50);
    return () => clearInterval(moverRef.current);
  }, [isRunning, bucketX]);

  // Temporizador de juego y auto-finish
  useEffect(() => {
    if (!isRunning) return;
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsed(seconds);
      if (seconds >= durationSec) {
        finishGame();
      }
    }, 250);
    return () => clearInterval(timerRef.current);
  }, [isRunning, durationSec]);

  // Envío opcional al backend al terminar
  const sendGameResult = async () => {
    const duration = elapsed; // ya contamos segundos en elapsed
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

  // Finaliza juego, calcula porcentaje y llama onFinish
  const finishGame = async () => {
    if (!isRunning) return; // evita doble finish
    setIsRunning(false);

    // detener timers
    clearInterval(spawnerRef.current);
    clearInterval(moverRef.current);
    clearInterval(timerRef.current);

    const pct = Math.round((score / Math.max(1, total)) * 100);

    if (autoSendResult) {
      await sendGameResult();
    }

    // Notifica al padre (MultitaskTest) para ponderación 40/30/30
    if (typeof onFinish === 'function') {
      onFinish(pct);
    }
  };

  return (
    <div>
      <div
        style={{
          width: W,
          height: H,
          background: 'black',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 8,
        }}
      >
        {balls.map(ball => (
          <div
            key={ball.id}
            style={{
              position: 'absolute',
              width: ballSize,
              height: ballSize,
              borderRadius: '50%',
              backgroundColor: 'white',
              top: ball.y,
              left: ball.x,
            }}
          />
        ))}

        {/* Balde */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: bucketX,
            width: bucketW,
            height: bucketH,
            backgroundColor: 'white',
            borderRadius: '0 0 10px 10px',
          }}
        />
      </div>

      {/* Controles y estado */}
      <div className="mt-3 flex justify-center gap-3">
        <button
          onClick={moveLeft}
          className="px-3 py-2 bg-gray-700 text-white rounded shadow"
          disabled={!isRunning}
        >
          ◀ Izq
        </button>
        <button
          onClick={moveRight}
          className="px-3 py-2 bg-gray-700 text-white rounded shadow"
          disabled={!isRunning}
        >
          Der ▶
        </button>
        {/* 
        <button
          onClick={finishGame}
          className="px-3 py-2 bg-blue-600 text-white rounded shadow"
          disabled={!isRunning}
        >
          Terminar
        </button>
        */}
      </div>

      <div className="mt-3 text-sm text-gray-700 text-center">
        <p>Atrapadas: {score} &nbsp;|&nbsp; Falladas: {missed} &nbsp;|&nbsp; Total: {total}</p>
        <p>Porcentaje actual: {Math.round((score / Math.max(1, total)) * 100)}%</p>
      </div>
    </div>
  );
}
