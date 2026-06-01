import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Chip,
  Alert,
} from '@mui/material';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import { useSnackbar } from 'notistack';
import api from '../api/axios';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const statCards = [
  {
    key: 'total_products',
    label: 'Total Products',
    icon: InventoryRoundedIcon,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    shadow: 'rgba(99,102,241,0.3)',
  },
  {
    key: 'total_customers',
    label: 'Total Customers',
    icon: PeopleRoundedIcon,
    gradient: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
    shadow: 'rgba(236,72,153,0.3)',
  },
  {
    key: 'total_orders',
    label: 'Total Orders',
    icon: ShoppingCartRoundedIcon,
    gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    shadow: 'rgba(16,185,129,0.3)',
  },
  {
    key: 'total_revenue',
    label: 'Total Revenue',
    icon: CurrencyRupeeRoundedIcon,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    shadow: 'rgba(245,158,11,0.3)',
    prefix: '₹',
  },
];

const STATUS_COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  shipped: '#6366f1',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

function AnimatedNumber({ value, prefix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (value === 0 || value === undefined || value === null) {
      setDisplay(0);
      return;
    }

    const startTime = performance.now();
    const startVal = 0;
    const endVal = value;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startVal + (endVal - startVal) * eased);
      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  const formatted =
    typeof value === 'number' && prefix === '₹'
      ? `${prefix}${display.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `${prefix}${display.toLocaleString('en-IN')}`;

  return <>{formatted}</>;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          background: '#1a1f2e',
          border: '1px solid rgba(255,255,255,0.1)',
          p: 1.5,
          borderRadius: 2,
        }}
      >
        <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>{label}</Typography>
        <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>
          {payload[0].name === 'revenue' ? '₹' : ''}
          {payload[0].value.toLocaleString('en-IN')}
        </Typography>
      </Box>
    );
  }
  return null;
};

export default function Dashboard() {
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data);
    } catch (err) {
      enqueueSnackbar('Failed to load dashboard data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.key}>
            {loading ? (
              <Skeleton
                variant="rounded"
                height={160}
                sx={{ borderRadius: 4, bgcolor: 'rgba(255,255,255,0.05)' }}
              />
            ) : (
              <Card
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  height: '100%',
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 500,
                          mb: 1,
                          fontSize: '0.85rem',
                        }}
                      >
                        {card.label}
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 700,
                          letterSpacing: '-0.02em',
                          lineHeight: 1.1,
                        }}
                      >
                        <AnimatedNumber
                          value={data?.[card.key] ?? 0}
                          prefix={card.prefix || ''}
                        />
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: '14px',
                        background: card.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 24px ${card.shadow}`,
                        flexShrink: 0,
                      }}
                    >
                      <card.icon sx={{ color: '#fff', fontSize: 26 }} />
                    </Box>
                  </Box>
                </CardContent>
                {/* Decorative gradient blob */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -30,
                    right: -30,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: card.gradient,
                    opacity: 0.06,
                    filter: 'blur(20px)',
                  }}
                />
              </Card>
            )}
          </Grid>
        ))}
      </Grid>

      {/* Row 1: Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Trend */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: 'rgba(99,102,241,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUpRoundedIcon sx={{ color: '#6366f1', fontSize: 22 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Revenue Trend
                </Typography>
              </Box>
              {loading ? (
                <Skeleton variant="rounded" height={300} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
              ) : !data?.revenue_by_month?.length ? (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No revenue data available.</Typography>
                </Box>
              ) : (
                <Box sx={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.revenue_by_month} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} dx={-10} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Status */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: 'rgba(236,72,153,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PieChartRoundedIcon sx={{ color: '#ec4899', fontSize: 22 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Order Status
                </Typography>
              </Box>
              {loading ? (
                <Skeleton variant="rounded" height={300} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
              ) : !data?.order_status_distribution?.length ? (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No order data available.</Typography>
                </Box>
              ) : (
                <Box sx={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.order_status_distribution}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="status"
                        stroke="none"
                      >
                        {data.order_status_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status.toLowerCase()] || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 2: Top Products & Recent Orders */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: 'rgba(16,185,129,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LeaderboardRoundedIcon sx={{ color: '#10b981', fontSize: 22 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Top Products
                </Typography>
              </Box>
              {loading ? (
                <Skeleton variant="rounded" height={300} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
              ) : !data?.top_products?.length ? (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No sales data yet.</Typography>
                </Box>
              ) : (
                <Box sx={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.top_products} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} width={120} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                      <Bar dataKey="total_sold" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: 'rgba(59,130,246,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ListAltRoundedIcon sx={{ color: '#3b82f6', fontSize: 22 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Orders
                </Typography>
              </Box>
              {loading ? (
                <Box>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} variant="rounded" height={48} sx={{ mb: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }} />
                  ))}
                </Box>
              ) : !data?.recent_orders?.length ? (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No orders yet.</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {data.recent_orders.map((order) => (
                    <Box
                      key={order.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        borderRadius: 2,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {order.customer_name}
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                          #{order.id} • {new Date(order.order_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography sx={{ fontWeight: 700 }}>
                          ₹{Number(order.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                        <Chip
                          label={order.status.toUpperCase()}
                          size="small"
                          sx={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            color: STATUS_COLORS[order.status.toLowerCase()] || 'text.primary',
                            borderColor: STATUS_COLORS[order.status.toLowerCase()] || 'text.primary',
                            background: 'transparent',
                            border: '1px solid',
                            width: 80,
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 3: Low Stock Alerts */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'rgba(245,158,11,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <WarningAmberRoundedIcon sx={{ color: 'warning.main', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Low Stock Alerts
            </Typography>
          </Box>

          {loading ? (
            <Box>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  height={48}
                  sx={{ mb: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }}
                />
              ))}
            </Box>
          ) : !data?.low_stock_products || data.low_stock_products.length === 0 ? (
            <Alert
              icon={<CheckCircleRoundedIcon />}
              severity="success"
              sx={{
                borderRadius: 3,
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)',
                '& .MuiAlert-icon': { color: 'success.main' },
                '& .MuiAlert-message': { color: 'text.primary' },
              }}
            >
              All products are well stocked!
            </Alert>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                background: 'transparent',
                boxShadow: 'none',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell align="right">Stock</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.low_stock_products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                        {product.sku}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color:
                              product.stock_quantity <= 0
                                ? 'error.main'
                                : product.stock_quantity < 5
                                ? 'error.light'
                                : 'warning.main',
                          }}
                        >
                          {product.stock_quantity}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={product.stock_quantity <= 0 ? 'Out of Stock' : 'Low Stock'}
                          size="small"
                          sx={{
                            background:
                              product.stock_quantity <= 0
                                ? 'rgba(239,68,68,0.15)'
                                : 'rgba(245,158,11,0.15)',
                            color:
                              product.stock_quantity <= 0 ? 'error.main' : 'warning.main',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
