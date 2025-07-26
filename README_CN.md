# FRP 客户端管理器

[English](README.md) | 中文说明

一个现代化的 FRP (Fast Reverse Proxy) 客户端图形界面管理工具，基于 Electron + React + TypeScript 构建。

## 🌟 功能特性

### 📋 配置管理
- **可视化配置创建** - 通过友好的表单界面创建 FRP 配置
- **TOML 高级编辑** - 直接编辑原始 TOML 配置文件
- **配置验证** - 内置语法验证和配置完整性检查
- **配置导入导出** - 支持从文件加载和保存配置

### 🚀 多进程运行
- **并行运行** - 支持同时运行多个 FRP 配置
- **独立控制** - 每个配置可以独立启动和停止
- **状态管理** - 实时显示每个配置的运行状态
- **进程隔离** - 每个配置运行在独立的进程中

### 📊 监控与日志
- **实时日志** - 查看所有 FRP 进程的实时运行日志
- **进程标识** - 日志中清楚标识每个进程的输出
- **日志管理** - 支持清空和搜索日志内容

### 🛠️ 高级功能
- **端口信息显示** - 显示每个配置的本地端口信息
- **错误处理** - 完善的错误边界和用户友好的错误提示
- **状态持久化** - 配置和运行状态自动保存
- **便携版支持** - 支持便携版部署

## 🖥️ 系统要求

- Windows 10/11 (64位)
- 需要预先安装 FRP 客户端 (frpc.exe)

## 📦 安装使用

### 方式一：下载预编译版本
1. 从 [Releases](https://github.com/hyper-fa/frpc_manager/releases) 下载最新版本
2. 解压到任意目录
3. 运行 `frpc-gui-manager.exe`

### 方式二：从源码构建
```bash
# 克隆仓库
git clone https://github.com/your-username/frpc-gui-manager.git
cd frpc-gui-manager

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 构建生产版本
npm run build

# 打包应用
npm run dist
```

## 🚀 快速开始

### 1. 首次设置
1. 启动应用后，首先需要设置 FRP 客户端路径
2. 点击"选择 frpc.exe 路径"按钮，选择您的 frpc.exe 文件

### 2. 创建配置
1. 点击"新建配置"标签页
2. 填写服务器地址、端口、认证令牌等基本信息
3. 根据需要添加访问者 (Visitors) 配置
4. 点击"保存配置"

### 3. 高级编辑
1. 在配置列表中点击"编辑"按钮
2. 进入 TOML 高级编辑模式
3. 直接编辑原始配置文件内容
4. 点击"测试配置"验证语法
5. 验证通过后点击"保存配置"

### 4. 运行管理
1. 在配置列表中点击"启动"按钮启动配置
2. 支持同时运行多个配置
3. 点击"停止"按钮停止特定配置
4. 点击"停止所有"按钮停止所有运行中的配置

### 5. 日志查看
1. 点击"运行日志"标签页
2. 查看所有 FRP 进程的实时日志
3. 日志中会标识每个配置的输出

## 📁 项目结构

```
frpc-gui-manager/
├── src/
│   ├── main/           # Electron 主进程
│   │   ├── main.ts     # 主进程入口
│   │   └── preload.ts  # 预加载脚本
│   └── renderer/       # React 渲染进程
│       ├── components/ # React 组件
│       ├── stores/     # 状态管理
│       └── types/      # TypeScript 类型定义
├── dist/               # 构建输出
├── frp/               # FRP 配置文件目录
└── configs.json       # 应用配置存储
```

## 🔧 配置文件格式

应用支持标准的 FRP TOML 配置格式：

```toml
serverAddr = "your-server.com"
serverPort = 7000

[auth]
method = "token"
token = "your-token"

[[visitors]]
name = "visitor-name"
type = "xtcp"
serverName = "server-name"
bindPort = 6000
secretKey = "your-secret"

[[proxies]]
name = "proxy-name"
type = "tcp"
localIP = "127.0.0.1"
localPort = 3389
remotePort = 6001
```

## 🛠️ 开发指南

### 技术栈
- **Electron** - 跨平台桌面应用框架
- **React** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Zustand** - 轻量级状态管理
- **Vite** - 快速构建工具

### 开发命令
```bash
npm run dev          # 开发模式
npm run build        # 构建项目
npm run dist         # 打包应用
npm run lint         # 代码检查
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [FRP](https://github.com/fatedier/frp) - 优秀的内网穿透工具
- [Electron](https://electronjs.org/) - 跨平台桌面应用框架
- [React](https://reactjs.org/) - 用户界面库

## 📞 支持

如果您遇到问题或有建议，请：
- 提交 [Issue](https://github.com/your-username/frpc-gui-manager/issues)
- 发送邮件至：fusion.ai726@gmail.com

---

⭐ 如果这个项目对您有帮助，请给它一个星标！


