import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useInventory } from '../hooks/useInventory';

const CloseInventoryModal = ({
  open,
  onClose,
  allProducts
}) => {
  const { inventories, selectedInventory, removeInventory } = useInventory();
  const [confirmClose, setConfirmClose] = useState(false);
  const [transferRows, setTransferRows] = useState([{ targetInventory: '', products: [] }]);

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
    return allProducts.filter(product => !allSelectedProducts.includes(product));
  };

  const getAvailableTargetInventories = () => {
    return inventories.filter(inv => inv !== selectedInventory);
  };

  const handleSubmit = () => {
    if (confirmClose) {
      // Process the transfers first
      console.log("Transfer data:", transferRows);
      // In a real app, you would update your state/API here
    }
    removeInventory(selectedInventory);
    onClose();
  };

  const isDisabled = confirmClose && transferRows.some(row => 
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
                  renderValue={(selected) => <SelectedProducts selected={selected} rowIndex={index} />}
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
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          color="error"
          disabled={isDisabled}
        >
          Close Inventory
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CloseInventoryModal;