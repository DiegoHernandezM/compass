import StudentLayout from '@/Layouts/StudentLayout';
import { Head, usePage } from '@inertiajs/react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import BarcodeReaderIcon from '@mui/icons-material/BarcodeReader';

export default function Subjects() {
  const { props } = usePage();
  const { subjects } = props;
  const [guideOpen, setGuideOpen] = useState(false);

  const [instruction, setInstruction] = useState(null);
  const [pdfOpen, setPdfOpen] = useState(false);

  useEffect(() => {
    // Cargar el instructivo más reciente (o primero de la lista)
    const fetchInstruction = async () => {
      try {
        const { data } = await axios.get(route('question.instructions.index'));
        // data: [{id, original_name, path, created_at}, ...]
        if (Array.isArray(data) && data.length > 0) {
          setInstruction(data[0]);
        }
      } catch (e) {
        console.error('No se pudo cargar el instructivo:', e);
      }
    };
    fetchInstruction();
  }, []);

  useEffect(() => {
    if (!instruction) return;

    const key = "compass_seen_instructions_prompt_v1";
    const alreadySeen = localStorage.getItem(key);

    if (!alreadySeen) {
      setGuideOpen(true);
    }
  }, [instruction]);

  const handleCloseGuide = () => {
    localStorage.setItem("compass_seen_instructions_prompt_v1", "1");
    setGuideOpen(false);
  };

  const handleOpenPdfFromGuide = () => {
    // marca como visto para que no salga cada vez
    localStorage.setItem("compass_seen_instructions_prompt_v1", "1");
    setGuideOpen(false);
  };

  const handleStartTest = async (subject) => {
    try {
      const response = await axios.post(route('student.test.create'), {
        subject_id: subject.id,
        level_id: subject.level_id,
      });
      const test = response.data.test.test;
      if (test?.id) {
        router.get(`/student/test/${test.id}/${subject.id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <StudentLayout>
      <Head title="Materias - Estudiante" />
      <Box
        sx={{
          bgcolor: '#f5f6fa', // gris opaco suave
          minHeight: '100vh',
          py: 4,
          px: { xs: 2, sm: 4, md: 6 },
        }}
      >
        <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
          <Grid container spacing={4} justifyContent="center">
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
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: '#1e1e1e',
                    color: '#fff',
                  }}
                  elevation={4}
                >
                  {/* Imagen arriba con letra sobrepuesta */}
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={subject.image ? `/storage/${subject.image}` : '/images/default.jpg'}
                      alt={subject.name}
                      sx={{
                        width: '100%',
                        height: 180, // altura fija en px (ajústalo a tu gusto)
                        objectFit: 'cover',
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                      }}
                    />

                    {/* Overlay oscuro */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Ajusta la opacidad si lo quieres más oscuro
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        boxShadow: 3,
                        color: '#fff',
                        px: 1.2,
                        py: 0.5,
                        fontSize: 11,
                        fontWeight: 'bold',
                        borderRadius: 1,
                        zIndex: 3,
                      }}
                    >
                      {subject?.level_name}
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                        fontWeight: 'bold',
                        color: '#fff',
                        boxShadow: 3,
                      }}
                    >
                      {/* Progress circular como fondo */}
                      <CircularProgress
                        variant="determinate"
                        value={subject.progress || 0}
                        size={63}
                        thickness={3}
                        sx={{
                          position: 'absolute',
                          color: '#e6fc6a',
                          zIndex: 1,
                        }}
                      />

                      {/* Letra sobrepuesta con efecto burbuja */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 52, // 👈 ligeramente más pequeño para separarlo del progress
                          height: 52,
                          borderRadius: '50%',
                          background: `linear-gradient(145deg, ${subject.color || '#555'} 30%, #ffffff20)`, // efecto de brillo
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 26,
                          fontWeight: 'bold',
                          color: '#fff',
                          boxShadow: `
                            0 2px 4px rgba(0, 0, 0, 0.2),
                            inset 0 1px 2px rgba(255, 255, 255, 0.3)
                          `, // efecto 3D tipo burbuja
                          zIndex: 2,
                        }}
                      >
                        {subject.name.charAt(0)}
                      </Box>
                    </Box>
                  </Box>

                  {/* Contenido inferior */}
                  <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', bgcolor: '#fff', color: '#000' }}>
                    <Typography
                      variant="overline"
                      gutterBottom
                      sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center', color: '#000' }}
                    >
                      {subject.name.toUpperCase()}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#555', // gris oscuro para descripción
                        mb: 2,
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {subject.description}
                    </Typography>

                    {/* Botón estilo link */}
                    <Box sx={{ mt: 'auto', textAlign: 'left' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          textTransform: 'none',
                          fontWeight: 500,
                          fontSize: '0.6rem',
                          backgroundColor: '#fff',
                          color: '#4f4f4f',
                          borderRadius: '999px',
                          borderColor: '#ccc',
                          padding: '4px 12px',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            borderColor: '#bbb',
                          },
                          minWidth: 'auto',
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
        </Box>
      </Box>

      {/* Dialog UX: aviso instructivo */}
      <Dialog
        open={guideOpen}
        onClose={handleCloseGuide}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ pr: 6 }}>
          Antes de empezar 🙌
          <IconButton
            aria-label="cerrar"
            onClick={handleCloseGuide}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: "rgba(25, 118, 210, 0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <BarcodeReaderIcon color="warning" />
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                Revisa el instructivo
              </Typography>

              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Te tomará menos de 1 minuto y te evita errores comunes. Puedes abrirlo
                tocando el ícono de ALERTA (<BarcodeReaderIcon color="warning" sx={{ fontSize: 18, verticalAlign: "text-bottom" }} />)
                en la parte superior.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>

            <Button
              fullWidth
              variant="contained"
              onClick={handleCloseGuide}
            >
              Entendido
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
}
