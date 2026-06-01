import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Chip,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { useAuth } from '../context/AuthContext';
import { DRAWER_WIDTH } from './Sidebar';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/customers': 'Customers',
  '/orders': 'Orders',
  '/orders/new': 'Create Order',
};

function getPageTitle(pathname) {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (/^\/orders\/\d+$/.test(pathname)) return 'Order Details';
  return 'Dashboard';
}

export default function TopBar({ onMenuToggle }) {
  const { user } = useAuth();
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        background: 'rgba(10, 14, 26, 0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
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
            background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </Typography>

        <Chip
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
            '& .MuiChip-label': { px: 1.5 },
          }}
        />
      </Toolbar>
    </AppBar>
  );
}
