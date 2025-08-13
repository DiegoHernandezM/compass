import { Head } from '@inertiajs/react';
import StudentLayout from '@/Layouts/StudentLayout';

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { alpha, useTheme } from '@mui/material/styles';

import SubjectsBar from '@/Components/Charts/SubjectsBar';

export default function ResultsDashboard({ stats }) {
  const theme = useTheme();
  // Paleta simple (puedes ampliarla o hacer un generador)
  const palette = [
    '#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#00838f', '#5d4037',
    '#c2185b', '#7b1fa2', '#388e3c', '#f57c00', '#455a64'
  ];
  const {
    testsTaken, testsCompleted, completionRate,
    avgPercent, bestPercent, latestPercent,
    avgDurationSec,
    timeline = [],
    recentMistakes = [],
    subjectsChart = [],
    subjectSummary = [],
    multiTimeline = [], 
    subjectKeys = []
  } = stats || {};

  const fmtTime = s => {
    const m = Math.floor(s / 60), r = s % 60;
    return `${m}m`;
    // no styles here; keep minimal
  };

  return (
    <StudentLayout>
      <Head title="Resultados - Estudiante" />
      <Box sx={{ p: 2, maxWidth: 1200, mx: 'auto' }}>
        {/* KPIs */}
        <Grid
          container
          spacing={2}
          mb={2}
          alignItems="stretch"
        >
          {[
            {label:'Promedio', value:`${avgPercent}%`},
            {label:'Mejor', value:`${bestPercent}%`},
            {label:'Último', value:`${latestPercent}%`},
            {label:'Completados', value:`${testsCompleted}/${testsTaken}`},
            {label:'% Finalización', value:`${completionRate}%`},
            {label:'Tiempo prom.', value:fmtTime(avgDurationSec)},
          ].map((kpi, i) => (
            <Grid
              item
              xs={12}        // 1 por fila en móvil
              sm={6}         // 2 por fila en pantallas pequeñas
              md={4}         // 3 por fila en medianas
              lg={3}         // 4 por fila en grandes
              xl={2}         // 6 por fila en extra grandes (ideal para 6 KPIs)
              key={i}
            >
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
                  background: `linear-gradient(135deg,
                    ${alpha(theme.palette.primary.main, 0.92)} 0%,
                    ${alpha(theme.palette.primary.dark, 0.92)} 100%)`,
                  color: '#fff',
                  position: 'relative',
                  transition: 'transform .2s ease, box-shadow .2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
                  },
                  // detalle sutil decorativo
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: -30,
                    top: -30,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: alpha('#FFFFFF', 0.08),
                    filter: 'blur(2px)',
                  },
                }}
              >
                <CardContent
                  sx={{
                    py: 3,
                    px: 3,
                    minHeight: 130,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      opacity: 0.9,
                      letterSpacing: 1,
                      fontWeight: 700,
                      color: alpha('#FFFFFF', 0.9),
                    }}
                  >
                    {kpi.label}
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      lineHeight: 1.1,
                      textShadow: '0 2px 6px rgba(0,0,0,0.35)',
                      mt: 1,
                      wordBreak: 'break-word',
                    }}
                  >
                    {kpi.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Evolución */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Evolución de puntaje por materia (por intento)
            </Typography>
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={multiTimeline} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="attempt" tickLine={false} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v, name) => [`${v}%`, name]} />
                  <Legend />
                  {subjectKeys.map((key, idx) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={palette[idx % palette.length]}
                      dot={false}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Box>
            <Typography variant="caption" color="text.secondary">
              El eje X representa el # de intento por materia (1 = primer test de esa materia, etc.).
            </Typography>
          </CardContent>
        </Card>
        {/* Por materia */}
        <SubjectsBar subjectsChart={subjectsChart} />

        {/* Errores recientes */}
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Materias destacadas (acumulado)
            </Typography>

            {subjectSummary?.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Aún no hay datos suficientes.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Materia</TableCell>
                      <TableCell align="right">Mejor</TableCell>
                      <TableCell align="right">Menor</TableCell>
                      <TableCell align="right">Repeticiones</TableCell>
                      <TableCell align="right">Promedio</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subjectSummary.map((row) => (
                      <TableRow key={row.subject_id}>
                        <TableCell>{row.subject}</TableCell>
                        <TableCell align="right">{row.best}%</TableCell>
                        <TableCell align="right">{row.worst}%</TableCell>
                        <TableCell align="right">{row.repetitions}</TableCell>
                        <TableCell align="right" style={{ fontWeight: 700 }}>
                          {row.avg}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </StudentLayout>
  );
}
