import React from 'react';
import { Box, Typography } from '@mui/material';

const ProductsBlockView = () => {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h6">Block View - Coming Soon</Typography>
      <Typography variant="body1">Switch back to Grid View to see products</Typography>
    </Box>
  );
};

export default ProductsBlockView;