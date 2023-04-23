// ==UserScript==
// @name         B站视频下载
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.2.0
// @description  视频下方添加下载按钮，点击下载后上方会出现下载进度条！注意：不保证所有视频都能下载！！！
// @author       张仨
// @noframes
// @match        https://www.bilibili.com/video/*
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_download
// @connect      www.mxnzp.com
// ==/UserScript==

let downloadButton = document.createElement('div')
let ops = document.querySelector('#arc_toolbar_report .ops') || document.querySelector('#arc_toolbar_report .toolbar-left');
ops.addEventListener("DOMNodeInserted", () => {
  ops.parentElement.appendChild(downloadButton);
})
downloadButton.id = "downloadButton"
downloadButton.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024" width="25" height="25">
<path d="M877.49 381.468H668.638V68.191H355.36v313.277H146.51l365.489 365.49 365.49-365.49zM146.51 851.383v104.425h730.98V851.383H146.51z"/>
</svg>
<span>视频下载</span>`
let progres = document.createElement('div')
document.body.appendChild(progres)
progres.id = 'my-box'
progres.innerHTML = `
<span class="my-percent"></span>
<span class="my-message"></span>
<div class="my-cancel">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17" width="20" height="20">
        <path d="M12.566,8 L15.611,4.956 C16.031,4.535 16.031,3.853 15.611,3.434 L12.566,0.389 C12.146,-0.031 11.464,-0.031 11.043,0.389 L7.999,3.433 L4.955,0.389 C4.534,-0.031 3.852,-0.031 3.432,0.389 L0.388,3.434 C-0.034,3.854 -0.034,4.536 0.387,4.956 L3.431,8 L0.387,11.044 C-0.034,11.465 -0.034,12.147 0.388,12.567 L3.432,15.611 C3.852,16.032 4.534,16.032 4.955,15.611 L7.999,12.567 L11.043,15.611 C11.464,16.032 12.146,16.032 12.566,15.611 L15.611,12.567 C16.031,12.146 16.031,11.464 15.611,11.044 L12.566,8 L12.566,8 Z"></path>
    </svg>
</div>
<div class="my-tip">
    <div class="tip-trangle-top"></div>
    取消下载
</div>
<div class="progress-box">
    <div class="progress"></div>
</div>`
function Display(style) {
  if (style) {
    progres.style.display = 'block'
    downloadButton.style.display = 'none'
  } else {
    progres.style.display = 'none'
    downloadButton.style.display = 'inline-block'
  }
}
let download = null;
let my_box = document.querySelectorAll("#my-box span")
function Download(url, name) {
  download = GM_download({
    url: url,
    name: name + ".mp4",
    saveAs: true,
    onprogress: (pro) => {
      let progress = document.querySelector(".progress")
      let percentage = Math.round(pro.loaded / pro.totalSize * 10000) / 100.00 + "%"
      progress.style.width = percentage
      my_box[1].innerHTML = percentage
      my_box[0].innerHTML = "下载中...请稍等！"
    },
    onload: () => {
      my_box[0].innerHTML = "下载完成，即将弹出'另存为'对话框！"
      setTimeout(() => {
        Display(false)
      }, 6000);
    },
    onerror: (e) => {
      if (e.error == "aborted") {
        my_box[0].innerHTML = "已取消下载！"
      } else {
        my_box[0].innerHTML = "下载未启动或失败！"
      }
    }
  })
}
let my_cancel = document.querySelector(".my-cancel")
my_cancel.addEventListener("click", () => {
  download.abort()
  setTimeout(() => {
    Display(false)
  }, 3000);
})
/*
* 以下app_id和app_secret为调用接口专门申请的，请勿滥用~！
*/
function Ajax(url) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      responseType: "json",
      url: `https://www.mxnzp.com/api/bilibili/video?url=${btoa(url)}&app_id=lnr8vkootnrr9ch2&app_secret=clloM1doZFczeHBjRjRndEZoMWhrUT09`,
      onload: function (xhr) {
        if (xhr.readyState === 4 && xhr.status === 200) {
          if (xhr.response.code === 1) {
            resolve(xhr.response.data)
          } else {
            reject("获取数据失败，请稍后重试！")
          }
        } else {
          reject("获取数据失败，请稍后重试！")
        }
      }
    })
  })
}
downloadButton.addEventListener('click', () => {
  let newAjax = new Ajax(location.href)
  newAjax.then(res => {
    if (res.list.length == 0) {
      alert("获取数据失败，请稍后重试！")
    } else {
      Display(true)
      if (res.list.length > 1) {
        let num = prompt("请输入需要下载的那一集！")
        if (num != null && num != "") {
          num = Number(num) - 1
          Download(res.list[num].url, res.list[num].title)
        } else {
          Display(false)
        }
      } else {
        Download(res.list[0].url, res.title)
      }
    }
  }).catch(err => {
    alert(err)
  })
})
GM_addStyle(`
    #my-box{
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        margin: auto;
        width: 450px;
        height: 120px;
        z-index: 9999999;
        border-radius: 10px;
        background: rgba(243, 247, 247, 0.9);
        animation: topDown 0.3s;
        display: none;
    }

    @keyframes topDown {
        from {
            top: -200px;
            opacity: 0
        }

        to {
            top: 0;
            opacity: 1
        }
    }

    #my-box span {
        position: absolute;
        bottom: 10px;
        color: #1b53ec;
        font-size: 16px;
    }

    .my-percent {
        left: 30px;
    }

    .my-message {
        left: 220px;
    }

    .my-cancel {
        position: absolute;
        top: 15px;
        right: 30px;
        fill: #1b53ec;
        cursor: pointer;
    }

    .my-tip {
        position: relative;
        top: 50px;
        left: 375px;
        width: 80px;
        color: #1b53ec;
        font-size: 16px;
        background: #f97199;
        padding: 10px;
        -webkit-border-radius: 5px;
        -moz-border-radius: 5px;
        border-radius: 5px;
        z-index: 9999999;
        display: none;
    }

    .tip-trangle-top {
        position: absolute;
        top: -10px;
        left: 20px;
        width: 0;
        height: 0;
        border-left: 15px solid transparent;
        border-right: 15px solid transparent;
        border-bottom: 15px solid #f97199;
    }

    .my-cancel:hover + .my-tip {
        display: block;
    }

    .progress-box {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        height: 20px;
        width: 400px;
        border-radius: 10px;
        background-color: gainsboro;
    }

    .progress {
        width: 0;
        height: 100%;
        border-radius: 10px;
        background-color: #1b53ec;
        transition: width .3s;
        background-image: linear-gradient(90deg,
                rgba(255, 255, 255, 0),
                rgba(255, 255, 255, 1),
                rgba(255, 255, 255, 0));
        background-size: 40px 100%;
        background-repeat: no-repeat;
        background-position: left -40px top 0;
        animation: shine 2s ease infinite;
    }

    @keyframes shine {
        to {
            background-position: right -40px top 0;
        }
    }

    #downloadButton {
        position: relative;
        left: 30px;
        width: 120px;
        height: 25px;
        display: inline-block;
        fill: #757575;
        color: #757575;
        cursor: pointer;
        z-index: 9999999;
    }

    #downloadButton svg {
        vertical-align: middle;
        line-height: initial;
    }

    #downloadButton:hover {
        fill: #17a2d4;
        color: #17a2d4;
    }
`)
