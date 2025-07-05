import { createApp } from "vue";
import App from "./App.vue";

// 导入MDUI样式
import 'mdui/mdui.css';
import 'mdui';

// 导入mdui-vui插件
import mduiVui from 'mdui-vui';

const app = createApp(App);

// 使用mdui-vui插件
app.use(mduiVui);

app.mount("#app");
