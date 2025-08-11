import { useEffect, useState, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, CircularProgress, Slide
} from '@mui/material';
import resultVideo from '@/assets/video/result_video.mp4';

const Transition = (props) => <Slide direction="up" {...props} />;

export default function TestResultDialog({ open, onClose, correct = 0, total = 0, onGoToSubjects }) {
  const targetPct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const [pct, setPct] = useState(0);
  const [count, setCount] = useState(0);
  const videoRef = useRef(null);

  // Animación del círculo
  useEffect(() => {
    if (!open) return;
    setPct(0);
    setCount(0);

    // Iniciar animación del círculo
    const duration = 1200; // ms
    const step = 16;
    const steps = Math.ceil(duration / step);
    let i = 0;
    const anim = setInterval(() => {
      i += 1;
      const val = Math.min(targetPct, Math.round((i / steps) * targetPct));
      setPct(val);
      setCount(val);
      if (i >= steps) clearInterval(anim);
    }, step);

    return () => clearInterval(anim);
  }, [open, targetPct]);

  // Controlar video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (open) {
      video.currentTime = 1; // empieza en el segundo 1
      video.play();

      const stopAt5 = setInterval(() => {
        if (video.currentTime >= 5) {
          video.pause();
          clearInterval(stopAt5);
        }
      }, 200);

      return () => clearInterval(stopAt5);
    } else {
      video.pause();
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: 'transparent', // fondo transparente para ver el video
          minHeight: 600
        }
      }}
    >
      {/* Video de fondo */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          opacity: 0.9, // opacidad del video
          overflow: 'hidden',
          minHeight: 650
        }}
      >
        <video
          ref={videoRef}
          src={resultVideo}
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',   // ⬅️ se adapta al alto del dialog
          }}
        />
      </Box>

      {/* Contenido */}
      <Box sx={{ position: 'relative', zIndex: 1, backgroundColor: 'rgba(255,255,255,0.75)', minHeight: 650 }}>
        <DialogTitle sx={{ fontWeight: 700 }}>¡Test terminado!</DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'grid', placeItems: 'center', my: 20 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress variant="determinate" value={pct} size={140} thickness={5} />
              <Box
                sx={{
                  top: 0, left: 0, bottom: 0, right: 0,
                  position: 'absolute', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 800 }}>{count}%</Typography>
              </Box>
            </Box>

            <Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>
              {correct} de {total}
            </Typography>
            <Typography variant="overline" color="text.secondary" sx={{ mt: 0.5 }}>
              <strong>¡Bien hecho!</strong> Tu porcentaje es {targetPct}%.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="contained" onClick={onClose} fullWidth>
            Revisar
          </Button>
          <Button
            variant="contained"
            onClick={onGoToSubjects}
            color="primary"
            fullWidth
          >
            Ir a materias
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
