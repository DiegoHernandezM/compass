import { Box, Grid, Typography, Avatar, useTheme } from '@mui/material';
import LaptopChromebookIcon from '@mui/icons-material/LaptopChromebook';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import ListIcon from '@mui/icons-material/List';

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

export default function Footer() {
  const theme = useTheme();

  return (
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
  );
}
