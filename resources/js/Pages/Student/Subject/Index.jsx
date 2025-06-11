import StudentLayout from '@/Layouts/StudentLayout';
import { Head, usePage } from '@inertiajs/react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button
} from '@mui/material';

export default function Subjects() {
  const { props } = usePage();
  const { subjects } = props;

  return (
    <StudentLayout>
      <Head title="Materias - Estudiante" />

      <Box sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          ¡Bienvenido al panel del estudiante!
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={2} justifyContent="center">
            {subjects.map((subject) => (
              <Grid
                item
                key={subject.id}
                xs={6} // 6 columnas de 12 → 2 por fila
                sm={4}
                md={3}
                lg={3}
                xl={2}
                sx={{ display: 'flex', justifyContent: 'center' }}
              >
                <Card sx={{ maxWidth: 300 }}>
                  <CardMedia
                    sx={{ height: 140 }}
                    image={subject.image ? `/storage/${subject.image}` : '/images/default.jpg'}
                    title={subject.name}
                  />
                  <CardContent sx={{ maxWidth: 200 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {subject.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                      {subject.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">Iniciar Práctica</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </StudentLayout>
  );
}
