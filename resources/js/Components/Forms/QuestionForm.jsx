import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Inertia } from '@inertiajs/inertia';

export default function SubjectForm({ open, onClose, subject = null }) {
  const [form, setForm] = useState({
    name: '',
    desciption: '',
    color: '#ff0000',
    image: null,
  });

  useEffect(() => {
    if (subject) {
      setForm({
        name: subject.name || '',
        description: subject.description || '',
        color: subject.color || '',
        image: null,
      });
    } else {
      setForm({ name: '', description: '', image: null });
    }
  }, [subject]);

  const handleChange = (e) => {
    const { name, type, files, value } = e.target;
    if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form
    };
    if (subject) {
      Inertia.post(route('subject.update', subject.id), {
        ...payload,
        _method: 'PUT',
      }, { forceFormData: true });
    } else {
      Inertia.post(route('subject.store'), payload, { forceFormData: true });
    }
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Box sx={{ width: 360, p: 3 }} role="presentation">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {subject ? 'Editar Materia' : 'Nueva Materia'}
          </Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        <Box component="form" onSubmit={handleSubmit} mt={2}>
          <TextField
            fullWidth
            label="Nombre"
            name="name"
            value={form.name}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Descripción"
            name="description"
            value={form.description}
            onChange={handleChange}
            margin="normal"
          />
          <Typography variant="subtitle2" gutterBottom>Color</Typography>
          <input
            type="color"
            name="color"
            value={form.color}
            onChange={handleChange}
            style={{ width: '100%', height: 40, border: 'none' }}
          />
          <input
            type="file"
            name="image"
            onChange={handleChange}
            style={{ marginTop: 16 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            {subject ? 'Actualizar' : 'Crear'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
