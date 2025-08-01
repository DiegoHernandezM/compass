import { Box, CssBaseline, Toolbar, AppBar, Typography, IconButton, Menu, MenuItem, useMediaQuery, Drawer } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import SidebarContent from '../Components/App/Sidebar';
import { usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 230;

export default function AuthenticatedLayout({ children }) {
  const { user } = usePage().props.auth;
  const { url } = usePage();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const pageTitles = {
    'dashboard': 'Dashboard',
    '/admin/question': 'Cuestionarios',
    '/admin/landing': 'Landing Page',
    '/admin/subject': 'Materias',
    '/admin': 'Administradores',
    '/student': 'Estudiantes',
  };

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const drawer = <SidebarContent onClickItem={() => setMobileOpen(false)} />;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        elevation={6}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          top: 15,
          left: isMobile ? 16 : drawerWidth + 24,
          right: 24,
          width: isMobile ? `calc(100% - 32px)` : `calc(100% - ${drawerWidth + 28}px)`,
          borderRadius: '12px',
          backgroundColor: '#203764',
          color: '#333',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          px: 2,
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton edge="start" color="inherit" onClick={handleDrawerToggle} sx={{ mr: 2, color: 'white' }}>
                <MenuIcon />
              </IconButton>
            )}
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
              <MenuItem component={Link} href={route('profile.edit')}>Perfil</MenuItem>
              <Link href={route('logout')} method="post" as="button">
                <MenuItem>Salir</MenuItem>
              </Link>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>



      {/* Drawer permanente para desktop */}
      {!isMobile && (
        <Box
          component="nav"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
          }}
        >
          <Drawer
            variant="permanent"
            sx={{
              [`& .MuiDrawer-paper`]: {
                width: drawerWidth,
                top: '15px',
                height: 'calc(100vh - 30px)',
                marginLeft: '10px',
                borderRadius: '16px',
                boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
                color: 'white',
                backgroundColor: '#203764',
                overflow: 'auto'
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
      )}

      {/* Drawer temporal para mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            display: { xs: 'block', md: 'none' },
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              borderRadius: '0 16px 16px 0',
              color: 'white',
              backgroundColor: '#203764'
            }
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 5,
          backgroundColor: 'white'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
