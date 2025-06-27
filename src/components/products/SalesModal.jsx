import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  InputAdornment
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const SalesModal = ({ 
  open, 
  onClose, 
  product, 
  onCompleteSale 
}) => {
  const [quantity, setQuantity] = useState(1);
  const [shipmentDate, setShipmentDate] = useState(new Date());
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [deliveryBy, setDeliveryBy] = useState('');

  const availableStock = product ? (product.stock - (product.details.inTransit + product.details.delivered)) : 0;

  const handleSubmit = () => {
    const saleData = {
      productId: product.id,
      quantity: Math.min(quantity, availableStock),
      shipmentDate,
      deliveryDate,
      deliveryBy,
      totalAmount: Math.min(quantity, availableStock) * product.price
    };
    onCompleteSale(saleData);
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Record Sale for {product?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                setQuantity(Math.min(availableStock, Math.max(1, value)));
              }}
              fullWidth
              margin="normal"
              InputProps={{
                inputProps: { 
                  min: 1, 
                  max: availableStock 
                }
              }}
              helperText={`Available: ${availableStock}`}
            />

            <DatePicker
              label="Shipment Date"
              value={shipmentDate}
              onChange={(newValue) => setShipmentDate(newValue)}
              renderInput={(params) => (
                <TextField {...params} fullWidth margin="normal" />
              )}
            />

            <DatePicker
              label="Delivery Date"
              value={deliveryDate}
              onChange={(newValue) => setDeliveryDate(newValue)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  fullWidth 
                  margin="normal"
                />
              )}
            />

            <TextField
              label="Delivered By"
              value={deliveryBy}
              onChange={(e) => setDeliveryBy(e.target.value)}
              fullWidth
              margin="normal"
            />

            <TextField
              label="Total Amount"
              value={`$${(Math.min(quantity, availableStock) * product?.price).toFixed(2)}`}
              InputProps={{
                readOnly: true,
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              fullWidth
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={quantity <= 0 || !deliveryBy || availableStock <= 0}
          >
            Complete Sale
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default SalesModal;