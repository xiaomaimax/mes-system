/**
 * HelpPanel - 帮助面板组件
 * 
 * 功能：
 * - 显示当前页面的帮助信息
 * - 提供常见问题解答
 * - 支持展开/收起
 */

import React, { useState } from 'react';
import { Card, Collapse, Button, Drawer, Space, Tag, Empty } from 'antd';
import { QuestionCircleOutlined, CloseOutlined, FileTextOutlined } from '@ant-design/icons';

const HelpPanel = ({ moduleKey, title, description, features, faqs, tips }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  // 帮助内容库
  const helpContent = {
    dashboard: {
      title: '仪表板帮助',
      description: '仪表板是您了解生产状态的中心。它显示关键业务指标和实时数据。',
      features: [
        '实时监控关键指标（产量、质量、效率等）',
        '查看生产趋势和部门绩效',
        '快速访问其他功能模块'
      ],
      faqs: [
        {
          question: '如何更新仪表板上的数据？',
          answer: '数据会自动实时更新。如需手动刷新，请按 F5 或点击浏览器的刷新按钮。'
        },
        {
          question: '我可以自定义仪表板吗？',
          answer: '目前仪表板显示所有用户的标准指标。未来版本将支持自定义。'
        },
        {
          question: '如何导出仪表板数据？',
          answer: '点击"查看详细报表"按钮进入报表模块，可以导出各种格式的数据。'
        }
      ],
      tips: [
        '💡 点击任何指标卡片可以查看更详细的数据',
        '💡 使用左侧菜单快速切换到其他功能模块',
        '💡 定期检查仪表板以了解生产进度'
      ]
    },
    production: {
      title: '生产管理帮助',
      description: '生产管理模块用于管理生产计划、任务分配和进度跟踪。',
      features: [
        '创建和管理生产计划',
        '分配生产任务给员工',
        '实时跟踪任务进度',
        '记录生产数据和报工'
      ],
      faqs: [
        {
          question: '如何创建新的生产计划？',
          answer: '点击"新建计划"按钮，填写计划信息（产品、数量、截止日期等），然后保存。'
        },
        {
          question: '如何分配任务给员工？',
          answer: '在计划详情页面，点击"分配任务"，选择员工和任务类型，设置截止时间。'
        },
        {
          question: '如何更新任务进度？',
          answer: '点击任务卡片，在"进度"字段输入完成百分比，或直接拖动进度条。'
        }
      ],
      tips: [
        '💡 定期检查任务进度，及时发现延期风险',
        '💡 使用筛选功能快速找到特定的计划或任务',
        '💡 为重要任务设置提醒，确保按时完成'
      ]
    },
    quality: {
      title: '质量管理帮助',
      description: '质量管理模块用于记录和监控产品质量数据。',
      features: [
        '记录检验数据（IQC、PQC、FQC、OQC）',
        '监控产品合格率',
        '追踪不良品和返工',
        '生成质量报告'
      ],
      faqs: [
        {
          question: '如何记录检验数据？',
          answer: '点击"新建检验"，选择检验类型，输入检验项目和结果，保存即可。'
        },
        {
          question: '如何处理不良品？',
          answer: '在检验记录中标记为"不良"，系统会自动生成返工单。'
        },
        {
          question: '如何查看质量趋势？',
          answer: '进入"报表分析"模块，选择"质量分析"可以查看合格率、CPK 等趋势。'
        }
      ],
      tips: [
        '💡 及时记录检验数据，确保数据准确性',
        '💡 定期查看质量指标，发现问题及时改进',
        '💡 使用质量报告支持管理决策'
      ]
    },
    inventory: {
      title: '库存管理帮助',
      description: '库存管理模块用于管理原材料和成品库存。',
      features: [
        '管理库存物料',
        '记录出入库操作',
        '库存预警和补货提醒',
        '库存分析和优化'
      ],
      faqs: [
        {
          question: '如何添加新物料？',
          answer: '点击"新建物料"，填写物料信息（名称、规格、单位等），设置库存预警值。'
        },
        {
          question: '如何记录出库？',
          answer: '点击"出库"，选择物料和数量，输入用途，系统会自动更新库存。'
        },
        {
          question: '如何处理库存预警？',
          answer: '当库存低于预警值时，系统会提醒。点击提醒可以快速创建补货单。'
        }
      ],
      tips: [
        '💡 定期检查库存预警，及时补货',
        '💡 使用库存分析优化库存结构',
        '💡 准确记录出入库，确保账实一致'
      ]
    },
    reports: {
      title: '报表分析帮助',
      description: '报表分析模块提供多维度的数据分析和可视化。',
      features: [
        '生产分析报表',
        '质量分析报表',
        '库存分析报表',
        '绩效评估报表'
      ],
      faqs: [
        {
          question: '如何生成报表？',
          answer: '选择报表类型，设置时间范围和筛选条件，点击"生成"即可。'
        },
        {
          question: '如何导出报表？',
          answer: '报表生成后，点击"导出"按钮，选择导出格式（Excel、PDF 等）。'
        },
        {
          question: '如何定时生成报表？',
          answer: '点击"定时任务"，设置生成频率和接收人，系统会自动生成并发送。'
        }
      ],
      tips: [
        '💡 定期查看报表，了解业务趋势',
        '💡 使用报表数据支持决策制定',
        '💡 导出报表用于会议和汇报'
      ]
    }
  };

  const content = helpContent[moduleKey] || {
    title: '帮助',
    description: '欢迎使用 MES 系统。如有问题，请查看下方的常见问题。',
    features: [],
    faqs: [],
    tips: []
  };

  const faqItems = (content.faqs || []).map((faq, index) => ({
    key: index,
    label: faq.question,
    children: <p style={{ margin: 0, color: '#666', lineHeight: 1.6 }}>{faq.answer}</p>
  }));

  return (
    <>
      {/* 帮助按钮 */}
      <Button
        type="text"
        icon={<QuestionCircleOutlined />}
        onClick={() => setIsOpen(true)}
        style={{ color: '#1890ff' }}
        title="点击查看帮助"
      />

      {/* 帮助抽屉 */}
      <Drawer
        title={
          <Space>
            <FileTextOutlined style={{ color: '#1890ff' }} />
            <span>{content.title}</span>
          </Space>
        }
        placement="right"
        onClose={() => setIsOpen(false)}
        open={isOpen}
        width={400}
        bodyStyle={{ padding: '16px' }}
      >
        {/* 模块描述 */}
        <Card
          size="small"
          style={{ marginBottom: '16px', background: '#f0f7ff', border: '1px solid #b3d8ff' }}
        >
          <p style={{ margin: 0, color: '#0050b3', fontSize: '14px', lineHeight: 1.6 }}>
            {content.description}
          </p>
        </Card>

        {/* 核心功能 */}
        {content.features && content.features.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '8px', color: '#1890ff' }}>核心功能</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#666', fontSize: '13px' }}>
              {content.features.map((feature, index) => (
                <li key={index} style={{ marginBottom: '4px' }}>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 常见问题 */}
        {content.faqs && content.faqs.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '8px', color: '#1890ff' }}>常见问题</h4>
            <Collapse
              items={faqItems}
              size="small"
              style={{ background: 'transparent' }}
            />
          </div>
        )}

        {/* 提示 */}
        {content.tips && content.tips.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '8px', color: '#1890ff' }}>使用提示</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {content.tips.map((tip, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px 12px',
                    background: '#fffbe6',
                    border: '1px solid #ffe58f',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#666',
                    lineHeight: 1.5
                  }}
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 底部提示 */}
        <Card
          size="small"
          style={{ marginTop: '16px', background: '#f6f8fb', border: '1px solid #d9d9d9' }}
        >
          <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
            💬 如需更多帮助，请联系系统管理员或查看完整文档。
          </p>
        </Card>
      </Drawer>
    </>
  );
};

export default HelpPanel;
