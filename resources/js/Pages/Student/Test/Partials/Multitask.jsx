import { useEffect, useMemo, useRef, useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';

import CatchGame from '@/Pages/Student/Games/CatchGame';
import PlanePathGame from '@/Pages/Student/Games/PlanePathGame';
import TestResultDialog from '@/Components/Dialog/TestResultDialog';

export default function MultitaskTest({ test, subject }) {
  const questions = test.test_questions || [];

  // --- separar por tipo y agrupar en pares [math, figure] ---
  const mathQuestions   = useMemo(() => questions.filter(q => q.type === 'math'),   [questions]);
  const figureQuestions = useMemo(() => questions.filter(q => q.type === 'figure'), [questions]);

  const groupedQuestions = useMemo(() => {
    const pairs = [];
    const n = Math.min(mathQuestions.length, figureQuestions.length);
    for (let i = 0; i < n; i++) pairs.push([mathQuestions[i], figureQuestions[i]]);
    return pairs;
  }, [mathQuestions, figureQuestions]);

  // --- mapas auxiliares con estado del servidor al montar ---
  const serverAnsweredMapRef = useRef({});
  useEffect(() => {
    const map = {};
    for (const q of questions) {
      map[q.id] = (q?.is_correct !== null) || !!q?.user_answer;
    }
    serverAnsweredMapRef.current = map;
  }, [questions]);

  // --- estados principales ---
  const [currentTrack, setCurrentTrack] = useState(0);
  const [answers, setAnswers] = useState({});               // id -> valor elegido (solo UI)
  const [feedback, setFeedback] = useState({});             // id -> 'correct'|'incorrect'
  const [localAnsweredMap, setLocalAnsweredMap] = useState({}); // id -> true (optimista)
  const [localCorrectMap, setLocalCorrectMap]   = useState({}); // id -> 0/1 (optimista Correct/Incorrect)
  const [gameType, setGameType] = useState(null);           // 'vertical' | 'horizontal'
  const [showDialog, setShowDialog] = useState(true);
  const gameKey = (testId) => `mtk:gameType:${testId}`;


  // puntuación del juego (0–100) reportada por el juego cuando termina
  const [gamePercent, setGamePercent] = useState(0);

  // resultado final (para TestResultDialog)
  const [openResult, setOpenResult] = useState(false);
  const [resultStats, setResultStats] = useState({ correct: 0, total: 100 });

  // --- helpers por pregunta ----
  const isServerAnswered = (q) =>
    q?.is_correct !== null || (q?.user_answer !== null && q?.user_answer !== '');

  const isReadOnly = (q) =>
    isServerAnswered(q) || !!localAnsweredMap[q?.id];

  // --- posición inicial: primer par con pendiente ---
  useEffect(() => {
    const idx = firstUnansweredTrack(groupedQuestions);
    if (idx !== null) setCurrentTrack(idx);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedQuestions.length]);

  useEffect(() => {
    if (!test?.id) return;
    const saved = localStorage.getItem(gameKey(test.id));
    if (saved === 'vertical' || saved === 'horizontal') {
      setGameType(saved);
      setShowDialog(false);
    } else {
      setGameType(null);
      setShowDialog(true);
    }
  }, [test?.id]);

  const startGame = () => {
    if (!gameType) return;
    localStorage.setItem(gameKey(test.id), gameType);
    setShowDialog(false);
  };
  
  const resetGameChoice = () => {
    localStorage.removeItem(gameKey(test.id));
    setGameType(null);
    setShowDialog(true);
  };

  function firstUnansweredTrack(pairs) {
    for (let i = 0; i < pairs.length; i++) {
      const [m, f] = pairs[i];
      const mAns = serverAnsweredMapRef.current[m.id] || localAnsweredMap[m.id];
      const fAns = serverAnsweredMapRef.current[f.id] || localAnsweredMap[f.id];
      if (!mAns || !fAns) return i;
    }
    return pairs.length ? 0 : null;
  }

  function pairIsComplete(i) {
    const [m, f] = groupedQuestions[i] || [];
    if (!m || !f) return true;
    const mAns = isServerAnswered(m) || !!localAnsweredMap[m.id];
    const fAns = isServerAnswered(f) || !!localAnsweredMap[f.id];
    return mAns && fAns;
  }

  function goToNextUnansweredPair() {
    // 1) buscar hacia adelante
    for (let i = currentTrack + 1; i < groupedQuestions.length; i++) {
      if (!pairIsComplete(i)) {
        setCurrentTrack(i);
        return;
      }
    }
    // 2) desde el inicio, por si el usuario contestó pares fuera de orden
    for (let i = 0; i < groupedQuestions.length; i++) {
      if (!pairIsComplete(i)) {
        setCurrentTrack(i);
        return;
      }
    }
    // 3) todas completas → finalizar
    handleFinish();
  }

  // --- envío al backend con dedupe + timeout ---
  const sentAnswersRef = useRef(new Set());
  const sendAnswer = (payload) => {
    const key = `${payload.test_id}:${payload.current_question?.id}`;
    if (sentAnswersRef.current.has(key)) return Promise.resolve();
    sentAnswersRef.current.add(key);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort('timeout'), 4000);

    return axios.post(route('answer.save'), payload, {
      signal: controller.signal,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
      },
    }).catch(err => {
      console.error('❌ Error al enviar respuesta', err);
      // permitir reintento si falló
      sentAnswersRef.current.delete(key);
    }).finally(() => clearTimeout(timer));
  };

  // --- manejo de respuesta por botón ---
  const handleAnswer = (q, selectedValue) => {
    if (!q) return;
    if (isReadOnly(q)) return;

    const isCorrect = String(selectedValue).toUpperCase() === String(q.correct_answer).toUpperCase();

    // feedback UI
    setAnswers(prev => ({ ...prev, [q.id]: selectedValue }));
    setFeedback(prev => ({ ...prev, [q.id]: isCorrect ? 'correct' : 'incorrect' }));
    setLocalAnsweredMap(prev => ({ ...prev, [q.id]: true }));
    setLocalCorrectMap(prev => ({ ...prev, [q.id]: isCorrect ? 1 : 0 }));

    // enviar al backend
    const payload = {
      test_id: test?.id,
      subject_id: subject?.id ?? null,
      current_question: q,
      is_correct: isCorrect ? 1 : 0,
      user_answer: String(selectedValue),
    };
    sendAnswer(payload).then(() => {
      // marcar en cache de "servidor" como respondida (para lógicas que dependen del mapRef)
      serverAnsweredMapRef.current[q.id] = true;
    });

    // si ambas del par ya están respondidas -> avanzar
    setTimeout(() => {
      const [m, f] = groupedQuestions[currentTrack] || [];
      const mDone = m ? (isServerAnswered(m) || !!localAnsweredMap[m.id] || (q.id === m.id)) : true;
      const fDone = f ? (isServerAnswered(f) || !!localAnsweredMap[f.id] || (q.id === f.id)) : true;
      if (mDone && fDone) goToNextUnansweredPair();
    }, 150); // pequeñísimo delay para que el estado se asiente
  };

  // --- progreso basado en pares completos ---
  const completedPairs = useMemo(() => {
    let c = 0;
    for (let i = 0; i < groupedQuestions.length; i++) {
      if (pairIsComplete(i)) c += 1;
    }
    return c;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack, localAnsweredMap, questions]);

  const progressPercent = groupedQuestions.length
    ? (completedPairs / groupedQuestions.length) * 100
    : 0;

  // --- cálculo final ponderado 40/30/30 ---
  function handleFinish() {
    const totalPairs = groupedQuestions.length || 1;

    // correctas por tipo usando server o local
    const correctMath = mathQuestions.reduce((acc, q) => {
      const v = (q.is_correct === 1) ? 1 : (localCorrectMap[q.id] === 1 ? 1 : 0);
      return acc + v;
    }, 0);

    const correctFigure = figureQuestions.reduce((acc, q) => {
      const v = (q.is_correct === 1) ? 1 : (localCorrectMap[q.id] === 1 ? 1 : 0);
      return acc + v;
    }, 0);

    const mathPct   = Math.round((correctMath   / totalPairs) * 100);
    const figurePct = Math.round((correctFigure / totalPairs) * 100);

    const finalPct = Math.round(0.4 * (gamePercent || 0) + 0.3 * mathPct + 0.3 * figurePct);

    setResultStats({ correct: finalPct, total: 100 });
    setOpenResult(true);
  }

  // --- preguntas actuales ---
  const currentMath   = groupedQuestions[currentTrack]?.[0];
  const currentFigure = groupedQuestions[currentTrack]?.[1];

  const isCorrect = (id) => feedback[id] === 'correct';
  const isIncorrect = (id) => feedback[id] === 'incorrect';

  // --- estilos de botón con feedback ---
  const btnStyle = (q, value) => {
    const selected = answers[q.id];
    const base = {
      minWidth: 120,
      backgroundColor: '#e0e0e0',
      color: '#000',
    };
    if (isReadOnly(q)) {
      return { ...base, opacity: 0.7, pointerEvents: 'none' };
    }
    if (selected === value) {
      if (isCorrect(q.id))   return { ...base, backgroundColor: '#dcfce7' };
      if (isIncorrect(q.id)) return { ...base, backgroundColor: '#fee2e2' };
    }
    return base;
  };

  return (
    <>
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <CardContent
          sx={{
            backgroundColor: `${subject?.color ?? '#1976d2'}80`,
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          }}
        >
          <Typography variant="h6">{subject?.name ?? 'Multitasking'}</Typography>
          <LinearProgress variant="determinate" value={progressPercent} />
        </CardContent>
      </Card>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="stretch"
        gap={2}
        flexWrap="wrap"
        px={2}
        minHeight="60vh"
      >
        {/* Juego */}
        <Paper
          sx={{
            p: 3,
            width: 500,
            borderRadius: 3,
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: 420,
          }}
        >
          {gameType === 'vertical'   && <CatchGame     onFinish={pct => setGamePercent(pct ?? 0)} />}
          {gameType === 'horizontal' && <PlanePathGame onFinish={pct => setGamePercent(pct ?? 0)} />}
          {!gameType && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Selecciona un juego para comenzar.
            </Typography>
          )}
        </Paper>

        {/* Bloque de preguntas */}
        <Paper
          sx={{
            p: 3,
            width: 500,
            borderRadius: 3,
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Matemáticas */}
          {currentMath && (
            <>
              <Typography variant="h3" mb={2} textAlign="center" sx={{ marginTop:10 }}>
                {currentMath.question_text}
              </Typography>
              <Stack direction="row" spacing={2} mb={5} flexWrap="wrap" justifyContent="center" sx={{ marginBottom:10 }}>
                {Object.entries(JSON.parse(currentMath.options || '{}'))
                  .filter(([_, v]) => v != null && v !== '')
                  .slice(0, 2) // solo 2 botones
                  .map(([key, value]) => (
                    <Button
                      key={key}
                      variant="contained"
                      sx={btnStyle(currentMath, value)}
                      onClick={() => handleAnswer(currentMath, value)}
                    >
                      {value}
                    </Button>
                  ))}
              </Stack>
            </>
          )}

          {/* Figuras */}
          {currentFigure && (
            <>
              <Typography variant="h2" mb={2} textAlign="center" sx={{ color: '#203764' }}>
                {currentFigure.question_text}
              </Typography>
              <Stack direction="row" spacing={2} mb={2} flexWrap="wrap" justifyContent="center">
                {Object.entries(JSON.parse(currentFigure.options || '{}'))
                  .filter(([_, v]) => v != null && v !== '')
                  .map(([key, value]) => (
                    <Button
                      key={key}
                      variant="contained"
                      sx={btnStyle(currentFigure, value)}
                      onClick={() => handleAnswer(currentFigure, value)}
                    >
                      {value}
                    </Button>
                  ))}
              </Stack>
            </>
          )}

          {/* Indicador del par actual */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Bloque {currentTrack + 1} de {groupedQuestions.length}
          </Typography>
        </Paper>
      </Box>

      {/* Selector de juego */}
      <Dialog open={showDialog}>
        <DialogTitle>¿Qué tipo de juego prefieres?</DialogTitle>
        <DialogContent>
          <RadioGroup value={gameType} onChange={(e) => setGameType(e.target.value)}>
            <FormControlLabel value="vertical" control={<Radio />} label="Vertical (Balde)" />
            <FormControlLabel value="horizontal" control={<Radio />} label="Horizontal (Avión)" />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={startGame} disabled={!gameType} variant="contained">
            Comenzar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resultado final ponderado */}
      <TestResultDialog
        open={openResult}
        onClose={() => setOpenResult(false)}
        correct={resultStats.correct}   // porcentaje final ponderado
        total={resultStats.total}       // 100
        onGoToSubjects={() => Inertia.get(route('student.subject.index'))}
        showReview={false}
      />
    </>
  );
}
