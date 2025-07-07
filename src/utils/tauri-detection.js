/**
 * Tauri环境检测和初始化
 */

// 确保在 Tauri 环境中正确加载
if (typeof window !== 'undefined' && window.__TAURI__) {
  // Tauri 环境检测
  console.log('Tauri 环境已检测到');
  
  // 可以在这里添加更多的Tauri相关初始化逻辑
  // 例如：主题检测、窗口状态监听等
}

// 导出环境检测函数以供其他模块使用
export const isTauriEnvironment = () => {
  return typeof window !== 'undefined' && window.__TAURI__;
};

// 导出安全的Tauri API调用函数
export const safeTauriCall = async (apiCall) => {
  if (isTauriEnvironment()) {
    try {
      return await apiCall();
    } catch (error) {
      console.error('Tauri API调用失败:', error);
      return null;
    }
  } else {
    console.warn('非Tauri环境，跳过API调用');
    return null;
  }
}; 