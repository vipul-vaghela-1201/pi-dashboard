import React, { useState, useEffect } from 'react';
import { InventoryContext } from '../contexts/InventoryContext';

const STORAGE_KEY = 'inventoryAppData';

export const InventoryProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    // Load from localStorage if available
    const savedData = localStorage.getItem(STORAGE_KEY);
  //   return savedData ? JSON.parse(savedData) : {
  //     inventories: ["Default Inventory", "Secondary Inventory"],
  //     selectedInventory: "Default Inventory",
  //     allProducts: {
  //       "Default Inventory": [],
  //       "Secondary Inventory": []
  //     },
  //     productsData: {
  //       "Default Inventory": [],
  //       "Secondary Inventory": []
  //     }
  //   };
  // });
    return savedData ? JSON.parse(savedData) : {
        inventories: ["Default Inventory", "Secondary Inventory"],
        selectedInventory: "Default Inventory",
        allProducts: {
          "Default Inventory": [],
          "Secondary Inventory": []
        },
        productsData: {
          "Default Inventory": [
            {
              id: 1,
              name: "Sample Product",
              price: 10.99,
              stock: 100,
              image: "",
              inCart: 0,
              inventory: "Default Inventory",
              details: {
                inTransit: 0,
                delivered: 0,
                totalSold: 0,
                deliveringToday: 0
              }
            }
          ],
          "Secondary Inventory": []
        }
      };
    });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const getAllProducts = () => {
  return Object.entries(state.productsData).flatMap(([inventory, products]) => 
    products.map(product => ({ 
      ...product, 
      inventory // Add inventory name to each product
    }))
  );
};

  const addInventory = (name) => {
    if (name.trim() && !state.inventories.includes(name)) {
      setState(prev => ({
        ...prev,
        inventories: [...prev.inventories, name],
        selectedInventory: name,
        allProducts: { ...prev.allProducts, [name]: [] },
        productsData: { ...prev.productsData, [name]: [] }
      }));
    }
  };

  const removeInventory = (name, transferData = []) => {
    const updatedInventories = state.inventories.filter(inv => inv !== name);
    
    // Handle product transfers
    const updatedProducts = { ...state.allProducts };
    const updatedProductsData = { ...state.productsData };
    
    transferData.forEach(({ targetInventory, products }) => {
      if (targetInventory && products.length > 0) {
        updatedProducts[targetInventory] = [
          ...(updatedProducts[targetInventory] || []),
          ...products.map(p => p.name)
        ];
        
        updatedProductsData[targetInventory] = [
          ...(updatedProductsData[targetInventory] || []),
          ...products
        ];
      }
    });
    
    delete updatedProducts[name];
    delete updatedProductsData[name];
    
    setState(prev => ({
      ...prev,
      inventories: updatedInventories,
      selectedInventory: prev.selectedInventory === name ? 
        (updatedInventories[0] || '') : prev.selectedInventory,
      allProducts: updatedProducts,
      productsData: updatedProductsData
    }));
  };

  const setSelectedInventory = (inventory) => {
    setState(prev => ({ ...prev, selectedInventory: inventory }));
  };

  // const updateProducts = (inventory, products) => {
  //   setState(prev => ({
  //     ...prev,
  //     productsData: {
  //       ...prev.productsData,
  //       [inventory]: products
  //     },
  //     allProducts: {
  //       ...prev.allProducts,
  //       [inventory]: products.map(p => p.name)
  //     }
  //   }));
  // };

  const updateProducts = (inventory, products) => {
  setState(prev => ({
    ...prev,
    productsData: {
      ...prev.productsData,
      [inventory]: products.map(p => ({
        ...p,
        // Remove inventory property if it exists (it shouldn't for single inventory updates)
        inventory: undefined,
        details: p.details || {
          inTransit: 0,
          delivered: 0,
          totalSold: 0,
          deliveringToday: 0
        }
      }))
    },
    allProducts: {
      ...prev.allProducts,
      [inventory]: products.map(p => p.name)
    }
  }));
};

  return (
    <InventoryContext.Provider
      value={{
        inventories: ['All Inventory', ...state.inventories],
        selectedInventory: state.selectedInventory,
        setSelectedInventory,
        addInventory,
        removeInventory,
        allProducts: state.allProducts,
        productsData: state.productsData,
        updateProducts,
        getAllProducts
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};