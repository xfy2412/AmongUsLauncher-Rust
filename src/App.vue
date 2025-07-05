<script setup>
import { ref, onMounted } from "vue";
import { invoke } from '@tauri-apps/api/core';
import './App-md3.css';

const showLoading = ref(true);

onMounted(() => {
  setTimeout(() => {
    showLoading.value = false;
  }, 2000);
});

const servers = ref([]);
const newServer = ref({
  name: '',
  ping_server: '',
  port: 25565,
  translate_name: 0
});

const showConfirmDialog = ref(false);
const serverToDelete = ref(null);

async function fetchServers() {
  try {
    const data = await invoke('get_now_server');
    servers.value = Array.isArray(data) 
      ? data.map(server => ({
          ...server,
          ping_server: server.pingServer || server.ping_server
        }))
      : (data?.Regions || []).map(server => ({
          ...server,
          ping_server: server.pingServer || server.ping_server
        }));
  } catch (error) {
    console.error('获取服务器列表时出错:', error);
  }
}

async function addServer() {
  try {
    if (!newServer.value.name || !newServer.value.ping_server) {
      throw new Error('服务器名称和地址不能为空');
    }
    await invoke('add_server', {
      name: newServer.value.name,
      pingServer: newServer.value.ping_server,
      port: newServer.value.port,
      translateName: newServer.value.translate_name
    });
    await fetchServers();
    
    // 清空表单
    newServer.value = {
      name: '',
      ping_server: '',
      port: 25565,
      translate_name: 0
    };
  } catch (error) {
    console.error('添加服务器时出错:', error);
    alert(`添加服务器失败: ${error.message}`);
  }
}

function confirmDelete(index) {
  serverToDelete.value = index;
  showConfirmDialog.value = true;
}

async function removeServer(index) {
  try {
    await invoke('remove_server_by_index', { 
      regionIndex: index,
      serverIndex: index
    });
    await fetchServers();
  } catch (error) {
    console.error('删除服务器时出错:', error);
    if (error?.message?.includes('区域中没有Servers字段')) {
      alert('删除服务器失败: 该区域没有可删除的服务器');
    } else {
      alert('删除服务器失败: ' + (error?.message || '未知错误'));
    }
  } finally {
    showConfirmDialog.value = false;
  }
}

async function startGame() {
  window.location.href = 'steam://rungameid/945360';
}

onMounted(fetchServers);
</script>

<template>
  <div class="app-container">
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
        <mdui-top-app-bar-title>Among Us 服务器管理</mdui-top-app-bar-title>
        <div style="flex-grow: 1;"></div>
        <mdui-button 
          variant="filled" 
          @click="startGame"
          icon="sports_esports"
        >
          启动游戏
        </mdui-button>
      </mdui-top-app-bar>

      <!-- 主要内容区域 -->
      <div class="main-content">
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
              ></mdui-text-field>
            </div>
            
            <div class="form-field">
              <mdui-text-field
                v-model="newServer.ping_server"
                label="服务器地址"
                helper="输入服务器的IP地址或域名"
                variant="outlined"
                clearable
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
              ></mdui-text-field>
            </div>
            
            <div class="form-field" style="display: flex; align-items: flex-end;">
              <mdui-button 
                variant="filled" 
                @click="addServer"
                icon="add"
                style="height: 56px; width: 100%;"
              >
                添加服务器
              </mdui-button>
            </div>
          </div>
        </div>

        <!-- 服务器列表卡片 -->
        <div class="server-list">
          <h2 class="form-title">
            <mdui-icon name="dns" style="vertical-align: middle; margin-right: 8px;"></mdui-icon>
            服务器列表
          </h2>
          
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
                </div>
              </div>
              
              <div style="display: flex; gap: 8px; align-items: center;">
                <!-- 显示服务器状态 -->
                <mdui-chip 
                  v-if="server.Name === 'North America' || server.Name === 'Asia' || server.Name === 'Europe'"
                  variant="assist"
                  icon="verified"
                >
                  官方服务器
                </mdui-chip>
                
                <mdui-chip 
                  v-else
                  variant="filter"
                  icon="person"
                >
                  自定义服务器
                </mdui-chip>
                <mdui-chip 
                  v-if="server.PingServer === 'mxzc.cloud'"
                  variant="assist"
                  icon="verified"
                >
                  可信服务器
                </mdui-chip>
                <!-- 删除按钮 -->
                <mdui-button 
                  v-if="!(server.Name === 'North America' || server.Name === 'Asia' || server.Name === 'Europe')"
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
    </div>

    <!-- 确认删除对话框 -->
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
        @click="showConfirmDialog = false"
      >
        取消
      </mdui-button>
      <mdui-button 
        slot="action" 
        variant="tonal" 
        @click="removeServer(serverToDelete)"
        style="color: var(--md-sys-color-error);"
      >
        确认删除
      </mdui-button>
    </mdui-dialog>
  </div>
</template>
