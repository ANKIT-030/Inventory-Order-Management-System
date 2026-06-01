import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { useSnackbar } from 'notistack';
import api from '../../api/axios';

const initialState = {
  full_name: '',
  email: '',
  phone: '',
  address: '',
};

export default function CustomerForm({ open, onClose, customer, onSave }) {
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEdit = !!customer;

  useEffect(() => {
    if (customer) {
      setForm({
        full_name: customer.full_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
      });
    } else {
      setForm(initialState);
    }
    setErrors({});
  }, [customer, open]);

  const validate = () => {
    const newErrors = {};
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email format is invalid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
    };

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/customers/${customer.id}`, payload);
        enqueueSnackbar('Customer updated successfully', { variant: 'success' });
      } else {
        await api.post('/customers', payload);
        enqueueSnackbar('Customer created successfully', { variant: 'success' });
      }
      onSave();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save customer';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          {isEdit ? 'Edit Customer' : 'Add New Customer'}
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Full Name"
              value={form.full_name}
              onChange={handleChange('full_name')}
              error={!!errors.full_name}
              helperText={errors.full_name}
              fullWidth
              required
            />
            <TextField
              label="Email Address"
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
              required
            />
            <TextField
              label="Phone Number"
              value={form.phone}
              onChange={handleChange('phone')}
              fullWidth
            />
            <TextField
              label="Address"
              value={form.address}
              onChange={handleChange('address')}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: 'rgba(255,255,255,0.12)',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.04)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : <SaveRoundedIcon />}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              },
            }}
          >
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
