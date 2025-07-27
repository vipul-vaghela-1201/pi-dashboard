// ProductsBlockView.jsx
import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  Checkbox,
  Button,
  ButtonGroup,
  Collapse,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalShipping as SalesIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const ProductCard = ({
  product = {},
  isSelected = false,
  onSelect = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onAddToCart = () => {},
  onOpenSales = () => {},
  showInventory = false
}) => {
  const [expanded, setExpanded] = useState(false);

  // Mirror GridView logic
  const soldCount = product.sold ?? product.details?.totalSold ?? 0;
  const availableStock = (product.stock || 0) - soldCount;
  const inCartCount   = product.inCartQuantity || 0;
  const isSoldOut     = availableStock <= 0;

  return (
    <Card
      sx={{
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        border: isSelected
          ? '2px solid #1976d2'
          : '1px solid rgba(0, 0, 0, 0.12)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1,
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
        }}
      >
        <Checkbox
          checked={isSelected}
          onChange={(e) => onSelect(product.id, e.target.checked)}
          size="small"
        />
        {showInventory && (
          <Chip
            label={product.inventory ?? '—'}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {/* Image */}
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <Avatar
          src={product.image || '/placeholder-product.png'}
          alt={product.name}
          sx={{ width: 120, height: 120, border: '1px solid rgba(0,0,0,0.12)' }}
          onError={(e) => {
            e.target.src = '/placeholder-product.png';
          }}
        />
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, pt: 2, px: 2, pb: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 1 }}>
          <Typography variant="h6" noWrap title={product.name}>
            {product.name || 'Unnamed Product'}
          </Typography>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
            ${(product.price ?? 0).toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography
            variant="body2"
            color={availableStock > 0 ? 'success.main' : 'error.main'}
            sx={{ fontWeight: 'medium' }}
          >
            {availableStock > 0
              ? `${availableStock} Available`
              : 'Out of Stock'}
          </Typography>
        </Box>

        {/* Cart Controls */}
        <Paper elevation={1} sx={{ p: 0.5, borderRadius: 2, mb: 2 }}>
          <ButtonGroup size="small" variant="outlined" sx={{ width: '100%' }}>
            <Button
              onClick={() =>
                onAddToCart(product.id, inCartCount - 1)
              }
              disabled={inCartCount <= 0 || isSoldOut}
            >
              <RemoveIcon />
            </Button>
            <Button disabled sx={{ width: 36 }}>
              {inCartCount}
            </Button>
            <Button
              onClick={() =>
                onAddToCart(product.id, inCartCount + 1)
              }
              disabled={inCartCount >= availableStock || isSoldOut}
            >
              <AddIcon />
            </Button>
          </ButtonGroup>
        </Paper>

        {/* Expand/Collapse */}
        <Box sx={{ mb: 1, width: '100%' }}>
          <Button
            onClick={() => setExpanded(!expanded)}
            endIcon={
              expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
            }
            size="small"
            fullWidth
          >
            {expanded ? 'Hide Details' : 'Show Details'}
          </Button>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box
              sx={{
                width: '100%',
                mt: 1,
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1
              }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                color="primary"
              >
                Product Details
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2,1fr)',
                  gap: 1,
                  fontSize: '0.875rem'
                }}
              >
                <Box>
                  <Typography variant="caption" display="block">
                    <strong>All Time Total Stock:</strong> {product.stock ?? 0}
                  </Typography>
                  <Typography variant="caption" display="block">
                    <strong>In Transit:</strong>{' '}
                    {product.details?.inTransit ?? 0}
                  </Typography>
                  <Typography variant="caption" display="block">
                    <strong>Delivered:</strong>{' '}
                    {product.details?.delivered ?? 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" display="block">
                    <strong>Total Sold:</strong>{' '}
                    {product.sold ?? product.details?.totalSold ?? 0}
                  </Typography>
                  <Typography variant="caption" display="block">
                    <strong>Yet to Dispatch:</strong>{' '}
                    {product.details?.yetToDispatch ?? 0}
                  </Typography>
                  <Typography variant="caption" display="block">
                    <strong>Delivering Today:</strong>{' '}
                    {product.details?.deliveringToday ?? 0}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </Box>
      </CardContent>

      {/* Actions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1,
          borderTop: '1px solid rgba(0,0,0,0.08)',
          bgcolor: 'grey.50'
        }}
      >
        <Button
          onClick={() => onOpenSales(product)}
          startIcon={<SalesIcon />}
          variant={isSoldOut ? 'outlined' : 'contained'}
          color={isSoldOut ? 'error' : 'primary'}
          disabled={isSoldOut}
          size="small"
          sx={{ flex: 1, mr: 1 }}
        >
          {isSoldOut ? 'Sold Out' : 'Record Sale'}
        </Button>
        <Box>
          <IconButton
            onClick={() => onEdit(product)}
            size="small"
            color="primary"
            sx={{ mr: 0.5 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => onDelete(product.id)}
            size="small"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
};

const ProductsBlockView = ({
  products = [],
  selectedProducts = [],
  onSelectProduct = () => {},
  onEditProduct = () => {},
  onDeleteProduct = () => {},
  onAddToCart = () => {},
  onOpenSales = () => {},
  isAllInventoryView = false,
  isLoading = false,
  error = null
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          Failed to load products: {error.message}
        </Alert>
      </Box>
    );
  }

  if (!products.length) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No products found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Add a product to get started
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 1 }}>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid
            item
            key={product.id}
            xs={12}
            sm={6}
            md={4}
            lg={3}
          >
            <ProductCard
              product={product}
              isSelected={selectedProducts.includes(product.id)}
              onSelect={onSelectProduct}
              onEdit={onEditProduct}
              onDelete={onDeleteProduct}
              onAddToCart={onAddToCart}
              onOpenSales={onOpenSales}
              showInventory={isAllInventoryView}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductsBlockView;
