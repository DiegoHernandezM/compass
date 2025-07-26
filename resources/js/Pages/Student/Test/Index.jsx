import { useEffect } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, usePage } from '@inertiajs/react';
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
import { useState } from 'react';

import FeedbackDialog from '../../../Components/Test/FeedbackDialog';

export default function Test() {
  const { test, subject } = usePage().props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const currentQuestion = test.test_questions[currentIndex];
  const [feedback, setFeedback] = useState(null); // null, 'correct', 'incorrect'
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [openFeedbackDialog, setOpenFeedbackDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null); // segundos restantes
  const [maxTime, setMaxTime] = useState(null);   // tiempo total para el progreso


  useEffect(() => {
    if (showFeedback && !openFeedbackDialog) {
      const timeout = setTimeout(() => {
        goToNextQuestion();
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [showFeedback, openFeedbackDialog]);

  useEffect(() => {
    if (currentQuestion?.limit_time) {
      setTimeLeft(currentQuestion.limit_time);
      setMaxTime(currentQuestion.limit_time);
    } else {
      setTimeLeft(null);
      setMaxTime(null);
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      // Marcar como incorrecto si no respondió
      handleAnswer(''); // respuesta vacía
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);


  const handleAnswerChange = (e) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: e.target.value,
    });
  };

  const handleAnswer = (selectedOption = '') => {
    const isCorrect = selectedOption.toUpperCase() === currentQuestion.correct_answer;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedOption,
    }));

    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (!isCorrect) {
      setCorrectAnswer(currentQuestion.correct_answer);
    }

    if (!isCorrect && (currentQuestion.feedback_text || currentQuestion.feedback_image)) {
      setOpenFeedbackDialog(true);
    }

    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
    }, 2500);
  };

  const handleNext = () => {
    const selectedOption = answers[currentQuestion.id];
    if (selectedOption) {
      handleAnswer(selectedOption);
      setTimeout(() => {
        if (currentIndex < test.test_questions.length - 1) {
          setCurrentIndex(currentIndex);
          setFeedback(null);
          setCorrectAnswer(null);
        }
      }, 3000);
      
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = () => {
    const selectedOption = answers[currentQuestion.id];
    if (selectedOption) {
      handleAnswer(selectedOption);
    }

    console.log('Enviar respuestas:', answers);
  };

  const progressPercent = ((currentIndex + 1) / test.test_questions.length) * 100;

  const goToNextQuestion = () => {
    if (currentIndex < test.test_questions.length - 1) {
      setCurrentIndex(currentIndex);
      setFeedback(null);
      setCorrectAnswer(null);
    }
    setShowFeedback(false);
  };

  const handleCloseFeedbackDialog = () => {
    setOpenFeedbackDialog(false);
    goToNextQuestion(); // avanzar solo cuando el usuario cierra el dialog
  };

  return (
    <StudentLayout>
      <Head title="Test - Estudiante" />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.05)', p: 2 }}>
        <Card
          sx={{
            mb: 4,
            borderRadius: 3,
            boxShadow: 3,
            backgroundColor: 'rgba(255,255,255,0.95)',
            border: '1px solid #e0e0e0',
          }}
        >
          <CardContent 
            sx={{
              backgroundColor: `${subject.color}80`, // 33 es transparencia (20%)
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
            }}
          >
            <Typography variant="h6" gutterBottom>
              {subject.name}
            </Typography>
            <LinearProgress variant="determinate" value={progressPercent} />
          </CardContent>
        </Card>

        <Box
          sx={{
            height: 'calc(100vh - 220px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              width: '100%',
              maxWidth: 700,
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

            <Typography variant="h6" gutterBottom>
              {currentQuestion.question_text}
            </Typography>

            <RadioGroup
              value={answers[currentQuestion.id] || ''}
              onChange={handleAnswerChange}
            >
              {Object.entries(JSON.parse(currentQuestion.options))
                .filter(([_, value]) => value) // Filtra opciones nulas o vacías
                .map(([key, value]) => (
                  <FormControlLabel
                    key={key}
                    value={key}
                    control={<Radio />}
                    label={`${key.toUpperCase()}: ${value}`}
                  />
                ))}
            </RadioGroup>

            <Stack direction="row" justifyContent="space-between" mt={3}>
              <Button
                variant="outlined"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
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
            <Fade
              in={showFeedback}
              timeout={{ enter: 300, exit: 500 }}
              onExited={() => {
                setFeedback(null);
                setCorrectAnswer(null);

                if (currentIndex < test.test_questions.length - 1) {
                  setCurrentIndex(currentIndex + 1);
                }
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
          </Paper>
        </Box>
      </Box>
      <FeedbackDialog open={openFeedbackDialog} close={handleCloseFeedbackDialog} />
    </StudentLayout>
  );
}
