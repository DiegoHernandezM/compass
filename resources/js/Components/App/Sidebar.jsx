import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { Dashboard, Group, Person, Settings, School, Logout, AutoStories, Description } from '@mui/icons-material';
import { Link, usePage } from '@inertiajs/react'; // 👈 importante
const drawerWidth = 230;

const Sidebar = ({ onClickItem }) => {
  const { url } = usePage(); // 👈 obtiene la URL actual

  const menuItems = [
    { label: 'Dashboard', icon: <Dashboard sx={{color: 'white'}} />, route: 'dashboard' },
    { label: 'Landing', icon: <Settings sx={{color: 'white'}} />, route: 'landing.edit' },
    { label: 'Materias', icon: <AutoStories sx={{color: 'white'}} />, route: 'subject.index' },
    { label: 'Cuestionarios', icon: <Description sx={{color: 'white'}} />, route: 'question.index' },
    { label: 'Administradores', icon: <Group sx={{color: 'white'}} />, route: 'admin.index' },
    { label: 'Estudiantes', icon: <School sx={{color: 'white'}} />, route: 'students.index' },
    { label: 'Salir', icon: <Logout sx={{color: 'white'}} />, route: 'logout', method: 'post' },
  ];

  return (
    <>
      <Toolbar>
        <Typography variant="h6" noWrap>ATP COMPASS</Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => {
          const isActive = route().current(item.route); 

          return (
            <ListItem
              button
              key={item.label}
              component={Link}
              href={route(item.route)}
              method={item.method}
              onClick={onClickItem}
              sx={{
                borderRadius: '8px',
                mx: 0.2,
                my: 0.5,
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  color: 'white',
                  fontWeight: isActive ? 'bold' : 'normal',
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </>
  );
};

export default Sidebar;
