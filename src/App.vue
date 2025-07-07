<script setup>
import { onMounted } from "vue";
import { useApp } from './composables/useApp.js';
import { useServers } from './composables/useServers.js';
import { useMods } from './composables/useMods.js';
import './App-md3.css';
import './styles/App.css';

// 使用composables
const {
  showLoading,
  currentTab,
  minimizeWindow,
  maximizeWindow,
  closeWindow,
  isMaximized,
  initWindowListeners,
  initTheme,
  toggleTheme,
  getThemeIcon,
  getThemeText,
  switchTab
} = useApp();

const {
  servers,
  isLoading,
  error,
  newServer,
  formErrors,
  isFormValid,
  showConfirmDialog,
  serverToDelete,
  serverStats,
  fetchServers,
  addServer,
  confirmDelete,
  removeServer,
  cancelDelete,
  refreshServerStatus,
  startGame,
  resetForm,
  exportServerConfig,
  isOfficialServer,
  isTrustedServer,
  getServerType,
  SERVER_STATUS,
  SERVER_TYPE
} = useServers();

const {
  mods,
  showModConfirmDialog,
  modToDelete,
  toggleMod,
  confirmDeleteMod,
  deleteMod,
  addMod,
  importMod,
  enabledModsCount
} = useMods();

// 获取服务器状态图标
function getStatusIcon(status) {
  switch (status) {
    case SERVER_STATUS.ONLINE:
      return 'check_circle';
    case SERVER_STATUS.OFFLINE:
      return 'cancel';
    case SERVER_STATUS.CHECKING:
      return 'pending';
    default:
      return 'help';
  }
}

// 获取服务器状态颜色
function getStatusColor(status) {
  switch (status) {
    case SERVER_STATUS.ONLINE:
      return 'var(--md-sys-color-success)';
    case SERVER_STATUS.OFFLINE:
      return 'var(--md-sys-color-error)';
    case SERVER_STATUS.CHECKING:
      return 'var(--md-sys-color-warning)';
    default:
      return 'var(--md-sys-color-outline)';
  }
}

onMounted(async () => {
  initTheme();
  await initWindowListeners();
  await fetchServers();
  
  setTimeout(() => {
    showLoading.value = false;
  }, 2000);
});
</script>

<template>
  <div class="app-container">
    <!-- 自定义标题栏 - 始终显示 -->
    <div class="custom-titlebar" data-tauri-drag-region>
      <div class="titlebar-left">
        <div class="app-icon">
          <mdui-icon name="sports_esports"></mdui-icon>
        </div>
        <div class="app-title">Among Us Launcher</div>
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
            class="titlebar-button maximize-btn"
            @click="maximizeWindow"
            :title="isMaximized ? '还原' : '最大化'"
          >
            <mdui-icon :name="isMaximized ? 'fullscreen_exit' : 'fullscreen'"></mdui-icon>
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

    <!-- 加载动画 -->
    <div v-if="showLoading" class="loading-overlay">
      <div class="loading-content">
        <h1 class="loading-title">Among Us Launcher</h1>
        <mdui-circular-progress></mdui-circular-progress>
      </div>
    </div>

    <!-- 主要内容 -->
    <div v-show="!showLoading">
      <!-- 顶部应用栏 -->
      <mdui-top-app-bar class="app-top-bar">
        <mdui-top-app-bar-title>Among Us Launcher</mdui-top-app-bar-title>
        <div style="flex-grow: 1;"></div>
        
        <!-- 主题切换按钮 -->
        <div class="theme-toggle-button">
          <mdui-button 
            variant="outlined" 
            @click="toggleTheme"
            :icon="getThemeIcon()"
          >
            {{ getThemeText() }}
          </mdui-button>
        </div>
        
        <!-- 启动游戏按钮 -->
        <mdui-button 
          variant="filled" 
          @click="startGame"
          icon="sports_esports"
        >
          启动游戏
        </mdui-button>
      </mdui-top-app-bar>

      <!-- 全局错误提示 -->
      <div v-if="error" class="error-banner">
        <mdui-icon name="error" style="margin-right: 8px;"></mdui-icon>
        <span>{{ error.message }}</span>
        <mdui-button variant="text" icon="close" @click="error = null"></mdui-button>
      </div>

      <!-- 标签页导航 -->
      <div class="tab-navigation">
        <mdui-segmented-button-group>
          <mdui-segmented-button 
            :selected="currentTab === 'servers'"
            @click="switchTab('servers')"
            icon="dns"
          >
            服务器管理
          </mdui-segmented-button>
          <mdui-segmented-button 
            :selected="currentTab === 'mods'"
            @click="switchTab('mods')"
            icon="extension"
          >
            模组管理
          </mdui-segmented-button>
        </mdui-segmented-button-group>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 服务器管理标签页 -->
        <div v-show="currentTab === 'servers'" class="tab-content">
          <!-- 服务器统计卡片 -->
          <div class="stats-container">
            <div class="stats-card">
              <mdui-icon name="dns"></mdui-icon>
              <div class="stats-info">
                <div class="stats-value">{{ serverStats.total }}</div>
                <div class="stats-label">总服务器</div>
              </div>
            </div>
            <div class="stats-card">
              <mdui-icon name="verified" style="color: var(--md-sys-color-primary);"></mdui-icon>
              <div class="stats-info">
                <div class="stats-value">{{ serverStats.official }}</div>
                <div class="stats-label">官方服务器</div>
              </div>
            </div>
            <div class="stats-card">
              <mdui-icon name="check_circle" style="color: var(--md-sys-color-success);"></mdui-icon>
              <div class="stats-info">
                <div class="stats-value">{{ serverStats.online }}</div>
                <div class="stats-label">在线服务器</div>
              </div>
            </div>
            <div class="stats-card">
              <mdui-icon name="person"></mdui-icon>
              <div class="stats-info">
                <div class="stats-value">{{ serverStats.custom }}</div>
                <div class="stats-label">自定义服务器</div>
              </div>
            </div>
          </div>

          <!-- 添加服务器卡片 -->
          <div class="form-container">
            <h2 class="form-title">
              <mdui-icon name="add_circle_outline" style="vertical-align: middle; margin-right: 8px;"></mdui-icon>
              添加新服务器
            </h2>
            
            <div class="form-row">
              <div class="form-field">
                <mdui-text-field
                  v-model="newServer.name"
                  label="服务器名称"
                  helper="输入服务器的显示名称"
                  variant="outlined"
                  clearable
                  :error="!!formErrors.name"
                  :error-text="formErrors.name"
                ></mdui-text-field>
              </div>
              
              <div class="form-field">
                <mdui-text-field
                  v-model="newServer.ping_server"
                  label="服务器地址"
                  helper="输入服务器的IP地址或域名"
                  variant="outlined"
                  clearable
                  :error="!!formErrors.ping_server"
                  :error-text="formErrors.ping_server"
                ></mdui-text-field>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <mdui-text-field
                  v-model="newServer.port"
                  label="端口"
                  helper="服务器端口号，默认25565"
                  variant="outlined"
                  type="number"
                  :min="1"
                  :max="65535"
                  :error="!!formErrors.port"
                  :error-text="formErrors.port"
                ></mdui-text-field>
              </div>
              
              <div class="form-field" style="display: flex; align-items: flex-end; gap: 8px;">
                <mdui-button 
                  variant="filled" 
                  @click="addServer"
                  icon="add"
                  :disabled="!isFormValid || isLoading"
                  :loading="isLoading"
                  style="height: 56px; flex: 1;"
                >
                  添加服务器
                </mdui-button>
                
                <mdui-button 
                  variant="outlined" 
                  @click="resetForm"
                  icon="refresh"
                  style="height: 56px;"
                  title="重置表单"
                ></mdui-button>
              </div>
            </div>
          </div>

          <!-- 服务器列表卡片 -->
          <div class="server-list">
            <div class="list-header">
              <h2 class="form-title">
                <mdui-icon name="dns" style="vertical-align: middle; margin-right: 8px;"></mdui-icon>
                服务器列表
              </h2>
              
              <div class="list-actions">
                <mdui-button 
                  variant="outlined" 
                  @click="fetchServers"
                  icon="refresh"
                  :loading="isLoading"
                >
                  刷新
                </mdui-button>
                
                <mdui-button 
                  variant="text" 
                  @click="exportServerConfig"
                  icon="download"
                >
                  导出配置
                </mdui-button>
              </div>
            </div>
            
            <div v-if="servers.length === 0" style="text-align: center; padding: 40px;">
              <mdui-icon name="cloud_off" style="font-size: 48px; color: var(--md-sys-color-outline); margin-bottom: 16px;"></mdui-icon>
              <p style="color: var(--md-sys-color-on-surface-variant);">暂无服务器</p>
            </div>
            
            <div v-else>
              <div 
                v-for="(server, index) in servers" 
                :key="index" 
                class="server-item"
              >
                <div class="server-info">
                  <div class="server-name">
                    <mdui-icon name="storage" style="vertical-align: middle; margin-right: 8px;"></mdui-icon>
                    {{ server.name || server.Name || server.TranslateName }}
                  </div>
                  <div class="server-address">
                    {{ server.ping_server || server.PingServer }}
                    <span v-if="server.Port || server.port">:{{ server.Port || server.port }}</span>
                  </div>
                  <div v-if="server.responseTime !== null" class="server-ping">
                    延迟: {{ server.responseTime }}ms
                  </div>
                </div>
                
                <div class="server-actions">
                  <!-- 服务器状态 -->
                  <mdui-chip 
                    variant="assist"
                    :icon="getStatusIcon(server.status)"
                    :style="{ color: getStatusColor(server.status) }"
                  >
                    {{ server.status === SERVER_STATUS.ONLINE ? '在线' : 
                        server.status === SERVER_STATUS.OFFLINE ? '离线' : 
                        server.status === SERVER_STATUS.CHECKING ? '检查中' : '未知' }}
                  </mdui-chip>

                  <!-- 服务器类型 -->
                  <mdui-chip 
                    v-if="isOfficialServer(server)"
                    variant="assist"
                    icon="verified"
                  >
                    官方服务器
                  </mdui-chip>
                  
                  <mdui-chip 
                    v-else-if="isTrustedServer(server)"
                    variant="assist"
                    icon="verified"
                  >
                    可信服务器
                  </mdui-chip>
                  
                  <mdui-chip 
                    v-else
                    variant="filter"
                    icon="person"
                  >
                    自定义服务器
                  </mdui-chip>

                  <!-- 操作按钮 -->
                  <mdui-button 
                    variant="text"
                    @click="refreshServerStatus(index)"
                    icon="refresh"
                    title="刷新状态"
                  ></mdui-button>
                  
                  <!-- 删除按钮 -->
                  <mdui-button 
                    v-if="!isOfficialServer(server)"
                    variant="outlined"
                    @click="confirmDelete(index)"
                    icon="delete"
                    style="color: var(--md-sys-color-error);"
                  >
                    删除
                  </mdui-button>
                  
                  <mdui-button 
                    v-else
                    variant="outlined"
                    disabled
                    icon="block"
                    title="无法删除官方服务器"
                  >
                    删除
                  </mdui-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 模组管理标签页 -->
        <div v-show="currentTab === 'mods'" class="tab-content">
          <!-- 模组管理头部 -->
          <div class="form-container">
            <h2 class="form-title">
              <mdui-icon name="extension" style="vertical-align: middle; margin-right: 8px;"></mdui-icon>
              模组管理
            </h2>
            
            <div class="form-row">
              <div class="form-field" style="display: flex; gap: 8px;">
                <mdui-button 
                  variant="tonal" 
                  @click="addMod"
                  icon="add"
                >
                  添加模组
                </mdui-button>
                <mdui-button 
                  variant="outlined" 
                  @click="importMod"
                  icon="file_upload"
                >
                  导入模组
                </mdui-button>
              </div>
            </div>
          </div>

          <!-- 模组列表 -->
          <div class="mod-list">
            <h2 class="form-title">
              <mdui-icon name="folder" style="vertical-align: middle; margin-right: 8px;"></mdui-icon>
              已安装模组
            </h2>
            
            <div v-if="mods.length === 0" style="text-align: center; padding: 40px;">
              <mdui-icon name="extension" style="font-size: 48px; color: var(--md-sys-color-outline); margin-bottom: 16px;"></mdui-icon>
              <p style="color: var(--md-sys-color-on-surface-variant);">暂无已安装的模组</p>
            </div>
            
            <div v-else>
              <div 
                v-for="mod in mods" 
                :key="mod.id" 
                class="mod-item"
              >
                <div class="mod-info">
                  <div class="mod-icon">
                    <mdui-icon name="extension"></mdui-icon>
                  </div>
                  <div class="mod-details">
                    <div class="mod-name">{{ mod.name }}</div>
                    <div class="mod-description">{{ mod.description }}</div>
                    <div class="mod-version">版本: {{ mod.version }}</div>
                  </div>
                </div>
                <div class="mod-actions">
                  <mdui-switch 
                    :checked="mod.enabled"
                    @change="toggleMod(mod)"
                  ></mdui-switch>
                  <mdui-button 
                    variant="text" 
                    icon="settings" 
                    title="设置"
                  ></mdui-button>
                  <mdui-button 
                    variant="text" 
                    icon="delete" 
                    title="删除" 
                    style="color: var(--md-sys-color-error);"
                    @click="confirmDeleteMod(mod)"
                  ></mdui-button>
                </div>
              </div>
            </div>

            <!-- 模组统计 -->
            <div class="mod-footer">
              <div class="mod-stats">
                <mdui-chip variant="assist" icon="check_circle">
                  已启用: {{ enabledModsCount }}
                </mdui-chip>
                <mdui-chip variant="filter" icon="extension">
                  总计: {{ mods.length }}
                </mdui-chip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 确认删除服务器对话框 -->
    <mdui-dialog 
      v-model="showConfirmDialog" 
      headline="确认删除服务器"
      description="您确定要删除这个服务器吗？此操作无法撤销。"
      close-on-esc
      close-on-overlay-click
    >
      <mdui-button 
        slot="action" 
        variant="text" 
        @click="cancelDelete"
      >
        取消
      </mdui-button>
      <mdui-button 
        slot="action" 
        variant="tonal" 
        @click="removeServer(serverToDelete)"
        :loading="isLoading"
        style="color: var(--md-sys-color-error);"
      >
        确认删除
      </mdui-button>
    </mdui-dialog>

    <!-- 确认删除模组对话框 -->
    <mdui-dialog 
      v-model="showModConfirmDialog" 
      headline="确认删除模组"
      description="您确定要删除这个模组吗？此操作无法撤销。"
      close-on-esc
      close-on-overlay-click
    >
      <mdui-button 
        slot="action" 
        variant="text" 
        @click="showModConfirmDialog = false"
      >
        取消
      </mdui-button>
      <mdui-button 
        slot="action" 
        variant="tonal" 
        @click="deleteMod"
        style="color: var(--md-sys-color-error);"
      >
        确认删除
      </mdui-button>
    </mdui-dialog>
  </div>
</template>

<style scoped>
/* 错误横幅样式 */
.error-banner {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
  margin: 8px 16px;
  border-radius: 8px;
}

/* 统计卡片样式 */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 16px;
}

.stats-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: var(--md-sys-color-surface-container);
  border-radius: 12px;
  gap: 12px;
}

.stats-info {
  display: flex;
  flex-direction: column;
}

.stats-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.stats-label {
  font-size: 12px;
  color: var(--md-sys-color-on-surface-variant);
}

/* 列表头部样式 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-actions {
  display: flex;
  gap: 8px;
}

/* 服务器项样式增强 */
.server-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.server-ping {
  font-size: 12px;
  color: var(--md-sys-color-outline);
  margin-top: 2px;
}
</style>
