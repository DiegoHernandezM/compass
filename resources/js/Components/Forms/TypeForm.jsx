import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Inertia } from '@inertiajs/inertia';

import EditLevelsDialog from '../Dialog/EditLevelsDialog';

export default function TypeForm({ open, onClose, type = null, onSubmit }) {
  const [openEditLevelsDialog, setOpenEditLevelsDialog] = useState(false);
  const [levels, setLevels] = useState([]);
  const [form, setForm] = useState({
    type_id: '',
    name: '',
    description: ''
  });

  useEffect(() => {
    if (type) {
      setForm({
        type_id: type.id || '',
        name: type.name || '',
        description: type.description || ''
      });
      setLevels(type.levels || []);
    } else {
      setForm({
        type_id: type?.id || '',
        name: '',
        description: ''
      });
      setLevels([]);
    }
  }, [type]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, levels };
    onSubmit(payload);
    onClose();
  };

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: (theme) => theme.zIndex.drawer + 10 }}>
        <Box sx={{ width: 400, p: 3 }} role="presentation">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {type ? 'Editar tipo de cuestionario' : 'Nuevo tipo de cuestionario'}
            </Typography>
            <IconButton onClick={onClose}><CloseIcon /></IconButton>
          </Box>

          <Box component="form" onSubmit={handleSubmit} mt={2}>
            <TextField
              label="Nombre"
              name="name"
              fullWidth
              value={form.name}
              onChange={handleFormChange}
              required
            />

            <TextField
              label="Descripción"
              name="description"
              fullWidth
              value={form.description}
              onChange={handleFormChange}
              margin="normal"
              required
            />

            <Button
              type="button"
              variant="text"
              color="secondary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => setOpenEditLevelsDialog(true)}
            >
              Editar niveles
            </Button>

            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              {type ? 'Actualizar' : 'Crear'}
            </Button>
          </Box>
        </Box>
      </Drawer>

      <EditLevelsDialog
        open={openEditLevelsDialog}
        onClose={() => setOpenEditLevelsDialog(false)}
        levels={levels}
        onChange={setLevels}
      />
    </>

  );
}
