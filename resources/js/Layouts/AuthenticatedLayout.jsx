import { Box, CssBaseline, Toolbar, AppBar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from '../Components/App/Sidebar';
import { usePage, Link } from '@inertiajs/react';
import { useState } from 'react';

const drawerWidth = 240;

export default function AuthenticatedLayout({ children }) {
    const { user } = usePage().props.auth;
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            <AppBar
                position="fixed"
                elevation={6}
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    top: 24, // <---- Baja el AppBar desde el top
                    left: 280, // <-- desplazado para que no se monte al Drawer
                    right: 24,
                    width: 'auto',
                    marginRight: '24px',
                    borderRadius: '12px',
                    boxShadow: '0px 4px 20px rgba(0,0,0,0.1)', // sombra suave
                    backgroundColor: '#ffffff', // blanco
                    color: '#333',
                    paddingX: 2,
                }}
            >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" noWrap component="div">
                        Dashboard
                    </Typography>
                    <div>
                        <IconButton onClick={handleMenu} color="inherit">
                            <MenuIcon />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                            <MenuItem disabled>{user?.name}</MenuItem>
                            <MenuItem component={Link} href={route('profile.edit')}>Perfil</MenuItem>
                            <MenuItem component={Link} href={route('logout')} method="post" as="button">Salir</MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>



            <Sidebar />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    marginLeft: `${drawerWidth}px`,
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}
