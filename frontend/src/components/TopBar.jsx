import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { DRAWER_WIDTH } from './Sidebar';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/customers': 'Customers',
  '/orders': 'Orders',
  '/orders/new': 'Create Order',
  '/profile': 'My Profile',
};

function getPageTitle(pathname) {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (/^\/orders\/\d+$/.test(pathname)) return 'Order Details';
  return 'Dashboard';
}

export default function TopBar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { mode, toggleColorMode } = useAppTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const title = getPageTitle(location.pathname);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        background: mode === 'dark' ? 'rgba(10, 14, 26, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        <IconButton
          edge="start"
          onClick={onMenuToggle}
          sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}
        >
          <MenuRoundedIcon />
        </IconButton>

        <Typography
          variant="h5"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            background: mode === 'dark' 
              ? 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)' 
              : 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </Typography>

        <IconButton onClick={toggleColorMode} sx={{ mr: 2, color: 'text.primary' }}>
          {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
        </IconButton>

        <Chip
          onClick={handleMenuClick}
          avatar={
            <Avatar sx={{ bgcolor: 'primary.dark' }}>
              <PersonRoundedIcon sx={{ fontSize: 18, color: '#fff' }} />
            </Avatar>
          }
          label={user?.username || 'User'}
          sx={{
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.2)',
            color: 'text.primary',
            fontWeight: 500,
            px: 0.5,
            cursor: 'pointer',
            '& .MuiChip-label': { px: 1.5 },
          }}
        />
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 4px 12px rgba(0,0,0,0.15))',
              mt: 1.5,
              background: mode === 'dark' ? '#1a1f2e' : '#ffffff',
              border: mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: mode === 'dark' ? '#1a1f2e' : '#ffffff',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
                borderLeft: mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                borderTop: mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <SettingsRoundedIcon fontSize="small" />
            </ListItemIcon>
            My Profile
          </MenuItem>
          <Divider sx={{ my: 0.5, borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" color="error" />
            </ListItemIcon>
            <Typography color="error" variant="inherit">Logout</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
