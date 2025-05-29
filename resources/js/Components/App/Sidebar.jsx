import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import { Dashboard, Group, Person, Settings, School, Logout } from '@mui/icons-material';
import { Link } from '@inertiajs/react';

const drawerWidth = 240;

const Sidebar = () => {
  const menuItems = [
    { label: 'Dashboard', icon: <Dashboard />, route: 'dashboard' },
    { label: 'Administradores', icon: <Group />, route: 'admin.index' },
    { label: 'Estudiantes', icon: <School />, route: 'students.index' },
    { label: 'Salir', icon: <Logout />, route: 'logout', method: 'post' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar>
        <Typography variant="h6">ATP UNIVERSITY</Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.label} component={Link} href={route(item.route)} method={item.method}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
