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
} from '@mui/material';

export default function ImportQuestionsDialog({ open, onClose, types, onImport, handleExport }) {
  const [subjectId, setSubjectId] = useState('');
  const [file, setFile] = useState(null);
  const [typeId, setTypeId] = useState('');
  const [levelId, setLevelId] = useState('');
  const selectedType = types.find((type) => type.id === Number(typeId));
  const levels = selectedType?.levels || [];

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    if (file && typeId) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type_id', typeId);
      formData.append('level_id', levelId);

      onImport(formData);

      // Limpiar y cerrar
      setFile(null);
      setTypetId('');
      setLeveltId('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Importar a banco de preguntas</DialogTitle>
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

          <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
            Seleccionar archivo Excel
            <input type="file" hidden accept=".xlsx, .xls" onChange={handleFileChange} />
          </Button>

          {file && (
            <TextField
              label="Archivo seleccionado"
              value={file.name}
              fullWidth
              disabled
              margin="normal"
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          handleExport(subjectId);
          setSubjectId(null);
        }}
        >Exportar Concentrado</Button>
        <Button onClick={() => {
          onClose();
          setTypeId(null);
          setLevelId(null);
        }}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!file || !typeId}
        >
          Importar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
