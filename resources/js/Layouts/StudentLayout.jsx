import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

import {
  Box,
  CssBaseline,
  BottomNavigation,
  BottomNavigationAction,
  Menu,
  MenuItem,
  Paper,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
} from '@mui/material';

import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SettingsIcon from '@mui/icons-material/Settings';
import InsightsIcon from '@mui/icons-material/Insights';
import LogoutIcon from '@mui/icons-material/Logout';
import BarcodeReaderIcon from '@mui/icons-material/BarcodeReader';
import CloseIcon from '@mui/icons-material/Close';

import axios from 'axios';
import ErrorAlert from '@/Components/ErrorAlert';

export default function StudentLayout({ children }) {
  const drawerWidth = 0;
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = usePage().props.auth;
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const { url } = usePage();
  const [value, setValue] = useState(url);
  const { props } = usePage();
  const subscriptionExpired = props.subscriptionExpired ?? false;
  const hideAppBar = url.startsWith('/student/test/');
  const errorMessage = usePage().props?.flash?.error ?? null;
  const [openError, setOpenError] = useState(!!errorMessage);

  // Estado para instructivo
  const [instruction, setInstruction] = useState(null);
  const [pdfOpen, setPdfOpen] = useState(false);

  // Títulos del AppBar
  const pageTitles = {
    '/student-dashboard': 'DASHBOARD',
    '/student/subjects': 'MATERIAS',
    '/student/stadistics': 'RESULTADOS',
    '/student/profile': 'MI PERFIL',
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      Inertia.post(route('logout'));
    }
  };
  const handleClose = () => setAnchorEl(null);

  const navActionStyle = (disabled) => ({
    color: disabled ? '#b0b0b0' : 'white',
    pointerEvents: disabled ? 'none' : 'auto',
    cursor: disabled ? 'not-allowed' : 'pointer',
    '&.Mui-selected': {
      color: disabled ? '#b0b0b0' : 'white',
    },
    '& .MuiSvgIcon-root': {
      color: disabled ? '#9e9e9e' : 'white',
      opacity: disabled ? 0.6 : 1,
    },
    opacity: disabled ? 0.5 : 1,
    transition: 'none',
  });

  // Cargar instructivo solo cuando estamos en /student/subjects
  useEffect(() => {
    let cancel = false;

    const fetchInstruction = async () => {
      if (url !== '/student/subjects') {
        setInstruction(null);
        return;
      }
      try {
        const { data } = await axios.get(route('question.instructions.index'));
        if (!cancel && Array.isArray(data) && data.length > 0) {
          setInstruction(data[0]); // el más reciente
        }
      } catch (e) {
        console.error('No se pudo cargar el instructivo:', e);
      }
    };

    fetchInstruction();
    return () => {
      cancel = true;
    };
  }, [url]);

  return (
    <Box sx={{ pb: 7 }}>
      <ErrorAlert
        open={openError}
        onClose={() => setOpenError(false)}
        message={errorMessage}
      />
      {!hideAppBar && (
        <AppBar
          position="fixed"
          elevation={6}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            top: 5,
            left: drawerWidth + 15,
            right: 30,
            width: `calc(100% - ${drawerWidth + 30}px)`,
            borderRadius: '10px',
            backgroundColor: '#203764',
            color: '#333',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            px: 1,
          }}
        >
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" noWrap color="white">
                {pageTitles[url] || 'ATP COMPASS'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Ícono visible solo en /student/subjects y si hay archivo */}
              {url === '/student/subjects' && instruction && (
                <Tooltip title={`Ver instructivo: ${instruction.original_name}`} arrow>
                  <IconButton
                    onClick={() => setPdfOpen(true)}
                    sx={{
                      color: 'white',
                      bgcolor: '#e53935',
                      '&:hover': { bgcolor: '#c62828' },
                      borderRadius: '10px',
                      p: 1,
                    }}
                  >
                    <BarcodeReaderIcon />
                  </IconButton>
                </Tooltip>
              )}

              <IconButton onClick={handleMenu} color="inherit" style={{ color: 'white' }}>
                <SettingsIcon />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <MenuItem disabled>{user?.name}</MenuItem>
                <MenuItem component={Link} href={route('student.profile')}>
                  Perfil
                </MenuItem>
                <Link href={route('logout')} method="post" as="button">
                  <MenuItem>Salir</MenuItem>
                </Link>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
      )}

      <CssBaseline />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          mt: hideAppBar ? 0 : 8,
        }}
      >
        {children}
      </Box>

      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: '2px solid #e0e0e0',
          zIndex: (theme) => theme.zIndex.drawer + 1000,
        }}
        elevation={3}
      >
        <Box sx={{ overflowX: 'auto' }}>
          <BottomNavigation
            disabled={subscriptionExpired}
            showLabels
            value={value}
            onChange={(event, newValue) => {
              setValue(newValue);
            }}
            sx={{
              zIndex: (theme) => theme.zIndex.drawer + 1000,
              width: 'max-content',
              minWidth: '100%',
              display: 'flex',
              backgroundColor: '#203764',
            }}
          >
            <BottomNavigationAction
              disabled={subscriptionExpired}
              label="Inicio"
              value="/student-dashboard"
              icon={<HomeIcon />}
              component={Link}
              href="/student-dashboard"
              sx={navActionStyle(subscriptionExpired)}
            />
            <BottomNavigationAction
              disabled={subscriptionExpired}
              label="Materias"
              value="/student/subjects"
              icon={<MenuBookIcon />}
              component={Link}
              href="/student/subjects"
              sx={navActionStyle(subscriptionExpired)}
            />
            <BottomNavigationAction
              disabled={subscriptionExpired}
              label="Resultados"
              value="/student/progress"
              icon={<InsightsIcon />}
              component={Link}
              href="/student/progress"
              sx={navActionStyle(subscriptionExpired)}
            />
            <BottomNavigationAction
              label="Salir"
              value="logout"
              icon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                color: 'white',
                '&.Mui-selected': {
                  color: 'white',
                },
              }}
            />
          </BottomNavigation>
        </Box>
      </Paper>

      {/* Diálogo para visualizar el PDF */}
      <Dialog
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { height: { xs: '85vh', md: '90vh' } } }}
      >
        <DialogTitle sx={{ pr: 6 }}>
          {instruction?.original_name || 'Instructivo'}
          <IconButton
            aria-label="cerrar"
            onClick={() => setPdfOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {instruction && (
            <iframe
              title="Instructivo PDF"
              src={route('question.instructions.show', instruction.id)}
              style={{ border: 'none', width: '100%', height: '100%' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
