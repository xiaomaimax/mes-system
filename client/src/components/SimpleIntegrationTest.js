import React from 'react';
import { Card } from 'antd';

const SimpleIntegrationTest = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card title="系统集成模块测试">
        <p>如果你能看到这个页面，说明路由配置正确。</p>
        <p>现在让我们检查完整的集成模块...</p>
      </Card>
    </div>
  );
};

export default SimpleIntegrationTest;