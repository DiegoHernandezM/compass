import {
  Box,
  Grid,
  Button,
  Typography,
  Tooltip,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ArrowForward } from '@mui/icons-material';
import { Link, usePage } from '@inertiajs/react';
import introBackground from '@/assets/images/background_landing.png';
import { useState, useEffect } from 'react';

const ContainerFrame = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  padding: theme.spacing(4),
}));

const VideoFrame = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: '100%',
  height: '100%',
  border: 'none',
}));

const BrandIcon = styled('img')(({ theme }) => ({
  verticalAlign: 'middle',
  marginRight: theme.spacing(3),
  height: 'auto',
}));

export default function IntroSection() {
  const { content } = usePage().props;
  const [triggerAnimation, setTriggerAnimation] = useState(false);

  useEffect(() => {
    setTimeout(() => setTriggerAnimation(true), 500);
  }, []);

  return (
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
        <Grid item xs={12} md={6}>
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
        <Grid item xs={12} md={6}>
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
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
              className={`animate__animated ${triggerAnimation ? 'animate__fadeIn' : ''}`}
              sx={{
                opacity: triggerAnimation ? 1 : 0,
                mt: 2,
              }}
            >
              <Box display="flex" justifyContent={{ xs: 'center', md: 'start' }} gap={2}>
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
                    style={{ width: '70px', background: '#fff' }}
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
  );
}
