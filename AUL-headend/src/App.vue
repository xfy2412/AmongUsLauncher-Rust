<script setup>
import { ref, onMounted } from "vue";

const showLoading = ref(true);

onMounted(() => {
  setTimeout(() => {
    const loadingElement = document.querySelector('.loading-animation');
    if (loadingElement) {
      loadingElement.style.opacity = '0';
      setTimeout(() => {
        showLoading.value = false;
      }, 500);
    }
  }, 2000);
});

const servers = ref([]);
const newServer = ref({
  name: '',
  ping_server: '',
  port: 25565,
  translate_name: 0
});

async function fetchServers() {
  const response = await fetch('http://localhost:8000/now_server');
  const data = await response.json();
  // 转换字段名从pingServer到ping_server以匹配后端API
  servers.value = data.map(server => ({
    ...server,
    ping_server: server.pingServer || server.ping_server
  }));
}

async function addServer() {
  await fetch('http://localhost:8000/add_server', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: newServer.value.name,
      ping_server: newServer.value.ping_server,
      port: newServer.value.port,
      translate_name: newServer.value.translate_name
    })
  });
  await fetchServers();
}

const showConfirmDialog = ref(false);
const serverToDelete = ref(null);

function confirmDelete(index) {
  serverToDelete.value = index;
  showConfirmDialog.value = true;
}

async function removeServer(index) {
  try {
    const response = await fetch('http://localhost:8000/remove_server', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index: index })
    });
    
    if (!response.ok) {
      throw new Error('删除服务器失败');
    }
    
    await fetchServers();
  } catch (error) {
    console.error('删除服务器时出错:', error);
    alert('删除服务器失败: ' + error.message);
  } finally {
    showConfirmDialog.value = false;
  }
}
async function startGame() {
  // 新建steam://rungameid/945360
  window.location.href = 'steam://rungameid/945360';
}

onMounted(fetchServers);
</script>


<template>
  <div class="container">
    <button @click="startGame">启动游戏</button>
    <!-- 确认删除对话框 -->
    <div v-if="showConfirmDialog" class="confirm-dialog" style="z-index: 1001">
      <div class="dialog-content">
        <h3>确认删除服务器</h3>
        <p>您确定要删除这个服务器吗？</p>
        <div class="dialog-buttons">
          <button @click="removeServer(serverToDelete)">确认</button>
          <button @click="showConfirmDialog = false">取消</button>
        </div>
      </div>
    </div>
    <div v-if="showLoading" class="loading-animation">
  <h1 class="title-animation">Among Us Launcher</h1>
</div>
<div v-show="!showLoading">
  <h1>Among Us 服务器管理</h1>
    
    <div class="server-form">
      <h2>添加新服务器</h2>
      <input v-model="newServer.name" placeholder="服务器名称" />
      <input v-model="newServer.ping_server" placeholder="服务器地址" />
      <input v-model.number="newServer.port" type="number" placeholder="端口" />
      <button @click="addServer">添加服务器</button>
    </div>
    
    <div class="server-list">
      <h2>服务器列表</h2>
      <div v-for="(server, index) in servers" :key="index" class="server-item">
        <span>{{ server.name || server.Name || server.TranslateName}} - {{ server.ping_server || server.PingServer}}</span>
        <!-- 如果名字是North America-->
        <template v-if="!(server.name === 'North America' || server.name === 'Asia' || server.name === 'Europe')">
          <button @click="confirmDelete(index)">删除</button>
        </template>
        <template v-else>
          <button disabled title="无法删除" class="official">删除</button>
        </template>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
.logo.vite:hover {
  filter: drop-shadow(0 0 2em #747bff);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #249b73);
}

</style>
<style>
:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color: #333333;
  background-color: #f6f6f6;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

.container {
  margin: 0;
  padding-top: 5vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  background-color: rgba(109, 109, 109, 0.9);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.server-form, .server-list {
  background-color: rgba(37, 32, 32, 0.5);
  padding: 1.5rem;
  border-radius: 12px;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.server-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  margin: 0.5rem 0;
  background-color: rgba(92, 92, 92, 0.7);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.server-item:hover {
  background-color: rgba(145, 145, 145, 0.9);
  transform: translateY(-2px);
}

input {
  margin: 0.5rem;
  width: 80%;
  max-width: 400px;
}

button {
  margin: 0.5rem;
  transition: all 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: 0.75s;
}

.logo.tauri:hover {
  filter: drop-shadow(0 0 2em #24c8db);
}

.loading-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 300px;
  min-height: 200px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 2rem;
  border-radius: 8px;
  z-index: 999;
  opacity: 1;
  transition: opacity 0.5s ease-out;
}

.title-animation {
  font-size: 2rem;
  color: #396cd8;
  animation: zoomIn 1s ease-in-out, fadeOut 0.5s ease-out 2s forwards;
}

@keyframes zoomIn {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid #396cd8;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.row {
  display: flex;
  justify-content: center;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}

a:hover {
  color: #535bf2;
}

h1 {
  text-align: center;
}

input,
button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  color: #0f0f0f;
  background-color: #ffffff;
  transition: border-color 0.25s;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
}

button.official {
  background-color: rgb(94, 9, 9);
}
button.official:hover {
  background-color: rgb(138, 13, 13);
}
button.official:active {
  border-color: rgb(172, 17, 17);
  background-color: rgb(172, 17, 17);
}

/* 确认对话框样式 */
.confirm-dialog {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   display: flex;
   justify-content: center;
   align-items: center;
   background: rgba(0, 0, 0, 0.5); /* 半透明背景 */
   z-index: 1000;
 }

.dialog-content {
   position: fixed;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
   background-color: white;
   padding: 2rem;
   border-radius: 8px;
   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
   min-width: 300px;
   max-width: 400px;
   width: 90%;
 }

.dialog-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.dialog-buttons button {
  margin: 0 0.5rem;
  padding: 0.5rem 1rem;
}

.dialog-content {
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
}

.dialog-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.dialog-buttons button {
  flex: 1;
  margin: 0 0.5rem;
}
button {
  cursor: pointer;
}

button:hover {
  border-color: #396cd8;
}
button:active {
  border-color: #396cd8;
  background-color: #e8e8e8;
}

input,
button {
  outline: none;
}

#greet-input {
  margin-right: 5px;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: #f6f6f6;
    background-color: #2f2f2f;
  }

  a:hover {
    color: #24c8db;
  }

  input,
  button {
    color: #ffffff;
    background-color: #0f0f0f98;
  }
  button:active {
    background-color: #0f0f0f69;
  }
}

</style>
