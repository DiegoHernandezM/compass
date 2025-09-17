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
  const questions = test?.test_questions || [];

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
      map[q.id] = (q?.is_correct !== null) || (q?.user_answer !== null && q?.user_answer !== '');
    }
    serverAnsweredMapRef.current = map;
  }, [questions]);

  // --- estados principales ---
  const [currentTrack, setCurrentTrack] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [localAnsweredMap, setLocalAnsweredMap] = useState({});
  const [localCorrectMap, setLocalCorrectMap]   = useState({});

  // ⬇️ Nuevo: separación selección vs activación
  const [selectedGameType, setSelectedGameType] = useState(null); // 'vertical' | 'horizontal' | null
  const [activeGameType, setActiveGameType]     = useState(null); // ← este monta el juego

  const [showDialog, setShowDialog] = useState(true);
  const gameKey = (testId) => `mtk:gameType:${testId}`;

  // puntuación del juego (0–100)
  const [gamePercent, setGamePercent] = useState(0);

  // resultado final (para TestResultDialog)
  const [openResult, setOpenResult] = useState(false);
  const [resultStats, setResultStats] = useState({ correct: 0, total: 100 });

  // helpers
  const isServerAnswered = (q) =>
    q?.is_correct !== null || (q?.user_answer !== null && q?.user_answer !== '');

  const isReadOnly = (q) =>
    isServerAnswered(q) || !!localAnsweredMap[q?.id];

  const pairDoneWith = (idx, answeredMap) => {
    const [m, f] = groupedQuestions[idx] || [];
    const done = (q) => !q || isServerAnswered(q) || !!answeredMap[q.id];
    return done(m) && done(f);
  };

  const allPairsDoneWith = (answeredMap) => {
    if (!groupedQuestions.length) return false;
    for (let i = 0; i < groupedQuestions.length; i++) {
      if (!pairDoneWith(i, answeredMap)) return false;
    }
    return true;
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
    return pairDoneWith(i, localAnsweredMap);
  }

  function goToNextUnansweredPair() {
    for (let i = currentTrack + 1; i < groupedQuestions.length; i++) {
      if (!pairIsComplete(i)) { setCurrentTrack(i); return; }
    }
    for (let i = 0; i < groupedQuestions.length; i++) {
      if (!pairIsComplete(i)) { setCurrentTrack(i); return; }
    }
    handleFinish();
  }

  // posición inicial
  useEffect(() => {
    const idx = firstUnansweredTrack(groupedQuestions);
    if (idx !== null) setCurrentTrack(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupedQuestions.length]);

  // Persistencia: solo preselecciona, NO activa
  useEffect(() => {
    if (!test?.id) return;
    const saved = localStorage.getItem(gameKey(test.id));
    if (saved === 'vertical' || saved === 'horizontal') {
      setSelectedGameType(saved);
    } else {
      setSelectedGameType(null);
    }
    setShowDialog(true);        // siempre pide "Comenzar"
    setActiveGameType(null);    // no auto-iniciar
  }, [test?.id]);

  const startGame = () => {
    if (!selectedGameType) return;
    localStorage.setItem(gameKey(test.id), selectedGameType); // opcional: recuerda preferencia
    setActiveGameType(selectedGameType);  // ← aquí sí iniciamos
    setShowDialog(false);
  };

  const resetGameChoice = () => {
    localStorage.removeItem(gameKey(test.id));
    setSelectedGameType(null);
    setActiveGameType(null);
    setShowDialog(true);
  };

  // envío al backend con dedupe + timeout
  const sentAnswersRef = useRef(new Set());
  const sendAnswer = (payload) => {
    const key = `${payload.test_id}:${payload.current_question?.id}`;
    if (sentAnswersRef.current.has(key)) return Promise.resolve();
    sentAnswersRef.current.add(key);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort('timeout'), 4000);

    return axios.post(route('answer.save'), payload, {
      signal: controller.signal,
      headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
    }).catch(err => {
      console.error('❌ Error al enviar respuesta', err);
      sentAnswersRef.current.delete(key);
    }).finally(() => clearTimeout(timer));
  };

  const finishedRef = useRef(false);

  const handleAnswer = (q, selectedValue) => {
    if (!q || isReadOnly(q)) return;

    const isCorrect = String(selectedValue).toUpperCase() === String(q.correct_answer).toUpperCase();

    setAnswers(prev => ({ ...prev, [q.id]: selectedValue }));
    setFeedback(prev => ({ ...prev, [q.id]: isCorrect ? 'correct' : 'incorrect' }));

    setLocalAnsweredMap(prev => {
      const nextAnswered = { ...prev, [q.id]: true };
      setLocalCorrectMap(prevC => ({ ...prevC, [q.id]: isCorrect ? 1 : 0 }));

      const payload = {
        test_id: test?.id,
        subject_id: subject?.id ?? null,
        current_question: q,
        is_correct: isCorrect ? 1 : 0,
        user_answer: String(selectedValue),
      };
      sendAnswer(payload).then(() => { serverAnsweredMapRef.current[q.id] = true; });

      if (pairDoneWith(currentTrack, nextAnswered)) {
        if (allPairsDoneWith(nextAnswered)) {
          if (!finishedRef.current) { finishedRef.current = true; handleFinish(); }
        } else {
          goToNextUnansweredPair();
        }
      }
      return nextAnswered;
    });
  };

  useEffect(() => {
    if (!finishedRef.current && allPairsDoneWith(localAnsweredMap)) {
      finishedRef.current = true;
      handleFinish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localAnsweredMap, groupedQuestions]);

  const completedPairs = useMemo(() => {
    let c = 0;
    for (let i = 0; i < groupedQuestions.length; i++) if (pairIsComplete(i)) c += 1;
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack, localAnsweredMap, questions]);

  const progressPercent = groupedQuestions.length
    ? (completedPairs / groupedQuestions.length) * 100
    : 0;

  function handleFinish() {
    const totalPairs = groupedQuestions.length || 1;

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

  const currentMath   = groupedQuestions[currentTrack]?.[0];
  const currentFigure = groupedQuestions[currentTrack]?.[1];

  const isCorrect = (id) => feedback[id] === 'correct';
  const isIncorrect = (id) => feedback[id] === 'incorrect';

  const btnStyle = (q, value) => {
    const selected = answers[q.id];
    const base = { minWidth: 120, backgroundColor: '#e0e0e0', color: '#000', border: '2px solid transparent' };
    if (isReadOnly(q)) return { ...base, opacity: 0.7, pointerEvents: 'none' };
    if (selected === value) {
      if (isCorrect(q.id))   return { ...base, backgroundColor: '#dcfce7', border: '2px solid #16a34a' };
      if (isIncorrect(q.id)) return { ...base, backgroundColor: '#fee2e2', border: '2px solid #dc2626' };
    }
    return base;
  };

  /* ====== Fila de símbolos (SVG) — igual que tenías ====== */
  const FigureRow = ({ text, color = '#203764', size = 56 }) => {
    const tokens = String(text || '').split(/(\|)/).map(t => t.trim()).filter(Boolean);
    const Bar = () => (<svg width={Math.max(10, size * 0.18)} height={size} viewBox="0 0 12 100"><rect x="4" y="10" width="4" height="80" rx="2" fill={color} /></svg>);
    const Circle = () => (<svg width={size} height={size} viewBox="0 0 100 100"><circle cx="50" cy="50" r="36" fill={color} /></svg>);
    const Square = () => (<svg width={size} height={size} viewBox="0 0 100 100"><rect x="15" y="15" width="70" height="70" rx="6" fill={color} /></svg>);
    const Triangle = () => (<svg width={size} height={size} viewBox="0 0 100 100"><polygon points="50,12 90,88 10,88" fill={color} /></svg>);
    const Diamond = () => (<svg width={size} height={size} viewBox="0 0 100 100"><polygon points="50,10 90,50 50,90 10,50" fill={color} /></svg>);
    const Star = () => (<svg width={size} height={size} viewBox="0 0 100 100"><polygon points="50,8 61,37 92,37 66,55 75,86 50,69 25,86 34,55 8,37 39,37" fill={color} /></svg>);
    const Hexagon = ({ outline = true }) => (<svg width={size} height={size} viewBox="0 0 100 100"><polygon points="50,10 84,30 84,70 50,90 16,70 16,30" fill={outline ? 'none' : color} stroke={outline ? color : 'none'} strokeWidth={outline ? 8 : 0} strokeLinejoin="round" /></svg>);
    const renderToken = (t, i) => {
      switch (t) {
        case '|': return <Bar key={`bar-${i}`} />;
        case '▲': return <Triangle key={`tri-${i}`} />;
        case '■': return <Square key={`sq-${i}`} />;
        case '◆': return <Diamond key={`dm-${i}`} />;
        case '★': return <Star key={`st-${i}`} />;
        case '⬡': return <Hexagon key={`hx-${i}`} outline />;
        case '●':
        case '⬤': return <Circle key={`ci-${i}`} />;
        default:  return <Box key={`tx-${i}`} sx={{ fontSize: `${size * 0.6}px`, color, lineHeight: 1 }}>{t}</Box>;
      }
    };
    return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: 'wrap', my: 1 }}>{tokens.map(renderToken)}</Box>;
  };

  return (
    <>
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ backgroundColor: `${subject?.color ?? '#1976d2'}80`, borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
          <Typography variant="h6">{subject?.name ?? 'Multitasking'}</Typography>
          <LinearProgress variant="determinate" value={progressPercent} />
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="center" alignItems="stretch" gap={2} flexWrap="wrap" px={2} minHeight="60vh">
        {/* Juego */}
        <Paper sx={{ p: 3, width: 500, borderRadius: 3, backgroundColor: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 420 }}>
          {activeGameType === 'vertical'   && <CatchGame     onFinish={pct => setGamePercent(pct ?? 0)} />}
          {activeGameType === 'horizontal' && <PlanePathGame onFinish={pct => setGamePercent(pct ?? 0)} />}
          {!activeGameType && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Selecciona un juego y presiona <strong>Comenzar</strong>.
            </Typography>
          )}
          {/* <Button size="small" sx={{ mt: 2 }} onClick={resetGameChoice}>Cambiar juego</Button> */}
        </Paper>

        {/* Bloque de preguntas */}
        <Paper sx={{ p: 3, width: 500, borderRadius: 3, backgroundColor: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Matemáticas */}
          {currentMath && (
            <>
              <Typography variant="h3" mb={2} textAlign="center" sx={{ mt: 2 }}>
                {currentMath.question_text}
              </Typography>
              <Stack direction="row" spacing={2} mb={5} flexWrap="wrap" justifyContent="center">
                {Object.entries(JSON.parse(currentMath.options || '{}'))
                  .filter(([_, v]) => v != null && v !== '')
                  .slice(0, 2)
                  .map(([key, value]) => (
                    <Button key={key} variant="contained" sx={btnStyle(currentMath, value)} onClick={() => handleAnswer(currentMath, value)}>
                      {value}
                    </Button>
                  ))}
              </Stack>
            </>
          )}

          {/* Figuras */}
          {currentFigure && (
            <>
              <FigureRow text={currentFigure.question_text} color="#203764" />
              <Stack direction="row" spacing={2} mb={2} flexWrap="wrap" justifyContent="center">
                {Object.entries(JSON.parse(currentFigure.options || '{}'))
                  .filter(([_, v]) => v != null && v !== '')
                  .map(([key, value]) => (
                    <Button key={key} variant="contained" sx={btnStyle(currentFigure, value)} onClick={() => handleAnswer(currentFigure, value)}>
                      {value}
                    </Button>
                  ))}
              </Stack>
            </>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Bloque {currentTrack + 1} de {groupedQuestions.length}
          </Typography>
        </Paper>
      </Box>

      {/* Selector de juego */}
      <Dialog open={showDialog}>
        <DialogTitle>¿Qué tipo de juego prefieres?</DialogTitle>
        <DialogContent>
          <RadioGroup value={selectedGameType} onChange={(e) => setSelectedGameType(e.target.value)}>
            <FormControlLabel value="vertical" control={<Radio />} label="Vertical (Balde)" />
            <FormControlLabel value="horizontal" control={<Radio />} label="Horizontal (Avión)" />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={startGame} disabled={!selectedGameType} variant="contained">
            Comenzar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resultado */}
      <TestResultDialog
        open={openResult}
        onClose={() => setOpenResult(false)}
        correct={resultStats.correct}
        total={resultStats.total}
        onGoToSubjects={() => Inertia.get(route('student.subject.index'))}
        showReview={false}
      />
    </>
  );
}
