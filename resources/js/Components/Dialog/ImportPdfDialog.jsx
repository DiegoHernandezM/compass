import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  LinearProgress,
} from '@mui/material';

export default function ImportPdfDialog({ open, onClose, onImport, loading = false }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const reset = () => {
    setFile(null);
    setError('');
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      setError('');
      return;
    }

    // Validación: solo PDF, tamaño sugerido < 25MB (ajústalo si quieres)
    const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setFile(null);
      setError('Solo se permite un archivo PDF (.pdf).');
      return;
    }

    const maxMB = 25;
    if (f.size > maxMB * 1024 * 1024) {
      setFile(null);
      setError(`El archivo excede ${maxMB} MB.`);
      return;
    }

    setError('');
    setFile(f);
  };

  const handleSubmit = () => {
    if (!file) return;
    const formData = new FormData();
    // Clave 'file' para coincidir con tu backend
    formData.append('file', file);

    onImport?.(formData);

    // Limpia y cierra
    reset();
    onClose?.();
  };

  const handleCancel = () => {
    reset();
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <DialogTitle>Importar documento PDF</DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 1, display: 'grid', gap: 2 }}>
          <Alert severity="info">
            Selecciona un archivo en formato <strong>PDF</strong>. Tamaño máximo sugerido: 25 MB.
          </Alert>

          <Button variant="outlined" component="label" disabled={loading}>
            Seleccionar PDF
            <input type="file" hidden accept="application/pdf,.pdf" onChange={handleFileChange} />
          </Button>

          {file && (
            <TextField
              label="Archivo seleccionado"
              value={file.name}
              fullWidth
              disabled
            />
          )}

          {error && <Alert severity="error">{error}</Alert>}

          {loading && <LinearProgress />}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!file || !!error || loading}
        >
          Importar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
