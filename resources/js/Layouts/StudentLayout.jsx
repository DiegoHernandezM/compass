import { Box, CssBaseline, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuizIcon from '@mui/icons-material/Quiz';
import InsightsIcon from '@mui/icons-material/Insights';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

export default function StudentLayout({ children }) {
  const { url } = usePage();
  const [value, setValue] = useState(url);
  const { props } = usePage();
  const subscriptionExpired = props.subscriptionExpired ?? false;
  const handleLogout = () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      Inertia.post(route('logout'));
    }
  };

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
      <CssBaseline />
      {children}

      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #e0e0e0' }}
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
            <BottomNavigationAction
              disabled={subscriptionExpired}
              label="Simulacro"
              value="/student/mock-test"
              icon={<QuizIcon />}
              component={Link}
              href="/student/mock-test"
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
              disabled={subscriptionExpired}
              label="Perfil"
              value="/profile"
              icon={<PersonIcon />}
              component={Link}
              href="/student/profile"
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
    </Box>
  );
}
