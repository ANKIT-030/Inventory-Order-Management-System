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
  InputAdornment,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { useSnackbar } from 'notistack';
import api from '../../api/axios';

const initialState = {
  name: '',
  sku: '',
  description: '',
  price: '',
  stock_quantity: '',
};

export default function ProductForm({ open, onClose, product, onSave }) {
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isEdit = !!product;

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        stock_quantity: product.stock_quantity?.toString() || '',
      });
    } else {
      setForm(initialState);
    }
    setErrors({});
  }, [product, open]);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.sku.trim()) newErrors.sku = 'SKU is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      newErrors.price = 'Price must be greater than 0';
    if (form.stock_quantity === '' || isNaN(form.stock_quantity) || Number(form.stock_quantity) < 0)
      newErrors.stock_quantity = 'Stock must be 0 or more';
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
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      stock_quantity: parseInt(form.stock_quantity, 10),
    };

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/products/${product.id}`, payload);
        enqueueSnackbar('Product updated successfully', { variant: 'success' });
      } else {
        await api.post('/products', payload);
        enqueueSnackbar('Product created successfully', { variant: 'success' });
      }
      onSave();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save product';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 600, pb: 1 }}>
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={handleChange('name')}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
            />
            <TextField
              label="SKU"
              value={form.sku}
              onChange={handleChange('sku')}
              error={!!errors.sku}
              helperText={errors.sku}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={handleChange('description')}
              fullWidth
              multiline
              rows={3}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Price"
                type="number"
                value={form.price}
                onChange={handleChange('price')}
                error={!!errors.price}
                helperText={errors.price}
                fullWidth
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                label="Stock Quantity"
                type="number"
                value={form.stock_quantity}
                onChange={handleChange('stock_quantity')}
                error={!!errors.stock_quantity}
                helperText={errors.stock_quantity}
                fullWidth
                required
                inputProps={{ min: 0, step: 1 }}
              />
            </Box>
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
