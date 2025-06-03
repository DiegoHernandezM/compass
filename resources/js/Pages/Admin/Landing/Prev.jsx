import { useState, useEffect } from 'react';
import { Box, Typography, Button, Avatar, useTheme, Tooltip, Grid, Container } from '@mui/material';
import { Link, usePage } from '@inertiajs/react';
import { styled } from '@mui/material/styles';
import { ArrowForward } from '@mui/icons-material';
import LaptopChromebookIcon from '@mui/icons-material/LaptopChromebook';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import ListIcon from '@mui/icons-material/List';

import introBackground from '@/assets/images/background_landing.png';

const ContainerFrame = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  padding: theme.spacing(4),
}));

const BrandIcon = styled('img')(({ theme }) => ({
  verticalAlign: 'middle',
  marginRight: theme.spacing(3),
  height: 'auto',
}));

const features = [
  {
    icon: <LaptopChromebookIcon fontSize="small" />,
    text: 'Estudiar con\ncuestionarios por\nmateria.',
  },
  {
    icon: <AddCircleOutlineIcon fontSize="small" />,
    text: 'Identificar respuestas\ncorrectas.',
  },
  {
    icon: <SearchIcon fontSize="small" />,
    text: 'Revisar explicación\nde ciertos\nescenarios.',
  },
  {
    icon: <ListIcon fontSize="small" />,
    text: 'Visualizar resultado\nfinal y progreso.',
  },
];

export default function Prev({ content }) {
  const theme = useTheme();
  const [triggerAnimation, setTriggerAnimation] = useState(false);
  useEffect(() => {
    setTimeout(() => setTriggerAnimation(true), 500);
  }, []);
  return (
    <>
      <Box
        component="header"
        sx={{
          backgroundColor: '#223566', // azul marino
          color: 'white',
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Bienvenido Capitán
        </Typography>

        <Button
          component={Link}
          href={route('login')}
          color="inherit"
          sx={{ textTransform: 'none' }}
        >
          Iniciar sesión
        </Button>
      </Box>
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          px: { xs: 2, md: 6 },
          backgroundImage: `url(${introBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 1,
          },
        }}
      >
        <Grid
          container
          spacing={4}
          alignItems="center"
          justifyContent="center"
          sx={{ position: 'relative', zIndex: 2 }}
        >
          {/* Video */}
          <Grid item xs={12} sm={6}>
            <ContainerFrame>
              <video
                width="100%"
                height="auto"
                controls
                style={{ borderRadius: '12px' }}
              >
                <source src={`/storage/${content?.video_path}`} type="video/mp4" />
                Tu navegador no soporta video.
              </video>
            </ContainerFrame>
          </Grid>

          {/* Texto */}
          <Grid item xs={12} sm={6}>
            <Box textAlign="center">

              <img
                src="/assets/logos/ais-normal.png"
                alt="Aviation In Sight Logo"
                style={{ width: '180px', marginBottom: '16px' }}
              />

              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {content?.subtitle}
              </Typography>

              <Typography color="textSecondary" paragraph>
                {content?.principal_text}
              </Typography>

              <Box my={4}>
                <Button
                  href="/auth/sign-up"
                  variant="contained"
                  color="secondary"
                  size="large"
                  endIcon={<ArrowForward />}
                >
                  {content?.subscribe_button}
                </Button>
              </Box>

              <Typography variant="body2" color="textSecondary">
                {content?.compatible_text}
              </Typography>

              <Box
                className={`animate__animated ${triggerAnimation ? 'animate__fadeIn' : ''
                  }`}
                sx={{
                  opacity: triggerAnimation ? 1 : 0,
                  mt: 2,
                }}
              >
                <Box display="flex" justifyContent="center" gap={2}>
                  <Tooltip title="Chrome">
                    <BrandIcon
                      alt="Chrome"
                      src="/assets/logos/chrome.png"
                      style={{ width: '70px' }}
                    />
                  </Tooltip>
                  <Tooltip title="Android">
                    <BrandIcon
                      alt="Android"
                      src="/assets/logos/android.png"
                      style={{ width: '70px' }}
                    />
                  </Tooltip>
                  <Tooltip title="Apple">
                    <BrandIcon
                      alt="Apple"
                      src="/assets/logos/apple.png"
                      style={{ width: '70px' }}
                    />
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Box
        sx={{
          backgroundColor: '#1e3261', // azul oscuro
          color: '#fff',
          textAlign: 'center',
          py: { xs: 6, md: 8 },
          px: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          En Aviation In Sight podrás realizar lo siguiente:
        </Typography>

        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="flex-start"
          mt={2}
        >
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.08)',
                    width: 40,
                    height: 40,
                    mr: 2,
                  }}
                >
                  {feature.icon}
                </Avatar>
                <Typography whiteSpace="pre-line" align="left">
                  {feature.text}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}
