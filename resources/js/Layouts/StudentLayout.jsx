import { Box, CssBaseline, BottomNavigation, BottomNavigationAction,Menu, MenuItem,  Paper, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SettingsIcon from '@mui/icons-material/Settings';
import InsightsIcon from '@mui/icons-material/Insights';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

export default function StudentLayout({ children }) {
  const drawerWidth = 0;
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = usePage().props.auth;
  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const { url } = usePage();
  const [value, setValue] = useState(url);
  const { props } = usePage();
  const subscriptionExpired = props.subscriptionExpired ?? false;

  // Aqui van las url para el AppBar
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

  return (
    <Box sx={{ pb: 7 }}>
      <AppBar
        position="fixed"
        elevation={6}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          top: 5,
          left: drawerWidth + 15,
          right: 30,
          width:  `calc(100% - ${drawerWidth + 30}px)`,
          borderRadius: '10px',
          backgroundColor: '#203764',
          color: '#333',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          px: 1,
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" noWrap color='white'>
              {pageTitles[url] || 'ATP COMPASS'}
            </Typography>
          </Box>
          <div>
            <IconButton onClick={handleMenu} color="inherit" style={{ color: 'white' }}>
              <SettingsIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              <MenuItem disabled>{user?.name}</MenuItem>
              <MenuItem component={Link} href={route('student.profile')}>Perfil</MenuItem>
              <Link href={route('logout')} method="post" as="button">
                <MenuItem>Salir</MenuItem>
              </Link>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          mt: 8,
        }}
      >
        {children}
      </Box>
      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '2px solid #e0e0e0' }}
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
            {/* 
            <BottomNavigationAction
              disabled={subscriptionExpired}
              label="Simulacro"
              value="/student/mock-test"
              icon={<QuizIcon />}
              component={Link}
              href="/student/mock-test"
              sx={navActionStyle(subscriptionExpired)}
            />
            */}
            <BottomNavigationAction
              disabled={subscriptionExpired}
              label="Resultados"
              value="/student/progress"
              icon={<InsightsIcon />}
              component={Link}
              href="/student/progress"
              sx={navActionStyle(subscriptionExpired)}
            />
            {/*
            <BottomNavigationAction
              disabled={subscriptionExpired}
              label="Perfil"
              value="/profile"
              icon={<PersonIcon />}
              component={Link}
              href="/student/profile"
              sx={navActionStyle(subscriptionExpired)}
            />
            */}
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
    </Box>
  );
}
