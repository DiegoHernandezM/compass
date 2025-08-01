import { useEffect, useState } from 'react';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, usePage } from '@inertiajs/react';
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
  Radio
} from '@mui/material';
import CatchGame from '@/Pages/Student/Games/CatchGame';
import PlanePathGame from '@/Pages/Student/Games/PlanePathGame';

export default function MultitaskTest({ test, subject }) {
  const questions = test.test_questions;
  // Separa por tipo
  const mathQuestions = questions.filter(q => q.type === 'math');
  const figureQuestions = questions.filter(q => q.type === 'figure');
  // Agrupa por índice
  const groupedQuestions = [];
  const [gameType, setGameType] = useState(null); // 'horizontal' o 'vertical'
  const [showDialog, setShowDialog] = useState(true);

  for (let i = 0; i < Math.min(mathQuestions.length, figureQuestions.length); i++) {
    groupedQuestions.push([mathQuestions[i], figureQuestions[i]]);
  }

  const [currentTrack, setCurrentTrack] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});

  const handleAnswer = (questionId, selected, correct) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selected }));
    setFeedback((prev) => ({
      ...prev,
      [questionId]: selected === correct ? 'correct' : 'incorrect',
    }));
    // Aqui mandar al backend
  };

  const isCorrect = (questionId) => feedback[questionId] === 'correct';
  const isIncorrect = (questionId) => feedback[questionId] === 'incorrect';

  const currentMath = groupedQuestions[currentTrack]?.[0];
  const currentFigure = groupedQuestions[currentTrack]?.[1];
  const progressPercent = ((currentTrack + 1) / groupedQuestions.length) * 100;

  return (
    <>
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: 3 }}>
        <CardContent
          sx={{
            backgroundColor: `${subject.color}80`,
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          }}>
          <Typography variant="h6">{subject.name}</Typography>
          <LinearProgress variant="determinate" value={progressPercent} />
        </CardContent>
      </Card>

      <Box 
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="70vh"
        gap={1}
        flexWrap="wrap"
        px={2}
      >
        {/* Juego fijo (puedes aplicar una condición en el futuro para mostrar uno u otro) */}
         <Paper
          sx={{
            p: 4,
            width: 500,
            borderRadius: 3,
            backgroundColor: '#fff',
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
        <Box>
          <Box>
            {gameType === 'vertical' && <CatchGame />}
            {gameType === 'horizontal' && <PlanePathGame />}
          </Box>  
        </Box>
        </Paper>
        {/* Bloque de preguntas */}
        <Paper
          sx={{
            p: 4,
            width: 500,
            borderRadius: 3,
            backgroundColor: '#fff',
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Pregunta de matemáticas */}
          <Typography variant='h4' mb={2} textAlign="center">
            {currentMath?.question_text}
          </Typography>
          <Stack direction="row" spacing={3} mb={6}>
            {Object.entries(JSON.parse(currentMath.options))
              .filter(([_, value]) => !!value) // solo valores no nulos
              .slice(0, 2) // máximo 2 botones
              .map(([key, value]) => (
                <Button
                  key={key}
                  variant="contained"
                  sx={{
                    backgroundColor: isCorrect(currentMath.id) && answers[currentMath.id] === value
                      ? '#dcfce7'
                      : isIncorrect(currentMath.id) && answers[currentMath.id] === value
                      ? '#fee2e2'
                      : '#e0e0e0',
                    color: '#000',
                    minWidth: 120
                  }}
                  onClick={() => handleAnswer(currentMath.id, value, currentMath.correct_answer)}
                >
                  {value}
                </Button>
              ))}
          </Stack>

          {/* Pregunta de figuras */}
          <Typography variant='h3' mb={2} textAlign="center">
            {currentFigure?.question_text}
          </Typography>
          <Stack direction="row" spacing={3} mb={4}>
            {Object.entries(JSON.parse(currentFigure.options))
              .filter(([_, value]) => !!value)
              .map(([key, value]) => (
                <Button
                  key={key}
                  variant="contained"
                  sx={{
                    backgroundColor: isCorrect(currentFigure.id) && answers[currentFigure.id] === value
                      ? '#dcfce7'
                      : isIncorrect(currentFigure.id) && answers[currentFigure.id] === value
                      ? '#fee2e2'
                      : '#e0e0e0',
                    color: '#000',
                    minWidth: 80
                  }}
                  onClick={() => handleAnswer(currentFigure.id, value, currentFigure.correct_answer)}
                >
                  {value}
                </Button>
              ))}
          </Stack>

          {/* Navegación */}
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Button
              disabled={currentTrack === 0}
              onClick={() => setCurrentTrack((prev) => prev - 1)}
            >
              Anterior
            </Button>
            <Button
              disabled={currentTrack >= groupedQuestions.length - 1}
              onClick={() => setCurrentTrack((prev) => prev + 1)}
            >
              Siguiente
            </Button>
          </Stack>
        </Paper>
      </Box>
      <Dialog open={showDialog}>
        <DialogTitle>¿Qué tipo de juego prefieres?</DialogTitle>
        <DialogContent>
          <RadioGroup
            value={gameType}
            onChange={(e) => setGameType(e.target.value)}
          >
            <FormControlLabel value="vertical" control={<Radio />} label="Vertical (Balde)" />
            <FormControlLabel value="horizontal" control={<Radio />} label="Horizontal (Avión)" />
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowDialog(false)}
            disabled={!gameType}
            variant="contained"
          >
            Comenzar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
