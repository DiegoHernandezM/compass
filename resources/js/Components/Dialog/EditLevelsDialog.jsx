import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Divider,
  Typography,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from 'react';

export default function EditLevelsDialog({ open, onClose, levels = [], onChange }) {
  const [localLevels, setLocalLevels] = useState([]);

  useEffect(() => {
    setLocalLevels(levels || []);
  }, [levels]);

  const handleChange = (index, field, value) => {
    const updated = [...localLevels];
    updated[index][field] = value;
    setLocalLevels(updated);
    onChange(updated);
  };

  const handleAddLevel = () => {
    const newLevel = {
      id: `new-${Date.now()}`,
      name: '',
      description: '',
      question_type_id: 1
    };
    const updated = [...localLevels, newLevel];
    setLocalLevels(updated);
    onChange(updated);
  };

  const handleRemoveLevel = (index) => {
    if (localLevels.length <= 1) return;
    const updated = [...localLevels];
    updated.splice(index, 1);
    setLocalLevels(updated);
    onChange(updated);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        backdrop: {
          sx: {
            zIndex: (theme) => theme.zIndex.drawer + 2001
          }
        }
      }}
      PaperProps={{
        sx: {
          zIndex: (theme) => theme.zIndex.drawer + 2002
        }
      }}
    >
      <DialogTitle>Editar Niveles</DialogTitle>
      <DialogContent dividers>
        {localLevels.length === 0 && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            No hay niveles registrados.
          </Typography>
        )}

        {localLevels.map((level, index) => (
          <Box key={level.id || index} sx={{ mt: 2 }}>
            {index !== 0 && <Divider sx={{ my: 2 }} />}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">NIVEL</Typography>
              <IconButton
                color="error"
                onClick={() => handleRemoveLevel(index)}
                disabled={localLevels.length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Box>

            <TextField
              label="Nombre"
              fullWidth
              value={level.name}
              onChange={(e) => handleChange(index, 'name', e.target.value)}
              sx={{ mb: 1 }}
            />
            <TextField
              label="Descripción"
              fullWidth
              value={level.description}
              onChange={(e) => handleChange(index, 'description', e.target.value)}
            />
          </Box>
        ))}

        <Button variant="outlined" onClick={handleAddLevel} sx={{ mt: 3 }}>
          Agregar nivel
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
