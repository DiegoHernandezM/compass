import React, { useState, useEffect } from 'react';
import { Box, AppBar, TextField, Button, Typography, Card, CardContent, Dialog, Toolbar, IconButton, Slide } from '@mui/material';
import { Inertia } from '@inertiajs/inertia';
import { Head } from '@inertiajs/react';
import CloseIcon from '@mui/icons-material/Close';

import { usePage } from '@inertiajs/react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Prev from './Prev';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Edit({ landingContent }) {
  const successMessage = usePage().props?.flash?.success ?? null;
  const [open, setOpen] = useState(!!successMessage);
  const [openDialog, setOpenDialog] = useState(false);

  const [form, setForm] = useState({
    main_title: landingContent.main_title || '',
    subtitle: landingContent.subtitle || '',
    principal_text: landingContent.principal_text || '',
    compatible_text: landingContent.compatible_text || '',
    lower_title: landingContent.lower_title || '',
    lower_text_1: landingContent.lower_text_1 || '',
    lower_text_2: landingContent.lower_text_2 || '',
    lower_text_3: landingContent.lower_text_3 || '',
    lower_text_4: landingContent.lower_text_4 || '',
    subscribe_button: landingContent.subscribe_button || '',
    login_button: landingContent.login_button || '',
    whatsapp_number: landingContent.whatsapp_number || '',
    video: null,
  });

  useEffect(() => {
    if (successMessage) {
      setOpen(true);
    }
  }, [successMessage]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Inertia.post(route('landing.update'), form, {
      forceFormData: true,
    });
  };

  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Landing
        </h2>
      }
    >
      <Head title="Editar Landing" />
      <Card mb={12}>
        <Snackbar
          open={open}
          autoHideDuration={4000}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Administración de Landing
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button type="button" variant="contained" onClick={handleClickOpen}>
              Previsualización
            </Button>
          </Box>
          <form onSubmit={handleSubmit}>
            <Typography variant="subtitle1">Información principal</Typography>
            <TextField fullWidth label="Título principal" name="main_title" value={form.main_title} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Subtítulo" name="subtitle" value={form.subtitle} onChange={handleChange} margin="normal" />
            <TextField fullWidth multiline rows={3} label="Texto principal" name="principal_text" value={form.principal_text} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Texto de compatibilidad" name="compatible_text" value={form.compatible_text} onChange={handleChange} margin="normal" />

            <Typography variant="subtitle1" sx={{ mt: 2 }}>Información inferior</Typography>
            <TextField fullWidth label="Título inferior" name="lower_title" value={form.lower_title} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Texto inferior 1" name="lower_text_1" value={form.lower_text_1} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Texto inferior 2" name="lower_text_2" value={form.lower_text_2} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Texto inferior 3" name="lower_text_3" value={form.lower_text_3} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Texto inferior 4" name="lower_text_4" value={form.lower_text_4} onChange={handleChange} margin="normal" />

            <Typography variant="subtitle1" sx={{ mt: 2 }}>Otros</Typography>
            <TextField fullWidth label="Texto del botón suscribir" name="subscribe_button" value={form.subscribe_button} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Texto del botón login" name="login_button" value={form.login_button} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Número de WhatsApp" name="whatsapp_number" value={form.whatsapp_number} onChange={handleChange} margin="normal" />

            <Box mt={2}>
              <label>Subir video:</label>
              <input type="file" name="video" accept="video/*" onChange={handleChange} />
            </Box>

            <Button type="submit" variant="contained" sx={{ mt: 3 }}>
              Guardar
            </Button>
          </form>
        </CardContent>
      </Card>
      <Dialog
        fullScreen
        open={openDialog}
        onClose={handleClose}
        slots={{
          transition: Transition,
        }}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Previsualización
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              CERRAR
            </Button>
          </Toolbar>
        </AppBar>
        <Prev content={form} />
      </Dialog>
    </AuthenticatedLayout>
  );
}
