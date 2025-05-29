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
            [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            margin: '16px 0 16px 16px', // margen izquierdo y vertical
            borderRadius: '16px',       // esquinas redondeadas
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)', // sombra suave
            backgroundColor: '#fff',    // fondo blanco
            },
        }}
        >
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
                sx={{ borderRadius: '8px', mx: 1, my: 0.5 }} // opcional: bordes redondeados por item
            >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
            </ListItem>
            ))}
        </List>
    </Drawer>

  );
};

export default Sidebar;
