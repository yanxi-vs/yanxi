# 律师管理平台 | Lawyer AI OS

智能化法律事务所运营系统，包含律师管理、客户管理、案件管理、预约管理、AI 智能体、数字化运营和系统设置等模块。

## 技术栈

- **后端**：Python + FastAPI + SQLAlchemy + SQLite
- **前端**：原生 HTML + CSS + JavaScript（单页应用）
- **容器化**：Docker + Docker Compose

## 快速启动

### 方式一：本地运行

```bash
# 1. 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 2. 安装依赖
pip install -r requirements.txt

# 3. 启动服务
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

访问：http://localhost:8000/static/index.html

### 方式二：Docker Compose

```bash
# 1. 复制环境变量文件
cp .env.example .env

# 2. 构建并启动
docker-compose up -d

# 3. 查看日志
docker-compose logs -f
```

访问：http://localhost:8000/static/index.html

### Docker Compose 常用命令

```bash
# 停止服务
docker-compose down

# 停止并删除数据卷
docker-compose down -v

# 重新构建镜像
docker-compose up -d --build

# 查看服务状态
docker-compose ps
```

## 项目结构

```
lawyer-platform/
├── main.py                 # FastAPI 入口
├── database.py             # 数据库模型与连接
├── models.py               # Pydantic 数据模型
├── requirements.txt        # Python 依赖
├── Dockerfile              # Docker 镜像构建
├── docker-compose.yml      # Docker Compose 配置
├── .env.example            # 环境变量示例
├── .gitignore              # Git 忽略规则
└── static/                 # 前端静态资源
    ├── index.html          # 页面结构
    ├── style.css           # 法务风格样式
    └── app.js              # 前端交互逻辑
```

## API 文档

启动服务后访问：http://localhost:8000/docs

## 数据持久化

Docker Compose 使用命名卷 `lawyer_platform_data` 持久化 SQLite 数据库，即使容器删除数据也不会丢失。

## 安全说明

本项目为 Demo 版本，请勿直接用于生产环境。生产部署建议：
- 使用 PostgreSQL 替代 SQLite
- 添加用户认证与权限控制
- 配置 HTTPS
- 使用 Secrets 管理敏感信息
