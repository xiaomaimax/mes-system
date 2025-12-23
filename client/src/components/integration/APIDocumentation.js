import React, { useState } from 'react';
import { Card, Tabs, Descriptions, Tag, Button, Space, Collapse, Table, Input, Select } from 'antd';
import { ApiOutlined, CodeOutlined, FileTextOutlined, PlayCircleOutlined, CopyOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;

const APIDocumentation = () => {
  const [activeTab, setActiveTab] = useState('rest-api');

  // API文档数据
  const apiDocData = [
    {
      key: '1',
      method: 'POST',
      endpoint: '/api/v1/production-orders',
      description: '创建生产订单',
      version: 'v1.0',
      status: '稳定'
    },
    {
      key: '2',
      method: 'GET',
      endpoint: '/api/v1/production-orders/{id}',
      description: '获取生产订单详情',
      version: 'v1.0',
      status: '稳定'
    },
    {
      key: '3',
      method: 'PUT',
      endpoint: '/api/v1/production-orders/{id}',
      description: '更新生产订单',
      version: 'v1.0',
      status: '稳定'
    },
    {
      key: '4',
      method: 'POST',
      endpoint: '/api/v1/inventory/sync',
      description: '同步库存数据',
      version: 'v1.1',
      status: '测试中'
    }
  ];

  const columns = [
    {
      title: '方法',
      dataIndex: 'method',
      key: 'method',
      render: (method) => (
        <Tag color={
          method === 'GET' ? 'blue' : 
          method === 'POST' ? 'green' : 
          method === 'PUT' ? 'orange' : 
          method === 'DELETE' ? 'red' : 'default'
        }>
          {method}
        </Tag>
      )
    },
    {
      title: '接口地址',
      dataIndex: 'endpoint',
      key: 'endpoint'
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === '稳定' ? 'green' : status === '测试中' ? 'orange' : 'red'}>
          {status}
        </Tag>
      )
    }
  ];

  const tabItems = [
    {
      key: 'rest-api',
      label: 'REST API',
      icon: <ApiOutlined />
    },
    {
      key: 'soap-api',
      label: 'SOAP API',
      icon: <CodeOutlined />
    },
    {
      key: 'examples',
      label: '调用示例',
      icon: <FileTextOutlined />
    }
  ];

  const renderRestAPI = () => (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Space>
          <Input.Search placeholder="搜索API..." style={{ width: 300 }} />
          <Select placeholder="HTTP方法" style={{ width: 120 }} allowClear>
            <Option value="GET">GET</Option>
            <Option value="POST">POST</Option>
            <Option value="PUT">PUT</Option>
            <Option value="DELETE">DELETE</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={apiDocData}
        pagination={false}
        size="small"
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ padding: '16px', background: '#fafafa' }}>
              <Descriptions title="API详情" size="small" column={2}>
                <Descriptions.Item label="请求方法">{record.method}</Descriptions.Item>
                <Descriptions.Item label="接口版本">{record.version}</Descriptions.Item>
                <Descriptions.Item label="认证方式">Bearer Token</Descriptions.Item>
                <Descriptions.Item label="内容类型">application/json</Descriptions.Item>
              </Descriptions>
              
              <div style={{ marginTop: '16px' }}>
                <h4>请求参数</h4>
                <pre style={{ background: '#f5f5f5', padding: '8px', fontSize: '12px' }}>
{`{
  "orderNo": "PO202412200001",
  "productCode": "P001",
  "quantity": 100,
  "planStartDate": "2024-12-21T08:00:00Z",
  "planEndDate": "2024-12-21T18:00:00Z"
}`}
                </pre>
              </div>

              <div style={{ marginTop: '16px' }}>
                <h4>响应示例</h4>
                <pre style={{ background: '#f5f5f5', padding: '8px', fontSize: '12px' }}>
{`{
  "code": 200,
  "message": "success",
  "data": {
    "id": "12345",
    "orderNo": "PO202412200001",
    "status": "created"
  }
}`}
                </pre>
              </div>
            </div>
          )
        }}
      />
    </div>
  );

  const renderSOAPAPI = () => (
    <div>
      <Card title="SOAP Web Services" size="small">
        <Collapse>
          <Panel header="库存同步服务 (InventoryService)" key="1">
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="服务地址">http://mes.company.com/soap/InventoryService</Descriptions.Item>
              <Descriptions.Item label="命名空间">http://mes.company.com/inventory</Descriptions.Item>
              <Descriptions.Item label="WSDL">http://mes.company.com/soap/InventoryService?wsdl</Descriptions.Item>
            </Descriptions>
            
            <div style={{ marginTop: '16px' }}>
              <h4>方法列表</h4>
              <ul>
                <li>syncInventoryData - 同步库存数据</li>
                <li>getInventoryStatus - 获取库存状态</li>
                <li>updateInventoryLevel - 更新库存水平</li>
              </ul>
            </div>
          </Panel>
          
          <Panel header="生产订单服务 (ProductionOrderService)" key="2">
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="服务地址">http://mes.company.com/soap/ProductionOrderService</Descriptions.Item>
              <Descriptions.Item label="命名空间">http://mes.company.com/production</Descriptions.Item>
              <Descriptions.Item label="WSDL">http://mes.company.com/soap/ProductionOrderService?wsdl</Descriptions.Item>
            </Descriptions>
            
            <div style={{ marginTop: '16px' }}>
              <h4>方法列表</h4>
              <ul>
                <li>createProductionOrder - 创建生产订单</li>
                <li>updateOrderStatus - 更新订单状态</li>
                <li>getOrderProgress - 获取订单进度</li>
              </ul>
            </div>
          </Panel>
        </Collapse>
      </Card>
    </div>
  );

  const renderExamples = () => (
    <div>
      <Card title="调用示例" size="small">
        <Collapse>
          <Panel header="JavaScript (Axios)" key="1">
            <pre style={{ background: '#f5f5f5', padding: '16px', fontSize: '12px' }}>
{`// 创建生产订单
const axios = require('axios');

const createProductionOrder = async () => {
  try {
    const response = await axios.post('http://mes.company.com/api/v1/production-orders', {
      orderNo: 'PO202412200001',
      productCode: 'P001',
      quantity: 100,
      planStartDate: '2024-12-21T08:00:00Z',
      planEndDate: '2024-12-21T18:00:00Z'
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('订单创建成功:', response.data);
  } catch (error) {
    console.error('创建失败:', error.response.data);
  }
};`}
            </pre>
            <Button icon={<CopyOutlined />} size="small">复制代码</Button>
          </Panel>
          
          <Panel header="Java (Spring RestTemplate)" key="2">
            <pre style={{ background: '#f5f5f5', padding: '16px', fontSize: '12px' }}>
{`// Java调用示例
@Service
public class MESIntegrationService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    public void createProductionOrder(ProductionOrderDTO order) {
        String url = "http://mes.company.com/api/v1/production-orders";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth("YOUR_TOKEN");
        
        HttpEntity<ProductionOrderDTO> request = new HttpEntity<>(order, headers);
        
        try {
            ResponseEntity<ApiResponse> response = restTemplate.postForEntity(
                url, request, ApiResponse.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                System.out.println("订单创建成功: " + response.getBody());
            }
        } catch (Exception e) {
            System.err.println("创建失败: " + e.getMessage());
        }
    }
}`}
            </pre>
            <Button icon={<CopyOutlined />} size="small">复制代码</Button>
          </Panel>
          
          <Panel header="Python (Requests)" key="3">
            <pre style={{ background: '#f5f5f5', padding: '16px', fontSize: '12px' }}>
{`# Python调用示例
import requests
import json

def create_production_order():
    url = "http://mes.company.com/api/v1/production-orders"
    
    headers = {
        "Authorization": "Bearer YOUR_TOKEN",
        "Content-Type": "application/json"
    }
    
    data = {
        "orderNo": "PO202412200001",
        "productCode": "P001",
        "quantity": 100,
        "planStartDate": "2024-12-21T08:00:00Z",
        "planEndDate": "2024-12-21T18:00:00Z"
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        print(f"订单创建成功: {result}")
        
    except requests.exceptions.RequestException as e:
        print(f"创建失败: {e}")`}
            </pre>
            <Button icon={<CopyOutlined />} size="small">复制代码</Button>
          </Panel>
        </Collapse>
      </Card>
    </div>
  );

  return (
    <div>
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems.map(item => ({
            ...item,
            children: 
              item.key === 'rest-api' ? renderRestAPI() :
              item.key === 'soap-api' ? renderSOAPAPI() :
              renderExamples()
          }))}
          size="small"
        />
      </Card>
    </div>
  );
};

export default APIDocumentation;