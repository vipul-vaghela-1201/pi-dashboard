import React from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  Toolbar, 
  Checkbox,
  FormControlLabel,
  Switch,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon,
  GridOn as GridIcon,
  ViewModule as BlockIcon
} from '@mui/icons-material';

const ProductsFilterBar = ({
  viewMode,
  onViewModeChange,
  onSelectAll,
  onSearch,
  selectedCount,
  totalCount,
  onAddProduct,
  onDeleteSelected
}) => {
  return (
    <Toolbar sx={{ 
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      mb: 2,
      display: 'flex',
      justifyContent: 'space-between'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FormControlLabel
          control={
            <Checkbox
              indeterminate={selectedCount > 0 && selectedCount < totalCount}
              checked={selectedCount > 0 && selectedCount === totalCount}
              onChange={(e) => onSelectAll(e.target.checked)}
            />
          }
          label="Select all"
        />

        {selectedCount > 0 && (
          <IconButton onClick={onDeleteSelected} color="error">
            <DeleteIcon />
          </IconButton>
        )}

        <TextField
          size="small"
          placeholder="Search products..."
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
          }}
          onChange={(e) => onSearch(e.target.value)}
          sx={{ ml: 2, width: 300 }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={onAddProduct} color="primary">
          <AddIcon />
        </IconButton>

        <IconButton color="inherit">
          <Badge badgeContent={0} color="secondary">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <GridIcon color={viewMode === 'grid' ? 'primary' : 'inherit'} />
          <Switch
            checked={viewMode === 'block'}
            onChange={(e) => onViewModeChange(e.target.checked ? 'block' : 'grid')}
            color="primary"
          />
          <BlockIcon color={viewMode === 'block' ? 'primary' : 'inherit'} />
        </Box>
      </Box>
    </Toolbar>
  );
};

export default ProductsFilterBar;