import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';

const DRAWER_WIDTH = 280;

const navItems = [
  { label: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/dashboard' },
  { label: 'Products', icon: <InventoryRoundedIcon />, path: '/products' },
  { label: 'Customers', icon: <PeopleRoundedIcon />, path: '/customers' },
  { label: 'Orders', icon: <ShoppingCartRoundedIcon />, path: '/orders' },
];

function SidebarContent({ onClose }) {
  const { logout } = useAuth();
  const { mode } = useAppTheme();
  const location = useLocation();

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: mode === 'dark' ? 'rgba(10, 14, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          px: 3,
          py: 3.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
            }}
          >
            <InventoryRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            InvenTrack
          </Typography>
        </Box>
        {onClose && (
          <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
            <CloseRoundedIcon />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />

      {/* Nav Items */}
      <List sx={{ px: 2, py: 2, flex: 1 }}>
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={onClose}
                sx={{
                  borderRadius: '12px',
                  px: 2,
                  py: 1.3,
                  transition: 'all 0.2s ease-in-out',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(236,72,153,0.1) 100%)'
                    : 'transparent',
                  border: isActive
                    ? '1px solid rgba(99,102,241,0.3)'
                    : '1px solid transparent',
                  '&:hover': {
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(236,72,153,0.15) 100%)'
                      : mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? '#818cf8' : 'text.secondary',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'text.primary' : 'text.secondary',
                    fontSize: '0.925rem',
                  }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#6366f1',
                      boxShadow: '0 0 8px rgba(99,102,241,0.6)',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />

      {/* Logout */}
      <Box sx={{ px: 2, py: 2 }}>
        <ListItemButton
          onClick={logout}
          sx={{
            borderRadius: '12px',
            px: 2,
            py: 1.3,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              background: 'rgba(239,68,68,0.1)',
              transform: 'translateX(4px)',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
            <LogoutRoundedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontWeight: 500,
              color: 'error.main',
              fontSize: '0.925rem',
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      {/* Mobile drawer */}
      {!isDesktop && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              border: 'none',
            },
          }}
        >
          <SidebarContent onClose={onClose} />
        </Drawer>
      )}
      {/* Desktop drawer */}
      {isDesktop && (
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              border: 'none',
            },
          }}
          open
        >
          <SidebarContent onClose={null} />
        </Drawer>
      )}
    </Box>
  );
}

export { DRAWER_WIDTH };
