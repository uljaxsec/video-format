// ==UserScript==
// @name         无限制下载视频ffmpeg
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.1.0
// @description:zh-Cn  直接获取视频和音频二进制流，打破所有下载限制。（只要你可以播放，你就可以下载！）
// @author       乐叶
// @match        https://www.bilibili.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        unsafeWindow
// @grant        GM_download
// @require      https://cdn.bootcdn.net/ajax/libs/ffmpeg/0.11.6/ffmpeg.min.js
// @require      https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js
// @run-at       document-start
// ==/UserScript==

(function () {
  console.log("开始解析");

  window.isComplete = 0;
  window.audio = [];
  window.video = [];

  const _endOfStream = window.MediaSource.prototype.endOfStream
  window.MediaSource.prototype.endOfStream = function () {
    window.isComplete = 1;
    return _endOfStream.apply(this, arguments)
  }

  window.MediaSource.prototype.endOfStream.toString = function() {
    return _endOfStream.toString();
  }

  const _addSourceBuffer = window.MediaSource.prototype.addSourceBuffer
  window.MediaSource.prototype.addSourceBuffer = function (mime) {
    if (mime.toString().indexOf('audio') !== -1) {
      window.audio = [];
    } else if (mime.toString().indexOf('video') !== -1) {
      window.video = [];
    }

    let sourceBuffer = _addSourceBuffer.call(this, mime)
    const _append = sourceBuffer.appendBuffer
    sourceBuffer.appendBuffer = function (buffer) {
      if (mime.toString().indexOf('audio') !== -1) {
        window.audio.push(buffer);
      } else if (mime.toString().indexOf('video') !== -1) {
        window.video.push(buffer)
      }
      _append.call(this, buffer)
    }

    sourceBuffer.appendBuffer.toString = function () {
      return _append.toString();
    }
    return sourceBuffer
  }

  window.MediaSource.prototype.addSourceBuffer.toString = function () {
    return _addSourceBuffer.toString();
  }

  function download() {
    // let a = document.createElement('a');
    // a.href = window.URL.createObjectURL(new Blob(window.audio));
    // a.download = 'audio_' + document.title + '.mp4';
    // a.click();
    // a.href = window.URL.createObjectURL(new Blob(window.video));
    // a.download = 'video_' + document.title + '.mp4';
    // a.click();
    // window.isComplete = 0;


    window.open(window.URL.createObjectURL(new Blob(window.audio)));
    window.open(window.URL.createObjectURL(new Blob(window.video)));

    GM_download(window.URL.createObjectURL(new Blob(window.audio)));
    GM_download(window.URL.createObjectURL(new Blob(window.video)));
    window.isComplete = 0;

    const { createFFmpeg } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });
    // const ffmpeg = createFFmpeg({
    //   // 打开log
    //   log: true,
    //   mainName: 'main',
    //   // 使用单线程版
    //   corePath: 'https://unpkg.com/@ffmpeg/core-st@0.11.1/dist/ffmpeg-core.js',
    // });
    (async () => {
        const { audioName } = new File([new Blob(window.audio)], 'audio');
        const { videoName } = new File([new Blob(window.video)], 'video')
        await ffmpeg.load();
        //ffmpeg -i audioLess.mp4 -i sampleAudio.mp3 -c copy output.mp4
        await ffmpeg.run('-i', audioName, '-i', videoName, '-c', 'copy', 'output.mp4');
        const data = ffmpeg.FS('readFile', 'output.mp4');
        let a = document.createElement('a');
        let blobUrl = new Blob([data.buffer], { type: 'video/mp4' })
        console.log(blobUrl);
        a.href = URL.createObjectURL(blobUrl);
        a.download = 'output.mp4';
        a.click();
    })()
  }

  let autoDownInterval = setInterval(() => {
    //  使用16倍速播放
    // document.querySelector('video').playbackRate = 16
    if (window.isComplete === 1) {
      download();
    }
  }, 3000);

  //  使用16倍速播放
  // document.querySelector('video').playbackRate = 16
  //  合并视频
  // ffmpeg -i video.mp4 -i audio.mp4 -c:v copy -c:a aac -strict experimental output.mp4
})();
