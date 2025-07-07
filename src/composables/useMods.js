import { ref, computed } from "vue";

export function useMods() {
  // 模组管理相关
  const mods = ref([
    { id: 1, name: '示例模组 1', description: '这是一个示例模组的描述信息', version: '1.0.1', enabled: true },
    { id: 2, name: '示例模组 2', description: '这是一个示例模组的描述信息', version: '1.0.2', enabled: true },
    { id: 3, name: '示例模组 3', description: '这是一个示例模组的描述信息', version: '1.0.3', enabled: false },
    { id: 4, name: '示例模组 4', description: '这是一个示例模组的描述信息', version: '1.0.4', enabled: false },
    { id: 5, name: '示例模组 5', description: '这是一个示例模组的描述信息', version: '1.0.5', enabled: false }
  ]);
  
  const showModConfirmDialog = ref(false);
  const modToDelete = ref(null);
  
  function toggleMod(mod) {
    mod.enabled = !mod.enabled;
  }
  
  function confirmDeleteMod(mod) {
    modToDelete.value = mod;
    showModConfirmDialog.value = true;
  }
  
  function deleteMod() {
    if (modToDelete.value) {
      const index = mods.value.findIndex(mod => mod.id === modToDelete.value.id);
      if (index > -1) {
        mods.value.splice(index, 1);
      }
    }
    showModConfirmDialog.value = false;
    modToDelete.value = null;
  }
  
  function addMod() {
    // TODO: 实现添加模组功能
    alert('添加模组功能待实现');
  }
  
  function importMod() {
    // TODO: 实现导入模组功能
    alert('导入模组功能待实现');
  }
  
  // 获取已启用的模组数量
  const enabledModsCount = computed(() => {
    return mods.value.filter(mod => mod.enabled).length;
  });
  
  return {
    mods,
    showModConfirmDialog,
    modToDelete,
    toggleMod,
    confirmDeleteMod,
    deleteMod,
    addMod,
    importMod,
    enabledModsCount
  };
} 