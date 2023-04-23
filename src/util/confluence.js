// ==UserScript==
// @name         confluence指定页面的 a 标签在新窗口打开
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.1.0
// @description  confluence 项目访问地址，产品访问地址，swagger接口文档 页面的 a 标签在新窗口打开
// @author       乐叶
// @match        http://192.168.0.220:8090/pages/viewpage.action?pageId=34326679
// @match        http://192.168.0.220:8090/pages/viewpage.action?pageId=34326674
// @match        http://192.168.0.220:8090/pages/viewpage.action?pageId=34326676
// ==/UserScript==

//  获取所有 a 元素
let aList = document.querySelectorAll('.confluenceTable a');
//  把 nodeList 转换为 数组
aList = Array.from(aList);
aList.forEach(a => {
  a.setAttribute('target', '_blank');
})
