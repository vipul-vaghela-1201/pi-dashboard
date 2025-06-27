import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
  IconButton,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const ProductFormModal = ({ open, onClose, product, products, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    stock: 0,
    image: ''
  });
  const [isNewProduct, setIsNewProduct] = useState(true);
  const [productOptions, setProductOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [priceDisabled, setPriceDisabled] = useState(true);

  useEffect(() => {
    if (open) {
      if (product) {
        // Editing existing product
        setFormData({
          name: product.name,
          price: product.price,
          stock: 0,
          image: product.image
        });
        setIsNewProduct(false);
        setPriceDisabled(true);
      } else {
        // Adding new product
        setFormData({
          name: '',
          price: 0,
          stock: 0,
          image: ''
        });
        setIsNewProduct(true);
        setPriceDisabled(false);
      }
      // Prepare unique product options for autocomplete
      const uniqueProducts = Array.from(new Set(products.map(p => p.name)))
        .map(name => {
          const prod = products.find(p => p.name === name);
          return { label: prod.name, id: prod.id };
        });
      setProductOptions(uniqueProducts);
    }
  }, [open, product, products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value
    }));
  };

  const handleProductSelect = (event, value) => {
    if (value) {
      const selectedProduct = products.find(p => p.id === value.id);
      if (selectedProduct) {
        setFormData({
          name: selectedProduct.name,
          price: selectedProduct.price,
          stock: 0,
          image: selectedProduct.image
        });
        setIsNewProduct(false);
        setPriceDisabled(false); // Enable price field when selecting existing product
      }
    } else {
      setFormData({
        name: '',
        price: 0,
        stock: 0,
        image: ''
      });
      setIsNewProduct(true);
      setPriceDisabled(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave({
        ...formData,
        price: parseFloat(formData.price.toFixed(2))
      }, isNewProduct);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{product ? 'Add Stock to Product' : 'Add New Product'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <label htmlFor="product-image-upload">
              <input
                id="product-image-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <IconButton component="span" disabled={loading}>
                <Avatar
                  src={formData.image}
                  sx={{ width: 100, height: 100 }}
                >
                  {!formData.image && <AddPhotoAlternateIcon fontSize="large" />}
                </Avatar>
              </IconButton>
            </label>
          </Box>

          {!product && (
            <Autocomplete
              options={productOptions}
              freeSolo
              onChange={handleProductSelect}
              disabled={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Product Name"
                  margin="normal"
                  required
                  disabled={loading}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    setIsNewProduct(true);
                    setPriceDisabled(false);
                  }}
                />
              )}
            />
          )}

          {product ? (
            <TextField
              name="name"
              label="Product Name"
              value={formData.name}
              fullWidth
              margin="normal"
              disabled
            />
          ) : null}

          <TextField
            name="price"
            label="Price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            required
            disabled={priceDisabled || loading}
          />

          <TextField
            name="stock"
            label={product ? "Quantity to Add" : "Initial Stock"}
            type="number"
            value={formData.stock}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputProps={{ inputProps: { min: 0 } }}
            required
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={
            loading ||
            !formData.name || 
            formData.price <= 0 || 
            formData.stock <= 0 ||
            (isNewProduct && products.some(p => p.name === formData.name))
          }
        >
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductFormModal;