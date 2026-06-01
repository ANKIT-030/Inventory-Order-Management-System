import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Avatar,
  CircularProgress
} from '@mui/material';
import { useSnackbar } from 'notistack';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';

export default function Profile() {
  const { enqueueSnackbar } = useSnackbar();
  const { user, fetchProfile } = useAuth();
  const { mode } = useAppTheme();
  
  const isDark = mode === 'dark';

  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/auth/profile', profileData);
      await fetchProfile();
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update profile';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      enqueueSnackbar('New passwords do not match!', { variant: 'error' });
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/auth/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      enqueueSnackbar('Password updated successfully!', { variant: 'success' });
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update password';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, margin: '0 auto' }}>
      
      {/* Header Profile Summary */}
      <Card sx={{ mb: 4, background: isDark ? 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(236,72,153,0.05) 100%)' : 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(236,72,153,0.02) 100%)' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 4 }}>
          <Avatar 
            sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: 'primary.main',
              boxShadow: '0 8px 32px rgba(99,102,241,0.3)'
            }}
          >
            <PersonRoundedIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              {user?.username || 'User'}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {user?.email || 'No email provided'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1, display: 'block' }}>
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'recently'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Profile Details Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <PersonRoundedIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Personal Information</Typography>
              </Box>
              <Divider sx={{ mb: 4, opacity: 0.5 }} />
              
              <form onSubmit={saveProfile}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Username"
                      name="username"
                      value={profileData.username}
                      onChange={handleProfileChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={savingProfile}
                      startIcon={savingProfile ? <CircularProgress size={20} /> : <SaveRoundedIcon />}
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: '#fff',
                        px: 4,
                        py: 1.2
                      }}
                    >
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Password Update Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <LockRoundedIcon sx={{ color: 'secondary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Security</Typography>
              </Box>
              <Divider sx={{ mb: 4, opacity: 0.5 }} />
              
              <form onSubmit={savePassword}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      name="current_password"
                      type="password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="New Password"
                      name="new_password"
                      type="password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirm_password"
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={savingPassword}
                      startIcon={savingPassword ? <CircularProgress size={20} /> : <SaveRoundedIcon />}
                      sx={{
                        background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                        color: '#fff',
                        px: 4,
                        py: 1.2
                      }}
                    >
                      {savingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
