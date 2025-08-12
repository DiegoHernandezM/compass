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
  const currentQuestion = test.test_questions[currentIndex];
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'incorrect'
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [maxTime, setMaxTime] = useState(null);
  const [holdForDialog, setHoldForDialog] = useState(false);

  const sentAnswersRef = useRef(new Set());
  const locallyAnsweredRef = useRef(new Set()); // <- marca local inmediata (incluye timeout)

  const [openResult, setOpenResult] = useState(false);
  const [resultStats, setResultStats] = useState({ correct: 0, total: 0 });

  const correctKey = String(currentQuestion?.correct_answer || '').toUpperCase();

  // ---------- helpers ----------
  // Considera respondida en servidor si ya hay user_answer O is_correct no es null (timeout con respuesta null)
  const isServerAnswered = (q) => q?.is_correct !== null || Boolean(q?.user_answer);

  const hydrateAnswersFromProps = (questions) => {
    const acc = {};
    questions.forEach(q => {
      if (q.user_answer) acc[q.id] = String(q.user_answer).toLowerCase();
      // si tu backend marca timeout con user_answer = null pero is_correct != null,
      // no seteamos valor visible, pero el readOnly lo cubre isServerAnswered(q)
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

  // readOnly si ya contestó en servidor o si ya la marcamos localmente (por ej. timeout)
  const readOnly = currentQuestion
    ? isServerAnswered(currentQuestion) || locallyAnsweredRef.current.has(currentQuestion.id)
    : false;

  // ---------- init: hidrata y posiciona ----------
  useEffect(() => {
    if (!test?.test_questions?.length) return;
    setAnswers(hydrateAnswersFromProps(test.test_questions));
    setCurrentIndex(firstUnansweredIndex(test.test_questions));
  }, [test?.id]);

  // ---------- auto avance tras GIF si no hay dialog ----------
  useEffect(() => {
    if (!showFeedback || openFeedbackDialog) return;
    const t = setTimeout(() => {
      goToNextQuestion();
    }, 2500);
    return () => clearTimeout(t);
  }, [showFeedback, openFeedbackDialog]);

  // ---------- temporizador: solo depende del estado del servidor ----------
  useEffect(() => {
    if (!currentQuestion) return;

    // si YA está respondida en backend, apagar timer
    if (isServerAnswered(currentQuestion)) {
      setTimeLeft(null);
      setMaxTime(null);
      return;
    }

    const limit = currentQuestion?.limit_time ?? null;
    setTimeLeft(limit);
    setMaxTime(limit);

    if (!limit) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return prev;
        if (prev <= 1) {
          clearInterval(interval);
          // tiempo agotado => marcar incorrecto y enviar (byTimeout = true)
          handleAnswer(null, true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestion]);

  // ---------- handlers ----------
  const handleAnswerChange = (e) => {
    if (readOnly) return; // bloquea edición
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: e.target.value.toLowerCase(),
    }));
  };

  
  const handleAnswer = (selectedOption = '', byTimeout = false) => {
    // si ya está respondida en servidor o marcada localmente, no re-enviar
    if (readOnly) return;
    const keyLower = (selectedOption || '').toLowerCase();
    const keyUpper = keyLower.toUpperCase();
    const isCorrect = !byTimeout && keyUpper === currentQuestion.correct_answer;
    // Marca local como contestada (incluye timeout) para bloquear inmediatamente
    locallyAnsweredRef.current.add(currentQuestion.id);
    // Guarda valor local:
    // - si timeout, guarda un sentinel para que el Radio se vea vacío pero readOnly
    // - si normal, guarda la opción
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: byTimeout ? '__timeout__' : keyLower,
    }));

    if (!byTimeout) {
      setFeedback(isCorrect ? 'correct' : 'incorrect');
      if (!isCorrect) setCorrectAnswer(currentQuestion.correct_answer);
      if (!isCorrect && (currentQuestion.feedback_text || currentQuestion.feedback_image)) {
        setOpenFeedbackDialog(true);
        setHoldForDialog(true);
      }
      setShowFeedback(true);
    }

    // Enviar al backend (en timeout mandamos user_answer = null, is_correct = 0)
    sendAnswer({
      test_id: test?.id,
      subject_id: subject?.id ?? null,
      current_question: currentQuestion,
      is_correct: byTimeout ? 0 : (isCorrect ? 1 : 0),
      user_answer: byTimeout ? null : keyUpper,
    });

    setTimeout(() => setShowFeedback(false), 5000); // si quieres más tiempo de feedback
  };

  const sendAnswer = async (payload) => {
    const key = `${payload.test_id}:${payload.current_question?.question_id}`;
    if (sentAnswersRef.current.has(key)) return;
    sentAnswersRef.current.add(key);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort('timeout'), 4000); // 4s

    try {
      await axios.post(route('answer.save'), payload, {
        signal: controller.signal,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
        },
      });
      // opcional: si quisieras refrescar algo después, hazlo aquí
      // sin interrumpir feedback/dialog
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
    const nextIdx = nextUnansweredIndex(test.test_questions, currentIndex);
    if (nextIdx !== null) setCurrentIndex(nextIdx);
    else if (currentIndex < test.test_questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleNext = () => {
    if (readOnly) {
      const nextIdx = nextUnansweredIndex(test.test_questions, currentIndex);
      if (nextIdx !== null) setCurrentIndex(nextIdx);
      else if (currentIndex < test.test_questions.length - 1) setCurrentIndex(currentIndex + 1);
      return;
    }
    const selectedOption = answers[currentQuestion.id];
    if (selectedOption && selectedOption !== '__timeout__') {
      handleAnswer(selectedOption);
      setTimeout(() => {
        setFeedback(null);
        setCorrectAnswer(null);
      }, 3000);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleFinish = () => {
    const selectedOption = answers[currentQuestion.id];
    if (selectedOption && selectedOption !== '__timeout__') {
      // envía y muestra feedback como ya lo tenías
      handleAnswer(selectedOption);
    }
    // calcula y abre el dialog (no bloquea el flujo)
    const stats = computeResults();
    setResultStats(stats);
    setOpenResult(true);
  };

  // progreso basado en backend (respondidas reales: user_answer o is_correct !== null)
  const answeredCount = test.test_questions.filter(q => isServerAnswered(q)).length;
  const progressPercent = (answeredCount / test.test_questions.length) * 100;

  const goToNextQuestion = () => {
    const nextIdx = nextUnansweredIndex(test.test_questions, currentIndex);
    if (nextIdx !== null) setCurrentIndex(nextIdx);
    else if (currentIndex < test.test_questions.length - 1) setCurrentIndex(currentIndex + 1);
    setFeedback(null);
    setCorrectAnswer(null);
    setShowFeedback(false);
  };

  const handleCloseFeedbackDialog = () => {
    setOpenFeedbackDialog(false);
    setHoldForDialog(false);
  };

  const isImage = (v) => {
    if (typeof v !== 'string') return false;
    const s = v.trim();
    if (/^data:image\//i.test(s)) return true;
    if (/^https?:\/\/.+\.(png|jpe?g|gif|svg|webp)(\?.*)?$/i.test(s)) return true;
    if (/^[\w.\-\/]+?\.(png|jpe?g|gif|svg|webp)$/i.test(s)) return true;
    return false;
  };

  // valor visible del radio: si timeout, no marcar nada
  const selectedValue =
    (answers[currentQuestion.id] === '__timeout__'
      ? ''
      : (answers[currentQuestion.id] || currentQuestion?.user_answer || '')
    ).toString().toLowerCase();

  const computeResults = () => {
    const total = test.test_questions.length;

    // Tomamos la elección local (answers) o la del back (user_answer)
    const correct = test.test_questions.reduce((acc, q) => {
      // ignora timeouts locales
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
    // Ajusta la ruta a la que corresponda en tu app
    Inertia.get(route('student.subject.index'));
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

          <Typography variant="subtitle1" gutterBottom>
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
            <Typography 
              variant="h6"
              sx={{marginBottom:'20px'}}
              gutterBottom>
              {currentQuestion.question_text}
            </Typography>
          )}

          <RadioGroup
            value={selectedValue}
            onChange={readOnly ? undefined : handleAnswerChange}
          >
            {Object.entries(JSON.parse(currentQuestion.options))
              .filter(([_, value]) => value != null && value !== '')
              .map(([key, value]) => {
                const valStr = String(value).trim();
                return (
                  <FormControlLabel
                    key={key}
                    value={key}
                    control={<Radio disabled={readOnly} />}
                    disabled={readOnly}
                    sx={{ mb: 2, marginTop: '15px', ...(readOnly ? { opacity: 0.8 } : {}) }}
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
            <Button variant="outlined" onClick={handlePrevious} disabled={currentIndex === 0}>
              Anterior
            </Button>
            {currentIndex < test.test_questions.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                Siguiente
              </Button>
            ) : (
              <Button variant="contained" color="success" onClick={handleFinish}>
                Finalizar
              </Button>
            )}
          </Stack>
          {type !== 'RAZONAMIENTO LOGICO' && correctAnswer != null ? (
            <Fade
              in={showFeedback}
              timeout={{ enter: 300, exit: 1000 }} // salida más suave
              onExited={() => {
                setFeedback(null);
                setCorrectAnswer(null);
                if (openFeedbackDialog || holdForDialog) return;
              }}
            >
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: feedback === 'correct' ? '#dcfce7' : '#fee2e2',
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
                    : `Incorrecto. La respuesta correcta era: ${correctAnswer}`}
                </Typography>
              </Box>
            </Fade>
          ): null}
          
          {readOnly && type !== 'RAZONAMIENTO LOGICO' ? (
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
