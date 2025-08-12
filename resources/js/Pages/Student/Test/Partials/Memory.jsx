import React, { useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';
import { Box, Typography, Button, Grid } from '@mui/material';
import * as Icons from '@mui/icons-material';

export default function Memory({ subject, test }) {
  const questions = test.test_questions;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('show'); // 'show' | 'select' | 'feedback'
  const [displayedIcon, setDisplayedIcon] = useState(null);
  const [selectedIcons, setSelectedIcons] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const sentAnswersRef = useRef(new Set());


  const currentQuestion = questions[currentIndex];
  const correctIcons = useMemo(
    () => currentQuestion.question_text.split(',').map(s => s.trim()),
    [currentQuestion]
  );

  const allIcons = useMemo(() => {
    const distractors = generateRandomIcons(correctIcons, 8 - correctIcons.length);
    return shuffle([...correctIcons, ...distractors]);
  }, [currentIndex]);

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
  }, [phase, currentIndex]);

  const handleIconClick = (icon) => {
    if (phase !== 'select') return;
    const updated = selectedIcons.includes(icon)
      ? selectedIcons.filter(i => i !== icon)
      : [...selectedIcons, icon];
    setSelectedIcons(updated);
  };

  const checkAnswers = () => {
    setPhase('feedback');

    // Determinar aciertos (no importa el orden)
    const selectedSorted = [...selectedIcons].sort();
    const correctSorted = [...correctIcons].sort();
    const isCorrect = JSON.stringify(selectedSorted) === JSON.stringify(correctSorted);

    // Enviar al backend
    sendAnswer({
      test_id: test.id,
      subject_id: subject?.id ?? null,
      current_question: currentQuestion,
      is_correct: isCorrect ? 1 : 0,
      user_answer: selectedIcons.join(','), // puede ser útil para mostrar qué eligió
    });

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
        setPhase('show');
        setSelectedIcons([]);
      } else {
        setIsFinished(true);
      }
    }, 3000);
  };


  const renderIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    const isSelected = selectedIcons.includes(iconName);
    const isCorrect = correctIcons.includes(iconName);

    const borderColor = phase === 'feedback'
      ? (isSelected ? (isCorrect ? 'green' : 'red') : (isCorrect ? 'green' : 'gray'))
      : (isSelected ? 'blue' : 'gray');

    return (
      <Grid item xs={6} sm={4} md={3} lg={3} key={iconName}>
        <Box
          onClick={() => handleIconClick(iconName)}
          sx={{
            backgroundColor: 'white',
            border: `3px solid ${borderColor}`,
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
          }}
        >
          {IconComponent ? <IconComponent sx={{ fontSize: 90 }} /> : iconName}
        </Box>
      </Grid>
    );
  };

  if (isFinished) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        textAlign="center"
      >
        <Typography variant="h4">¡Examen finalizado!</Typography>
      </Box>
    );
  }

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
      sentAnswersRef.current.delete(key);
    } finally {
      clearTimeout(timer);
    }
  };

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
      <Typography variant="h5">Pregunta {currentIndex + 1} de {questions.length}</Typography>

      {phase === 'show' && displayedIcon && (
        <Box mt={5} display="flex" justifyContent="center" alignItems="center" height="300px">
          <Box
            sx={{
              backgroundColor: 'white',
              border: '3px solid #ccc',
              borderRadius: 2,
              width: 200,
              height: 200,
              boxShadow: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {(() => {
              const IconComponent = Icons[displayedIcon];
              return IconComponent ? <IconComponent sx={{ fontSize: 90 }} /> : null;
            })()}
          </Box>
        </Box>
      )}

      {(phase === 'select' || phase === 'feedback') && (
        <>
          <Typography mt={3}>Selecciona los iconos que recuerdas</Typography>
          <Grid
            container
            spacing={3}
            justifyContent="center"
            alignItems="center"
            mt={2}
            maxWidth="lg"
          >
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

// Utilidad para mezclar arrays
function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}
