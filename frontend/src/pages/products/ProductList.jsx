import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  InputAdornment,
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
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import { useSnackbar } from 'notistack';
import api from '../../api/axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import ProductForm from './ProductForm';
import useDebounce from '../../hooks/useDebounce';

function getStockColor(stock) {
  if (stock < 10) return 'error.main';
  if (stock < 25) return 'warning.main';
  return 'success.main';
}

function getStockBg(stock) {
  if (stock < 10) return 'rgba(239,68,68,0.12)';
  if (stock < 25) return 'rgba(245,158,11,0.12)';
  return 'rgba(16,185,129,0.12)';
}

export default function ProductList() {
  const { enqueueSnackbar } = useSnackbar();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, debouncedSearch]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: { search: debouncedSearch, page: page + 1, page_size: rowsPerPage },
      });
      const data = res.data;
      if (Array.isArray(data)) {
        setProducts(data);
        setTotal(data.length);
      } else {
        setProducts(data.items || data.products || []);
        setTotal(data.total || data.count || (data.items || data.products || []).length);
      }
    } catch (err) {
      enqueueSnackbar('Failed to load products', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const product = deleteDialog.product;
    if (!product) return;
    try {
      await api.delete(`/products/${product.id}`);
      enqueueSnackbar('Product deleted successfully', { variant: 'success' });
      setDeleteDialog({ open: false, product: null });
      fetchProducts();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.detail || 'Failed to delete product', {
        variant: 'error',
      });
    }
  };

  const handleSave = () => {
    setFormOpen(false);
    setEditProduct(null);
    fetchProducts();
  };

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
          mb: 3,
        }}
      >
        <TextField
          placeholder="Search products..."
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 280 }}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadRoundedIcon />}
            onClick={async () => {
              try {
                const res = await api.get('/exports/products/csv', { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'products.csv');
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
              '&:hover': {
                borderColor: 'primary.main',
                background: 'rgba(99,102,241,0.1)',
              },
              whiteSpace: 'nowrap',
            }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => {
              setEditProduct(null);
              setFormOpen(true);
            }}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                boxShadow: '0 6px 20px rgba(99,102,241,0.5)',
              },
              whiteSpace: 'nowrap',
            }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {[1, 2, 3, 4, 5].map((c) => (
                          <TableCell key={c}>
                            <Skeleton
                              variant="text"
                              sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                          <InventoryRoundedIcon
                            sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.5 }}
                          />
                          <Typography color="text.secondary">No products found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                    products.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell>
                          <Typography sx={{ fontWeight: 500 }}>{product.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              fontFamily: 'monospace',
                              color: 'text.secondary',
                              fontSize: '0.85rem',
                            }}
                          >
                            {product.sku}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontWeight: 500 }}>
                            ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={product.stock_quantity}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              minWidth: 48,
                              color: getStockColor(product.stock_quantity),
                              background: getStockBg(product.stock_quantity),
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditProduct(product);
                              setFormOpen(true);
                            }}
                            sx={{ color: 'primary.main', mr: 0.5 }}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setDeleteDialog({ open: true, product })
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

      {/* Product Form Dialog */}
      <ProductForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditProduct(null);
        }}
        product={editProduct}
        onSave={handleSave}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteDialog.product?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, product: null })}
      />
    </Box>
  );
}
