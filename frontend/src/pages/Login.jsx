import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Fade,
} from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import api from '../api/axios';

export default function Login() {
  const { login, register } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { mode } = useAppTheme();
  const isDark = mode === 'dark';

  const [tab, setTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      enqueueSnackbar('Please fill in all fields', { variant: 'warning' });
      return;
    }
    setLoading(true);
    try {
      await login(loginData.username, loginData.password);
      enqueueSnackbar('Welcome back!', { variant: 'success' });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerData.username || !registerData.email || !registerData.password) {
      enqueueSnackbar('Please fill in all fields', { variant: 'warning' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      enqueueSnackbar('Please enter a valid email', { variant: 'warning' });
      return;
    }
    if (registerData.password.length < 6) {
      enqueueSnackbar('Password must be at least 6 characters', { variant: 'warning' });
      return;
    }
    setLoading(true);
    try {
      await register(registerData.username, registerData.email, registerData.password);
      enqueueSnackbar('Account created! Please log in.', { variant: 'success' });
      setTab(0);
      setLoginData({ username: registerData.username, password: '' });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      enqueueSnackbar('Please enter your email', { variant: 'warning' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      enqueueSnackbar('Please enter a valid email', { variant: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: forgotPasswordEmail });
      enqueueSnackbar(response.data.message || 'Reset link sent!', { variant: 'success' });
      setTab(0);
      setForgotPasswordEmail('');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to send reset link.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const inputProps = (Icon) => ({
    startAdornment: (
      <InputAdornment position="start">
        <Icon sx={{ color: 'text.secondary', fontSize: 20 }} />
      </InputAdornment>
    ),
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        px: 2,
      }}
    >
      {/* Animated background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          background: isDark ? '#0a0e1a' : '#f8fafc',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background:
              'radial-gradient(circle at 30% 40%, rgba(99,102,241,0.15) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(236,72,153,0.12) 0%, transparent 40%), radial-gradient(circle at 50% 80%, rgba(16,185,129,0.1) 0%, transparent 40%)',
            animation: 'meshMove 20s ease-in-out infinite',
          },
          '@keyframes meshMove': {
            '0%': { transform: 'translate(0, 0) rotate(0deg)' },
            '33%': { transform: 'translate(-2%, -3%) rotate(1deg)' },
            '66%': { transform: 'translate(2%, 1%) rotate(-1deg)' },
            '100%': { transform: 'translate(0, 0) rotate(0deg)' },
          },
        }}
      />

      {/* Floating orbs */}
      <Box
        sx={{
          position: 'fixed',
          top: '20%',
          left: '10%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(99,102,241,0.08)',
          filter: 'blur(80px)',
          animation: 'float1 15s ease-in-out infinite',
          '@keyframes float1': {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '50%': { transform: 'translate(30px, -20px)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          bottom: '10%',
          right: '15%',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'rgba(236,72,153,0.08)',
          filter: 'blur(80px)',
          animation: 'float2 18s ease-in-out infinite',
          '@keyframes float2': {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '50%': { transform: 'translate(-20px, 30px)' },
          },
        }}
      />

      <Fade in timeout={800}>
        <Card
          sx={{
            maxWidth: 440,
            width: '100%',
            position: 'relative',
            zIndex: 1,
            background: isDark ? 'rgba(17, 24, 39, 0.75)' : 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(24px)',
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            borderRadius: '24px',
            boxShadow: isDark 
              ? '0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02)' 
              : '0 32px 64px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.02)',
            overflow: 'visible',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {/* Logo */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
                }}
              >
                <InventoryRoundedIcon sx={{ color: '#fff', fontSize: 30 }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #f59e0b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.5,
                }}
              >
                InvenTrack
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Inventory &amp; Order Management
              </Typography>
            </Box>

            {/* Tabs */}
            {tab !== 2 && (
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="fullWidth"
                sx={{
                  mb: 3,
                  '& .MuiTabs-indicator': {
                    background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                    height: 3,
                    borderRadius: 2,
                  },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                    '&.Mui-selected': { color: isDark ? '#fff' : '#000' },
                  },
                }}
              >
                <Tab label="Sign In" />
                <Tab label="Sign Up" />
              </Tabs>
            )}

            {/* Login Form */}
            {tab === 0 && (
              <Fade in key="login">
                <Box component="form" onSubmit={handleLogin}>
                  <TextField
                    fullWidth
                    label="Username or Email"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    InputProps={inputProps(PersonRoundedIcon)}
                    sx={{ mb: 2.5 }}
                    autoComplete="off"
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    InputProps={{
                      ...inputProps(LockRoundedIcon),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? (
                              <VisibilityOffRoundedIcon sx={{ fontSize: 20 }} />
                            ) : (
                              <VisibilityRoundedIcon sx={{ fontSize: 20 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 1.5 }}
                    autoComplete="new-password"
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setTab(2)}
                      sx={{
                        textTransform: 'none',
                        color: 'text.secondary',
                        '&:hover': { color: 'primary.main', background: 'transparent' }
                      }}
                    >
                      Forgot Password?
                    </Button>
                  </Box>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                      boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
                        boxShadow: '0 12px 40px rgba(99,102,241,0.5)',
                        transform: 'translateY(-1px)',
                      },
                      '&:disabled': {
                        background: 'rgba(99,102,241,0.3)',
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                  </Button>
                </Box>
              </Fade>
            )}

            {/* Register Form */}
            {tab === 1 && (
              <Fade in key="register">
                <Box component="form" onSubmit={handleRegister}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={registerData.username}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, username: e.target.value })
                    }
                    InputProps={inputProps(PersonRoundedIcon)}
                    sx={{ mb: 2.5 }}
                    autoComplete="off"
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, email: e.target.value })
                    }
                    InputProps={inputProps(EmailRoundedIcon)}
                    sx={{ mb: 2.5 }}
                    autoComplete="off"
                  />
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, password: e.target.value })
                    }
                    InputProps={{
                      ...inputProps(LockRoundedIcon),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? (
                              <VisibilityOffRoundedIcon sx={{ fontSize: 20 }} />
                            ) : (
                              <VisibilityRoundedIcon sx={{ fontSize: 20 }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 3.5 }}
                    autoComplete="new-password"
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #6366f1 100%)',
                      boxShadow: '0 8px 30px rgba(236,72,153,0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #db2777 0%, #7c3aed 50%, #4f46e5 100%)',
                        boxShadow: '0 12px 40px rgba(236,72,153,0.5)',
                        transform: 'translateY(-1px)',
                      },
                      '&:disabled': {
                        background: 'rgba(236,72,153,0.3)',
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                  </Button>
                </Box>
              </Fade>
            )}

            {/* Forgot Password Form */}
            {tab === 2 && (
              <Fade in key="forgot-password">
                <Box component="form" onSubmit={handleForgotPassword}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
                    Reset Password
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', textAlign: 'center' }}>
                    Enter your email address and we'll send you a link to reset your password.
                  </Typography>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    InputProps={inputProps(EmailRoundedIcon)}
                    sx={{ mb: 3 }}
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      mb: 2,
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                      boxShadow: '0 8px 30px rgba(16,185,129,0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                        boxShadow: '0 12px 40px rgba(16,185,129,0.4)',
                        transform: 'translateY(-1px)',
                      },
                      '&:disabled': {
                        background: 'rgba(16,185,129,0.3)',
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
                  </Button>
                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => setTab(0)}
                    disabled={loading}
                    sx={{
                      textTransform: 'none',
                      color: 'text.secondary',
                      '&:hover': { color: 'text.primary', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
                    }}
                  >
                    Back to Sign In
                  </Button>
                </Box>
              </Fade>
            )}
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
}
