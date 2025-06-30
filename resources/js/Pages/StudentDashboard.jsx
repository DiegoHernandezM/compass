import StudentLayout from '@/Layouts/StudentLayout';
import { Head } from '@inertiajs/react';
import { Box, Typography, Paper } from '@mui/material';
import PayPalComponent from "@/Components/PayPal/PayPalComponent.jsx";
import React from "react";
import { usePage } from '@inertiajs/react';


export default function StudentDashboard() {
  const { props } = usePage();
  const subscriptionExpired = props.subscriptionExpired;
  const user = props.user;
  const clientId = props.clientId

  return (
    <StudentLayout>
      <Head title="Inicio - Estudiante" />
      <Box sx={{ p: 2 }}>
        {subscriptionExpired ? (
          <Box
            sx={{
              minHeight: '60vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" color="error" gutterBottom>
              Tu suscripción ha expirado.
            </Typography>
            <Typography sx={{ mb: 4 }}>
              Por favor renueva tu suscripción para continuar utilizando la plataforma.
            </Typography>

            <Box sx={{ maxWidth: 500, width: '100%' }}>
              <PayPalComponent user={user} clientId={clientId} isRenovation={subscriptionExpired} />
            </Box>
          </Box>
        ) : (
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
              ¡Bienvenido al panel del estudiante!
            </Typography>
            <Typography>
              Desde aquí podrás acceder a tus materias, simulacros y revisar tu progreso.
            </Typography>
          </Paper>
        )}
      </Box>
    </StudentLayout>
  );
}
