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
    image: null,
  });

  useEffect(() => {
    if (subject) {
      setForm({
        name: subject.name || '',
        desciption: subject.desciption || '',
        image: null,
      });
    } else {
      setForm({ name: '', desciption: '', image: null });
    }
  }, [subject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
            name="desciption"
            value={form.desciption}
            onChange={handleChange}
            margin="normal"
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
