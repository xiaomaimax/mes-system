import React from 'react';
import { Outlet } from 'react-router-dom';

import ButtonActions from '../../utils/buttonActions';
const EquipmentLayout = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Outlet />
    </div>
  );
};

export default EquipmentLayout;