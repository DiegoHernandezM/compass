import { useEffect, useRef, useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Fade,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';

import TestResultDialog from '@/Components/Dialog/TestResultDialog';

export default function Params({ test, subject }) {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMemoryPanel, setShowMemoryPanel] = useState(true);
  const [parameters, setParameters] = useState({});
  const [hiddenParams, setHiddenParams] = useState([]);
  const [userInputs, setUserInputs] = useState({});

  // 'correct' | 'incorrect' | null
  const [feedback, setFeedback] = useState(null);
  // [{ key, expected, got, correct }]
  const [feedbackDiffs, setFeedbackDiffs] = useState([]);

  const [timeLeft, setTimeLeft] = useState(0);
  const [maxTime, setMaxTime] = useState(0);

  const sentAnswersRef = useRef(new Set());

  const questions = test.test_questions || [];
  const currentQuestion = questions[currentIndex];
  const isServerAnswered = (q) => q?.is_correct !== null;

  const [openResult, setOpenResult] = useState(false);
  const [resultStats, setResultStats] = useState({
    correct: 0,
    total: questions.length
  });
  const [localCorrectMap, setLocalCorrectMap] = useState({});

  // Sembrar mapa local con lo que ya trae el back
  useEffect(() => {
    const seed = {};
    for (const q of questions) {
      if (q.is_correct === 0 || q.is_correct === 1) seed[q.id] = q.is_correct;
    }
    setLocalCorrectMap(seed);
  }, [test?.id]);

  // Ir a la primera sin contestar
  useEffect(() => {
    if (!questions.length) return;
    const idx = questions.findIndex(q => !isServerAnswered(q));
    setCurrentIndex(idx === -1 ? 0 : idx);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test?.id]);

  useEffect(() => {
    setResultStats(computeResultsFrom(localCorrectMap));
  }, [currentIndex, localCorrectMap]);

  // Preparar la pregunta actual
  useEffect(() => {
    if (!currentQuestion) return;

    // Reset
    setShowMemoryPanel(true);
    setUserInputs({});
    setFeedback(null);
    setFeedbackDiffs([]);

    // Parse de parámetros (KEY: value por línea)
    const parsed = {};
    currentQuestion.question_text.split('\n').forEach(line => {
      const [rawKey, ...rest] = line.split(':');
      if (!rawKey || !rest.length) return;
      const key = rawKey.trim().toUpperCase();
      const value = rest.join(':').trim();
      parsed[key] = value;
    });
    setParameters(parsed);

    // Elegir cuántos ocultar según nivel
    const level = test.question_level_id;
    const totalKeys = Object.keys(parsed);
    const countToHide = level === 14 ? 1 : level === 15 ? 2 : 4;
    const shuffled = [...totalKeys].sort(() => 0.5 - Math.random());
    setHiddenParams(shuffled.slice(0, Math.min(countToHide, totalKeys.length)));

    // Tiempo límite (para mostrar el panel de memoria)
    const limit = currentQuestion.limit_time || 5;
    setTimeLeft(limit);
    setMaxTime(limit);

    const timeout = setTimeout(() => setShowMemoryPanel(false), limit * 1000);
    return () => clearTimeout(timeout);
  }, [currentQuestion, test?.question_level_id]);

  // Decremento del reloj mientras el panel está visible
  useEffect(() => {
    if (!showMemoryPanel || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [showMemoryPanel, timeLeft]);

  const handleChange = (key, value) => {
    setUserInputs(prev => ({ ...prev, [key.toUpperCase()]: value }));
  };

  // POST al backend
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
      sentAnswersRef.current.delete(key);
    }).finally(() => clearTimeout(timer));
  };

  const normalizeValue = (val) => {
    if (val === null || val === undefined) return '';
    const num = Number(val);
    if (!Number.isNaN(num) && val !== '') {
      return Math.floor(num); // quita decimales si vinieron
    }
    return String(val).toLowerCase().trim();
  };

  // Enviar respuesta y mostrar feedback (TODOS los campos)
  const handleSubmit = async () => {
    if (!currentQuestion) return;

    // Construye el diff de todos los ocultos
    const diffs = hiddenParams.map(key => {
      const expected = parameters[key];
      const gotRaw   = userInputs[key] ?? '';
      const ok = normalizeValue(expected) === normalizeValue(gotRaw);
      return {
        key,
        expected,          // como lo verá el alumno
        got: String(gotRaw),
        correct: ok
      };
    });

    const incorrect = diffs.filter(d => !d.correct);
    const isCorrect = incorrect.length === 0;

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setFeedbackDiffs(diffs);

    // actualizar mapa local (optimista)
    setLocalCorrectMap(prev => {
      const next = { ...prev, [currentQuestion.id]: isCorrect ? 1 : 0 };
      setResultStats(computeResultsFrom(next));
      return next;
    });

    // user_answer: solo los ocultos que el alumno llenó (como JSON)
    const answerPayload = {};
    hiddenParams.forEach(k => { answerPayload[k] = userInputs[k] ?? ''; });

    await sendAnswer({
      test_id: test.id,
      subject_id: subject?.id ?? null,
      current_question: currentQuestion,
      is_correct: isCorrect ? 1 : 0,
      user_answer: JSON.stringify(answerPayload),
    });
  };

  // Buscar la siguiente no contestada
  const getAnswerValue = (q) => {
    const v = (localCorrectMap[q.id] !== undefined && localCorrectMap[q.id] !== null)
      ? localCorrectMap[q.id]
      : q.is_correct;
    return v;
  };

  const findNextUnansweredIndex = (fromIdx) => {
    for (let i = fromIdx + 1; i < questions.length; i++) {
      if (getAnswerValue(questions[i]) === null || getAnswerValue(questions[i]) === undefined) {
        return i;
      }
    }
    for (let i = 0; i <= fromIdx; i++) {
      if (getAnswerValue(questions[i]) === null || getAnswerValue(questions[i]) === undefined) {
        return i;
      }
    }
    return -1;
  };

  const goToNext = () => {
    const nextIdx = findNextUnansweredIndex(currentIndex);
    if (nextIdx === -1) {
      setResultStats(computeResultsFrom(localCorrectMap));
      setOpenResult(true);
      return;
    }
    setCurrentIndex(nextIdx);
  };

  const readOnly = currentQuestion ? isServerAnswered(currentQuestion) : false;

  const computeResultsFrom = (map) => {
    const total = questions.length;
    let correct = 0;
    for (const q of questions) {
      const v = (map[q.id] !== undefined && map[q.id] !== null) ? map[q.id] : q.is_correct;
      if (v === 1) correct += 1;
    }
    return { correct, total };
  };

  return (
    <>
      <Card
        sx={{
          mb: isLargeScreen ? 2 : 1,
          mt: isLargeScreen ? 2 : 1,
          mx: isLargeScreen ? 'auto' : 1,
          width: isLargeScreen ? '60%' : '100%',
          borderRadius: 3,
          boxShadow: 3,
          backgroundColor: 'rgba(255,255,255,0.95)',
          border: '1px solid #e0e0e0',
        }}
      >
        <CardContent
          sx={{
            backgroundColor: `${subject?.name ? subject.color : '#1976d2'}80`,
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          }}
        >
          <Typography variant="h6" gutterBottom>
            {subject?.name}
          </Typography>
        </CardContent>
      </Card>

      <Box
        sx={{
          mt: isSmallScreen ? 4 : 4,
          mb: 2,
          px: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 220px)',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 500, borderRadius: 3, boxShadow: 4 }}>
          <CardContent>
            <LinearProgress
              variant="determinate"
              value={maxTime ? (timeLeft / maxTime) * 100 : 0}
              sx={{ mb: 2, height: 10, borderRadius: 5 }}
            />

            <Typography variant="subtitle1" gutterBottom sx={{ marginBottom: '25px' }}>
              Pregunta {currentIndex + 1} de {questions.length}
            </Typography>

            <Box
              sx={{
                border: '2px solid #333',
                borderRadius: 2,
                p: 3,
                backgroundColor: '#000',
                color: '#0f0',
                fontFamily: 'monospace',
                mt: 2
              }}
            >
              {Object.entries(parameters).map(([key, value]) => {
                const isHidden = hiddenParams.includes(key.toUpperCase());
                const showValue = showMemoryPanel || !isHidden || readOnly;

                return (
                  <Box
                    key={key}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography>{key}</Typography>

                    {showValue ? (
                      <Typography>{value}</Typography>
                    ) : (
                      <input
                        type="number"
                        value={userInputs[key] || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        disabled={readOnly}
                        style={{
                          width: 140,
                          padding: 6,
                          borderRadius: 6,
                          backgroundColor: readOnly ? '#f1f1f1' : '#fff',
                          color: '#000',
                          fontSize: '1rem',
                          border: '1px solid #ccc'
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>

            {!showMemoryPanel && !readOnly && (
              <Box mt={4} textAlign="center">
                {feedback ? (
                  <Fade in={true}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
                        color: feedback === 'correct' ? '#15803d' : '#b91c1c',
                        display: 'inline-block',
                        textAlign: 'left'
                      }}
                    >
                      {feedback === 'correct' ? (
                        <Typography variant="h6">¡Muy bien! Respuesta correcta.</Typography>
                      ) : (
                        <>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            Incorrecto. Valores correctos:
                          </Typography>
                          <Box component="ul" sx={{ pl: '1.2rem', m: 0 }}>
                            {feedbackDiffs
                              .filter(d => !d.correct)
                              .map(d => (
                                <li key={d.key}>
                                  <strong>{d.key}</strong>: {String(d.expected)}
                                  {d.got !== '' ? <> (tu: {String(d.got)})</> : ' (vacío)'}
                                </li>
                              ))}
                          </Box>
                        </>
                      )}
                    </Box>
                  </Fade>
                ) : (
                  <Button variant="contained" onClick={handleSubmit}>
                    Enviar respuesta
                  </Button>
                )}
              </Box>
            )}

            {(feedback || readOnly) && (
              <Box mt={3} textAlign="center">
                <Button variant="contained" onClick={goToNext}>
                  Siguiente
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

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
