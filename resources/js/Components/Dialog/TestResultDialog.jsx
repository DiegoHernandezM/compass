import { useEffect, useState, useRef, forwardRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, CircularProgress, Slide, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material';
import resultVideo from '@/assets/video/result_video.mp4';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function TestResultDialog({ open, setReview, onClose, correct = 0, total = 0, onGoToSubjects, showReview }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const targetPct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const [pct, setPct] = useState(0);
  const [count, setCount] = useState(0);
  const videoRef = useRef(null);

  const progressColor =
    pct < 60 ? theme.palette.error.main
  : pct < 80 ? theme.palette.warning.main
  : theme.palette.success.main;

  let resultMessage = '';
  if (targetPct >= 90) resultMessage = '¡Excelente resultado!';
  else if (targetPct >= 70) resultMessage = '¡Bien hecho!';
  else resultMessage = 'Necesitas mejorar, sigue practicando.';

  // Animación del círculo
  useEffect(() => {
    if (!open) return;
    setPct(0); setCount(0);
    const duration = 1200, step = 16, steps = Math.ceil(duration / step);
    let i = 0;
    const anim = setInterval(() => {
      i += 1;
      const val = Math.min(targetPct, Math.round((i / steps) * targetPct));
      setPct(val); setCount(val);
      if (i >= steps) clearInterval(anim);
    }, step);
    return () => clearInterval(anim);
  }, [open, targetPct]);

  // Control de video (autoplay confiable)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let onLoadedMeta, onTimeUpdate;
    if (open) {
      video.muted = true; video.playsInline = true;
      onLoadedMeta = async () => {
        try { video.currentTime = 1; await video.play(); } catch (e) { /* noop */ }
      };
      if (video.readyState >= 1) onLoadedMeta();
      else video.addEventListener('loadedmetadata', onLoadedMeta, { once: true });

      onTimeUpdate = () => {
        if (video.currentTime >= 5) { video.pause(); video.removeEventListener('timeupdate', onTimeUpdate); }
      };
      video.addEventListener('timeupdate', onTimeUpdate);
    } else {
      try { video.pause(); } catch {}
    }
    return () => {
      if (onLoadedMeta) video.removeEventListener('loadedmetadata', onLoadedMeta);
      if (onTimeUpdate) video.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      TransitionComponent={Transition}
      // Deja que el contenido interno haga scroll; el Paper será el contenedor
      scroll="paper"
      PaperProps={{
        sx: {
          m: isMobile ? 0 : 2,
          borderRadius: isMobile ? 0 : 3,
          position: 'relative',
          backgroundColor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100dvh',   // alto útil del viewport en móvil
          overflow: 'hidden',    // el scroll ocurrirá en DialogContent
        },
      }}
    >
      {/* Video de fondo, no intercepta eventos */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: 1,
          pointerEvents: 'none',
        }}
      >
        <video
          key={open ? 'open' : 'closed'}
          ref={videoRef}
          src={resultVideo}
          muted
          playsInline
          autoPlay
          preload="auto"
          style={{ width:'100%', height:'100%', objectFit:'cover' }}
        />
      </Box>

      {/* Contenedor de contenido (flex-col) */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'rgba(255,255,255,0.90)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%', // ocupa el alto del Paper
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>¡Test terminado!</DialogTitle>

        <DialogContent
          dividers={false}
          sx={{
            flex: 1,                         // ← hace que esto crezca y permita scroll
            overflowY: 'auto',
            pt: 1,
            pb: 2,                           // espacio para que no tape Actions
          }}
        >
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              my: { xs: 4, sm: 8, md: 10 },  // ← márgenes responsivos (antes 20 empujaba todo)
            }}
          >
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              {/* anillo de fondo */}
              <CircularProgress
                variant="determinate"
                value={100}
                size={140}
                thickness={5}
                sx={{
                  color: theme.palette.action.disabledBackground,
                  position: 'absolute',
                  left: 0,
                }}
              />
              {/* progreso real */}
              <CircularProgress
                variant="determinate"
                value={pct}
                size={140}
                thickness={5}
                sx={{ color: progressColor }}
              />
              {/* centro */}
              <Box
                sx={{
                  top: 0, left: 0, bottom: 0, right: 0,
                  position: 'absolute', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column',
                  color: progressColor,
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{pct}%</Typography>
              </Box>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>
                {correct} de {total}
              </Typography>
              <Typography variant="overline" color="text.secondary" sx={{ mt: 0.5 }}>
                <strong>{resultMessage}</strong> Tu porcentaje es {targetPct}%.
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        {/* Acciones SIEMPRE visibles en el borde inferior */}
        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            gap: 1,
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            bgcolor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'saturate(180%) blur(6px)',
          }}
        >
          {showReview ? (
            <Button variant="contained" onClick={() => { setReview(); onClose();}} fullWidth>
              Revisar
            </Button>
          ): null}
          
          <Button variant="contained" onClick={onGoToSubjects} color="primary" fullWidth>
            Materias
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
