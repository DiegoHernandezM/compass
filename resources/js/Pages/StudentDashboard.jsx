import StudentLayout from '@/Layouts/StudentLayout';
import { Head } from '@inertiajs/react';
import { Box, Typography, Paper } from '@mui/material';

export default function StudentDashboard() {
  return (
    <StudentLayout>
      <Head title="Inicio - Estudiante" />

      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          ¡Bienvenido al panel del estudiante!
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Typography>
            Desde aquí podrás acceder a tus materias, simulacros y revisar tu progreso.
          </Typography>
        </Paper>
      </Box>
    </StudentLayout>
  );
}
