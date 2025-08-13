import { Box, Card, CardContent, Grid, Typography, Chip, Divider } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function ResultsDashboard({ stats, subjectsMap = {} }) {
  const {
    testsTaken, testsCompleted, completionRate,
    avgPercent, bestPercent, latestPercent,
    avgDurationSec,
    timeline = [],
    bySubject = [],
    byType = [],
    byLevel = [],
    recentMistakes = [],
  } = stats || {};

  const fmtTime = s => {
    const m = Math.floor(s / 60), r = s % 60;
    return `${m}m ${r}s`;
    // no styles here; keep minimal
  };

  return (
    <Box sx={{ p: 2, maxWidth: 1200, mx: 'auto' }}>
      {/* KPIs */}
      <Grid container spacing={2} mb={2}>
        {[
          {label:'Promedio', value:`${avgPercent}%`},
          {label:'Mejor', value:`${bestPercent}%`},
          {label:'Último', value:`${latestPercent}%`},
          {label:'Completados', value:`${testsCompleted}/${testsTaken}`},
          {label:'% Finalización', value:`${completionRate}%`},
          {label:'Tiempo prom.', value:fmtTime(avgDurationSec)},
        ].map((kpi, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card><CardContent>
              <Typography variant="overline" color="text.secondary">{kpi.label}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{kpi.value}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      {/* Evolución */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Evolución de puntaje</Typography>
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={timeline}>
                <XAxis dataKey="date" hide />
                <YAxis domain={[0,100]} />
                <Tooltip />
                <Line type="monotone" dataKey="percent" stroke="#1976d2" dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {/* Por materia */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Accuracy por materia</Typography>
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={bySubject.map(s => ({
                    name: subjectsMap[s.subject_id] || `Materia ${s.subject_id}`,
                    percent: s.total ? Math.round(100*s.correct/s.total) : 0,
                  }))}>
                    <XAxis dataKey="name" hide />
                    <YAxis domain={[0,100]} />
                    <Tooltip />
                    <Bar dataKey="percent" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Por tipo */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Por tipo de pregunta</Typography>
              <Box sx={{ height: 260, display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%">
                  <PieChart>
                    <Pie
                      data={byType.map(t => ({
                        name: t.type || 'N/A',
                        value: t.total ? Math.round(100*t.correct/t.total) : 0
                      }))}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                      label
                    >
                      {byType.map((_, i) => <Cell key={i} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Errores recientes */}
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Errores recientes</Typography>
          {recentMistakes.length === 0 ? (
            <Typography variant="body2" color="text.secondary">¡Sin errores recientes! 🎉</Typography>
          ) : (
            recentMistakes.map((m, i) => (
              <Box key={i} sx={{ py: 1.2 }}>
                <Typography variant="subtitle2">{m.type || 'Pregunta'}</Typography>
                <Typography variant="body2" sx={{ mb: .5 }}>{m.question_text?.slice(0, 160)}</Typography>
                {(m.correct_answer || m.user_answer) && (
                  <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
                    <Chip size="small" label={`Correcta: ${m.correct_answer ?? '—'}`} />
                    <Chip size="small" color="warning" label={`Tu respuesta: ${m.user_answer ?? '—'}`} />
                  </Box>
                )}
                {i < recentMistakes.length - 1 && <Divider sx={{ mt: 1.2 }} />}
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
