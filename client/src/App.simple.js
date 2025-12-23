import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>MES系统测试</h1>
      <p>如果你能看到这个页面，说明React应用正在工作。</p>
      <div style={{ marginTop: '20px' }}>
        <h2>库存管理功能已添加：</h2>
        <ul>
          <li>备件寿命预警</li>
          <li>库外备件管理</li>
          <li>库外备件流水</li>
        </ul>
      </div>
    </div>
  );
}

export default App;