# 代码架构说明

## 概述

本项目采用了Vue 3的Composition API和模块化架构，将JavaScript逻辑和CSS样式从主组件中分离出来，以提高代码的可维护性和可重用性。经过重构，特别是**服务器管理模块**得到了大幅改进。

## 项目结构

```
src/
├── composables/          # 可复用的组合式函数
│   ├── useApp.js        # 应用主逻辑（窗口管理、主题管理等）
│   ├── useServers.js    # 服务器管理逻辑 ⭐ 重构重点
│   └── useMods.js       # 模组管理逻辑
├── styles/              # 样式文件
│   └── App.css          # 应用主样式
├── App.vue              # 主组件（仅包含模板和导入）
├── App-md3.css          # Material Design 3样式
└── main.js              # 应用入口
```

## 🚀 重构亮点：服务器管理模块

### 新增特性

1. **服务器状态监控**
   - 实时检测服务器在线状态
   - 显示服务器响应时间
   - 自动状态刷新

2. **表单验证系统**
   - 实时验证用户输入
   - 友好的错误提示
   - 防止无效数据提交

3. **错误处理机制**
   - 统一的错误处理
   - 自动错误清除
   - 用户友好的错误信息

4. **服务器统计面板**
   - 实时统计服务器数量
   - 按类型和状态分类统计
   - 可视化数据展示

5. **数据导出功能**
   - 一键导出服务器配置
   - JSON格式，便于备份和迁移

## Composables 详解

### useApp.js
负责应用的核心功能：
- **窗口管理**：最小化、最大化、关闭窗口
- **主题管理**：亮色/深色主题切换
- **标签页管理**：在服务器管理和模组管理之间切换
- **加载状态管理**：控制应用启动时的加载动画

**主要功能：**
```javascript
const {
  showLoading,          // 加载状态
  currentTab,           // 当前活动标签页
  minimizeWindow,       // 最小化窗口
  maximizeWindow,       // 最大化窗口
  closeWindow,          // 关闭窗口
  isMaximized,          // 窗口是否最大化
  initWindowListeners,  // 初始化窗口监听器
  initTheme,            // 初始化主题
  toggleTheme,          // 切换主题
  getThemeIcon,         // 获取主题图标
  getThemeText,         // 获取主题文本
  switchTab             // 切换标签页
} = useApp();
```

### useServers.js ⭐ 重构重点
负责服务器管理的所有逻辑，经过全面重构：

#### 🔧 核心状态管理
```javascript
const {
  // 数据状态
  servers,             // 服务器列表（增强版）
  serverStats,         // 服务器统计信息 🆕
  
  // UI状态
  isLoading,           // 加载状态 🆕
  error,               // 错误状态 🆕
  showConfirmDialog,   // 确认对话框状态
  
  // 表单状态
  newServer,           // 新服务器表单数据
  formErrors,          // 表单验证错误 🆕
  isFormValid,         // 表单验证状态 🆕
} = useServers();
```

#### 🎯 功能方法
```javascript
const {
  // 核心操作
  fetchServers,        // 获取服务器列表（增强版）
  addServer,           // 添加服务器（带验证）
  removeServer,        // 删除服务器（安全删除）
  
  // 状态管理
  refreshServerStatus, // 刷新服务器状态 🆕
  
  // 表单操作
  resetForm,           // 重置表单 🆕
  
  // 高级功能
  exportServerConfig,  // 导出配置 🆕
  
  // 工具函数
  isOfficialServer,    // 判断官方服务器 🆕
  isTrustedServer,     // 判断可信服务器 🆕
  getServerType,       // 获取服务器类型 🆕
} = useServers();
```

#### 🎨 服务器对象结构
```javascript
{
  // 基本信息
  name: "服务器名称",
  ping_server: "server.example.com",
  port: 25565,
  
  // 位置信息
  regionIndex: 0,      // 区域索引
  serverIndex: 0,      // 服务器索引
  regionName: "Asia",  // 区域名称
  
  // 状态信息 🆕
  type: "custom",      // 服务器类型
  status: "online",    // 在线状态
  responseTime: 45,    // 响应时间(ms)
  lastChecked: Date,   // 最后检查时间
}
```

#### 🔐 服务器类型和状态
```javascript
// 服务器类型
export const SERVER_TYPE = {
  OFFICIAL: 'official',  // 官方服务器
  CUSTOM: 'custom',      // 自定义服务器
  TRUSTED: 'trusted'     // 可信服务器
};

// 服务器状态
export const SERVER_STATUS = {
  UNKNOWN: 'unknown',    // 未知状态
  ONLINE: 'online',      // 在线
  OFFLINE: 'offline',    // 离线
  CHECKING: 'checking'   // 检查中
};
```

### useMods.js
负责模组管理的所有逻辑：
- **模组列表管理**：显示已安装的模组
- **模组操作**：启用/禁用、删除模组
- **模组统计**：统计启用的模组数量

**主要功能：**
```javascript
const {
  mods,                  // 模组列表
  showModConfirmDialog,  // 显示模组删除确认对话框
  modToDelete,           // 待删除的模组
  toggleMod,             // 切换模组启用状态
  confirmDeleteMod,      // 确认删除模组
  deleteMod,             // 删除模组
  addMod,                // 添加模组（待实现）
  importMod,             // 导入模组（待实现）
  enabledModsCount       // 已启用模组数量
} = useMods();
```

## 🎨 UI/UX 改进

### 1. 服务器统计面板
```html
<div class="stats-container">
  <div class="stats-card">
    <mdui-icon name="dns"></mdui-icon>
    <div class="stats-info">
      <div class="stats-value">{{ serverStats.total }}</div>
      <div class="stats-label">总服务器</div>
    </div>
  </div>
  <!-- 更多统计卡片... -->
</div>
```

### 2. 实时状态显示
- ✅ **在线**：绿色指示器，显示响应时间
- ❌ **离线**：红色指示器
- 🔄 **检查中**：黄色加载指示器
- ❓ **未知**：灰色指示器

### 3. 表单验证
- 实时输入验证
- 错误信息即时显示
- 提交按钮智能启用/禁用

### 4. 错误处理
- 全局错误横幅
- 自动错误清除（3秒）
- 上下文相关的错误信息

## 🔧 后端增强

### 新增Tauri命令

```rust
#[tauri::command]
async fn check_server_status(host: String, port: u16) -> Result<ServerStatusResult, String> {
    // TCP连接测试
    // 响应时间测量
    // 错误处理
}
```

### 服务器状态结构
```rust
#[derive(Debug, Serialize, Deserialize)]
struct ServerStatusResult {
    online: bool,           // 是否在线
    response_time: Option<u64>, // 响应时间(ms)
    error: Option<String>   // 错误信息
}
```

## 样式架构

### styles/App.css
包含了所有应用特定的样式：
- **颜色变量**：状态颜色、主题颜色 🆕
- **标签页导航样式**：标签页切换动画和布局
- **模组列表样式**：模组卡片的样式和交互效果
- **响应式设计**：移动端适配 🆕
- **动画定义**：页面切换和悬停动画 🆕

### 新增颜色变量
```css
:root {
  --md-sys-color-success: #4caf50;
  --md-sys-color-warning: #ff9800;
  --md-sys-color-error: #f44336;
  --md-sys-color-success-container: #e8f5e8;
  --md-sys-color-warning-container: #fff3e0;
  --md-sys-color-error-container: #ffebee;
}
```

## 使用方法

### 1. 添加服务器
```javascript
// 表单验证会自动进行
const newServerData = {
  name: "我的服务器",
  ping_server: "example.com",
  port: 25565
};

// 调用添加函数
await addServer();
```

### 2. 监控服务器状态
```javascript
// 手动刷新单个服务器状态
await refreshServerStatus(serverIndex);

// 自动状态检查在fetchServers时触发
await fetchServers();
```

### 3. 导出配置
```javascript
// 一键导出所有服务器配置
exportServerConfig();
```

## 🚀 性能优化

1. **异步状态检查**：服务器状态检查不阻塞UI
2. **智能验证**：实时表单验证，减少无效提交
3. **错误恢复**：自动错误清除，改善用户体验
4. **加载状态**：清晰的加载指示器
5. **响应式设计**：移动端友好的布局

## 🔒 安全改进

1. **输入验证**：严格的前端和后端验证
2. **官方服务器保护**：防止删除官方服务器
3. **错误边界**：优雅的错误处理
4. **超时控制**：网络请求超时保护

## 📱 响应式设计

- **桌面端**：4列统计卡片，横向操作按钮
- **平板端**：2列统计卡片，纵向操作按钮  
- **手机端**：1列统计卡片，堆叠布局

## 扩展建议

1. **TypeScript支持**：为更好的类型检查 🎯
2. **单元测试**：为每个composable编写测试 🧪
3. **服务器分组**：按地区或用途分组管理 📁
4. **批量操作**：批量添加/删除服务器 🔄
5. **历史记录**：操作历史和回滚功能 ⏰
6. **通知系统**：服务器状态变化通知 🔔

## 总结

这次重构大幅提升了服务器管理的用户体验和代码质量：

- ✅ **用户体验**：实时状态、友好提示、响应式设计
- ✅ **代码质量**：模块化、类型安全、错误处理
- ✅ **功能完整**：验证、导出、统计、监控
- ✅ **性能优化**：异步操作、智能加载、缓存机制

这种架构为后续功能扩展奠定了坚实的基础！🎉 