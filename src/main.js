import { createApp } from 'vue';
import '@/assets/css/index.css';
import '@/assets/css/reset.css';
import '@/assets/css/atom.css';
import '@/assets/css/atomColor.css';
import App from './App.vue';

import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn' // 汉化 element-plus 组件
// 全局注册 ElementPlus 图标组件
import * as ElementPlusIcons from '@element-plus/icons-vue'

let app = createApp(App)

app.use(ElementPlus, {
    locale: zhCn,
})

for(const [key, component] of Object.entries(ElementPlusIcons)) {
    app.component(key, component)
}

app.mount('#app');
