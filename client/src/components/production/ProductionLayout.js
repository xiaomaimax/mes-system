import React from 'react';
import { Outlet } from 'react-router-dom';

const ProductionLayout = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Outlet />
    </div>
  );
};

export default ProductionLayout;