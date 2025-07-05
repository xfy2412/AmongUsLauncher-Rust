# Among Us Launcher
Among Us 启动器，具有服务器管理功能  

基于 Rust 重构，现已焕发新生！

## 📋 编译指南

### 🔧 环境要求

在开始之前，请确保您的系统已安装以下工具：

- **Node.js** >= 18.0.0 ([下载地址](https://nodejs.org/))
- **Rust** >= 1.70.0 ([下载地址](https://rustup.rs/))
- **Git** ([下载地址](https://git-scm.com/))

### 📦 克隆项目

```bash
git clone https://github.com/xfy2412/AmongUsLauncher-Rust.git
cd AmongUsLauncher-Rust
```

### 安装依赖

```bash
# 安装前端依赖
npm install

# 安装Tauri CLI工具（如果尚未安装）
npm install -g @tauri-apps/cli
```

### 开发环境运行

```bash
# 启动开发环境（包含热重载）
npm run tauri dev

# 或者分别启动前端和后端
npm run dev        # 启动前端开发服务器
npm run tauri      # 启动Tauri应用
```

### 生产环境构建

```bash
# 构建生产版本
npm run tauri build

# 仅构建前端资源
npm run build
```
