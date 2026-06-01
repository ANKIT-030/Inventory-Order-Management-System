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
  Card,
  CardContent,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import { useSnackbar } from 'notistack';
import api from '../../api/axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import CustomerForm from './CustomerForm';
import useDebounce from '../../hooks/useDebounce';

export default function CustomerList() {
  const { enqueueSnackbar } = useSnackbar();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, customer: null });

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    fetchCustomers();
  }, [page, rowsPerPage, debouncedSearch]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers', {
        params: { search: debouncedSearch, page: page + 1, page_size: rowsPerPage },
      });
      const data = res.data;
      if (Array.isArray(data)) {
        setCustomers(data);
        setTotal(data.length);
      } else {
        setCustomers(data.items || data.customers || []);
        setTotal(data.total || data.count || (data.items || data.customers || []).length);
      }
    } catch (err) {
      enqueueSnackbar('Failed to load customers', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const customer = deleteDialog.customer;
    if (!customer) return;
    try {
      await api.delete(`/customers/${customer.id}`);
      enqueueSnackbar('Customer deleted successfully', { variant: 'success' });
      setDeleteDialog({ open: false, customer: null });
      fetchCustomers();
    } catch (err) {
      enqueueSnackbar(err.response?.data?.detail || 'Failed to delete customer', {
        variant: 'error',
      });
    }
  };

  const handleSave = () => {
    setFormOpen(false);
    setEditCustomer(null);
    fetchCustomers();
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
          placeholder="Search customers..."
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
                const res = await api.get('/exports/customers/csv', { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([res.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'customers.csv');
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
              setEditCustomer(null);
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
            Add Customer
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
                  <TableCell>Full Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
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
                  : customers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                          <PeopleRoundedIcon
                            sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.5 }}
                          />
                          <Typography color="text.secondary">No customers found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      customers.map((customer) => (
                      <TableRow key={customer.id} hover>
                        <TableCell>
                          <Typography sx={{ fontWeight: 500 }}>{customer.full_name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="text.secondary">{customer.email}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ color: 'text.secondary' }}>
                            {customer.phone || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              color: 'text.secondary',
                              maxWidth: 200,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {customer.address || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditCustomer(customer);
                              setFormOpen(true);
                            }}
                            sx={{ color: 'primary.main', mr: 0.5 }}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              setDeleteDialog({ open: true, customer })
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

      {/* Customer Form Dialog */}
      <CustomerForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditCustomer(null);
        }}
        customer={editCustomer}
        onSave={handleSave}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete Customer"
        message={`Are you sure you want to delete customer "${deleteDialog.customer?.full_name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, customer: null })}
      />
    </Box>
  );
}
