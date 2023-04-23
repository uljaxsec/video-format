// ==UserScript==
// @name         腾讯视频去广告
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.1.0
// @description  腾讯视频去广告，不保证所有视频都能去广告
// @author       乐叶
// @match        https://v.qq.com/*
// ==/UserScript==

window.onload = () => {
  let bi = null;
  clearAd();
  //  监听 pushState ，如果是剧集，会在当前页面选择具体剧集，会不刷新页面
  window.addEventListener('pushState', () => {
    clearInterval(bi);
    clearAd();
  })

  function clearAd() {
    bi = setInterval(() => {
      //  获取广告的 video 标签，一般是有两个，显示一个，另一个在加载下一个广告
      let adVideos = document.querySelectorAll('.txp_ad video');
      adVideos.forEach(ad => {
        try {
          if (ad.duration !== ad.currentTime) {
            ad.setAttribute('src', '');
            //  隐藏广告的 video 标签，解决广告闪屏
            ad.style.display = 'none';
          }
        } catch (e) {
          console.log(e)
        }
      })

    }, 100);

    //  倒计时去掉
    let adc = document.querySelectorAll('.txp_ad_control');
    adc.forEach(adcItem => {
      adcItem.style.display = 'none'
    })

    setTimeout(() => {
      console.log('开始播放')
      document.querySelector('.txp_btn.txp_btn_play.play_btn_play').click();
    }, 300)
  }

}

