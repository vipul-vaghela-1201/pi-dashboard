import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Checkbox,
  IconButton,
  Button,
  ButtonGroup,
  Divider,
  Chip,
  Badge,
  CircularProgress,
  Alert,
  CardActionArea
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  LocalShipping as SalesIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components for flip animation
const FlipCard = styled('div')({
  backgroundColor: 'transparent',
  perspective: '1000px',
  width: '100%',
  height: '100%',
});

const FlipCardInner = styled('div')(({ flipped }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  transition: 'transform 0.6s',
  transformStyle: 'preserve-3d',
  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)',
}));

const FlipCardFront = styled(Card)({
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

const FlipCardBack = styled(Card)({
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  transform: 'rotateY(180deg)',
  overflow: 'auto',
});

const ProductCard = ({
  product,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onAddToCart,
  onOpenSales,
  showInventory = false
}) => {
  const [flipped, setFlipped] = useState(false);
  const availableStock = product.stock - (product.details?.totalSold || 0);
  const isSoldOut = availableStock <= 0;

  const handleFlip = (e) => {
    // Don't flip if clicking on interactive elements
    if (e.target.closest('button, [role="button"], input')) {
      return;
    }
    setFlipped(!flipped);
  };

  return (
    <FlipCard>
      <FlipCardInner flipped={flipped}>
        {/* Front of the card */}
        <FlipCardFront 
          sx={{ 
            border: isSelected ? '2px solid #1976d2' : '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <CardActionArea onClick={handleFlip} sx={{ flexGrow: 1 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Checkbox
                  checked={isSelected}
                  onChange={(e) => onSelect(product.id, e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  sx={{ mr: 1 }}
                />
                
                <CardMedia
                  component="img"
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    objectFit: 'contain',
                    mr: 2,
                    borderRadius: 1
                  }}
                  image={product.image || '/placeholder-product.png'}
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = '/placeholder-product.png';
                  }}
                />
                
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" component="div">
                        {product.name || 'Unnamed Product'}
                      </Typography>
                      {showInventory && (
                        <Chip 
                          label={product.inventory || 'Unknown'} 
                          size="small" 
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Box>
                    
                    <Typography variant="h6" color="primary">
                      ${(product.price || 0).toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mt: 1
                  }}>
                    <Typography 
                      variant="body2" 
                      color={availableStock > 0 ? 'text.primary' : 'error'}
                    >
                      Stock: {availableStock}
                    </Typography>
                    
                    <Box>
                      <ButtonGroup size="small" sx={{ mr: 1 }}>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product.id, (product.inCart || 0) - 1);
                          }}
                          disabled={(product.inCart || 0) <= 0 || isSoldOut}
                        >
                          <RemoveIcon />
                        </Button>
                        <Button disabled>
                          <Badge 
                            badgeContent={product.inCart || 0} 
                            color="primary"
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}
                          >
                            <CartIcon />
                          </Badge>
                        </Button>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product.id, (product.inCart || 0) + 1);
                          }}
                          disabled={(product.inCart || 0) >= availableStock || isSoldOut}
                        >
                          <AddIcon />
                        </Button>
                      </ButtonGroup>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            p: 1,
            borderTop: '1px solid rgba(0, 0, 0, 0.12)'
          }}>
            <IconButton 
              onClick={(e) => {
                e.stopPropagation();
                onOpenSales(product);
              }}
              color={isSoldOut ? "error" : "primary"}
              disabled={isSoldOut}
              title={isSoldOut ? "Sold Out" : "Record Sale"}
            >
              <SalesIcon />
            </IconButton>
            
            <Box>
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(product);
                }}
                size="small" 
                sx={{ mr: 1 }}
              >
                <EditIcon color="primary" fontSize="small" />
              </IconButton>
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product.id);
                }}
                size="small"
              >
                <DeleteIcon color="error" fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </FlipCardFront>

        {/* Back of the card */}
        <FlipCardBack>
          <CardActionArea onClick={handleFlip} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Product Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 2
              }}>
                <Box>
                  <Typography variant="body2">
                    <strong>Name:</strong> {product.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Price:</strong> ${(product.price || 0).toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Stock:</strong> {product.stock}
                  </Typography>
                  {showInventory && (
                    <Typography variant="body2">
                      <strong>Inventory:</strong> {product.inventory || 'Unknown'}
                    </Typography>
                  )}
                </Box>
                
                <Box>
                  <Typography variant="body2">
                    <strong>In Transit:</strong> {product.details?.inTransit || 0}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Delivered:</strong> {product.details?.delivered || 0}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Total Sold:</strong> {product.details?.totalSold || 0}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Available:</strong> {availableStock}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                Click anywhere to flip back
              </Typography>
            </CardContent>
          </CardActionArea>
        </FlipCardBack>
      </FlipCardInner>
    </FlipCard>
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

  if (!products || products.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">No products found</Typography>
        <Typography variant="body1">Add a product to get started</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id || Math.random()}>
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