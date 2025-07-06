<template>
  <div class="mod-manager">
    <!-- 自定义标题栏 -->
    <div class="custom-titlebar" data-tauri-drag-region>
      <div class="titlebar-left">
        <div class="app-icon">
          <mdui-icon name="folder_zip"></mdui-icon>
        </div>
        <div class="app-title">模组管理</div>
      </div>
      
      <div class="titlebar-right">
        <div class="window-controls">
          <button 
            class="titlebar-button minimize-btn"
            @click="minimizeWindow"
            title="最小化"
          >
            <mdui-icon name="remove"></mdui-icon>
          </button>
          
          <button 
            class="titlebar-button close-btn"
            @click="closeWindow"
            title="关闭"
          >
            <mdui-icon name="close"></mdui-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="mod-content">
        <div class="mod-header">
          <h2>已安装模组</h2>
          <div class="mod-actions">
            <mdui-button variant="tonal" icon="add">添加模组</mdui-button>
            <mdui-button variant="outlined" icon="upload">导入模组</mdui-button>
          </div>
        </div>

        <div class="mod-list">
          <div class="mod-item" v-for="i in 5" :key="i">
            <div class="mod-info">
              <div class="mod-icon">
                <mdui-icon name="extension"></mdui-icon>
              </div>
              <div class="mod-details">
                <div class="mod-name">示例模组 {{ i }}</div>
                <div class="mod-description">这是一个示例模组的描述信息</div>
                <div class="mod-version">版本: 1.0.{{ i }}</div>
              </div>
            </div>
            <div class="mod-actions">
              <mdui-switch></mdui-switch>
              <mdui-button variant="text" icon="settings" title="设置"></mdui-button>
              <mdui-button variant="text" icon="delete" title="删除" style="color: var(--md-sys-color-error);"></mdui-button>
            </div>
          </div>
        </div>

        <div class="mod-footer">
          <div class="mod-stats">
            <mdui-chip variant="assist" icon="check_circle">
              已启用: 3
            </mdui-chip>
            <mdui-chip variant="filter" icon="extension">
              总计: 5
            </mdui-chip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 安全的窗口控制函数
async function minimizeWindow() {
  try {
    // 改进的 Tauri 环境检测
    if (typeof window !== 'undefined' && (window.__TAURI__ || window.__TAURI_INTERNALS__)) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      await appWindow.minimize();
    } else {
      console.log('非 Tauri 环境，无法最小化窗口');
    }
  } catch (error) {
    console.error('最小化窗口失败:', error);
  }
}

async function closeWindow() {
  try {
    // 改进的 Tauri 环境检测
    if (typeof window !== 'undefined' && (window.__TAURI__ || window.__TAURI_INTERNALS__)) {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const appWindow = getCurrentWindow();
      await appWindow.close();
    } else {
      console.log('非 Tauri 环境，无法关闭窗口');
    }
  } catch (error) {
    console.error('关闭窗口失败:', error);
  }
}
</script>

<style scoped>
.mod-manager {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--md-sys-color-surface);
}

.custom-titlebar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
  background-color: var(--md-sys-color-surface-container);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  padding: 0 16px;
  user-select: none;
}

.titlebar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-icon {
  font-size: 16px;
  color: var(--md-sys-color-primary);
}

.app-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
}

.titlebar-right {
  display: flex;
  align-items: center;
}

.window-controls {
  display: flex;
  gap: 4px;
}

.titlebar-button {
  width: 32px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--md-sys-color-on-surface);
  transition: background-color 0.2s;
}

.titlebar-button:hover {
  background-color: var(--md-sys-color-surface-variant);
}

.close-btn:hover {
  background-color: var(--md-sys-color-error);
  color: var(--md-sys-color-on-error);
}

.main-content {
  flex: 1;
  overflow: hidden;
  padding: 16px;
}

.mod-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mod-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.mod-header h2 {
  margin: 0;
  color: var(--md-sys-color-on-surface);
  font-size: 20px;
  font-weight: 500;
}

.mod-actions {
  display: flex;
  gap: 8px;
}

.mod-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mod-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--md-sys-color-surface-container-low);
  border-radius: 12px;
  border: 1px solid var(--md-sys-color-outline-variant);
}

.mod-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.mod-icon {
  font-size: 32px;
  color: var(--md-sys-color-primary);
}

.mod-details {
  flex: 1;
}

.mod-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
  margin-bottom: 4px;
}

.mod-description {
  font-size: 14px;
  color: var(--md-sys-color-on-surface-variant);
  margin-bottom: 4px;
}

.mod-version {
  font-size: 12px;
  color: var(--md-sys-color-outline);
}

.mod-item .mod-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mod-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--md-sys-color-outline-variant);
}

.mod-stats {
  display: flex;
  gap: 8px;
}
</style> 