import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Inertia } from '@inertiajs/inertia';
import axios from 'axios';
import { Box, Typography, Button, Grid } from '@mui/material';
import * as Icons from '@mui/icons-material';
import TestResultDialog from '@/Components/Dialog/TestResultDialog';

export default function Memory({ subject, test }) {
  // 1) Mantén copia local editable de las preguntas
  const [localQuestions, setLocalQuestions] = useState(() =>
    (test.test_questions || []).map(q => ({ ...q }))
  );

  // Primero no contestada (con base en la copia local)
  const initialIndex = localQuestions.findIndex(q => q.is_correct === null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex === -1 ? 0 : initialIndex);

  const [phase, setPhase] = useState('show'); // 'show' | 'select' | 'feedback'
  const [displayedIcon, setDisplayedIcon] = useState(null);
  const [selectedIcons, setSelectedIcons] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  const [openResult, setOpenResult] = useState(false);
  const [resultStats, setResultStats] = useState({ correct: 0, total: localQuestions.length });

  const sentAnswersRef = useRef(new Set());

  const currentQuestion = localQuestions[currentIndex];

  const [localCorrectMap, setLocalCorrectMap] = useState({});

  const correctIcons = useMemo(
    () => currentQuestion.question_text.split(',').map(s => s.trim()),
    [currentQuestion]
  );

  useEffect(() => {
    const seed = {};
    for (const q of test.test_questions) {
      if (q.is_correct === 0 || q.is_correct === 1) {
        seed[q.id] = q.is_correct;
      }
    }
    setLocalCorrectMap(seed);
  }, [test?.id]);

  // Si ya venía todo contestado desde el back, muestra resultados al montar
  useEffect(() => {
    if (initialIndex === -1) {
      setIsFinished(true);
      setResultStats(computeResults());
      setOpenResult(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setResultStats(computeResultsFrom(localCorrectMap));
  }, [currentIndex, localCorrectMap]);

  const computeResultsFrom = (map) => {
    const total = test.test_questions.length;
    let correct = 0;
    for (const q of test.test_questions) {
      if (map[q.id] === 0 || map[q.id] === 1) {
        correct += map[q.id];
      } else if (q.is_correct === 1) {
        correct += 1;
      }
    }
    return { correct, total };
  };

  const allIcons = useMemo(() => {
    const distractors = generateRandomIcons(correctIcons, 8 - correctIcons.length);
    return shuffle([...correctIcons, ...distractors]);
  }, [currentIndex]); // ok: se regenera por pregunta

  useEffect(() => {
    if (phase === 'show') {
      let i = 0;
      const interval = setInterval(() => {
        if (i < correctIcons.length) {
          setDisplayedIcon(correctIcons[i]);
          i++;
        } else {
          clearInterval(interval);
          setDisplayedIcon(null);
          setTimeout(() => setPhase('select'), 500);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase, currentIndex, correctIcons]);

  const handleIconClick = (icon) => {
    if (phase !== 'select') return;
    setSelectedIcons(prev =>
      prev.includes(icon) ? prev.filter(i => i !== icon) : [...prev, icon]
    );
  };

  const checkAnswers = () => {
    if (!currentQuestion) return;

    setPhase('feedback');

    const selectedSorted = [...selectedIcons].sort();
    const correctSorted = [...correctIcons].sort();
    const isCorrect = JSON.stringify(selectedSorted) === JSON.stringify(correctSorted);

    // 1) Actualiza overrides de aciertos (optimista)
    setLocalCorrectMap(prev => {
      const next = { ...prev, [currentQuestion.id]: isCorrect ? 1 : 0 };
      setResultStats(computeResultsFrom(next)); // recalcula al vuelo
      return next;
    });

    // 2) Actualiza la copia local (is_correct y user_answer) para mantener todo consistente
    setLocalQuestions(prev =>
      prev.map(q =>
        q.id === currentQuestion.id
          ? { ...q, is_correct: isCorrect ? 1 : 0, user_answer: selectedIcons.join(',') }
          : q
      )
    );

    // 3) Dispara guardado (no bloquea UI)
    const payload = {
      test_id: test.id,
      subject_id: subject?.id ?? null,
      current_question: currentQuestion,
      is_correct: isCorrect ? 1 : 0,
      user_answer: selectedIcons.join(','),
    };
    sendAnswer(payload);

    // 4) Siguiente pregunta o fin (OJO: usa localQuestions, no 'questions')
    setTimeout(() => {
      if (currentIndex + 1 < localQuestions.length) {
        setCurrentIndex(currentIndex + 1);
        setPhase('show');
        setSelectedIcons([]);
      } else {
        // Última: abre diálogo con el conteo ya recalculado
        setIsFinished(true);
        setOpenResult(true);
      }
    }, 3000);
  };

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
      // Si falló, permite reintentar
      sentAnswersRef.current.delete(key);
    }).finally(() => {
      clearTimeout(timer);
    });
  };

  // 6) Resultados basados SIEMPRE en la copia local
  const computeResults = () => {
    const total = localQuestions.length;
    const correct = localQuestions.reduce((acc, q) => acc + (q.is_correct ? 1 : 0), 0);
    return { correct, total };
  };

  const renderIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    const isSelected = selectedIcons.includes(iconName);
    const isCorrect = correctIcons.includes(iconName);

    const borderColor =
      phase === 'feedback'
        ? (isSelected ? (isCorrect ? 'green' : 'red') : (isCorrect ? 'green' : 'gray'))
        : (isSelected ? 'blue' : 'gray');

    return (
      <Grid item xs={6} sm={4} md={3} lg={3} key={iconName}>
        <Box
          onClick={() => handleIconClick(iconName)}
          sx={{
            backgroundColor: 'rgba(32, 55, 100, 0.85)', // Azul #203764 sutil con opacidad
            border: '3px solid #ECD358', // Marco dorado
            borderRadius: 2,
            p: 2,
            cursor: phase === 'select' ? 'pointer' : 'default',
            width: '100%',
            height: 200,
            boxShadow: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: 200,
            mx: 'auto',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',

            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 0 15px rgba(236, 211, 88, 0.6)', // Glow dorado sutil
            },
          }}
        >
          {IconComponent ? (
            <IconComponent sx={{ fontSize: 90, color: 'white' }} /> // Iconos blancos
          ) : (
            iconName
          )}
        </Box>
      </Grid>
    );
  };

  if (isFinished) {
    return (
      <TestResultDialog
        open={openResult}
        onClose={() => setOpenResult(false)}
        correct={resultStats.correct}
        total={resultStats.total}
        onGoToSubjects={() => Inertia.get(route('student.subject.index'))}
        showReview={false}
      />
    );
  }

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      px={2}
      textAlign="center"
    >
      <Typography variant="h5">Pregunta {currentIndex + 1} de {localQuestions.length}</Typography>

      {phase === 'show' && displayedIcon && (
        <Box mt={5} display="flex" justifyContent="center" alignItems="center" height="300px">
          <Box
            sx={{
              backgroundColor: 'rgba(32, 55, 100, 0.85)', // Fondo azul sutil
              border: '3px solid #ECD358', // Marco dorado
              borderRadius: 2,
              width: 200,
              height: 200,
              boxShadow: '0 0 10px rgba(236, 211, 88, 0.5)', // Glow suave dorado
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {(() => {
              const IconComponent = Icons[displayedIcon];
              return IconComponent ? (
                <IconComponent sx={{ fontSize: 90, color: 'white' }} /> // Icono blanco
              ) : null;
            })()}
          </Box>
        </Box>
      )}

      {(phase === 'select' || phase === 'feedback') && (
        <>
          <Typography mt={3}>Selecciona los iconos que recuerdas</Typography>
          <Grid container spacing={3} justifyContent="center" alignItems="center" mt={2} maxWidth="lg">
            {allIcons.map(renderIcon)}
          </Grid>
          {phase === 'select' && (
            <Button variant="contained" onClick={checkAnswers} sx={{ mt: 3 }}>
              Confirmar selección
            </Button>
          )}
        </>
      )}
    </Box>
  );
}

// Simula íconos aleatorios sin repetir los correctos
function generateRandomIcons(excludeIcons = [], needed = 5) {
  const available = Object.keys(Icons).filter(name => !excludeIcons.includes(name));
  return shuffle(available).slice(0, needed);
}

// Mezcla simple
function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}
