import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Inertia } from '@inertiajs/inertia';
import { useTheme } from '@mui/material/styles';

export default function StudentForm({ open, onClose, student = null }) {
  const theme = useTheme();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    birthdate: '',
    gender: '',
    phone: '',
    address: '',
    zip_code: '',
    city: '',
    country: '',
    school: '',
  });

  useEffect(() => {
    if (student) {
      setForm({
        name: student.user?.name || '',
        email: student.user?.email || '',
        password: '',
        birthdate: student.birthdate || '',
        gender: student?.gender || '',
        phone: student.phone || '',
        address: student.address || '',
        zip_code: student.zip_code || '',
        city: student.city || '',
        country: student.country || '',
        school: student.school || '',
      });
    } else {
      setForm({
        name: '',
        email: '',
        password: '',
        birthdate: '',
        phone: '',
        address: '',
        zip_code: '',
        city: '',
        country: '',
        school: '',
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      role: 'student',
    };

    if (student) {
      Inertia.post(route('students.update', student.id), {
        ...payload,
        _method: 'PUT',
      });
    } else {
      console.log(payload);
      Inertia.post(route('students.store'), payload);
    }

    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Box sx={{ width: 400, p: 3 }} role="presentation">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {student ? 'Editar Estudiante' : 'Nuevo Estudiante'}
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
            label="Correo electrónico"
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
            helperText={student ? 'Deja en blanco si no deseas cambiar la contraseña' : ''}
          />
          <TextField
            fullWidth
            label="Fecha de nacimiento"
            name="birthdate"
            type="date"
            value={form.birthdate}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <InputLabel id="gender-label">Género</InputLabel>
          <Select
            fullWidth
            name="gender"
            value={form.gender || ''}
            label="Género"
            onChange={handleChange}
          >
            <MenuItem value="Masculino">Masculino</MenuItem>
            <MenuItem value="Femenino">Femenino</MenuItem>
            <MenuItem value="Otro">Otro</MenuItem>
          </Select>
          <TextField
            fullWidth
            label="Teléfono"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Dirección"
            name="address"
            value={form.address}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="CP"
            name="zip_code"
            value={form.zip_code}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Ciudad"
            name="city"
            value={form.city}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Pais"
            name="country"
            value={form.country}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Escuela"
            name="school"
            value={form.school}
            onChange={handleChange}
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            {student ? 'Actualizar' : 'Crear'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
