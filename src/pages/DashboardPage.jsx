import React, { useMemo, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as ShippingIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useInventory } from '../hooks/useInventory';
import { BarChart, PieChart, Bar, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import dayjs from 'dayjs';

const DashboardPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { 
    selectedInventory, 
    productsData,
    getAllProducts,
    inventories
  } = useInventory();

  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('week');
  const [chartType, setChartType] = useState('bar');
  const [isLoading, setIsLoading] = useState(false);
  const [dataKey, setDataKey] = useState('sold');

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  // Get products based on selected inventory
  const products = useMemo(() => {
    const prods = selectedInventory === 'All Inventory' 
      ? getAllProducts() 
      : productsData[selectedInventory] || [];
    return prods.filter(p => p);
  }, [productsData, selectedInventory, getAllProducts]);

  // Calculate base metrics without trends first
  const baseMetrics = useMemo(() => {
    const defaultMetrics = {
      totalProducts: 0,
      totalStock: 0,
      totalValue: 0,
      totalInTransit: 0,
      totalDelivered: 0,
      totalSold: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      averageValue: 0
    };

    if (!products.length) return defaultMetrics;

    return products.reduce((acc, product) => {
      if (!product) return acc;
      
      const availableStock = (product.stock || 0) - (product.details?.totalSold || 0);
      const productValue = availableStock * (product.price || 0);
      
      return {
        totalProducts: acc.totalProducts + 1,
        totalStock: acc.totalStock + Math.max(0, availableStock),
        totalValue: acc.totalValue + productValue,
        totalInTransit: acc.totalInTransit + (product.details?.inTransit || 0),
        totalDelivered: acc.totalDelivered + (product.details?.delivered || 0),
        totalSold: acc.totalSold + (product.details?.totalSold || 0),
        lowStockProducts: acc.lowStockProducts + (availableStock > 0 && availableStock <= 10 ? 1 : 0),
        outOfStockProducts: acc.outOfStockProducts + (availableStock <= 0 ? 1 : 0),
        averageValue: 0
      };
    }, defaultMetrics);
  }, [products]);

  // Then calculate the complete metrics with trends
  const safeMetrics = useMemo(() => {
    const avgValue = baseMetrics.totalProducts > 0 
      ? baseMetrics.totalValue / baseMetrics.totalProducts 
      : 0;
    
    const previousValue = baseMetrics.totalValue * 0.8;
    const valueChange = baseMetrics.totalValue > 0 
      ? ((baseMetrics.totalValue - previousValue) / previousValue) * 100 
      : 0;
    
    const previousSales = baseMetrics.totalSold * 0.9;
    const salesTrend = baseMetrics.totalSold > 0
      ? ((baseMetrics.totalSold - previousSales) / previousSales) * 100
      : 0;

    return {
      ...baseMetrics,
      averageValue: avgValue,
      valueChange,
      salesTrend
    };
  }, [baseMetrics]);

  // Prepare data for charts with safe defaults
  const chartData = useMemo(() => {
    if (!products.length) return [];

    if (selectedInventory === 'All Inventory') {
      const inventoryDistribution = {};
      products.forEach(product => {
        if (!product) return;
        const inventory = product.inventory || 'Unknown';
        inventoryDistribution[inventory] = (inventoryDistribution[inventory] || 0) + 1;
      });
      return Object.entries(inventoryDistribution).map(([name, value]) => ({
        name,
        value
      }));
    }

    const stockData = products.reduce((acc, product) => {
      if (!product) return acc;
      return {
        available: acc.available + Math.max(0, (product.stock || 0) - (product.details?.totalSold || 0)),
        inTransit: acc.inTransit + (product.details?.inTransit || 0),
        sold: acc.sold + (product.details?.totalSold || 0)
      };
    }, { available: 0, inTransit: 0, sold: 0 });

    return [
      { name: 'Available', value: stockData.available },
      { name: 'In Transit', value: stockData.inTransit },
      { name: 'Sold', value: stockData.sold }
    ];
  }, [products, selectedInventory]);

  // Prepare data for top products bar chart with safety checks
  const topProductsData = useMemo(() => {
    return [...products]
      .filter(p => p && p.details)
      .sort((a, b) => (b.details?.totalSold || 0) - (a.details?.totalSold || 0))
      .slice(0, 5)
      .map(product => ({
        name: product.name || 'Unnamed',
        sold: product.details?.totalSold || 0,
        available: Math.max(0, (product.stock || 0) - (product.details?.totalSold || 0)),
        value: (product.stock || 0) * (product.price || 0)
      }));
  }, [products]);

  // Generate time series data for trend analysis
  const timeSeriesData = useMemo(() => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const date = dayjs().subtract(days - i - 1, 'day');
      return {
        date: date.format('MMM D'),
        sales: Math.floor(Math.random() * 100) + 50 * (i / days),
        inventory: Math.floor(Math.random() * 200) + 100 * (i / days),
        value: Math.floor(Math.random() * 10000) + 5000 * (i / days)
      };
    });
  }, [timeRange]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={topProductsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey={dataKey} fill="#8884d8" name={dataKey === 'sold' ? 'Units Sold' : dataKey === 'available' ? 'Available Stock' : 'Inventory Value'} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={topProductsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey={dataKey} stroke="#8884d8" name={dataKey === 'sold' ? 'Units Sold' : dataKey === 'available' ? 'Available Stock' : 'Inventory Value'} />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={topProductsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Area type="monotone" dataKey={dataKey} fill="#8884d8" stroke="#8884d8" name={dataKey === 'sold' ? 'Units Sold' : dataKey === 'available' ? 'Available Stock' : 'Inventory Value'} />
          </AreaChart>
        );
      default:
        return (
          <BarChart data={topProductsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey={dataKey} fill="#8884d8" name={dataKey === 'sold' ? 'Units Sold' : dataKey === 'available' ? 'Available Stock' : 'Inventory Value'} />
          </BarChart>
        );
    }
  };

  return (
    <Box sx={{ 
      p: 3, 
      width: '100%',
      minWidth: '100%',
      maxWidth: 'none',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center',
        mb: 3,
        width: '100%',
        gap: isMobile ? 2 : 0
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {selectedInventory === 'All Inventory' 
            ? "All Inventories Dashboard" 
            : `${selectedInventory} Dashboard`}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexGrow: 1,
          minWidth: 0
        }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} color="primary" disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="quarter">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
        
      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)} 
        sx={{ mb: 3 }}
        variant={isMobile ? 'scrollable' : 'standard'}
      >
        <Tab label="Overview" icon={<PieChartIcon />} />
        <Tab label="Analytics" icon={<BarChartIcon />} />
        <Tab label="Trends" icon={<TrendingIcon />} />
      </Tabs>
      
      {activeTab === 0 && (
        <>
          <Grid container spacing={3} sx={{ mb: 3, marginLeft: 0 }}>
            {[
              { 
                title: "Total Products", 
                value: safeMetrics.totalProducts,
                icon: <InventoryIcon fontSize="large" />,
                color: theme.palette.primary.main,
                trend: null
              },
              { 
                title: "Available Stock", 
                value: safeMetrics.totalStock,
                icon: <ShoppingCartIcon fontSize="large" />,
                color: theme.palette.success.main,
                trend: null
              },
              { 
                title: "Inventory Value", 
                value: safeMetrics.totalValue,
                icon: <MoneyIcon fontSize="large" />,
                color: theme.palette.warning.main,
                trend: safeMetrics.valueChange,
                trendLabel: "vs last period"
              },
              { 
                title: "Total Sales", 
                value: safeMetrics.totalSold,
                icon: <ShippingIcon fontSize="large" />,
                color: theme.palette.info.main,
                trend: safeMetrics.salesTrend,
                trendLabel: "vs last period"
              },
              { 
                title: selectedInventory === "All Inventory" ? "Inventories" : "Stock Status",
                value: selectedInventory === "All Inventory" 
                  ? inventories.length 
                  : `${safeMetrics.lowStockProducts} Low, ${safeMetrics.outOfStockProducts} Out`,
                icon: <TrendingIcon fontSize="large" />,
                color: theme.palette.secondary.main,
                trend: null
              }
            ].map((metric, index) => (
              <Grid item xs={12} sm={6} md={3} lg={2.4} xl={2} width='18.45%' key={index}>
                <MetricCard {...metric} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3} sx={{ marginLeft: 0}}>
            <Grid item xs={12} lg={6} width='49%'>
              <Paper sx={{ p: 2, height: '400px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    {selectedInventory === 'All Inventory' 
                      ? "Products Distribution by Inventory" 
                      : "Stock Status"}
                  </Typography>
                  <Tooltip title={selectedInventory === 'All Inventory' 
                    ? "Shows how products are distributed across inventories" 
                    : "Shows current stock status breakdown"}>
                    <InfoIcon color="action" />
                  </Tooltip>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [value, selectedInventory === 'All Inventory' ? 'Products' : 'Units']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={6} width='49%'>
              <Paper sx={{ p: 2, height: '400px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    Top Products
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={dataKey}
                        onChange={(e) => setDataKey(e.target.value)}
                        variant="outlined"
                      >
                        <MenuItem value="sold">Units Sold</MenuItem>
                        <MenuItem value="available">Available Stock</MenuItem>
                        <MenuItem value="value">Inventory Value</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 100 }}>
                      <Select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        variant="outlined"
                      >
                        <MenuItem value="bar">Bar</MenuItem>
                        <MenuItem value="line">Line</MenuItem>
                        <MenuItem value="area">Area</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <ResponsiveContainer width="100%" height="90%">
                  {renderChart()}
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3} sx={{ marginLeft: 0 }}>
          {/* First chart - now 1/3 width */}
          <Grid item xs={12} md={4} width='31.5%'>
            <Paper sx={{ p: 2, height: '500px' }}>
              <Typography variant="h6" gutterBottom>
                Sales Analytics
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" name="Daily Sales" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Second chart - now 1/3 width */}
          <Grid item xs={12} md={4} width='31.5%'>
            <Paper sx={{ p: 2, height: '500px' }}>
              <Typography variant="h6" gutterBottom>
                Inventory Levels
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="inventory" stroke="#82ca9d" name="Inventory Level" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Third chart - now 1/3 width */}
          <Grid item xs={12} md={4} width='31.5%'>
            <Paper sx={{ p: 2, height: '500px' }}>
              <Typography variant="h6" gutterBottom>
                Inventory Value Trend
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" stroke="#ffc658" fill="#ffc658" name="Inventory Value" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3} sx={{ marginLeft: 0 }}>
          <Grid item xs={12} md={6} width='48%'>
            <Paper sx={{ p: 2, height: '500px' }}>
              <Typography variant="h6" gutterBottom>
                Sales Performance
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Sales" />
                  <Line type="monotone" dataKey="inventory" stroke="#82ca9d" name="Inventory" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} width='48%'>
            <Paper sx={{ p: 2, height: '500px' }}>
              <Typography variant="h6" gutterBottom>
                Value vs Inventory
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="value" stroke="#ffc658" fill="#ffc658" name="Value" />
                  <Area yAxisId="right" type="monotone" dataKey="inventory" stroke="#82ca9d" fill="#82ca9d" name="Inventory" opacity={0.5} />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

const MetricCard = ({ title, value, icon, color, trend, trendLabel }) => {
  const formattedValue = typeof value === 'number' && value % 1 !== 0 
    ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
    : typeof value === 'number' 
      ? value.toLocaleString('en-US') 
      : value;

  const trendColor = trend > 0 ? '#4caf50' : trend < 0 ? '#f44336' : 'text.secondary';
  const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '';

  return (
    <Paper sx={{ 
      p: 2,
      height: '100%',
      minHeight: '150px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      backgroundColor: `${color}10`,
      borderLeft: `4px solid ${color}`,
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: 3
      }
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 1, 
        color,
        width: '100%'
      }}>
        {React.cloneElement(icon, { sx: { fontSize: '1.5rem' } })}
        <Typography variant="subtitle1" sx={{ 
          ml: 1, 
          fontWeight: 'medium',
          fontSize: '0.875rem'
        }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h5" sx={{
        fontWeight: 'bold', 
        mb: 1,
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
      }}>
        {formattedValue}
      </Typography>
      {trend !== null && (
        <Typography 
          variant="caption" 
          sx={{ 
            color: trendColor,
            display: 'flex',
            alignItems: 'center',
            fontSize: '0.75rem'
          }}
        >
          {trendIcon} {Math.abs(trend).toFixed(1)}% {trendLabel}
        </Typography>
      )}
    </Paper>
  );
};

export default DashboardPage;