import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Typography
} from '@mui/material';

export default function QuestionsNewDialog({ open, onClose, type, subjects, onSave }) {
  const [subjectId, setSubjectId] = useState('');
  const [levelId, setLevelId] = useState('');
  const selectedSubject = subjects.find((subject) => subject.id === Number(subjectId));
  const levels = type?.levels || [];
  const selectedLevel = levels.find((level) => level.id === Number(levelId));
  const [hasTimeLimit, setHasTimeLimit] = useState(false);
  const [questionCount, setQuestionCount] = useState('');
  const [limitTime, setLimitTime] = useState('');
  const bypassLevels = type?.bypass_levels_and_questions === 1;
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const checkTestExists = async () => {
      if (subjectId && levelId) {
        try {
          const response = await axios.get(`/admin/question/check-existence/${subjectId}/${levelId}/${type?.id}`);
          if (response.data?.exists.length > 0) {
            console.log(response.data.exists);
            setShowConfirmation(true); // Muestra el modal
          }
        } catch (error) {
          console.error('Error al verificar test existente:', error);
        }
      }
    };

    checkTestExists();
  }, [subjectId, levelId]);


  const handleSubmit = () => {
    if (type?.id && subjectId) {
      const formData = new FormData();
      formData.append('subject_id', subjectId);
      formData.append('question_type_id', type?.id);
      formData.append('question_level_id', levelId);
      formData.append('question_count', questionCount);
      formData.append('has_time_limit', hasTimeLimit ? '1' : '0');
      if (hasTimeLimit) {
        formData.append('time_limit', limitTime);
      }
      onSave(formData);
      // Reset
      setSubjectId('');
      setLevelId('');
      setQuestionCount('');
      setLimitTime('');
      onClose();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={(event, reason) => {
          if (reason !== 'backdropClick') {
            onClose;
          }
        }}
        fullWidth maxWidth="xl"
        disableEscapeKeyDown
      >
        <DialogTitle>Tipo de cuestionario: {type?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="type-select-label">Materias</InputLabel>
              <Select
                labelId="type-select-label"
                value={subjectId ?? ''}
                label="Materias"
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setLevelId('');
                }}
                required
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" disabled={levels.length == 0}>
              <InputLabel id="level-select-label">Nivel de complejidad</InputLabel>
              <Select
                labelId="level-select-label"
                value={levelId ?? ''}
                label="Nivel de complejidad"
                onChange={(e) => setLevelId(e.target.value)}
                required={levels.length > 0}
              >
                {levels.map((level) => (
                  <MenuItem 
                    key={level.id} 
                    value={level.id}
                  >
                    {level.name} - {level.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {(selectedLevel || bypassLevels) && (
              <FormControl fullWidth margin="normal">
                <Typography variant="subtitle1" component="p">
                  {bypassLevels
                    ? 'Número de preguntas para el examen'
                    : `Preguntas disponibles sobre examen (${selectedLevel
                        ? selectedLevel.questions_count || 0
                        : selectedSubject?.questions_count || 0
                      })`}
                </Typography>
                <TextField
                  id="count-question-required"
                  label="Número de preguntas para examen"
                  type="number"
                  inputProps={{
                    min: 1,
                    ...(bypassLevels
                      ? {}
                      : {
                          max: selectedLevel
                            ? selectedLevel.questions_count
                            : selectedSubject?.questions_count || 1,
                        }),
                  }}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  required
                />
              </FormControl>
            )}
            {bypassLevels || subjectId  && (
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hasTimeLimit}
                      onChange={(e) => setHasTimeLimit(e.target.checked)}
                    />
                  }
                  label="Tiempo límite"
                />
              </FormGroup>
            )}
            {hasTimeLimit && (
              <>
                <FormControl fullWidth margin="normal">
                  <TextField
                    id="limit-time-required"
                    label="Tiempo límite (segundos por pregunta)"
                    type="number"
                    onChange={(e) => setLimitTime(e.target.value)}
                    inputProps={{ min: 1 }}
                  />
                </FormControl>
              </>

            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            onClose();
            setSubjectId('');
            levelId('');
          }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!subjectId}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={showConfirmation} onClose={() => setShowConfirmation(false)}>
          <DialogTitle>Existen preguntas asignadas a esta materia</DialogTitle>
          <DialogContent>
            Al continuar se reasignarán las nuevas preguntas a la materia con el nivel asignado. ¿Quieres continuar?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfirmation(false)}>Cancelar</Button>
            <Button onClick={() => { setShowConfirmation(false); /* continuar lógica */ }} autoFocus>
              Continuar
            </Button>
          </DialogActions>
      </Dialog>
    </>
  );

}
