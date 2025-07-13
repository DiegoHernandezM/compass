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

export default function QuestionsNewDialog({ open, onClose, subjects, subject, onImport, handleExport }) {
  console.log(subject);
  const [subjectId, setSubjectId] = useState('');
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    if (file && subjectId) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject_id', subjectId);

      onImport(formData);

      // Limpiar y cerrar
      setFile(null);
      setSubjectId('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>Crear cuestionario para: {subject?.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="subject-select-label">Tipo de cuestionario</InputLabel>
            <Select
              labelId="subject-select-label"
              value={subjectId}
              label="Tipo de cuestionario"
              onChange={(e) => setSubjectId(e.target.value)}
              required
            >
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.name}
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
          setSubjectId(null);
        }}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!file || !subjectId}
        >
          Importar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
