import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useInventory } from '../hooks/useInventory';
import ProductsFilterBar from '../components/products/ProductsFilterBar';
import ProductsGridView from '../components/products/ProductsGridView';
import ProductsBlockView from '../components/products/ProductsBlockView';
import ProductFormModal from '../components/products/ProductFormModal';
import SalesModal from '../components/products/SalesModal';

const ProductsPage = () => {
  const { 
    selectedInventory, 
    productsData,
    updateProducts,
    getAllProducts
  } = useInventory();
  
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [openSalesModal, setOpenSalesModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentSaleProduct, setCurrentSaleProduct] = useState(null);
  
  // Get products based on selected inventory
  const products = useMemo(() => {
    return selectedInventory === 'All Inventory' 
      ? getAllProducts() 
      : productsData[selectedInventory] || [];
  }, [productsData, selectedInventory, getAllProducts]);

  // Calculate available stock for a product
  const calculateAvailableStock = (product) => {
    return product.stock - product.details.totalSold;
  };

  // Update the title to reflect the view
  const pageTitle = selectedInventory === 'All Inventory' 
    ? "All Products Across Inventories" 
    : `${selectedInventory} Products`;

  // Daily delivery processing
  useEffect(() => {
    const checkDeliveries = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const updatedProducts = products.map(p => {
        if (p.details.deliveringToday > 0) {
          return {
            ...p,
            details: {
              ...p.details,
              delivered: p.details.delivered + p.details.deliveringToday,
              inTransit: p.details.inTransit - p.details.deliveringToday,
              deliveringToday: 0
            }
          };
        }
        return p;
      });

      updateProducts(selectedInventory, updatedProducts);
    };

    const timer = setInterval(checkDeliveries, 24 * 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, [products, selectedInventory, updateProducts]);

  // Update the updateLocalProducts function to handle all inventories
  const updateLocalProducts = (updatedProducts) => {
    if (selectedInventory === 'All Inventory') {
      // For all inventory view, we need to update each product in its respective inventory
      const inventoryUpdates = {};
      
      updatedProducts.forEach(product => {
        // Use the inventory property we added to each product
        const inventory = product.inventory;
        if (inventory && inventory !== 'All Inventory') {
          if (!inventoryUpdates[inventory]) {
            inventoryUpdates[inventory] = productsData[inventory].map(p => 
              p.id === product.id ? { ...product, inventory: undefined } : p
            );
          } else {
            inventoryUpdates[inventory] = inventoryUpdates[inventory].map(p => 
              p.id === product.id ? { ...product, inventory: undefined } : p
            );
          }
        }
      });
      
      // Apply all updates
      Object.entries(inventoryUpdates).forEach(([inventory, products]) => {
        updateProducts(inventory, products);
      });
    } else {
      // Normal single inventory update
      updateProducts(selectedInventory, updatedProducts);
    }
  };

  const handleSelectAll = (checked) => {
    setSelectedProducts(checked ? products.map(p => p.id) : []);
  };

  const handleSelectProduct = (id, checked) => {
    setSelectedProducts(prev => 
      checked ? [...prev, id] : prev.filter(pId => pId !== id)
    );
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleAddToCart = (id, quantity) => {
    const updatedProducts = products.map(p => {
      if (p.id === id) {
        const available = calculateAvailableStock(p);
        const newQuantity = Math.min(available, Math.max(0, quantity));
        return { ...p, inCart: newQuantity };
      }
      return p;
    });
    updateLocalProducts(updatedProducts);
  };

  const handleOpenModal = (product = null) => {
    setCurrentProduct(product);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setCurrentProduct(null);
  };

  const handleOpenSales = (product) => {
    setCurrentSaleProduct(product);
    setOpenSalesModal(true);
  };

  const handleCompleteSale = (saleData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deliveryDate = new Date(saleData.deliveryDate);
    deliveryDate.setHours(0, 0, 0, 0);
    
    const isDeliveringToday = deliveryDate.getTime() === today.getTime();
    const isPastDelivery = deliveryDate.getTime() < today.getTime();

    const updatedProducts = products.map(p => {
      if (p.id === saleData.productId) {
        const saleQuantity = Math.min(
          p.stock - p.details.totalSold, 
          saleData.quantity
        );
        
        if (isPastDelivery) {
          return {
            ...p,
            details: {
              ...p.details,
              delivered: p.details.delivered + saleQuantity,
              totalSold: p.details.totalSold + saleQuantity
            }
          };
        } else if (isDeliveringToday) {
          return {
            ...p,
            details: {
              ...p.details,
              inTransit: p.details.inTransit + saleQuantity,
              deliveringToday: p.details.deliveringToday + saleQuantity,
              totalSold: p.details.totalSold + saleQuantity
            }
          };
        } else {
          return {
            ...p,
            details: {
              ...p.details,
              inTransit: p.details.inTransit + saleQuantity,
              totalSold: p.details.totalSold + saleQuantity
            }
          };
        }
      }
      return p;
    });

    updateLocalProducts(updatedProducts);
    setOpenSalesModal(false);
    setCurrentSaleProduct(null);
  };

  const handleSaveProduct = (productData, isNewProduct) => {
    let updatedProducts;
    
    if (!isNewProduct && currentProduct) {
      updatedProducts = products.map(p => 
        p.id === currentProduct.id ? { 
          ...p,
          stock: p.stock + productData.stock,
          inCart: Math.min(p.inCart, calculateAvailableStock({...p, stock: p.stock + productData.stock}))
        } : p
      );
    } else {
      const newProduct = {
        ...productData,
        id: Date.now(),
        inCart: 0,
        details: {
          inTransit: 0,
          delivered: 0,
          totalSold: 0,
          deliveringToday: 0
        }
      };
      updatedProducts = [...products, newProduct];
    }
    
    updateLocalProducts(updatedProducts);
    setOpenModal(false);
    setCurrentProduct(null);
  };

  const handleDeleteProduct = (id) => {
    const updatedProducts = products.filter(p => p.id !== id);
    updateLocalProducts(updatedProducts);
    setSelectedProducts(prev => prev.filter(pId => pId !== id));
  };

  const filteredProducts = products.filter(p => 
  p && p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())
);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {pageTitle}
      </Typography>

      <ProductsFilterBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSelectAll={handleSelectAll}
        onSearch={handleSearch}
        selectedCount={selectedProducts.length}
        totalCount={products.length}
        onAddProduct={() => handleOpenModal()}
        onDeleteSelected={() => {
          selectedProducts.forEach(id => handleDeleteProduct(id));
          setSelectedProducts([]);
        }}
      />

      {viewMode === 'grid' ? (
        <ProductsGridView
          products={filteredProducts}
          selectedProducts={selectedProducts}
          onSelectProduct={handleSelectProduct}
          onEditProduct={handleOpenModal}
          onDeleteProduct={handleDeleteProduct}
          onAddToCart={handleAddToCart}
          onOpenSales={handleOpenSales}
          isAllInventoryView={selectedInventory === 'All Inventory'}
        />
      ) : (
        <ProductsBlockView />
      )}

      <ProductFormModal
        open={openModal}
        onClose={handleCloseModal}
        product={currentProduct}
        products={products}
        onSave={handleSaveProduct}
      />

      <SalesModal
        open={openSalesModal}
        onClose={() => {
          setOpenSalesModal(false);
          setCurrentSaleProduct(null);
        }}
        product={currentSaleProduct}
        onCompleteSale={handleCompleteSale}
      />
    </Box>
  );
};

export default ProductsPage;