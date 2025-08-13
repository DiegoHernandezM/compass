import React from 'react';
import { Head } from '@inertiajs/react';
import { Grid, Card, CardContent, Typography, Box, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid, Legend } from 'recharts';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';


export default function Dashboard({ kpis = {}, incomeSeries = [], testsBySubject = [], topStudents = [] }) {
  const currency = (n=0) =>
    new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN', maximumFractionDigits:2 }).format(n);

  const cards = [
    { label: 'Estudiantes', value: kpis.studentsCount ?? 0 },
    { label: 'Ingresos totales', value: currency(kpis.revenueTotal ?? 0) },
    { label: 'Materias', value: kpis.subjectsCount ?? 0 },
    { label: 'Suscripciones activas', value: kpis.activeSubscriptions ?? 0 },
    { label: 'Promedio general', value: `${kpis.avgPercent ?? 0}%` },
  ];
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <Box sx={{ p: { xs: 2, md: 3 } }}>
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
                  <Grid key={i} item xs={12} sm={6} md={4} lg={3}>
                    <Card sx={{
                      background: 'linear-gradient(135deg, #203764 0%, #1b2e52 100%)',
                      color: 'white',
                      boxShadow: 8,
                      borderRadius: 3,
                      height: '100%'
                    }}>
                      <CardContent>
                        <Typography variant="overline" sx={{ opacity: .85 }}>{k.label}</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, mt: .5 }}>{k.value}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Box>

              {/* Ingresos (70%) + Repetición por materia (30%) */}
              <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }} sx={{ marginBottom: '20px' }}>
                <Grid size={{ xs: 12, sm: 12, md: 6 }} sx={{ display: 'flex' }}>
                  <Card sx={{ flex: 1, width: '100%', boxShadow: 9 }}>
                    <CardContent sx={{ height: '100%' }}>
                      <Typography variant="h6" gutterBottom>Ingresos por mes</Typography>
                      <Box sx={{ height: 260 }}>
                        <ResponsiveContainer>
                          <LineChart data={incomeSeries}>
                            <XAxis dataKey="ym" />
                            <YAxis />
                            <Tooltip formatter={(v) => currency(v)} />
                            <Line type="monotone" dataKey="amount" stroke="#22c55e" dot={false}/>
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 6 }} sx={{ display: 'flex' }}>
                  <Card sx={{ flex: 1, width: '100%', boxShadow: 9 }}>
                    <CardContent sx={{ height: '100%' }}>
                      <Typography variant="h6" gutterBottom>Repetición de test por materia</Typography>
                      <Box sx={{ height: 260 }}>
                        <ResponsiveContainer>
                          <BarChart data={testsBySubject}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" hide />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="tests" name="Tests" fill="#8884d8" />
                            <Bar dataKey="percent" name="% Prom." fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Top estudiantes */}
              <Card sx={{ flex: 1, width: '100%', boxShadow: 9 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Estudiantes con más tests</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell align="right">Tests</TableCell>
                        <TableCell align="right">% Promedio</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topStudents.map((s, i) => (
                        <TableRow key={i} hover>
                          <TableCell>{s.name}</TableCell>
                          <TableCell align="right">{s.tests_count}</TableCell>
                          <TableCell align="right">{s.avg_percent}%</TableCell>
                        </TableRow>
                      ))}
                      {topStudents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Typography variant="body2" color="text.secondary">Sin datos suficientes.</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Box>
        </AuthenticatedLayout>
    );
}
