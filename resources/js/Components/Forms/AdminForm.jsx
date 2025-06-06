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
import { useTheme } from '@mui/material/styles';

export default function AdminForm({ open, onClose, admin = null }) {
  const theme = useTheme();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (admin) {
      setForm({
        name: admin.name || '',
        email: admin.email || '',
        password: '',
      });
    } else {
      setForm({ name: '', email: '', password: '' });
    }
  }, [admin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      role: 'admin',
    };
    if (admin) {
      const id = admin.id;
      Inertia.post(route('admins.update', id), {
        ...payload,
        _method: 'PUT',
      });
    } else {
      Inertia.post(route('admins.store'), payload);
    }
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Box sx={{ width: 360, p: 3 }} role="presentation">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {admin ? 'Editar Administrador' : 'Nuevo Administrador'}
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
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            margin="normal"
            helperText={admin ? 'Deja en blanco si no deseas cambiar la contraseña' : ''}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            {admin ? 'Actualizar' : 'Crear'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
