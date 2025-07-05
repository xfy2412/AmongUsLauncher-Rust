import { createApp } from "vue";
import App from "./App.vue";

// 导入本地Roboto字体
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// 导入Material Design Icons本地字体
import '@material-design-icons/font/filled.css';
import '@material-design-icons/font/outlined.css';

// 导入MDUI样式
import 'mdui/mdui.css';
import 'mdui';

// 导入mdui-vui插件
import mduiVui from 'mdui-vui';

const app = createApp(App);

// 使用mdui-vui插件
app.use(mduiVui);

app.mount("#app");
