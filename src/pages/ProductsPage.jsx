import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  
  // Update the title to reflect the view
  const pageTitle = selectedInventory === 'All Inventory' 
    ? "All Products Across Inventories" 
    : `${selectedInventory} Products`;

    const products = useMemo(() => {
    return selectedInventory === 'All Inventory' 
      ? getAllProducts() 
      : productsData[selectedInventory] || [];
  }, [productsData, selectedInventory, getAllProducts]);

  const calculateAvailableStock = (product) => {
    return product.stock - (product.details?.totalSold || 0);
  };

  const updateLocalProducts = useCallback((updatedProducts) => {
    if (selectedInventory === 'All Inventory') {
      const inventoryUpdates = {};
      
      updatedProducts.forEach(product => {
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
      
      Object.entries(inventoryUpdates).forEach(([inventory, products]) => {
        updateProducts(inventory, products);
      });
    } else {
      updateProducts(selectedInventory, updatedProducts);
    }
  }, [selectedInventory, productsData, updateProducts]);

  useEffect(() => {
    const checkDeliveries = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const updatedProducts = products.map(p => {
        let deliveringTodayCount = 0;
        const updatedShipments = (p.details.shipments || []).map(shipment => {
          const shipmentDate = new Date(shipment.shipmentDate);
          shipmentDate.setHours(0, 0, 0, 0);
          
          if (shipmentDate.getTime() === today.getTime() && !shipment.delivered) {
            deliveringTodayCount += shipment.quantity;
          }

          if (shipmentDate.getTime() <= today.getTime() && !shipment.delivered) {
            return {...shipment, delivered: true};
          }
          return shipment;
        });

        const statusCounts = (p.details.shipments || []).reduce((acc, shipment) => {
          const shipmentDate = new Date(shipment.shipmentDate);
          shipmentDate.setHours(0, 0, 0, 0);
          
          if (shipment.delivered) {
            acc.delivered += shipment.quantity;
          } else if (shipmentDate.getTime() <= today.getTime()) {
            acc.inTransit += shipment.quantity;
          } else {
            acc.yetToDispatch += shipment.quantity;
          }
          return acc;
        }, { inTransit: 0, delivered: 0, yetToDispatch: 0 });

        return {
          ...p,
          details: {
            ...p.details,
            shipments: updatedShipments,
            inTransit: statusCounts.inTransit,
            delivered: statusCounts.delivered,
            yetToDispatch: statusCounts.yetToDispatch,
            deliveringToday: deliveringTodayCount
          }
        };
      });

      updateLocalProducts(updatedProducts);
    };

    const timer = setInterval(checkDeliveries, 24 * 60 * 60 * 1000);
    return () => clearInterval(timer);
  }, [products, updateLocalProducts]);

  const handleCompleteSale = (saleData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deliveryDate = new Date(saleData.deliveryDate);
    deliveryDate.setHours(0, 0, 0, 0);
    
    const isDeliveringToday = deliveryDate.getTime() === today.getTime();
    const isPastDelivery = deliveryDate.getTime() < today.getTime();
    const isFutureDelivery = deliveryDate.getTime() > today.getTime();

    const updatedProducts = products.map(p => {
      if (p.id === saleData.productId) {
        const saleQuantity = Math.min(
          p.stock - p.details.totalSold, 
          saleData.quantity
        );
        
        const newShipment = {
          quantity: saleQuantity,
          shipmentDate: saleData.shipmentDate,
          delivered: isPastDelivery
        };

        return {
          ...p,
          details: {
            ...p.details,
            shipments: [...(p.details.shipments || []), newShipment],
            totalSold: p.details.totalSold + saleQuantity,
            ...(isPastDelivery && {
              delivered: p.details.delivered + saleQuantity
            }),
            ...(isDeliveringToday && {
              inTransit: p.details.inTransit + saleQuantity,
              deliveringToday: p.details.deliveringToday + saleQuantity
            }),
            ...(isFutureDelivery && {
              yetToDispatch: (p.details.yetToDispatch || 0) + saleQuantity
            })
          }
        };
      }
      return p;
    });

    updateLocalProducts(updatedProducts);
    setOpenSalesModal(false);
    setCurrentSaleProduct(null);
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

  const handleOpenSales = (product) => {
    setCurrentSaleProduct(product);
    setOpenSalesModal(true);
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

  const filteredProducts = useMemo(() => {
    const baseProducts = selectedInventory === 'All Inventory' 
      ? getAllProducts() 
      : productsData[selectedInventory] || [];
      
    return baseProducts.filter(p => 
      p && p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [productsData, selectedInventory, searchQuery, getAllProducts]);

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

      {viewMode === 'block' ? (
        <ProductsBlockView
          products={filteredProducts}
          selectedProducts={selectedProducts}
          onSelectProduct={handleSelectProduct}
          onEditProduct={handleOpenModal}
          onDeleteProduct={handleDeleteProduct}
          onAddToCart={handleAddToCart}
          onOpenSales={handleOpenSales}
          isAllInventoryView={selectedInventory === 'All Inventory'}
          isLoading={false}
          error={null}
        />
      ) : (
        <ProductsGridView
          products={filteredProducts}
          selectedProducts={selectedProducts}
          onSelectProduct={handleSelectProduct}
          onEditProduct={handleOpenModal}
          onDeleteProduct={handleDeleteProduct}
          onAddToCart={handleAddToCart}
          onOpenSales={handleOpenSales}
          isAllInventoryView={selectedInventory === 'All Inventory'}
          isLoading={false}
          error={null}
        />
      )}

      <ProductFormModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setCurrentProduct(null);
        }}
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