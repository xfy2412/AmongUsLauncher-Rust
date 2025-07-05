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

### 🚀 安装依赖

```bash
# 安装前端依赖
npm install

# 安装Tauri CLI工具（如果尚未安装）
npm install -g @tauri-apps/cli
```

### 💻 开发环境运行

```bash
# 启动开发环境（包含热重载）
npm run tauri dev

# 或者分别启动前端和后端
npm run dev        # 启动前端开发服务器
npm run tauri      # 启动Tauri应用
```

### 🏗️ 生产环境构建

```bash
# 构建生产版本
npm run tauri build

# 仅构建前端资源
npm run build
```

### 📱 构建产物

构建完成后，您可以在以下位置找到应用程序：

- **Windows**: `src-tauri/target/release/bundle/`
  - `.msi` 安装包：`src-tauri/target/release/bundle/msi/`
  - 可执行文件：`src-tauri/target/release/among-us-launcher.exe`

- **macOS**: `src-tauri/target/release/bundle/`
  - `.dmg` 安装包：`src-tauri/target/release/bundle/dmg/`
  - `.app` 应用：`src-tauri/target/release/bundle/macos/`

- **Linux**: `src-tauri/target/release/bundle/`
  - `.deb` 包：`src-tauri/target/release/bundle/deb/`
  - `.AppImage`：`src-tauri/target/release/bundle/appimage/`

### 🔍 故障排除

#### 图标不显示问题
如果在生产环境中遇到图标不显示的问题，这通常是由于Material Design Icons资源加载失败导致的。我们已经在项目中集成了本地图标字体，确保：

1. 所有依赖已正确安装：`npm install`
2. 构建过程包含了字体文件
3. 应用使用本地字体而非CDN资源

#### 构建失败
1. **清理缓存**：
   ```bash
   npm run clean    # 如果有此命令
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **更新依赖**：
   ```bash
   npm update
   ```

3. **检查Rust工具链**：
   ```bash
   rustup update
   ```

#### 开发环境端口冲突
如果遇到端口占用问题，可以修改 `vite.config.js` 中的端口配置：

```javascript
server: {
  port: 1420,  // 修改为其他端口
  strictPort: true,
}
```

### 🎯 开发提示

- 前端使用 **Vue 3** + **MDUI 2.x**（Material Design 组件库）
- 后端使用 **Tauri** + **Rust**
- 图标系统基于 **Material Design Icons** 本地字体
- 支持亮色/暗色主题自动切换

### 📞 技术支持

如果在编译过程中遇到问题，请：

1. 查看上述故障排除部分
2. 检查 [Issues](https://github.com/xfy2412/AmongUsLauncher-Rust/issues) 中是否有类似问题
3. 创建新的 Issue 并提供详细的错误信息

---

**Happy Coding! 🚀**