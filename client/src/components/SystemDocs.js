import React from 'react';
import { FileTextOutlined, BookOutlined, RocketOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Typography, Tabs, List, Card, Tag, Timeline, Button, Space, Divider, Collapse, Row, Col, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;

/**
 * 系统文档页面
 * 包含：项目介绍、系统部署、更新日志、文档预览
 */
function SystemDocs() {
  const navigate = useNavigate();

  // 文档分类数据
  const docCategories = [
    {
      title: '快速入门',
      icon: '📘',
      docs: [
        { name: 'MES 系统简介', path: '/docs/intro.md', tag: '必读' },
        { name: '系统功能概览', path: '/docs/features.md', tag: '新手' },
        { name: '快速上手指南', path: '/docs/quickstart.md', tag: '实操' },
        { name: '常见问题 FAQ', path: '/docs/faq.md', tag: '帮助' },
      ]
    },
    {
      title: '用户指南',
      icon: '📗',
      docs: [
        { name: '工艺管理操作手册', path: '/docs/process-guide.md' },
        { name: '生产管理操作手册', path: '/docs/production-guide.md' },
        { name: '设备管理操作手册', path: '/docs/equipment-guide.md' },
        { name: '质量管理操作手册', path: '/docs/quality-guide.md' },
        { name: '库存管理操作手册', path: '/docs/inventory-guide.md' },
        { name: '人员管理操作手册', path: '/docs/personnel-guide.md' },
      ]
    },
    {
      title: '技术文档',
      icon: '📙',
      docs: [
        { name: '系统架构说明', path: '/docs/architecture.md', tag: '技术' },
        { name: 'API 接口文档', path: '/docs/api.md', tag: '开发' },
        { name: '数据库设计文档', path: '/docs/database.md', tag: '技术' },
        { name: '部署配置指南', path: '/docs/deployment.md', tag: '运维' },
      ]
    },
    {
      title: '优化报告',
      icon: '📕',
      docs: [
        { name: 'UI/UX 优化 Phase 1-5', path: '/docs/ui-optimization.md', tag: '最新' },
        { name: '性能优化报告', path: '/docs/performance.md', tag: '性能' },
        { name: 'PWA 实施文档', path: '/docs/pwa.md', tag: '功能' },
      ]
    },
  ];

  // 更新日志数据
  const updateLogs = [
    {
      version: 'v1.5.0',
      date: '2026-04-04',
      type: 'feature',
      title: 'UI/UX 优化项目完成',
      changes: [
        '完成 Phase 1-5 全面优化（基础系统、组件重构、页面优化、细节打磨、性能优化）',
        '新增 PWA 支持，可离线访问和添加到主屏幕',
        '启用 Gzip 压缩，传输体积减少 73%',
        '配置浏览器缓存，二次加载速度提升 75%',
        'Lighthouse 性能评分达到 95+ 分',
        '新增系统文档菜单和功能',
      ]
    },
    {
      version: 'v1.4.0',
      date: '2026-03-30',
      type: 'performance',
      title: '性能优化',
      changes: [
        '新增 Redis 缓存中间件',
        '优化 API 响应速度',
        '开启 MySQL 慢查询日志',
        '前端构建优化（819.43 kB gzipped）',
      ]
    },
    {
      version: 'v1.3.0',
      date: '2026-03-28',
      type: 'feature',
      title: 'CRUD 功能扩展',
      changes: [
        '通用 CRUD 系统部署到所有模块',
        '动态字段过滤功能',
        'POST/PUT/DELETE 功能修复',
        'CI/CD自动化配置完成',
      ]
    },
    {
      version: 'v1.2.0',
      date: '2026-03-25',
      type: 'fix',
      title: '系统修复',
      changes: [
        '修复前端 API 连接问题',
        '优化 Nginx 配置',
        '修复登录认证 bug',
      ]
    },
    {
      version: 'v1.1.0',
      date: '2026-03-20',
      type: 'feature',
      title: '功能增强',
      changes: [
        '新增系统监控页面',
        '新增报表分析模块',
        '优化用户体验',
      ]
    },
    {
      version: 'v1.0.0',
      date: '2026-03-15',
      type: 'release',
      title: '正式发布',
      changes: [
        'MES 系统正式上线',
        '包含 8 大核心模块',
        '支持多用户权限管理',
      ]
    },
  ];

  // 部署步骤数据
  const deploySteps = [
    {
      title: '环境准备',
      icon: '🔧',
      content: (
        <>
          <Paragraph><strong>系统要求：</strong></Paragraph>
          <ul>
            <li>操作系统：Ubuntu 20.04+ / CentOS 7+</li>
            <li>Node.js: v18.0+</li>
            <li>Python: v3.8+</li>
            <li>MySQL: v8.0+</li>
            <li>Nginx: v1.20+</li>
            <li>PM2: 最新稳定版</li>
          </ul>
          <Paragraph><strong>安装依赖：</strong></Paragraph>
          <Paragraph code block>
{`# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 安装 Python 依赖
pip3 install flask flask-cors pymysql redis`}
          </Paragraph>
        </>
      )
    },
    {
      title: '代码部署',
      icon: '📦',
      content: (
        <>
          <Paragraph><strong>1. 克隆代码：</strong></Paragraph>
          <Paragraph code block>
{`git clone https://github.com/xiaomaimax/mes-system.git
cd mes-system`}
          </Paragraph>
          <Paragraph><strong>2. 安装前端依赖：</strong></Paragraph>
          <Paragraph code block>
{`cd client
npm install`}
          </Paragraph>
          <Paragraph><strong>3. 构建生产版本：</strong></Paragraph>
          <Paragraph code block>
{`npm run build`}
          </Paragraph>
        </>
      )
    },
    {
      title: '数据库配置',
      icon: '🗄️',
      content: (
        <>
          <Paragraph><strong>1. 创建数据库：</strong></Paragraph>
          <Paragraph code block>
{`mysql -u root -p
CREATE DATABASE mes_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mes_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON mes_system.* TO 'mes_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;`}
          </Paragraph>
          <Paragraph><strong>2. 导入数据：</strong></Paragraph>
          <Paragraph code block>
{`mysql -u mes_user -p mes_system < backups/database/mes_system_latest.sql`}
          </Paragraph>
        </>
      )
    },
    {
      title: '后端部署',
      icon: '⚙️',
      content: (
        <>
          <Paragraph><strong>1. 配置环境变量：</strong></Paragraph>
          <Paragraph code block>
{`cd server
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息`}
          </Paragraph>
          <Paragraph><strong>2. 启动后端服务：</strong></Paragraph>
          <Paragraph code block>
{`pm2 start app.js --name mes-api
pm2 save
pm2 startup`}
          </Paragraph>
        </>
      )
    },
    {
      title: '前端部署',
      icon: '🎨',
      content: (
        <>
          <Paragraph><strong>1. 配置 Nginx：</strong></Paragraph>
          <Paragraph code block>
{`sudo cp /opt/mes-system/nginx.conf /etc/nginx/sites-enabled/mes
sudo nginx -t
sudo nginx -s reload`}
          </Paragraph>
          <Paragraph><strong>2. 验证访问：</strong></Paragraph>
          <Paragraph>访问 http://your-server-ip 验证系统是否正常运行</Paragraph>
        </>
      )
    },
    {
      title: '验证检查',
      icon: '✅',
      content: (
        <>
          <Paragraph><strong>检查清单：</strong></Paragraph>
          <ul>
            <li>✅ 前端页面可正常访问</li>
            <li>✅ 登录功能正常</li>
            <li>✅ 各模块功能正常</li>
            <li>✅ API 接口响应正常</li>
            <li>✅ 数据库连接正常</li>
            <li>✅ PM2 进程运行正常</li>
            <li>✅ Nginx 配置正确</li>
          </ul>
          <Paragraph><strong>常用命令：</strong></Paragraph>
          <Paragraph code block>
{`# 查看 PM2 进程
pm2 list

# 查看日志
pm2 logs mes-api --lines 50

# 重启服务
pm2 restart all

# 查看 Nginx 状态
systemctl status nginx`}
          </Paragraph>
        </>
      )
    },
  ];

  // 获取更新日志的类型标签
  const getUpdateTagColor = (type) => {
    const colors = {
      feature: 'blue',
      performance: 'green',
      fix: 'orange',
      release: 'purple',
    };
    return colors[type] || 'default';
  };

  const getUpdateTagText = (type) => {
    const texts = {
      feature: '新功能',
      performance: '性能优化',
      fix: '问题修复',
      release: '正式发布',
    };
    return texts[type] || '更新';
  };

  return (
    <div style={{ padding: '24px' }}>
      <Typography>
        <Title level={2} style={{ marginBottom: 24 }}>
          <BookOutlined style={{ marginRight: 8 }} />
          系统文档
        </Title>
      </Typography>

      <Tabs defaultActiveKey="intro" size="large">
        {/* Tab 1: 项目介绍 */}
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              项目介绍
            </span>
          } 
          key="intro"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card title="🏭 什么是 MES 系统？" style={{ marginBottom: 24 }}>
                <Paragraph>
                  <strong>MES（Manufacturing Execution System，制造执行系统）</strong>是位于上层计划管理系统（如 ERP）与底层工业控制之间的、面向车间层的管理信息系统。
                </Paragraph>
                <Paragraph>
                  它为操作人员/管理人员提供计划的执行、跟踪以及所有资源（人、设备、物料、客户需求等）的当前状态。
                </Paragraph>
                <Divider />
                <Title level={5}>MES 系统的核心价值：</Title>
                <ul>
                  <li>📊 <strong>提高生产效率</strong> - 优化生产流程，减少等待时间</li>
                  <li>🎯 <strong>提升产品质量</strong> - 实时监控质量，快速响应问题</li>
                  <li>💰 <strong>降低生产成本</strong> - 减少浪费，优化资源利用</li>
                  <li>📈 <strong>增强可追溯性</strong> - 完整的生产记录，便于追溯</li>
                  <li>🤖 <strong>支持决策</strong> - 实时数据支持管理决策</li>
                </ul>
              </Card>

              <Card title="🚀 MaxMES 系统能做什么？" style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card size="small" title="📋 工艺管理">
                      <Text type="secondary">管理工艺流程、工艺路线、工艺参数</Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" title="📅 辅助排程">
                      <Text type="secondary">生产计划排程、工单管理</Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" title="🏭 生产管理">
                      <Text type="secondary">生产执行、进度跟踪、报工管理</Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" title="🔧 设备管理">
                      <Text type="secondary">设备档案、维护保养、故障记录</Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" title="✅ 质量管理">
                      <Text type="secondary">质量检验、质量控制、不合格品管理</Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" title="📦 库存管理">
                      <Text type="secondary">物料管理、出入库、库存盘点</Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" title="👥 人员管理">
                      <Text type="secondary">员工档案、技能培训、绩效考核</Text>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card size="small" title="🔗 系统集成">
                      <Text type="secondary">与 ERP、PLM、WMS 等系统集成</Text>
                    </Card>
                  </Col>
                </Row>
              </Card>

              <Card title="📖 如何快速上手？">
                <Timeline>
                  <Timeline.Item dot="📘" color="blue">
                    <Text strong>阅读快速入门文档</Text>
                    <br />
                    <Text type="secondary">了解系统基本概念和功能概览</Text>
                  </Timeline.Item>
                  <Timeline.Item dot="🎯" color="green">
                    <Text strong>完成系统培训</Text>
                    <br />
                    <Text type="secondary">学习各模块的操作流程</Text>
                  </Timeline.Item>
                  <Timeline.Item dot="🔧" color="orange">
                    <Text strong>实际操作练习</Text>
                    <br />
                    <Text type="secondary">在测试环境中进行实操练习</Text>
                  </Timeline.Item>
                  <Timeline.Item dot="✅" color="purple">
                    <Text strong>通过考核认证</Text>
                    <br />
                    <Text type="secondary">完成操作考核，获得系统使用权限</Text>
                  </Timeline.Item>
                  <Timeline.Item dot="🚀" color="red">
                    <Text strong>正式上岗使用</Text>
                    <br />
                    <Text type="secondary">在生产环境中使用系统</Text>
                  </Timeline.Item>
                </Timeline>
                <Divider />
                <Space>
                  <Button type="primary" onClick={() => navigate('/docs/quickstart')}>
                    📘 开始学习
                  </Button>
                  <Button onClick={() => navigate('/docs/faq')}>
                    ❓ 常见问题
                  </Button>
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="📚 文档导航" style={{ marginBottom: 24 }}>
                <List
                  size="small"
                  dataSource={docCategories.flatMap(cat => cat.docs.slice(0, 2))}
                  renderItem={doc => (
                    <List.Item>
                      <Space>
                        <Text>{doc.name}</Text>
                        {doc.tag && <Tag color="blue">{doc.tag}</Tag>}
                      </Space>
                    </List.Item>
                  )}
                />
                <Button type="link" block>
                  查看更多文档 →
                </Button>
              </Card>

              <Card title="📞 技术支持">
                <Paragraph>
                  <strong>遇到问题？</strong>
                </Paragraph>
                <ul>
                  <li>查看 <a href="#faq">常见问题 FAQ</a></li>
                  <li>联系 IT 部门支持</li>
                  <li>提交问题反馈</li>
                </ul>
                <Paragraph>
                  <Text type="secondary">
                    工作时间：周一至周五 9:00-18:00
                  </Text>
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Tab 2: 系统部署 */}
        <TabPane 
          tab={
            <span>
              <RocketOutlined />
              系统部署
            </span>
          } 
          key="deploy"
        >
          <Card title="📋 部署步骤详解" style={{ marginBottom: 24 }}>
            <Collapse accordion>
              {deploySteps.map((step, index) => (
                <Panel 
                  header={
                    <Space>
                      <Text>{step.icon}</Text>
                      <Text strong>{step.title}</Text>
                    </Space>
                  } 
                  key={index}
                >
                  {step.content}
                </Panel>
              ))}
            </Collapse>
          </Card>

          <Card title="📥 相关资源下载">
            <List
              size="small"
              dataSource={[
                { name: 'MES 系统安装包', size: '150MB', type: 'zip' },
                { name: '数据库初始化脚本', size: '5MB', type: 'sql' },
                { name: '部署配置模板', size: '1MB', type: 'conf' },
                { name: '用户手册 PDF', size: '10MB', type: 'pdf' },
              ]}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button type="link" key="download">下载</Button>
                  ]}
                >
                  <Space>
                    <FileTextOutlined />
                    <Text>{item.name}</Text>
                    <Tag color="green">{item.size}</Tag>
                    <Tag>{item.type}</Tag>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        {/* Tab 3: 更新日志 */}
        <TabPane 
          tab={
            <span>
              <ClockCircleOutlined />
              更新日志
            </span>
          } 
          key="changelog"
        >
          <Card title="📝 版本更新历史">
            <Timeline>
              {updateLogs.map((log, index) => (
                <Timeline.Item 
                  key={index}
                  dot={<Tag color={getUpdateTagColor(log.type)}>{getUpdateTagText(log.type)}</Tag>}
                >
                  <Card size="small" style={{ marginBottom: 16 }}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Space>
                        <Text strong>{log.version}</Text>
                        <Text type="secondary">{log.date}</Text>
                      </Space>
                      <Title level={5} style={{ margin: 0 }}>{log.title}</Title>
                      <ul>
                        {log.changes.map((change, i) => (
                          <li key={i}><Text>{change}</Text></li>
                        ))}
                      </ul>
                    </Space>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </TabPane>

        {/* Tab 4: 文档预览 */}
        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              文档预览
            </span>
          } 
          key="preview"
        >
          <Row gutter={[24, 24]}>
            {docCategories.map((category, catIndex) => (
              <Col xs={24} md={12} lg={8} key={catIndex}>
                <Card 
                  title={`${category.icon} ${category.title}`}
                  size="small"
                  hoverable
                >
                  <List
                    size="small"
                    dataSource={category.docs}
                    renderItem={doc => (
                      <List.Item
                        actions={[
                          <Button 
                            type="link" 
                            size="small" 
                            key="preview"
                            onClick={() => window.open(doc.path, '_blank')}
                          >
                            预览
                          </Button>
                        ]}
                      >
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          <Text>{doc.name}</Text>
                          {doc.tag && <Tag color="blue" style={{ fontSize: 12 }}>{doc.tag}</Tag>}
                        </Space>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
}

export default SystemDocs;
