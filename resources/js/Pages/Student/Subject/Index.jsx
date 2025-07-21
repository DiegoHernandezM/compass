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
        router.get(`/student/test/${test.id}/${subject.id}`);
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
                xs={12}
                sm={6}
                md={4}
                lg={3}
                xl={2}
                sx={{ display: 'flex', justifyContent: 'center' }}
              >
                <Card
                  sx={{
                    width: 260,
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundImage: `url(${subject.image ? `/storage/${subject.image}` : '/images/default.jpg'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    p: 2,
                  }}
                  elevation={6}
                >
                  {/* Overlay para oscurecer imagen y dar contraste */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      zIndex: 1,
                    }}
                  />

                  {/* Contenido encima del overlay */}
                  <Box sx={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Círculo con letra */}
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        backgroundColor: subject.color || '#555',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                        fontWeight: 'bold',
                        color: '#fff',
                        mb: 2,
                      }}
                    >
                      {subject.name.charAt(0)}
                    </Box>

                    {/* Nombre */}
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {subject.name.toUpperCase()}
                    </Typography>

                    {/* Descripción */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#ccc',
                        mb: 2,
                        maxWidth: '90%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {subject.description}
                    </Typography>

                    {/* Enlace estilo botón */}
                    <Box>
                      <Button
                        size="small"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 'bold',
                          backgroundColor: 'transparent',
                          color: '#4dabf7',
                          '&:hover': {
                            textDecoration: 'underline',
                            backgroundColor: 'transparent',
                          },
                          p: 0,
                          minWidth: 'unset',
                        }}
                        onClick={() => handleStartTest(subject)}
                      >
                        {subject.progress > 0 ? 'Continuar práctica' : 'Iniciar práctica'}
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </StudentLayout>
  );
}
