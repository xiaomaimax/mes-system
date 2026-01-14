#!/bin/bash

################################################################################
# MES制造执行系统 - Ubuntu自动部署脚本
# 
# 使用方法：
#   chmod +x deploy.sh
#   ./deploy.sh
#
# 该脚本将自动完成以下操作：
#   1. 检查系统环境
#   2. 安装必要的软件包
#   3. 配置数据库
#   4. 部署应用
#   5. 启动服务
#
################################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否为root用户
check_root() {
    if [ "$EUID" -eq 0 ]; then
        log_warning "不建议使用root用户运行此脚本"
        read -p "是否继续？(y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# 检查系统
check_system() {
    log_info "检查系统环境..."
    
    if ! grep -q "Ubuntu" /etc/os-release; then
        log_error "此脚本仅支持Ubuntu系统"
        exit 1
    fi
    
    log_success "系统检查通过"
}

# 更新系统包
update_system() {
    log_info "更新系统包..."
    sudo apt update
    sudo apt upgrade -y
    sudo apt install -y curl wget git build-essential
    log_success "系统包更新完成"
}

# 安装Node.js
install_nodejs() {
    log_info "检查Node.js..."
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js已安装: $NODE_VERSION"
        return
    fi
    
    log_info "安装Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    
    log_success "Node.js安装完成: $(node --version)"
}

# 安装MySQL
install_mysql() {
    log_info "检查MySQL..."
    
    if command -v mysql &> /dev/null; then
        MYSQL_VERSION=$(mysql --version)
        log_success "MySQL已安装: $MYSQL_VERSION"
        return
    fi
    
    log_info "安装MySQL..."
    sudo apt install -y mysql-server
    sudo systemctl start mysql
    sudo systemctl enable mysql
    
    log_success "MySQL安装完成"
}

# 安装PM2
install_pm2() {
    log_info "检查PM2..."
    
    if sudo npm list -g pm2 &> /dev/null; then
        PM2_VERSION=$(pm2 --version)
        log_success "PM2已安装: $PM2_VERSION"
        return
    fi
    
    log_info "安装PM2..."
    sudo npm install -g pm2
    
    log_success "PM2安装完成"
}

# 安装Nginx
install_nginx() {
    log_info "检查Nginx..."
    
    if command -v nginx &> /dev/null; then
        NGINX_VERSION=$(nginx -v 2>&1)
        log_success "Nginx已安装: $NGINX_VERSION"
        return
    fi
    
    log_info "安装Nginx..."
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    log_success "Nginx安装完成"
}

# 配置数据库
setup_database() {
    log_info "配置数据库..."
    
    read -p "请输入MySQL root密码: " -s MYSQL_ROOT_PASSWORD
    echo
    
    read -p "请输入MES数据库用户密码: " -s MYSQL_MES_PASSWORD
    echo
    
    # 创建数据库和用户
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" << EOF
CREATE DATABASE IF NOT EXISTS mes_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'mes_user'@'localhost' IDENTIFIED BY '$MYSQL_MES_PASSWORD';
GRANT ALL PRIVILEGES ON mes_system.* TO 'mes_user'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    log_success "数据库配置完成"
    
    # 保存密码到环境变量文件
    echo "MYSQL_MES_PASSWORD=$MYSQL_MES_PASSWORD" >> ~/.bashrc
}

# 部署应用
deploy_application() {
    log_info "部署应用..."
    
    # 获取项目目录
    PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    cd "$PROJECT_DIR"
    
    # 配置环境变量
    if [ ! -f .env ]; then
        log_info "创建.env文件..."
        cp .env.example .env
        
        # 生成JWT密钥
        JWT_SECRET=$(openssl rand -base64 32)
        
        # 更新.env文件
        sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$MYSQL_MES_PASSWORD/" .env
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
        sed -i "s/NODE_ENV=.*/NODE_ENV=production/" .env
        
        log_success ".env文件已创建"
    fi
    
    # 安装依赖
    log_info "安装项目依赖..."
    npm install
    cd client && npm install && cd ..
    log_success "依赖安装完成"
    
    # 初始化数据库
    log_info "初始化数据库..."
    mysql -u mes_user -p"$MYSQL_MES_PASSWORD" mes_system < database/init.sql
    log_success "数据库初始化完成"
    
    # 构建前端
    log_info "构建前端应用..."
    npm run build
    log_success "前端构建完成"
}

# 启动应用
start_application() {
    log_info "启动应用..."
    
    PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$PROJECT_DIR"
    
    # 创建PM2配置文件
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'mes-api',
      script: './server/app.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
EOF
    
    # 创建日志目录
    mkdir -p logs
    
    # 启动应用
    pm2 start ecosystem.config.js
    pm2 save
    
    log_success "应用启动完成"
}

# 配置Nginx
setup_nginx() {
    log_info "配置Nginx..."
    
    read -p "请输入服务器IP或域名 (默认: localhost): " SERVER_NAME
    SERVER_NAME=${SERVER_NAME:-localhost}
    
    # 创建Nginx配置
    sudo tee /etc/nginx/sites-available/mes-system > /dev/null << EOF
server {
    listen 80;
    server_name $SERVER_NAME;

    access_log /var/log/nginx/mes-access.log;
    error_log /var/log/nginx/mes-error.log;

    client_max_body_size 100M;

    location / {
        root $(pwd)/client/build;
        try_files \$uri \$uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }

    location /socket.io {
        proxy_pass http://localhost:5000/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF
    
    # 启用配置
    sudo ln -sf /etc/nginx/sites-available/mes-system /etc/nginx/sites-enabled/
    
    # 测试配置
    if sudo nginx -t; then
        sudo systemctl restart nginx
        log_success "Nginx配置完成"
    else
        log_error "Nginx配置有误"
        exit 1
    fi
}

# 验证部署
verify_deployment() {
    log_info "验证部署..."
    
    sleep 2
    
    # 检查API
    if curl -s http://localhost:5000/api/health | grep -q "ok"; then
        log_success "API服务正常"
    else
        log_warning "API服务检查失败"
    fi
    
    # 检查Nginx
    if sudo systemctl is-active --quiet nginx; then
        log_success "Nginx服务正常"
    else
        log_warning "Nginx服务未运行"
    fi
    
    # 检查MySQL
    if sudo systemctl is-active --quiet mysql; then
        log_success "MySQL服务正常"
    else
        log_warning "MySQL服务未运行"
    fi
}

# 显示部署信息
show_deployment_info() {
    log_info "部署完成！"
    echo ""
    echo "================================"
    echo "MES系统部署信息"
    echo "================================"
    echo "前端地址: http://localhost"
    echo "API地址: http://localhost/api"
    echo "API健康检查: http://localhost:5000/api/health"
    echo ""
    echo "常用命令:"
    echo "  查看应用状态: pm2 status"
    echo "  查看应用日志: pm2 logs mes-api"
    echo "  重启应用: pm2 restart mes-api"
    echo "  停止应用: pm2 stop mes-api"
    echo ""
    echo "更多信息请查看: UBUNTU_DEPLOYMENT_GUIDE.md"
    echo "================================"
}

# 主函数
main() {
    log_info "开始部署MES制造执行系统..."
    echo ""
    
    check_root
    check_system
    update_system
    install_nodejs
    install_mysql
    install_pm2
    install_nginx
    setup_database
    deploy_application
    start_application
    setup_nginx
    verify_deployment
    show_deployment_info
}

# 运行主函数
main
