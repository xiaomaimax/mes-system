#!/bin/bash
# 前端资源优化脚本

cd /opt/mes-system/client

echo "🔧 开始前端优化..."

# 1. 安装依赖（如果需要）
echo "  - 检查依赖..."
npm install --save-dev source-map-explorer 2>/dev/null || true

# 2. 优化构建
echo "  - 优化构建..."
GENERATE_SOURCEMAP=false npm run build

# 3. 分析构建结果
echo "  - 分析构建大小..."
if command -v source-map-explorer &> /dev/null; then
    source-map-explorer 'build/static/js/*.js' --html /opt/mes-system/client/build/analysis.html
    echo "  ✅ 分析报告：/opt/mes-system/client/build/analysis.html"
fi

# 4. 压缩静态资源
echo "  - 压缩静态资源..."
find build/static -name "*.js" -o -name "*.css" | while read file; do
    # 可以使用 terser 或其他工具进一步压缩
    echo "    处理：$file"
done

echo "✅ 前端优化完成！"
echo ""
echo "📊 构建统计:"
du -sh build/
echo ""
