import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  MenuItem,
  Select,
  Box,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  Chip,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useInventory } from '../hooks/useInventory';

const TopBar = () => {
  const navigate = useNavigate();
  const {
    inventories,
    selectedInventory,
    setSelectedInventory,
    addInventory,
    removeInventory,
    allProducts
  } = useInventory();
  
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openCloseDialog, setOpenCloseDialog] = useState(false);
  const [newInventoryName, setNewInventoryName] = useState('');
  const [confirmClose, setConfirmClose] = useState(false);
  const [transferRows, setTransferRows] = useState([{ targetInventory: '', products: [] }]);

  const handleAddInventory = () => {
    addInventory(newInventoryName);
    setNewInventoryName('');
    setOpenAddDialog(false);
  };

  const handleOpenCloseDialog = () => {
    setOpenCloseDialog(true);
    setConfirmClose(false);
    setTransferRows([{ targetInventory: '', products: [] }]);
  };

  const handleCloseInventory = () => {
    removeInventory(selectedInventory, transferRows);
    setOpenCloseDialog(false);
  };

  const addTransferRow = () => {
    setTransferRows([...transferRows, { targetInventory: '', products: [] }]);
  };

  const removeTransferRow = (index) => {
    if (transferRows.length > 1) {
      const updatedRows = [...transferRows];
      updatedRows.splice(index, 1);
      setTransferRows(updatedRows);
    }
  };

  const handleTargetInventoryChange = (index, value) => {
    const updatedRows = [...transferRows];
    updatedRows[index].targetInventory = value;
    setTransferRows(updatedRows);
  };

  const handleProductsChange = (index, selectedProducts) => {
    const updatedRows = [...transferRows];
    updatedRows[index].products = selectedProducts;
    setTransferRows(updatedRows);
  };

  const removeProduct = (rowIndex, productToRemove) => {
    const updatedRows = [...transferRows];
    updatedRows[rowIndex].products = updatedRows[rowIndex].products.filter(
      product => product !== productToRemove
    );
    setTransferRows(updatedRows);
  };

  const getAvailableProducts = () => {
    const allSelectedProducts = transferRows.flatMap(row => row.products);
    return (allProducts[selectedInventory] || []).filter(
      product => !allSelectedProducts.includes(product)
    );
  };

  const getAvailableTargetInventories = () => {
    return inventories.filter(inv => inv !== selectedInventory);
  };

  const isCloseDisabled = confirmClose && transferRows.some(row => 
    !row.targetInventory || (row.targetInventory && row.products.length === 0)
  );

  const SelectedProducts = ({ selected, rowIndex }) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {selected.map((value) => (
        <Chip
          key={value}
          label={value}
          size="small"
          onDelete={() => removeProduct(rowIndex, value)}
          deleteIcon={<CloseIcon fontSize="small" />}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ))}
    </Box>
  );

  const isAllInventorySelected = selectedInventory === 'All Inventory';

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <Button
            color="inherit"
            onClick={() => navigate("/dashboard")}
            sx={{ mr: 2 }}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate("/products")}
            sx={{ mr: 2 }}
          >
            Products
          </Button>

          <Select
            value={selectedInventory}
            onChange={(e) => setSelectedInventory(e.target.value)}
            sx={{ minWidth: 200, mr: 2, backgroundColor: "background.paper" }}
          >
            {inventories.map((inventory) => (
              <MenuItem key={inventory} value={inventory}>
                {inventory}
              </MenuItem>
            ))}
          </Select>

          <IconButton
            color="inherit"
            onClick={() => setOpenAddDialog(true)}
            sx={{ mr: 1 }}
            disabled={isAllInventorySelected}
          >
            <AddIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleOpenCloseDialog}
            disabled={inventories.length <= 1 || isAllInventorySelected}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Add Inventory Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Create New Inventory</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Inventory Name"
            fullWidth
            value={newInventoryName}
            onChange={(e) => setNewInventoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddInventory}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Close Inventory Dialog */}
      <Dialog open={openCloseDialog} onClose={() => setOpenCloseDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Close Inventory "{selectedInventory}"</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmClose}
                onChange={(e) => setConfirmClose(e.target.checked)}
              />
            }
            label="I want to close this inventory permanently"
          />

          {confirmClose && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Move inventory items to:
              </Typography>

              {transferRows.map((row, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Select
                    value={row.targetInventory}
                    onChange={(e) => handleTargetInventoryChange(index, e.target.value)}
                    displayEmpty
                    fullWidth
                    sx={{ minWidth: 200 }}
                  >
                    <MenuItem value="" disabled>
                      Select target inventory
                    </MenuItem>
                    {getAvailableTargetInventories().map((inventory) => (
                      <MenuItem key={inventory} value={inventory}>
                        {inventory}
                      </MenuItem>
                    ))}
                  </Select>

                  <Select
                    multiple
                    value={row.products}
                    onChange={(e) => handleProductsChange(index, e.target.value)}
                    displayEmpty
                    fullWidth
                    sx={{ minWidth: 200 }}
                    renderValue={(selected) => (
                      <SelectedProducts selected={selected} rowIndex={index} />
                    )}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                    }}
                  >
                    {getAvailableProducts().map((product) => (
                      <MenuItem key={product} value={product}>
                        {product}
                      </MenuItem>
                    ))}
                  </Select>

                  <IconButton onClick={() => removeTransferRow(index)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>

                  {index === transferRows.length - 1 && (
                    <IconButton onClick={addTransferRow}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCloseDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCloseInventory} 
            color="error"
            disabled={isCloseDisabled}
          >
            Close Inventory
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default TopBar;