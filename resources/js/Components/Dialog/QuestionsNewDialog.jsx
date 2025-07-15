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

export default function QuestionsNewDialog({ open, onClose, types, subject, onImport, handleExport }) {
  console.log(types);
  const [typeId, setTypeId] = useState('');
  const [levelId, setLevelId] = useState('');
  const selectedType = types.find((type) => type.id === Number(typeId));
  const levels = selectedType?.levels || [];
  const selectedLevel = levels.find((level) => level.id === Number(levelId));
  const [hasTimeLimit, setHasTimeLimit] = useState(false);

  const handleSubmit = () => {
    if (subject?.id) {
      const formData = new FormData();
      formData.append('subject_id', subject?.Id);
      onImport(formData);
      setTypeId('');
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
              required
            >
              {levels.map((level) => (
                <MenuItem key={level.id} value={level.id}>
                  {level.name} - {level.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedLevel && (
            <FormControl fullWidth margin="normal">
              <Typography variant="subtitle1" component="p">
                Preguntas disponibles sobre examen ({selectedLevel.questions_count || 0})
              </Typography>
              <TextField
                id="count-question-required"
                label="Número de preguntas para examen"
                type="number"
                inputProps={{ min: 1, max: selectedLevel.questions_count }}
                required
              />
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
                  inputProps={{ min: 1 }}
                  required
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
          disabled={!typeId || !levelId}
        >
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  );
}
