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
import { Inertia } from '@inertiajs/inertia';
import { router } from '@inertiajs/react';


export default function Subjects() {
  const { props } = usePage();
  const { subjects } = props;

  const isDarkColor = (hex) => {
    if (!hex) return false;
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };


  const handleStartTest = async (subject) => {
    try {
      const response = await axios.post(route('student.test.create'), {
        subject_id: subject.id,
      });
      const test = response.data.test.test;
      if (test?.id) {
        console.log('entro');
        console.log(test.id);
        router.get(`/student/test/${test.id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

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
                xs={6}
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
                  <Box sx={{ flexGrow: 1 }}>
                    <CardContent
                      sx={{
                        maxWidth: 200,
                        backgroundColor: subject.color,
                        color: isDarkColor(subject.color) ? '#fff' : '#000',
                      }}
                    >
                      <Typography gutterBottom variant="h5" component="div">
                        {subject.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          mt: 2,
                          color: isDarkColor(subject.color) ? '#fff' : '#000'
                        }}>
                        {subject.description}
                      </Typography>
                    </CardContent>
                  </Box>
                  <CardActions sx={{ mt: 'auto' }}>
                    <Button size="small" onClick={() => handleStartTest(subject)}>
                      {subject.progress > 0 ? 'Continuar Práctica' : 'Iniciar Práctica'}
                    </Button>
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
