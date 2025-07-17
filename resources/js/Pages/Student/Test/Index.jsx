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

export default function Test() {
  const { test } = usePage().props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const currentQuestion = test.test_questions[currentIndex];
  const [feedback, setFeedback] = useState(null); // null, 'correct', 'incorrect'
  const [correctAnswer, setCorrectAnswer] = useState(null);


  const handleAnswerChange = (e) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: e.target.value,
    });
  };

  const handleAnswer = (selectedOption) => {
    const currentQuestion = test.test_questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.correct_answer;

    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (!isCorrect) {
      setCorrectAnswer(currentQuestion.correct_answer);
    }
    // Aquí puedes enviar la respuesta al backend si deseas
  };

  const handleNext = () => {
    const selectedOption = answers[currentQuestion.id];
    if (selectedOption) {
      handleAnswer(selectedOption);

      // Mostrar el feedback durante 1.5 segundos antes de avanzar
      setTimeout(() => {
        if (currentIndex < test.test_questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setFeedback(null);
          setCorrectAnswer(null);
        }
      }, 2500);
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

  return (
    <StudentLayout>
      <Head title="Test - Estudiante" />

      {/* Fondo opaco */}
      <Box sx={{ minHeight: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.05)', p: 2 }}>

        {/* Card superior con título y progreso */}
        <Card
          sx={{
            mb: 4,
            borderRadius: 3,
            boxShadow: 3,
            backgroundColor: 'rgba(255,255,255,0.95)',
            border: '1px solid #e0e0e0',
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resolviendo Test de Materia ID: {test.subject_id}
            </Typography>
            <LinearProgress variant="determinate" value={progressPercent} />
          </CardContent>
        </Card>

        {/* Contenedor centrado del test */}
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
              {Object.entries(JSON.parse(currentQuestion.options)).map(([key, value]) => (
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
            <Fade in={Boolean(feedback)}>
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
    </StudentLayout>
  );
}
