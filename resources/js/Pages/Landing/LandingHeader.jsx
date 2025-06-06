import { Box, Typography, Button } from '@mui/material';
import { Link } from '@inertiajs/react';

export default function LandingHeader() {
  return (
    <Box
      component="header"
      sx={{
        backgroundColor: '#223566', // azul marino
        color: 'white',
        px: 3,
        py: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Typography variant="h6" fontWeight="bold">
        Bienvenido Capitán
      </Typography>

      <Button
        component={Link}
        href={route('login')}
        color="inherit"
        sx={{ textTransform: 'none' }}
      >
        Iniciar sesión
      </Button>

      <Button
        component={Link}
        href={route('register')}
        color="inherit"
        sx={{ textTransform: 'none' }}
      >
        Registrar
      </Button>
    </Box>
  );
}
