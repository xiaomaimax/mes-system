#!/bin/bash
# E2E 测试运行脚本

cd /opt/mes-system

echo ========================================
echo MaxMES E2E 测试
echo ========================================

# 运行测试
npx playwright test --reporter=list

echo 
echo ========================================
echo 测试完成
echo 查看报告: open /opt/mes-system/playwright-report/index.html
echo ========================================
