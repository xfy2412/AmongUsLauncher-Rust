# Among Us 启动器 (Tauri + Vue + MDUI)
一个使用 Tauri、Vue.js 3 和 Material Design 3 (MDUI) 构建的现代化、美观且功能丰富的 Among Us 启动器。它提供了统一的界面来管理游戏服务器和模组，并支持完全离线使用。

## 📸  应用UI

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://github.com/xfy2412/AmongUsLauncher-Rust/blob/main/src/assets/%E5%90%AF%E5%8A%A8%E5%99%A8%E6%A8%A1%E7%BB%84%E7%AE%A1%E7%90%86%E7%95%8C%E9%9D%A2.png?raw=true">
  <source media="(prefers-color-scheme: light)" srcset="https://github.com/xfy2412/AmongUsLauncher-Rust/blob/main/src/assets/%E5%90%AF%E5%8A%A8%E5%99%A8%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AE%A1%E7%90%86%E7%95%8C%E9%9D%A2.png?raw=true">
  <img alt="应用截图" src="https://github.com/xfy2412/AmongUsLauncher-Rust/blob/main/src/assets/%E5%90%AF%E5%8A%A8%E5%99%A8%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AE%A1%E7%90%86%E7%95%8C%E9%9D%A2.png?raw=true">
</picture>

## ✨ 核心功能

- **统一管理界面**: 在单一窗口内通过标签页方便地切换服务器和模组管理。
- **服务器管理**:
  - 动态添加和删除自定义游戏服务器。
  - 清晰列出所有官方和自定义服务器。
  - 智能识别官方、可信和自定义服务器，并以标签区分。
- **模组管理**:
  - 集中管理所有已安装的模组。
  - 快速启用或禁用单个模组。
  - 提供模组统计信息（已启用/总数）。
- **现代化用户体验**:
  - 基于 Material Design 3 设计，界面美观现代。
  - 支持浅色和深色主题一键切换。
  - 流畅的过渡动画和响应式布局。
- **完全离线支持**:
  - 所有核心库 (MDUI) 和图标资源 (Material Icons) 均已本地化。
  - 无需互联网连接即可正常使用所有功能。
- **原生应用性能**:
  - 基于 Tauri 构建，拥有接近原生应用的性能和极低的内存占用。
  - 自定义窗口标题栏，提供最小化、最大化和关闭功能。

## 🛠️ 技术栈

- **核心框架**: [Tauri](https://tauri.app/) (使用 Rust 后端)
- **前端框架**: [Vue.js 3](https://vuejs.org/) (使用 Composition API)
- **构建工具**: [Vite](https://vitejs.dev/)
- **UI 组件库**: [MDUI 2](https://mdui.org/) (Material Design 3)
- **图标**: [Material Icons](https://fonts.google.com/icons) (本地化)
- **语言**: Rust, TypeScript, JavaScript, CSS

## 🚀 开发与构建

在开始之前，请确保你已经安装了 [Node.js](https://nodejs.org/) 和 [Rust 环境](https://www.rust-lang.org/tools/install)，并根据 [Tauri 官方文档](https://tauri.app/v1/guides/getting-started/prerequisites) 配置好了系统依赖。

### 1. 克隆仓库
```bash
git clone https://github.com/xfy2412/AmongUsLauncher-Rust.git
cd AmongUsLauncher-Rust
```

### 2. 安装依赖
该项目使用 `npm` 作为包管理器。
```bash
npm install
```

### 3. 启动开发环境
此命令将同时启动前端开发服务器和后端的 Cargo 进程。
```bash
npm run tauri dev
```
应用将以开发模式启动，并开启热重载功能。

### 4. 构建应用
此命令将构建并打包适用于你当前操作系统的可执行文件。
```bash
npm run tauri build
```
构建产物将位于 `src-tauri/target/release/` 目录下。

## 📁 项目结构

```
.
├── public/                # 静态资源 (图标, 字体, 本地化库)
│   ├── fonts/
│   └── mdui/
├── src/                   # 前端源代码
│   ├── App.vue            # 主应用组件 (包含所有UI和逻辑)
│   ├── App-md3.css        # Material Design 3 主题和自定义样式
│   └── main.js            # Vue 应用入口
├── src-tauri/             # Tauri 后端代码 (Rust)
│   ├── capabilities/      # Tauri 权限配置文件
│   ├── src/
│   │   └── main.rs        # Rust 后端入口和原生API
│   └── tauri.conf.json    # Tauri 核心配置文件
├── README.md              # 你正在阅读的文件
└── package.json           # 项目依赖和脚本
```

## 🤝 贡献

欢迎提交问题 (issues) 和拉取请求 (pull requests)！如果你有任何改进建议或发现了 Bug，请不要犹豫，让我们一起让这个项目变得更好。

## 📄 许可证

该项目正在考虑使用相关许可证
