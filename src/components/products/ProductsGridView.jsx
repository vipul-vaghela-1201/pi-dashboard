import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Collapse,
  Typography,
  Avatar,
  Button,
  ButtonGroup
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  LocalShipping as SalesIcon
} from '@mui/icons-material';

const ProductRow = ({
  product,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onAddToCart,
  onOpenSales,
  showInventory = false // Add this prop
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const availableStock = product.stock - product.details.totalSold;
  const isSoldOut = availableStock <= 0;

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <CollapseIcon /> : <ExpandIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelect(product.id, e.target.checked)}
          />
        </TableCell>

        {showInventory && (
          <TableCell>
            <Typography variant="body2">
              {product.inventory || 'Unknown'}
            </Typography>
          </TableCell>
        )}

        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={product.image} 
              alt={product.name}
              sx={{ width: 56, height: 56, mr: 2 }}
            />
            <Typography variant="body1">{product.name}</Typography>
          </Box>
        </TableCell>
        <TableCell>${product.price.toFixed(2)}</TableCell>
        <TableCell>
          <Typography color={availableStock > 0 ? 'text.primary' : 'error'}>
            {availableStock} available
          </Typography>
        </TableCell>
        <TableCell>
          <ButtonGroup size="small">
            <Button 
              onClick={() => onAddToCart(product.id, product.inCart - 1)}
              disabled={product.inCart <= 0 || isSoldOut}
            >
              <RemoveIcon />
            </Button>
            <Button disabled>
              {product.inCart}
            </Button>
            <Button 
              onClick={() => onAddToCart(product.id, product.inCart + 1)}
              disabled={product.inCart >= availableStock || isSoldOut}
            >
              <AddIcon />
            </Button>
          </ButtonGroup>
        </TableCell>
        <TableCell>
          <IconButton 
            onClick={() => onOpenSales(product)}
            color={isSoldOut ? "error" : "primary"}
            disabled={isSoldOut}
            title={isSoldOut ? "Sold Out" : "Record Sale"}
          >
            {isSoldOut ? "Sold Out" : <SalesIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <IconButton onClick={() => onEdit(product)}>
            <EditIcon color="primary" />
          </IconButton>
          <IconButton onClick={() => onDelete(product.id)}>
            <DeleteIcon color="error" />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom>
                Product Details
              </Typography>
              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box>
                  <Typography variant="body2">In Transit: {product.details.inTransit}</Typography>
                  <Typography variant="body2">Delivered: {product.details.delivered}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2">Total Sold: {product.details.totalSold}</Typography>
                  <Typography variant="body2">Delivering Today: {product.details.deliveringToday}</Typography>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const ProductsGridView = ({
  products,
  selectedProducts,
  onSelectProduct,
  onEditProduct,
  onDeleteProduct,
  onAddToCart,
  onOpenSales,
  isAllInventoryView = false
}) => {
  return (
    <TableContainer component={Box}>
      <Table aria-label="products table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell />
            {isAllInventoryView && <TableCell>Inventory</TableCell>}
            <TableCell>Product</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Available</TableCell>
            <TableCell>Cart</TableCell>
            <TableCell>Sales</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              isSelected={selectedProducts.includes(product.id)}
              onSelect={onSelectProduct}
              onEdit={onEditProduct}
              onDelete={onDeleteProduct}
              onAddToCart={onAddToCart}
              onOpenSales={onOpenSales}
              showInventory={isAllInventoryView}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProductsGridView;