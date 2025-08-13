import React from "react";
import { Head, Link, usePage } from '@inertiajs/react';
import { Box, Typography, Paper, Card, CardContent, Grid, Button } from '@mui/material';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip
} from 'recharts';
import StudentLayout from '@/Layouts/StudentLayout';
import PayPalComponent from "@/Components/PayPal/PayPalComponent.jsx";



export default function StudentDashboard() {
  const { kpis, sparkline, quick, subjectsTop, user, clientId, subscriptionExpired} = usePage().props;
  console.log(usePage().props);

  const fmtPct = (n) => `${n ?? 0}%`;

  const cards = [
    { label: 'Promedio', value: fmtPct(kpis?.avgPercent) },
    { label: 'Mejor', value: fmtPct(kpis?.bestPercent) },
    { label: 'Último', value: fmtPct(kpis?.latestPercent) },
    { label: 'Completados', value: `${kpis?.testsCompleted ?? 0}/${kpis?.testsTaken ?? 0}` },
    { label: '% Finalización', value: fmtPct(kpis?.completionRate) },
  ];


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
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              {/* Mensaje motivacional */}
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                ¡Hola! {user?.name} 👋
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Aquí tienes un resumen rápido de tu progreso y accesos directos para continuar.
              </Typography>

              {/* KPIs */}
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,                // espacio entre cards (equiv. a spacing={2})
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  width: '100%',
                  mb: 2,
                }}
              >
                {cards.map((k, i) => (
                  <Card
                    key={i}
                    sx={{
                      background: 'linear-gradient(135deg, #203764 0%, #203764 90%)',
                      color: 'white',
                      boxShadow: 9,
                      borderRadius: 3,
                      height: '100%',
                      display: 'flex',          // para estirar contenido verticalmente si agregas más cosas
                      alignItems: 'stretch',
                    }}
                  >
                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="overline" sx={{ opacity: 0.85 }}>
                        {k.label}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                        {k.value}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>

              {/* Sparkline + Acciones */}
              <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                {/* Evolución reciente - 70% en desktop, 100% en móvil */}
                <Grid size={{ xs: 12, sm: 12, md: 8 }} sx={{ display: 'flex' }}>
                  <Card sx={{ flex: 1, width: '100%', boxShadow: 9 }}>
                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" gutterBottom>Evolución reciente</Typography>

                      {/* ocupa el resto del alto disponible */}
                      <Box sx={{ flex: 1, minHeight: 180, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={sparkline || []}>
                            <XAxis dataKey="label" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="percent" stroke="#22c55e" dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Acciones rápidas - 30% en desktop, 100% en móvil */}
                <Grid size={{ xs: 12, sm: 12, md: 4 }} sx={{ display: 'flex' }}>
                  <Card sx={{ flex: 1, boxShadow: 9 }}>
                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" gutterBottom>Acciones rápidas</Typography>

                      {/* empuja el contenido hacia arriba pero permite crecer si hay más botones */}
                      <Box sx={{ mt: 1, display: 'grid', gap: 1.2 }}>
                        {quick?.continueTest ? (
                          <Button
                            variant="contained"
                            size="large"
                            onClick={() =>
                              window.location.href = route('student.test.show', quick.continueTest.test_id)
                            }
                          >
                            Continuar último test ({quick?.continueTest?.subject ?? '—'})
                          </Button>
                        ) : (
                          <Button variant="outlined" size="large" disabled>
                            No tienes tests pendientes
                          </Button>
                        )}

                        {quick?.weakestSubject ? (
                          <Button
                            variant="text"
                            onClick={() => window.location.href = route('student.subject.index')}
                          >
                            Reforzar: {quick?.weakestSubject?.name} ({quick?.weakestSubject?.average}%)
                          </Button>
                        ) : null}
                      </Box>

                      {/* opcional: empujar botones al centro vertical si quieres */}
                      {/* <Box sx={{ flex: 1 }} /> */}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>



              {/* Top materias (resumen) */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Top materias</Typography>
                  <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    {(subjectsTop || []).map((s, i) => (
                      <Grid size={{ xs: 12, sm: 12, md: 3 }} key={i}>
                        <Card sx={{ borderRadius: 3, maxHeight: 120, minHeight: 120,  boxShadow: 9 }}>
                          <CardContent>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                              {s.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Intentos: {s.attempts}
                            </Typography>
                            <Typography variant="body2">Promedio: {s.average}%</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Box>
        )}
      </Box>
    </StudentLayout>
  );
}
