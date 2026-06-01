import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { useSnackbar } from 'notistack';
import api from '../../api/axios';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'success';
    case 'shipped':
      return 'primary';
    case 'confirmed':
      return 'info';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
}

export default function OrderDetail() {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      enqueueSnackbar('Failed to load order details', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      const res = await api.put(`/orders/${id}`, { status: newStatus });
      setOrder(res.data);
      enqueueSnackbar(`Order status updated to ${newStatus}`, { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(err.response?.data?.detail || 'Failed to update status', {
        variant: 'error',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Order not found</Typography>
        <Button component={Link} to="/orders" sx={{ mt: 2 }} variant="contained">
          Back to Orders
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton component={Link} to="/orders" sx={{ color: 'text.secondary' }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Order #{order.id}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Placed on {new Date(order.order_date).toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Status Dropdown */}
        <Box sx={{ minWidth: 180, display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="order-status-label">Update Status</InputLabel>
            <Select
              labelId="order-status-label"
              value={order.status}
              label="Update Status"
              onChange={handleStatusChange}
              disabled={updating}
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {updating && <CircularProgress size={20} />}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Customer Details Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PersonRoundedIcon color="primary" /> Customer Details
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {order.customer?.full_name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.customer?.email || 'N/A'}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                  Phone Number
                </Typography>
                <Typography variant="body2">{order.customer?.phone || 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                  Shipping Address
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {order.customer?.address || 'N/A'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Details Panel */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Items Ordered
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ pl: 0 }}>Product Name</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right" sx={{ pr: 0 }}>
                        Total
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell sx={{ pl: 0 }}>
                          <Typography sx={{ fontWeight: 500 }}>
                            {item.product?.name || 'Deleted Product'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.85rem' }}>
                            {item.product?.sku || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography>₹{Number(item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography>{item.quantity}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 0 }}>
                          <Typography sx={{ fontWeight: 600 }}>
                            ₹{(Number(item.unit_price) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.05)' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Typography color="text.secondary">Total Items:</Typography>
                  <Typography sx={{ fontWeight: 600 }}>
                    {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'baseline' }}>
                  <Typography variant="h6" color="text.secondary">
                    Total Amount:
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    ₹{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
