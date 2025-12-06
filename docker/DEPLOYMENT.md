# Doc2MD 生产环境部署指南

本指南将帮助你在生产服务器上部署 Doc2MD 服务。

> **端口说明**：
> - **开发环境**：Backend API 使用 `8100` 端口，Redis 使用 `6380` 端口（避免与服务器已有服务冲突）
> - **生产环境**：Backend API 使用 `8000` 端口（标准端口），通过 Nginx 反向代理对外提供服务

## 📋 部署前准备

### 1. 服务器要求

- **操作系统**：Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **CPU**：2 核以上
- **内存**：4GB 以上
- **硬盘**：20GB 以上可用空间
- **网络**：公网 IP + 域名（用于 SSL）

### 2. 安装必要软件

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo apt install docker-compose -y

# 将当前用户添加到 docker 组（避免每次都用 sudo）
sudo usermod -aG docker $USER
newgrp docker

# 验证安装
docker --version
docker-compose --version
```

### 3. 准备域名和 DNS

将你的域名 A 记录指向服务器 IP：

```
A    api.doc2md.org    -> 你的服务器IP
```

## 🚀 部署步骤

### 步骤 1：上传代码到服务器

```bash
# 方式一：使用 git（推荐）
cd /opt
sudo git clone https://github.com/your-username/doc2md.git
cd doc2md

# 方式二：使用 scp 上传
# 在本地机器运行：
# tar czf doc2md.tar.gz /path/to/doc2md
# scp doc2md.tar.gz user@server:/opt/
# 在服务器运行：
# cd /opt && tar xzf doc2md.tar.gz
```

### 步骤 2：配置环境变量

```bash
# 复制生产环境配置模板
cp docker/.env.production docker/.env.prod

# 编辑配置文件
nano docker/.env.prod
```

**必须修改的配置项**：

```bash
# Redis 密码（请使用强密码）
REDIS_PASSWORD=your_strong_redis_password_here

# 允许的前端域名
ALLOWED_ORIGINS=https://doc2md.org

# 你的域名
DOMAIN=api.doc2md.org

# SSL 证书邮箱
SSL_EMAIL=your-email@example.com

# 数据持久化路径（确保目录存在）
REDIS_DATA_PATH=/opt/doc2md/data/redis
LOG_PATH=/opt/doc2md/logs
BACKUP_PATH=/opt/doc2md/backups
```

### 步骤 3：创建必要的目录

```bash
# 创建数据目录
sudo mkdir -p /opt/doc2md/data/redis
sudo mkdir -p /opt/doc2md/logs
sudo mkdir -p /opt/doc2md/backups

# 设置权限
sudo chown -R $USER:$USER /opt/doc2md
```

### 步骤 4：启动服务（不带 Nginx）

如果你想使用服务器已有的 Nginx：

```bash
# 构建并启动服务
docker-compose --env-file docker/.env.prod up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 步骤 5：配置服务器上的 Nginx

将 `docker/nginx/default.conf` 的内容复制到服务器 Nginx 配置：

```bash
# 复制配置文件
sudo cp docker/nginx/default.conf /etc/nginx/sites-available/doc2md

# 修改域名
sudo nano /etc/nginx/sites-available/doc2md
# 将 api.doc2md.org 改为你的实际域名

# 启用站点
sudo ln -s /etc/nginx/sites-available/doc2md /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### 步骤 6：配置 SSL 证书（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 自动获取证书并配置 Nginx
sudo certbot --nginx -d api.doc2md.org

# 测试自动续期
sudo certbot renew --dry-run
```

Certbot 会自动修改你的 Nginx 配置，添加 SSL 配置并设置 HTTP 到 HTTPS 的重定向。

### 步骤 7：验证部署

```bash
# 测试健康检查
curl http://api.doc2md.org/health

# 测试 HTTPS（如果已配置 SSL）
curl https://api.doc2md.org/health

# 查看 API 文档
# 浏览器访问：https://api.doc2md.org/docs
```

## 🔧 使用 Docker Compose 内置 Nginx（可选方案）

如果你不想使用服务器的 Nginx，可以在 `docker-compose.yml` 中添加 Nginx 服务：

### 创建 docker-compose.prod.yml

```bash
nano docker-compose.prod.yml
```

内容：

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: doc2md-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/log/nginx:/var/log/nginx
    depends_on:
      - backend
    restart: always

  backend:
    environment:
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
      - LOG_LEVEL=WARNING
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 512M

  worker:
    deploy:
      replicas: 4
      resources:
        limits:
          cpus: '1'
          memory: 1G

  redis:
    volumes:
      - ${REDIS_DATA_PATH}:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
```

### 启动服务

```bash
# 使用两个配置文件启动
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file docker/.env.prod up -d
```

## 📊 监控和维护

### 查看服务状态

```bash
# 查看所有容器
docker-compose ps

# 查看资源使用
docker stats

# 查看日志
docker-compose logs -f backend
docker-compose logs -f worker
docker-compose logs -f redis
```

### 更新服务

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose --env-file docker/.env.prod build
docker-compose --env-file docker/.env.prod up -d

# 查看更新后的状态
docker-compose ps
```

### 备份数据

```bash
# 备份 Redis 数据
docker-compose exec redis redis-cli SAVE
cp -r /opt/doc2md/data/redis /opt/doc2md/backups/redis-$(date +%Y%m%d)

# 或使用自动化脚本
cat > /opt/doc2md/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/opt/doc2md/backups
DATE=$(date +%Y%m%d_%H%M%S)

# 备份 Redis
docker-compose exec -T redis redis-cli SAVE
tar czf $BACKUP_DIR/redis-$DATE.tar.gz /opt/doc2md/data/redis

# 清理 7 天前的备份
find $BACKUP_DIR -name "redis-*.tar.gz" -mtime +7 -delete

echo "Backup completed: redis-$DATE.tar.gz"
EOF

chmod +x /opt/doc2md/backup.sh

# 添加到 crontab（每天凌晨 2 点备份）
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/doc2md/backup.sh") | crontab -
```

### 清理日志

```bash
# 限制 Docker 日志大小
cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

sudo systemctl restart docker
```

## 🛡️ 安全加固

### 1. 配置防火墙

```bash
# 安装 ufw
sudo apt install ufw -y

# 允许 SSH
sudo ufw allow 22/tcp

# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable

# 查看状态
sudo ufw status
```

### 2. 禁止 Redis 端口对外开放

确保 `docker-compose.yml` 中 Redis 的 `ports` 部分已注释或删除：

```yaml
redis:
  # ports:
  #   - "6379:6379"  # ❌ 生产环境不要暴露 Redis 端口
```

### 3. 启用 Redis 密码认证

在 `docker/.env.prod` 中设置：

```bash
REDIS_PASSWORD=your_strong_password
```

在 `docker-compose.prod.yml` 中配置：

```yaml
redis:
  command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}

backend:
  environment:
    - REDIS_PASSWORD=${REDIS_PASSWORD}

worker:
  environment:
    - REDIS_PASSWORD=${REDIS_PASSWORD}
```

### 4. 限制 API 访问频率（可选）

在 `docker/nginx/default.conf` 中添加限流配置：

```nginx
# 在 http 块中添加
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# 在 location / 中添加
limit_req zone=api_limit burst=20 nodelay;
```

## 🐛 故障排查

### 问题 1：容器无法启动

```bash
# 查看详细日志
docker-compose logs backend
docker-compose logs worker

# 检查容器状态
docker-compose ps

# 重启服务
docker-compose restart
```

### 问题 2：Redis 连接失败

```bash
# 检查 Redis 是否运行
docker-compose exec redis redis-cli ping

# 查看 Redis 日志
docker-compose logs redis

# 测试连接
docker-compose exec backend python -c "import redis; r=redis.Redis(host='redis'); print(r.ping())"
```

### 问题 3：502 Bad Gateway

```bash
# 检查 Backend 是否正常
curl http://localhost:8000/health

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/doc2md_error.log
```

### 问题 4：Worker 不处理任务

```bash
# 查看 Worker 日志
docker-compose logs -f worker

# 检查 Redis 队列
docker-compose exec redis redis-cli KEYS "*"

# 重启 Worker
docker-compose restart worker
```

## 📞 获取帮助

- **文档**：查看 `docs/` 目录
- **API 文档**：访问 `https://api.doc2md.org/docs`
- **GitHub Issues**：提交问题到项目仓库

## 🔄 回滚部署

如果部署出现问题，快速回滚：

```bash
# 停止服务
docker-compose down

# 切换到上一个版本
git checkout <previous-commit>

# 重新启动
docker-compose --env-file docker/.env.prod up -d
```

---

**部署完成后别忘了**：
- ✅ 测试所有 API 端点
- ✅ 上传测试文件验证转换功能
- ✅ 配置监控和告警
- ✅ 设置定期备份
- ✅ 更新前端配置中的 API 地址
