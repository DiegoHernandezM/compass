import React, { useState } from 'react';
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

export default function QuestionsNewDialog({ open, onClose, types, subject, onSave }) {
  const [typeId, setTypeId] = useState('');
  const [levelId, setLevelId] = useState('');
  const selectedType = types.find((type) => type.id === Number(typeId));
  const levels = selectedType?.levels || [];
  const selectedLevel = levels.find((level) => level.id === Number(levelId));
  const [hasTimeLimit, setHasTimeLimit] = useState(false);
  const [questionCount, setQuestionCount] = useState('');
  const [limitTime, setLimitTime] = useState('');
  const isMultitasking = selectedType?.name === 'MULTITASK' || selectedType?.name === 'MULTITASKING';
  const [gameType, setGameType] = useState('');

  const handleSubmit = () => {
    if (subject?.id && typeId) {
      const formData = new FormData();
      formData.append('subject_id', subject.id);
      formData.append('question_type_id', typeId);
      formData.append('question_level_id', levelId);
      formData.append('question_count', questionCount);
      formData.append('has_time_limit', hasTimeLimit ? '1' : '0');
      if (hasTimeLimit) {
        formData.append('time_limit', limitTime);
      }
      onSave(formData);
      // Reset
      setTypeId('');
      setLevelId('');
      setQuestionCount('');
      setLimitTime('');
      onClose();
    }
  };


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>Crear cuestionario para: {subject?.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="type-select-label">Tipo de cuestionario</InputLabel>
            <Select
              labelId="type-select-label"
              value={typeId}
              label="Tipo de cuestionario"
              onChange={(e) => {
                setTypeId(e.target.value);
                setLevelId(''); // Reiniciar nivel cuando cambia el tipo
              }}
              required
            >
              {types.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" disabled={!levels.length}>
            <InputLabel id="level-select-label">Nivel de complejidad</InputLabel>
            <Select
              labelId="level-select-label"
              value={levelId}
              label="Nivel de complejidad"
              onChange={(e) => setLevelId(e.target.value)}
              required={levels.length > 0}
            >
              {levels.map((level) => (
                <MenuItem key={level.id} value={level.id} disabled={level.questions_count === 0}>
                  {level.name} - {level.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {(selectedLevel || selectedType) && (
            <FormControl fullWidth margin="normal">
              <Typography variant="subtitle1" component="p">
                Preguntas disponibles sobre examen (
                {selectedLevel
                  ? selectedLevel.questions_count || 0
                  : selectedType?.questions_count || 0}
                )
              </Typography>
              <TextField
                id="count-question-required"
                label="Número de preguntas para examen"
                type="number"
                inputProps={{
                  min: 1,
                  max: selectedLevel
                    ? selectedLevel.questions_count
                    : selectedType?.questions_count || 1,
                }}
                onChange={(e) => setQuestionCount(e.target.value)}
                required
              />
            </FormControl>
          )}

          {isMultitasking && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="game-type-label">Tipo de juego</InputLabel>
              <Select
                labelId="game-type-label"
                value={gameType}
                label="Tipo de juego"
                onChange={(e) => setGameType(e.target.value)}
                required
              >
                <MenuItem value="balde">Balde</MenuItem>
                <MenuItem value="avion">Avión</MenuItem>
              </Select>
            </FormControl>
          )}

          {typeId && (
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
              {console.log(typeId)}
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
          setTypeId('');
          levelId('');
        }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!typeId}
        >
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  );
}
