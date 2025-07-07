import { ref, computed } from "vue";
import { invoke } from '@tauri-apps/api/core';

// 服务器状态枚举
export const SERVER_STATUS = {
  UNKNOWN: 'unknown',
  ONLINE: 'online',
  OFFLINE: 'offline',
  CHECKING: 'checking'
};

// 服务器类型枚举
export const SERVER_TYPE = {
  OFFICIAL: 'official',
  CUSTOM: 'custom',
  TRUSTED: 'trusted'
};

export function useServers() {
  // 服务器管理相关状态
  const servers = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  
  // 新服务器表单数据
  const newServer = ref({
    name: '',
    ping_server: '',
    port: 25565,
    translate_name: 0
  });
  
  // 表单验证状态
  const formErrors = ref({});
  const isFormValid = computed(() => {
    return Object.keys(formErrors.value).length === 0 && 
           newServer.value.name.trim() !== '' && 
           newServer.value.ping_server.trim() !== '';
  });
  
  // 对话框状态
  const showConfirmDialog = ref(false);
  const serverToDelete = ref(null);
  
  // 服务器统计信息
  const serverStats = computed(() => {
    const stats = {
      total: servers.value.length,
      official: 0,
      custom: 0,
      trusted: 0,
      online: 0,
      offline: 0,
      unknown: 0
    };
    
    servers.value.forEach(server => {
      // 按类型统计
      if (isOfficialServer(server)) {
        stats.official++;
      } else if (isTrustedServer(server)) {
        stats.trusted++;
      } else {
        stats.custom++;
      }
      
      // 按状态统计
      switch (server.status) {
        case SERVER_STATUS.ONLINE:
          stats.online++;
          break;
        case SERVER_STATUS.OFFLINE:
          stats.offline++;
          break;
        default:
          stats.unknown++;
      }
    });
    
    return stats;
  });
  
  // 服务器类型判断函数
  function isOfficialServer(server) {
    const officialServers = ['North America', 'Asia', 'Europe'];
    return officialServers.includes(server.Name);
  }
  
  function isTrustedServer(server) {
    const trustedHosts = ['mxzc.cloud'];
    return trustedHosts.includes(server.PingServer);
  }
  
  function getServerType(server) {
    if (isOfficialServer(server)) return SERVER_TYPE.OFFICIAL;
    if (isTrustedServer(server)) return SERVER_TYPE.TRUSTED;
    return SERVER_TYPE.CUSTOM;
  }
  
  // 错误处理函数
  function handleError(errorMessage, context = '') {
    console.error(`[服务器管理] ${context}: ${errorMessage}`);
    error.value = {
      message: errorMessage,
      context: context,
      timestamp: new Date().toISOString()
    };
    
    // 3秒后自动清除错误
    setTimeout(() => {
      error.value = null;
    }, 3000);
  }
  
  // 表单验证函数
  function validateServerForm() {
    const errors = {};
    
    if (!newServer.value.name.trim()) {
      errors.name = '服务器名称不能为空';
    } else if (newServer.value.name.length > 50) {
      errors.name = '服务器名称不能超过50个字符';
    }
    
    if (!newServer.value.ping_server.trim()) {
      errors.ping_server = '服务器地址不能为空';
    } else if (!/^[a-zA-Z0-9.-]+$/.test(newServer.value.ping_server)) {
      errors.ping_server = '服务器地址格式不正确';
    }
    
    if (!newServer.value.port || newServer.value.port < 1 || newServer.value.port > 65535) {
      errors.port = '端口号必须在1-65535之间';
    }
    
    formErrors.value = errors;
    return Object.keys(errors).length === 0;
  }
  
  // 获取服务器列表
  async function fetchServers() {
    if (isLoading.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const data = await invoke('get_now_server');
      const flattenedServers = processServerData(data);
      
      servers.value = flattenedServers;
      
      // 异步检查服务器状态
      checkAllServersStatus();
      
    } catch (err) {
      handleError(err.message || '获取服务器列表失败', '获取服务器列表');
    } finally {
      isLoading.value = false;
    }
  }
  
  // 处理服务器数据
  function processServerData(data) {
    const flattenedServers = [];
    
    if (data && data.Regions && Array.isArray(data.Regions)) {
      data.Regions.forEach((region, regionIndex) => {
        if (region.Servers && Array.isArray(region.Servers)) {
          region.Servers.forEach((server, serverIndex) => {
            flattenedServers.push(createServerObject(server, region, regionIndex, serverIndex));
          });
        } else {
          // 如果没有Servers字段，将区域本身作为服务器
          flattenedServers.push(createServerObject(region, region, regionIndex, 0));
        }
      });
    }
    
    return flattenedServers;
  }
  
  // 创建服务器对象
  function createServerObject(server, region, regionIndex, serverIndex) {
    return {
      ...server,
      ping_server: server.PingServer || server.ping_server,
      regionIndex: regionIndex,
      serverIndex: serverIndex,
      regionName: region.Name,
      type: getServerType(server),
      status: SERVER_STATUS.UNKNOWN,
      lastChecked: null,
      responseTime: null
    };
  }
  
  // 检查所有服务器状态
  async function checkAllServersStatus() {
    const promises = servers.value.map(server => checkServerStatus(server));
    await Promise.allSettled(promises);
  }
  
  // 检查单个服务器状态
  async function checkServerStatus(server) {
    if (isOfficialServer(server)) {
      // 官方服务器默认在线
      server.status = SERVER_STATUS.ONLINE;
      server.responseTime = 0;
      return;
    }
    
    server.status = SERVER_STATUS.CHECKING;
    
    try {
      const startTime = Date.now();
      
      // 调用后端检查服务器状态
      const result = await invoke('check_server_status', {
        host: server.ping_server || server.PingServer,
        port: server.Port || server.port || 25565
      });
      
      const endTime = Date.now();
      server.responseTime = endTime - startTime;
      server.status = result.online ? SERVER_STATUS.ONLINE : SERVER_STATUS.OFFLINE;
      
    } catch (err) {
      server.status = SERVER_STATUS.OFFLINE;
      server.responseTime = null;
    }
    
    server.lastChecked = new Date();
  }
  
  // 添加服务器
  async function addServer() {
    if (!validateServerForm()) {
      return;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      await invoke('add_server', {
        name: newServer.value.name.trim(),
        pingServer: newServer.value.ping_server.trim(),
        port: parseInt(newServer.value.port),
        translateName: newServer.value.translate_name
      });
      
      await fetchServers();
      resetForm();
      
    } catch (err) {
      handleError(err.message || '添加服务器失败', '添加服务器');
    } finally {
      isLoading.value = false;
    }
  }
  
  // 重置表单
  function resetForm() {
    newServer.value = {
      name: '',
      ping_server: '',
      port: 25565,
      translate_name: 0
    };
    formErrors.value = {};
  }
  
  // 确认删除服务器
  function confirmDelete(index) {
    const server = servers.value[index];
    if (isOfficialServer(server)) {
      handleError('无法删除官方服务器', '删除服务器');
      return;
    }
    
    serverToDelete.value = index;
    showConfirmDialog.value = true;
  }
  
  // 删除服务器
  async function removeServer(flatIndex) {
    if (flatIndex === null || flatIndex === undefined) return;
    
    const server = servers.value[flatIndex];
    if (!server) {
      handleError('服务器不存在', '删除服务器');
      return;
    }
    
    if (isOfficialServer(server)) {
      handleError('无法删除官方服务器', '删除服务器');
      return;
    }
    
    isLoading.value = true;
    
    try {
      await invoke('remove_server_by_index', { 
        regionIndex: server.regionIndex,
        serverIndex: server.serverIndex
      });
      
      await fetchServers();
      
    } catch (err) {
      handleError(err.message || '删除服务器失败', '删除服务器');
    } finally {
      isLoading.value = false;
      showConfirmDialog.value = false;
      serverToDelete.value = null;
    }
  }
  
  // 取消删除
  function cancelDelete() {
    showConfirmDialog.value = false;
    serverToDelete.value = null;
  }
  
  // 刷新服务器状态
  async function refreshServerStatus(serverIndex) {
    if (serverIndex >= 0 && serverIndex < servers.value.length) {
      await checkServerStatus(servers.value[serverIndex]);
    }
  }
  
  // 启动游戏
  async function startGame() {
    try {
      // 检查Steam是否可用
      window.location.href = 'steam://rungameid/945360';
    } catch (err) {
      handleError('无法启动游戏，请确保Steam已安装', '启动游戏');
    }
  }
  
  // 导出服务器配置
  function exportServerConfig() {
    const config = {
      servers: servers.value.map(server => ({
        name: server.name || server.Name,
        ping_server: server.ping_server || server.PingServer,
        port: server.Port || server.port || 25565,
        type: server.type
      })),
      exportTime: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `among-us-servers-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  return {
    // 状态
    servers,
    isLoading,
    error,
    newServer,
    formErrors,
    isFormValid,
    showConfirmDialog,
    serverToDelete,
    serverStats,
    
    // 方法
    fetchServers,
    addServer,
    confirmDelete,
    removeServer,
    cancelDelete,
    refreshServerStatus,
    startGame,
    resetForm,
    exportServerConfig,
    
    // 工具函数
    isOfficialServer,
    isTrustedServer,
    getServerType,
    
    // 常量
    SERVER_STATUS,
    SERVER_TYPE
  };
} 