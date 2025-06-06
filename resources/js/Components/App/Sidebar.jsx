import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { Dashboard, Group, Person, Settings, School, Logout } from '@mui/icons-material';
import { Link } from '@inertiajs/react';

const drawerWidth = 240;

const Sidebar = ({ onClickItem }) => {
  const menuItems = [
    { label: 'Dashboard', icon: <Dashboard />, route: 'dashboard' },
    { label: 'Landing', icon: <Settings />, route: 'landing.edit' },
    { label: 'Administradores', icon: <Group />, route: 'admin.index' },
    { label: 'Estudiantes', icon: <School />, route: 'students.index' },
    { label: 'Salir', icon: <Logout />, route: 'logout', method: 'post' },
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
