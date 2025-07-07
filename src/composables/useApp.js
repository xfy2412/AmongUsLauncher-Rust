import { ref, onMounted, watch, computed } from "vue";
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function useApp() {
  const showLoading = ref(true);
  
  // 获取当前窗口实例
  const appWindow = getCurrentWindow();
  
  // 标签页管理
  const currentTab = ref('servers'); // 'servers' 或 'mods'
  
  // 窗口控制函数
  async function minimizeWindow() {
    await appWindow.minimize();
  }
  
  async function maximizeWindow() {
    await appWindow.toggleMaximize();
  }
  
  async function closeWindow() {
    // 简化关闭逻辑，不再需要关闭模组窗口
    await appWindow.close();
  }
  
  // 窗口状态
  const isMaximized = ref(false);
  
  // 监听窗口最大化状态
  const initWindowListeners = async () => {
    isMaximized.value = await appWindow.isMaximized();
    
    // 监听窗口最大化状态变化
    appWindow.listen('tauri://resize', async () => {
      isMaximized.value = await appWindow.isMaximized();
    });
  };
  
  // 主题管理
  const currentTheme = ref('light'); // 'light', 'dark'
  
  // 初始化主题
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    // 如果之前保存的是auto，则默认为light
    currentTheme.value = savedTheme === 'auto' ? 'light' : savedTheme;
    applyTheme(currentTheme.value);
  }
  
  // 应用主题
  function applyTheme(theme) {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('data-theme', theme);
  }
  
  // 切换主题 - 直接在light和dark之间切换
  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light';
  }
  
  // 获取主题图标
  function getThemeIcon() {
    return currentTheme.value === 'light' ? 'dark_mode' : 'light_mode';
  }
  
  // 获取主题文本
  function getThemeText() {
    return currentTheme.value === 'light' ? '深色模式' : '浅色模式';
  }
  
  // 监听主题变化
  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  });
  
  // 切换标签页
  function switchTab(tab) {
    currentTab.value = tab;
  }
  
  return {
    showLoading,
    currentTab,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    isMaximized,
    initWindowListeners,
    currentTheme,
    initTheme,
    toggleTheme,
    getThemeIcon,
    getThemeText,
    switchTab
  };
} 