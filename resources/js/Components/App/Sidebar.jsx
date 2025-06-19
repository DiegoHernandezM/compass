import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { Dashboard, Group, Person, Settings, School, Logout, AutoStories, Description } from '@mui/icons-material';
import { Link } from '@inertiajs/react';
const drawerWidth = 240;

const Sidebar = ({ onClickItem }) => {
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
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.label}
            component={Link}
            href={route(item.route)}
            method={item.method}
            onClick={onClickItem}
            sx={{ borderRadius: '8px', mx: 1, my: 0.5 }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default Sidebar;
