import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  Skeleton,
  Typography,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import { useSnackbar } from 'notistack';
import api from '../../api/axios';
import ConfirmDialog from '../../components/ConfirmDialog';

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

export default function OrderList() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({ open: false, orderId: null });

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders', {
        params: { page: page + 1, page_size: rowsPerPage },
      });
      const data = res.data;
      if (Array.isArray(data)) {
        setOrders(data);
        setTotal(data.length);
      } else {
        setOrders(data.items || data.orders || []);
        setTotal(data.total || data.count || (data.items || data.orders || []).length);
      }
    } catch (err) {
      enqueueSnackbar('Failed to load orders', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const orderId = deleteDialog.orderId;
    if (!orderId) return;
    try {
      await api.delete(`/orders/${orderId}`);
      enqueueSnackbar('Order deleted and stock levels restored successfully', {
        variant: 'success',
      });
      setDeleteDialog({ open: false, orderId: null });
      fetchOrders();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.detail || 'Failed to delete order', {
        variant: 'error',
      });
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 3,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<FileDownloadRoundedIcon />}
          onClick={async () => {
            try {
              const res = await api.get('/exports/orders/csv', { responseType: 'blob' });
              const url = window.URL.createObjectURL(new Blob([res.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'orders.csv');
              document.body.appendChild(link);
              link.click();
              link.remove();
            } catch (err) {
              enqueueSnackbar('Failed to export CSV', { variant: 'error' });
            }
          }}
          sx={{
            borderColor: 'rgba(255,255,255,0.2)',
            color: 'text.primary',
            mr: 2,
            '&:hover': {
              borderColor: 'primary.main',
              background: 'rgba(99,102,241,0.1)',
            },
          }}
        >
          Export CSV
        </Button>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          component={Link}
          to="/orders/new"
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              boxShadow: '0 6px 20px rgba(99,102,241,0.5)',
            },
          }}
        >
          Create Order
        </Button>
      </Box>

      {/* Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {[1, 2, 3, 4, 5, 6].map((c) => (
                          <TableCell key={c}>
                            <Skeleton
                              variant="text"
                              sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <ShoppingCartRoundedIcon
                            sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.5 }}
                          />
                          <Typography color="text.secondary">No orders found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                            #{order.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 500 }}>
                            {order.customer?.full_name || 'Deleted Customer'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.customer?.email || ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="text.secondary">
                            {new Date(order.order_date).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontWeight: 600 }}>
                            ₹{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={order.status.toUpperCase()}
                            size="small"
                            color={getStatusColor(order.status)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/orders/${order.id}`)}
                            sx={{ color: 'primary.main', mr: 0.5 }}
                          >
                            <VisibilityRoundedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setDeleteDialog({ open: true, orderId: order.id })
                            }
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              '.MuiTablePagination-select': { borderRadius: 2 },
            }}
          />
        </CardContent>
      </Card>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Order"
        message={`Are you sure you want to delete order #${deleteDialog.orderId}? This will automatically restore the product stock levels.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, orderId: null })}
      />
    </Box>
  );
}
