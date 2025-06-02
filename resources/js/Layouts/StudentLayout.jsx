import { Box, CssBaseline, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuizIcon from '@mui/icons-material/Quiz';
import InsightsIcon from '@mui/icons-material/Insights';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function StudentLayout({ children }) {
  const { url } = usePage();
  const [value, setValue] = useState(url);

  return (
    <Box sx={{ pb: 7 }}>
      <CssBaseline />
      {children}

      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid #e0e0e0' }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
        >
          <BottomNavigationAction
            label="Inicio"
            value="/student-dashboard"
            icon={<HomeIcon />}
            component={Link}
            href="/student-dashboard"
          />
          <BottomNavigationAction
            label="Materias"
            value="/student/subjects"
            icon={<MenuBookIcon />}
            component={Link}
            href="/student/subjects"
          />
          <BottomNavigationAction
            label="Test Simulacro"
            value="/student/mock-test"
            icon={<QuizIcon />}
            component={Link}
            href="/student/mock-test"
          />
          <BottomNavigationAction
            label="Progreso y Resultados"
            value="/student/progress"
            icon={<InsightsIcon />}
            component={Link}
            href="/student/progress"
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
