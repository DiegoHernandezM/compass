import { useEffect, useState } from 'react';
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

export default function Params({ test, subject }) {
  console.log(subject);
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md')); // true si pantalla ≥ 960px
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm')); // sm = 600px
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMemoryPanel, setShowMemoryPanel] = useState(true);
  const [parameters, setParameters] = useState({});
  const [hiddenParams, setHiddenParams] = useState([]);
  const [userInputs, setUserInputs] = useState({});
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'
  const [correctValue, setCorrectValue] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [maxTime, setMaxTime] = useState(0);

  const currentQuestion = test.test_questions[currentIndex];

  useEffect(() => {
    if (!currentQuestion) return;

    // Reset states
    setShowMemoryPanel(true);
    setUserInputs({});
    setFeedback(null);
    setCorrectValue(null);

    // Parse parameters
    const parsed = {};
    currentQuestion.question_text.split('\n').forEach(line => {
      const [key, value] = line.split(':');
      if (key && value) parsed[key.trim()] = value.trim();
    });
    setParameters(parsed);

    // Determine how many to hide
    const level = currentQuestion.question_level_id;
    const totalKeys = Object.keys(parsed);
    const countToHide = level === 14 ? 1 : level === 15 ? 2 : 4;
    const shuffled = [...totalKeys].sort(() => 0.5 - Math.random());
    setHiddenParams(shuffled.slice(0, countToHide));

    // Tiempo límite
    const limit = currentQuestion.limit_time || 5;
    setTimeLeft(limit);
    setMaxTime(limit);

    const timeout = setTimeout(() => {
      setShowMemoryPanel(false);
    }, limit * 1000);

    return () => clearTimeout(timeout);
  }, [currentQuestion]);

  // Decrementar el tiempo cada segundo
  useEffect(() => {
    if (!showMemoryPanel || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [showMemoryPanel, timeLeft]);

  const handleChange = (key, value) => {
    setUserInputs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = () => {
    const incorrect = hiddenParams.find(key => {
      const real = (parameters[key] || '').toLowerCase().trim();
      const input = (userInputs[key] || '').toLowerCase().trim();
      return real !== input;
    });

    const isCorrect = !incorrect;

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    if (!isCorrect) setCorrectValue(parameters[incorrect]);

    // TODO: Guardar la respuesta con Inertia.post
    /*
    Inertia.post(route('test.answer', test.id), {
      question_id: currentQuestion.id,
      user_answer: userInputs,
      is_correct: isCorrect,
    });
    */
  };

  const goToNext = () => {
    if (currentIndex < test.test_questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      console.log('Test completado');
    }
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
                backgroundColor: `${subject?.color}80`, // 33 es transparencia (20%)
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
          mt: isSmallScreen ? 4 : 4, // más espacio en pantallas pequeñas
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
              value={(timeLeft / maxTime) * 100}
              sx={{ mb: 2, height: 10, borderRadius: 5 }}
            />

            <Typography variant="subtitle1" gutterBottom>
              Pregunta {currentIndex + 1} de {test.test_questions.length}
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
              {Object.entries(parameters).map(([key, value]) => (
                <Box
                  key={key}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography>{key}</Typography>
                  {showMemoryPanel || !hiddenParams.includes(key) ? (
                    <Typography>{value}</Typography>
                  ) : (
                    <input
                      type="text"
                      value={userInputs[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      style={{
                        width: 100,
                        padding: 4,
                        borderRadius: 4,
                        backgroundColor: '#fff',
                        color: '#000',
                        fontSize: '1rem'
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>

            {!showMemoryPanel && (
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
                      }}
                    >
                      <Typography variant="h6">
                        {feedback === 'correct'
                          ? '¡Muy bien! Respuesta correcta.'
                          : `Incorrecto. La respuesta correcta era: ${correctValue}`}
                      </Typography>
                    </Box>
                  </Fade>
                ) : (
                  <Button variant="contained" onClick={handleSubmit}>
                    Enviar respuesta
                  </Button>
                )}
              </Box>
            )}

            {feedback && (
              <Box mt={3} textAlign="center">
                <Button variant="contained" onClick={goToNext}>
                  Siguiente
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
