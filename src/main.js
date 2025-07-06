import { createApp } from "vue";
import "./App-md3.css";
import App from "./App.vue";

// 导入本地Roboto字体
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// 导入Material Design Icons本地字体
import '@material-design-icons/font/filled.css';
import '@material-design-icons/font/outlined.css';

// 由于MDUI是全局JS文件，我们需要在HTML中加载
// MDUI将在index.html中加载

// 导入mdui-vui插件
import mduiVui from 'mdui-vui';

const app = createApp(App);

// 使用mdui-vui插件
app.use(mduiVui);

app.mount("#app");
