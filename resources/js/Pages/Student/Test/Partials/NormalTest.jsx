import { useEffect, useRef, useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Fade
} from '@mui/material';
import { useMediaQuery, useTheme } from '@mui/material';
import FeedbackDialog from '@/Components/Test/FeedbackDialog';
import TestResultDialog from '@/Components/Dialog/TestResultDialog';

export default function NormalTest({ test, subject, type }) {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const currentQuestion = test?.test_questions?.[currentIndex];
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'incorrect' | 'timeout'
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // NUEVO: máquina de estados y tiempos mínimos
  const [phase, setPhase] = useState('ANSWERING'); // 'ANSWERING' | 'FEEDBACK'
  const [feedbackUntil, setFeedbackUntil] = useState(null); // timestamp ms
  const MIN_FB_CORRECT = 1500;
  const MIN_FB_WRONG   = 2500;

  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [holdForDialog, setHoldForDialog] = useState(false);

  const [timeLeft, setTimeLeft] = useState(null);
  const [maxTime, setMaxTime] = useState(null);

  const sentAnswersRef = useRef(new Set());
  const locallyAnsweredRef = useRef(new Set());

  const [openResult, setOpenResult] = useState(false);
  const [resultStats, setResultStats] = useState({ correct: 0, total: 0 });

  const correctKey = String(currentQuestion?.correct_answer || '').toUpperCase();

  const [finishAfterFeedback, setFinishAfterFeedback] = useState(false);


  // Helpers
  const isServerAnswered = (q) => q?.is_correct !== null || Boolean(q?.user_answer);

  const hydrateAnswersFromProps = (questions) => {
    const acc = {};
    questions.forEach(q => {
      if (q.user_answer) acc[q.id] = String(q.user_answer).toLowerCase();
    });
    return acc;
  };

  const firstUnansweredIndex = (questions) => {
    const idx = questions.findIndex(q => !isServerAnswered(q));
    return idx === -1 ? 0 : idx;
  };

  const nextUnansweredIndex = (questions, fromIndex) => {
    for (let i = fromIndex + 1; i < questions.length; i++) {
      if (!isServerAnswered(questions[i])) return i;
    }
    return null;
  };

  const readOnly = currentQuestion
    ? isServerAnswered(currentQuestion) || locallyAnsweredRef.current.has(currentQuestion.id)
    : false;

  const timerPaused = phase === 'FEEDBACK';

  // Init: hidrata y posiciona
  useEffect(() => {
    if (!test?.test_questions?.length) return;
    setAnswers(hydrateAnswersFromProps(test.test_questions));
    setCurrentIndex(firstUnansweredIndex(test.test_questions));
    setPhase('ANSWERING');
    setFeedback(null);
    setShowFeedback(false);
    setFeedbackUntil(null);
  }, [test?.id]);

  // Preload de GIFs de feedback (evita saltos)
  useEffect(() => {
    ['/assets/correct.gif','/assets/incorrect.gif'].forEach(src => {
      const i = new Image(); i.src = src;
    });
  }, []);

  // Temporizador de la pregunta (pausado en feedback)
  useEffect(() => {
    if (!currentQuestion) return;

    if (isServerAnswered(currentQuestion)) {
      setTimeLeft(null);
      setMaxTime(null);
      return;
    }

    const limit = currentQuestion?.limit_time ?? null;
    setTimeLeft(limit);
    setMaxTime(limit);

    if (!limit) return;
    if (timerPaused) return; // pausa durante FEEDBACK

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return prev;
        if (prev <= 1) {
          clearInterval(interval);
          // tiempo agotado => marcar incorrecto y enviar como timeout
          handleAnswer(null, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestion, timerPaused]);

  // Avance controlado: solo cuando pasa el mínimo y no hay diálogo
  useEffect(() => {
    if (phase !== 'FEEDBACK' || !feedbackUntil) return;
    if (openFeedbackDialog) return;

    const ms = Math.max(0, feedbackUntil - Date.now());
    const t = setTimeout(() => {
      setShowFeedback(false);
      setPhase('ANSWERING');
      setFeedback(null);

      // Si se pidió finalizar tras el feedback (última pregunta)
      if (finishAfterFeedback) {
        setFinishAfterFeedback(false);
        const stats = computeResults();
        setResultStats(stats);
        setOpenResult(true);
        return; // no intentes navegar
      }

      // Navegación normal
      const nextIdx = nextUnansweredIndex(test.test_questions, currentIndex);
      if (nextIdx !== null) setCurrentIndex(nextIdx);
      else if (currentIndex < test.test_questions.length - 1) setCurrentIndex(currentIndex + 1);
    }, ms);

    return () => clearTimeout(t);
  }, [phase, feedbackUntil, openFeedbackDialog, currentIndex, finishAfterFeedback, test?.test_questions]);

  // Handlers
  const handleAnswerChange = (e) => {
    if (readOnly || phase === 'FEEDBACK') return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: e.target.value.toLowerCase(),
    }));
  };

  const handleAnswer = (selectedOption = '', byTimeout = false) => {
    if (readOnly) return;

    const keyLower = (selectedOption || '').toLowerCase();
    const keyUpper = keyLower.toUpperCase();
    const isCorrect = !byTimeout && keyUpper === currentQuestion.correct_answer;

    // Bloquear edición inmediata
    locallyAnsweredRef.current.add(currentQuestion.id);

    // Guardar valor local (sentinel en timeout)
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: byTimeout ? '__timeout__' : keyLower,
    }));

    // Mostrar feedback SIEMPRE: correcta, incorrecta o timeout
    setFeedback(byTimeout ? 'timeout' : (isCorrect ? 'correct' : 'incorrect'));
    if (!isCorrect) setCorrectAnswer(currentQuestion.correct_answer);

    // Abrir dialog de feedback (si aplica) solo en incorrecta (no timeout)
    if (!isCorrect && !byTimeout && (currentQuestion.feedback_text || currentQuestion.feedback_image)) {
      setOpenFeedbackDialog(true);
      setHoldForDialog(true);
    }

    setShowFeedback(true);
    setPhase('FEEDBACK');
    const minMs = isCorrect ? MIN_FB_CORRECT : MIN_FB_WRONG;
    setFeedbackUntil(Date.now() + minMs);

    // Enviar al backend (no avanza aquí)
    sendAnswer({
      test_id: test?.id,
      subject_id: subject?.id ?? null,
      current_question: currentQuestion,
      is_correct: byTimeout ? 0 : (isCorrect ? 1 : 0),
      user_answer: byTimeout ? null : keyUpper,
    });
  };

  const sendAnswer = async (payload) => {
    const key = `${payload.test_id}:${payload.current_question?.question_id}`;
    if (sentAnswersRef.current.has(key)) return;
    sentAnswersRef.current.add(key);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort('timeout'), 4000);

    try {
      await axios.post(route('answer.save'), payload, {
        signal: controller.signal,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
      });
    } catch (err) {
      if (err.message === 'timeout' || err.code === 'ERR_CANCELED') {
        console.warn('⏳ La petición se canceló por timeout (4s).');
      } else {
        console.error('❌ Error al enviar respuesta', err);
      }
      // permitir reintento si falló
      sentAnswersRef.current.delete(key);
    } finally {
      clearTimeout(timer);
    }
  };

  const handleNext = () => {
    if (phase === 'FEEDBACK') return;
    if (readOnly) {
      const nextIdx = nextUnansweredIndex(test.test_questions, currentIndex);
      if (nextIdx !== null) setCurrentIndex(nextIdx);
      else if (currentIndex < test.test_questions.length - 1) setCurrentIndex(currentIndex + 1);
      return;
    }
    const selectedOption = answers[currentQuestion.id];
    if (selectedOption && selectedOption !== '__timeout__') {
      handleAnswer(selectedOption);
    }
  };

  const handlePrevious = () => {
    if (phase === 'FEEDBACK') return;
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleFinish = () => {
    if (phase === 'FEEDBACK') return;

    const isLast = currentIndex === test.test_questions.length - 1;
    const selectedOption = answers[currentQuestion.id];

    // Si estamos en el último y aún no es readOnly y hay selección,
    // dispara la respuesta y marca que al terminar el feedback se muestre el resultado.
    if (isLast && !readOnly && selectedOption && selectedOption !== '__timeout__') {
      setFinishAfterFeedback(true);
      handleAnswer(selectedOption);
      return; // gating se encarga de abrir el diálogo
    }

    // Caso ya respondida o sin selección: muestra resultados directo
    const stats = computeResults();
    setResultStats(stats);
    setOpenResult(true);
  };


  const answeredCount = (test?.test_questions || []).filter(q => isServerAnswered(q)).length;
  const progressPercent = (test?.test_questions?.length
    ? (answeredCount / test.test_questions.length) * 100
    : 0
  );

  const handleCloseFeedbackDialog = () => {
    setOpenFeedbackDialog(false);
    setHoldForDialog(false);
    // Si ya pasó el mínimo, el efecto de gating hará avanzar
  };

  const isImage = (v) => {
    if (typeof v !== 'string') return false;
    const s = v.trim();
    if (/^data:image\//i.test(s)) return true;
    if (/^https?:\/\/.+\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i.test(s)) return true;
    if (/^[\w.\-\/]+?\.(png|jpe?g|gif|svg|webp)$/i.test(s)) return true;
    return false;
  };

  const selectedValue =
    (answers[currentQuestion?.id] === '__timeout__'
      ? ''
      : (answers[currentQuestion?.id] || currentQuestion?.user_answer || '')
    ).toString().toLowerCase();

  const computeResults = () => {
    const total = test?.test_questions?.length || 0;
    const correct = (test?.test_questions || []).reduce((acc, q) => {
      const local = answers[q.id];
      const choice = (local && local !== '__timeout__')
        ? local.toUpperCase()
        : (q.user_answer || null);
      if (!choice) return acc;
      return acc + (choice === q.correct_answer ? 1 : 0);
    }, 0);
    return { correct, total };
  };

  const goToSubjects = () => {
    Inertia.get(route('student.subject.index'));
  };

  if (!currentQuestion) return null;

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
            backgroundColor: `${subject.color}80`,
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          }}
        >
          <Typography variant="h6" gutterBottom>{subject.name}</Typography>
          <LinearProgress variant="determinate" value={progressPercent} />
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
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: isLargeScreen ? 600 : '95%',
            p: 3,
            borderRadius: 3,
            boxShadow: 3,
            backgroundColor: 'rgba(255,255,255,0.95)',
            border: '1px solid #e0e0e0',
          }}
        >
          {maxTime && (
            <LinearProgress
              variant="determinate"
              value={(timeLeft / maxTime) * 100}
              sx={{ mt: 2, height: 10, borderRadius: 5 }}
            />
          )}

          <Typography variant="subtitle1" gutterBottom sx={{ marginBottom: '25px' }}>
            Pregunta {currentIndex + 1} de {test.test_questions.length}
          </Typography>

          {currentQuestion?.type === 'image' ? (
            <Box
              component="img"
              src={`${currentQuestion.question_text}`}
              alt="Pregunta"
              sx={{ width: '100%', maxWidth: 350, maxHeight: 350, height: 'auto', display: 'block', mx: 'auto', mb: 4 }}
            />
          ) : (
            <Typography variant="h6" sx={{ mb: '20px' }} gutterBottom>
              {currentQuestion.question_text}
            </Typography>
          )}

          <RadioGroup
            value={selectedValue}
            onChange={readOnly || phase === 'FEEDBACK' ? undefined : handleAnswerChange}
          >
            {Object.entries(JSON.parse(currentQuestion.options))
              .filter(([_, value]) => value != null && value !== '')
              .map(([key, value]) => {
                const valStr = String(value).trim();
                return (
                  <FormControlLabel
                    key={key}
                    value={key}
                    control={<Radio disabled={readOnly || phase === 'FEEDBACK'} />}
                    disabled={readOnly || phase === 'FEEDBACK'}
                    sx={{ mb: 2, mt: '15px', ...(readOnly ? { opacity: 0.8 } : {}) }}
                    label={
                      isImage(valStr) ? (
                        <Box
                          component="img"
                          src={valStr}
                          alt={`Opción ${key.toUpperCase()}`}
                          sx={{ width: 70, height: 70, objectFit: 'contain', border: '1px solid #ccc', p: 1 }}
                        />
                      ) : (
                        `${key.toUpperCase()}: ${valStr}`
                      )
                    }
                  />
                );
              })}
          </RadioGroup>

          <Stack direction="row" justifyContent="space-between" mt={3}>
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={currentIndex === 0 || phase === 'FEEDBACK'}
            >
              Anterior
            </Button>
            {currentIndex < test.test_questions.length - 1 ? (
              <Button variant="contained" onClick={handleNext} disabled={phase === 'FEEDBACK'}>
                Siguiente
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={handleFinish} disabled={phase === 'FEEDBACK'}>
                Finalizar
              </Button>
            )}
          </Stack>

          {feedback ? (
            <Fade in={showFeedback} timeout={{ enter: 300, exit: 300 }}>
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor:
                    feedback === 'correct' ? '#dcfce7' : '#fee2e2',
                  color: feedback === 'correct' ? '#15803d' : '#b91c1c',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <img
                  src={feedback === 'correct' ? '/assets/correct.gif' : '/assets/incorrect.gif'}
                  alt="feedback gif"
                  style={{ height: 70 }}
                />
                <Typography variant="h6">
                  {feedback === 'correct'
                    ? '¡Muy bien! Respuesta correcta.'
                    : feedback === 'timeout'
                      ? `Tiempo agotado. La respuesta correcta era: ${correctAnswer}`
                      : `Incorrecto. La respuesta correcta era: ${correctAnswer}`}
                </Typography>
              </Box>
            </Fade>
          ) : null}

          {readOnly ? (
            <Typography variant="h5" sx={{ mb: 2 }}>
              Correcta: <strong>{correctKey}</strong>
            </Typography>
          ) : null}
        </Paper>
      </Box>

      <FeedbackDialog
        open={openFeedbackDialog}
        close={handleCloseFeedbackDialog}
        message={currentQuestion?.feedback_text}
        image={currentQuestion?.feedback_image}
      />

      <TestResultDialog
        open={openResult}
        onClose={() => setOpenResult(false)}
        correct={resultStats.correct}
        total={resultStats.total}
        onGoToSubjects={goToSubjects}
        showReview={true}
      />
    </>
  );
}
