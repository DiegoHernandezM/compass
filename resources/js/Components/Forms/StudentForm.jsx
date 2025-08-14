import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  InputAdornment,
  FormControl,
  FormHelperText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Inertia } from '@inertiajs/inertia';
import { useTheme } from '@mui/material/styles';

export default function StudentForm({ open, onClose, student = null }) {
  const randomString = Math.random().toString(36).substring(2, 10);
  const [showPassword, setShowPassword] = useState(false);
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loadingZip, setLoadingZip] = useState(false);
  const [zipError, setZipError] = useState('');

  const today = new Date().toISOString().split("T")[0];
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
    expires_at: ''
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
        expires_at: student.user?.paypal_user?.expires_at.substring(0, 10) || '',
      });
    } else {
      setForm({
        name: '',
        email: '',
        password: randomString,
        birthdate: '',
        phone: '',
        address: '',
        zip_code: '',
        city: '',
        country: '',
        school: '',
        expires_at: ''
      });
    }
  }, [student]);

   // Debounce simple: espera 500ms tras teclear para consultar
  useEffect(() => {
    if (!form.zip_code || form.zip_code.length < 4) {
      setCities([]);
      setCountries([]);
      setZipError('');
      return;
    }

    const t = setTimeout(() => {
      lookupZip(form.zip_code, 'mx'); // ajusta el país si lo necesitas
    }, 500);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.zip_code]);

  const lookupZip = async (zip, country = 'mx') => {
    setLoadingZip(true);
    setZipError('');
    try {
      const { data } = await axios.get(route('zip.lookup'), {
        params: { zip, country }
      });

      const cityList = data.cities || [];
      const countryName = data.country || '';

      setCities(cityList);
      setCountries(countryName ? [countryName] : []);

      setForm(prev => ({
        ...prev,
        city: cityList[0] || '',
        country: countryName || '',
      }));
    } catch (e) {
      setCities([]);
      setCountries([]);
      setForm(prev => ({ ...prev, city: '', country: '' }));
      setZipError('No se encontró el código postal.');
      console.error(e);
    } finally {
      setLoadingZip(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'zip_code') {
      const digits = value.replace(/\D/g, '');
      setForm(prev => ({ ...prev, zip_code: digits }));
      return;
    }
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
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            margin="normal"
            helperText={student ? 'Deja en blanco si no deseas cambiar la contraseña' : ''}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
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
            inputProps={{ max: today }}
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
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            helperText={zipError || (loadingZip ? 'Buscando…' : '')}
            error={Boolean(zipError)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Ciudad</InputLabel>
            <Select
              name="city"
              value={form.city}
              onChange={handleChange}
              label="Ciudad"
              disabled={cities.length === 0}
            >
              {cities.length > 0 ? (
                cities.map((c, i) => (
                  <MenuItem key={i} value={c}>{c}</MenuItem>
                ))
              ) : (
                <MenuItem value="">Sin datos</MenuItem>
              )}
            </Select>
            <FormHelperText>Selecciona tu ciudad</FormHelperText>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>País</InputLabel>
            <Select
              name="country"
              value={form.country}
              onChange={handleChange}
              label="País"
              disabled={countries.length === 0}
            >
              {countries.length > 0 ? (
                countries.map((c, i) => (
                  <MenuItem key={i} value={c}>{c}</MenuItem>
                ))
              ) : (
                <MenuItem value="">Sin datos</MenuItem>
              )}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Escuela"
            name="school"
            value={form.school}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Fecha de expiración"
            name="expires_at"
            type="date"
            value={form.expires_at}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: today }}
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
