import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Autocomplete,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import { useSnackbar } from 'notistack';
import api from '../../api/axios';

export default function OrderForm() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingCust, setLoadingCust] = useState(false);
  const [loadingProd, setLoadingProd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([{ product: null, quantity: 1, maxStock: 0, price: 0 }]);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchCustomers = async () => {
    setLoadingCust(true);
    try {
      const res = await api.get('/customers', { params: { page_size: 100 } });
      const data = res.data;
      setCustomers(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      enqueueSnackbar('Failed to load customers', { variant: 'error' });
    } finally {
      setLoadingCust(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProd(true);
    try {
      const res = await api.get('/products', { params: { page_size: 100 } });
      const data = res.data;
      setProducts(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      enqueueSnackbar('Failed to load products', { variant: 'error' });
    } finally {
      setLoadingProd(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { product: null, quantity: 1, maxStock: 0, price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      enqueueSnackbar('An order must have at least one product item.', { variant: 'warning' });
      return;
    }
    const newItems = items.filter((_, idx) => idx !== index);
    setItems(newItems);
  };

  const handleProductChange = (index, product) => {
    const newItems = [...items];
    newItems[index].product = product;
    newItems[index].maxStock = product ? product.stock_quantity : 0;
    newItems[index].price = product ? Number(product.price) : 0;
    setItems(newItems);
  };

  const handleQuantityChange = (index, qtyVal) => {
    const newItems = [...items];
    const qty = parseInt(qtyVal, 10);
    newItems[index].quantity = isNaN(qty) ? '' : Math.max(1, qty);
    setItems(newItems);
  };

  // Calculations
  const grandTotal = items.reduce((acc, item) => {
    const qty = Number(item.quantity) || 0;
    return acc + qty * item.price;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      enqueueSnackbar('Please select a customer', { variant: 'error' });
      return;
    }

    const invalidItem = items.find((item) => !item.product || !item.quantity);
    if (invalidItem) {
      enqueueSnackbar('Please complete all item selections and quantities', { variant: 'error' });
      return;
    }

    // Verify stock checks frontend-side as helper validation
    const stockErrors = [];
    items.forEach((item, index) => {
      if (item.quantity > item.maxStock) {
        stockErrors.push(
          `${item.product.name} has only ${item.maxStock} in stock (requested: ${item.quantity})`
        );
      }
    });

    if (stockErrors.length > 0) {
      stockErrors.forEach((err) => enqueueSnackbar(err, { variant: 'error' }));
      return;
    }

    const payload = {
      customer_id: selectedCustomer.id,
      items: items.map((item) => ({
        product_id: item.product.id,
        quantity: parseInt(item.quantity, 10),
      })),
    };

    setSubmitting(true);
    try {
      await api.post('/orders', payload);
      enqueueSnackbar('Order created successfully!', { variant: 'success' });
      navigate('/orders');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMsg = typeof detail === 'string' ? detail : 'Failed to create order';
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton component={Link} to="/orders" sx={{ color: 'text.secondary' }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Create New Order
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Customer Select Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Customer Information
              </Typography>
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => `${option.full_name} (${option.email})`}
                loading={loadingCust}
                value={selectedCustomer}
                onChange={(_, val) => setSelectedCustomer(val)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Customer"
                    required
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingCust ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              {selectedCustomer && (
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Phone:</strong> {selectedCustomer.phone || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Address:</strong> {selectedCustomer.address || 'N/A'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Items Table Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Order Items
              </Typography>

              <TableContainer>
                <Table sx={{ minWidth: 500 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ pl: 0 }}>Product</TableCell>
                      <TableCell align="right" sx={{ width: 100 }}>
                        Price
                      </TableCell>
                      <TableCell align="right" sx={{ width: 140 }}>
                        Quantity
                      </TableCell>
                      <TableCell align="right" sx={{ width: 100 }}>
                        Stock
                      </TableCell>
                      <TableCell align="right" sx={{ width: 120 }}>
                        Total
                      </TableCell>
                      <TableCell align="center" sx={{ pr: 0, width: 60 }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        {/* Product Autocomplete */}
                        <TableCell sx={{ pl: 0 }}>
                          <Autocomplete
                            options={products}
                            getOptionLabel={(option) => option.name}
                            loading={loadingProd}
                            value={item.product}
                            onChange={(_, val) => handleProductChange(index, val)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Select Product"
                                variant="outlined"
                                size="small"
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {loadingProd ? (
                                        <CircularProgress color="inherit" size={16} />
                                      ) : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        {/* Price */}
                        <TableCell align="right">
                          <Typography>${item.price.toFixed(2)}</Typography>
                        </TableCell>
                        {/* Quantity input */}
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            inputProps={{ min: 1, step: 1 }}
                            sx={{ width: '100%' }}
                          />
                        </TableCell>
                        {/* Max Stock check */}
                        <TableCell align="right">
                          <Typography
                            color={
                              item.product
                                ? item.maxStock < item.quantity || item.maxStock < 10
                                  ? 'error.main'
                                  : 'text.secondary'
                                : 'text.secondary'
                            }
                            sx={{ fontWeight: item.product && item.maxStock < 10 ? 600 : 400 }}
                          >
                            {item.product ? item.maxStock : '-'}
                          </Typography>
                        </TableCell>
                        {/* Line Total */}
                        <TableCell align="right">
                          <Typography sx={{ fontWeight: 600 }}>
                            ${((item.quantity || 0) * item.price).toFixed(2)}
                          </Typography>
                        </TableCell>
                        {/* Remove Row */}
                        <TableCell align="center" sx={{ pr: 0 }}>
                          <IconButton onClick={() => handleRemoveItem(index)} color="error">
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Button
                startIcon={<AddRoundedIcon />}
                onClick={handleAddItem}
                sx={{ mt: 2 }}
                color="primary"
              >
                Add Item
              </Button>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                <Typography color="text.secondary" variant="body2">
                  Total Items: {items.length}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                  <Typography variant="h6">Grand Total:</Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    ${grandTotal.toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  component={Link}
                  to="/orders"
                  variant="outlined"
                  sx={{ borderColor: 'rgba(255,255,255,0.12)', color: 'text.secondary' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={18} /> : <ShoppingBagRoundedIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    },
                  }}
                >
                  Place Order
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
