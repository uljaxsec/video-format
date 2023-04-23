<template>
  <div class="main-box">
    <div class="merge-boxf">
      <div class="merge-title">视频格式转换</div>
      <div class="merge-box">
        <el-upload
          v-model:file-list="state.fileListF"
          class="merge-video-upload"
          action="#"
          multiple
          :before-upload="beforeUploadF()"
          :on-exceed="handleExceed"
          :limit="10"
          :auto-upload="false"
          list-type="picture"
        >
          <el-button size="large" type="primary">请选择需要转换的视频</el-button>
          <template #tip>
            <div class="el-upload__tip">
              最多支持 10 个视频文件
            </div>
          </template>
        </el-upload>
        <div class="select-f">
          <div>转换后格式：</div>
          <el-select v-model="state.formatVal" placeholder="请选择格式" size="large">
            <el-option v-for="item in state.formatList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </div>

        <el-button class="merge-sure-btn" type="primary" size="large" :disabled="!state.mergeFlagF" @click="mergeSureF">确定转换</el-button>
      </div>
    </div>

    <div class="merge-box1">
      <div class="merge-title">视频音频合并</div>
      <div class="merge-box">
        <el-upload
          v-model:file-list="state.fileVideoAudioListV"
          class="merge-video-upload"
          action="#"
          :before-upload="beforeUploadVAV()"
          :auto-upload="false"
          :limit="1"
          list-type="picture"
        >
          <el-button size="large" type="primary">请选择需要合并的画面视频</el-button>
          <template #tip>
            <div class="el-upload__tip">
              支持 1 个视频文件
            </div>
          </template>
        </el-upload>
        <el-upload
          v-model:file-list="state.fileVideoAudioListA"
          class="merge-video-upload"
          action="#"
          :before-upload="beforeUploadVAA()"
          :auto-upload="false"
          :limit="1"
          list-type="picture"
        >
          <el-button size="large" type="primary">请选择需要合并的声音视频</el-button>
          <template #tip>
            <div class="el-upload__tip">
              支持 1 个音频文件
            </div>
          </template>
        </el-upload>
        <el-button class="merge-sure-btn" type="primary" size="large" :disabled="!state.mergeFlagVAV||!state.mergeFlagVAA" @click="mergeSureVA">确定合并</el-button>
      </div>
    </div>

    <div class="merge-box0">
      <div class="merge-title">视频合并</div>
      <div class="merge-box">
        <el-upload
          v-model:file-list="state.fileList"
          class="merge-video-upload"
          action="#"
          multiple
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          :before-upload="beforeUpload()"
          :limit="10"
          :on-exceed="handleExceed"
          :auto-upload="false"
          list-type="picture"
        >
          <el-button size="large" type="primary">请选择需要合并的视频</el-button>
          <template #tip>
            <div class="el-upload__tip">
              最多支持 10 个视频文件
            </div>
          </template>
        </el-upload>
        <el-button class="merge-sure-btn" type="primary" size="large" :disabled="!state.mergeFlag" @click="mergeSure">确定合并</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import videoImg from '@/assets/img/video.png'
import { ElMessage } from 'element-plus'

import {onBeforeMount, reactive} from 'vue'
import { createFFmpeg } from '@ffmpeg/ffmpeg'

const state = reactive({
  fileList: [
    // {
    //   name: 'element-plus-logo.svg',
    //   url: './img/video.png',
    // },
  ],
  mergeFlag: false,
  fileVideoAudioListV: [],
  fileVideoAudioListA: [],
  mergeFlagVAV: false,
  mergeFlagVAA: false,
  fileListF: [],
  mergeFlagF: false,
  formatVal: 'mp4',
  formatList: [
    {value: 'mp4', label: 'mp4'},
    {value: 'avi', label: 'avi'},
    {value: 'wmv', label: 'wmv'},
  ],
  ffmpeg: null,
})

onBeforeMount(() => {
  state.ffmpeg = createFFmpeg({
    log: true,
    corePath: '/lib/ffmpeg-core.js',
  });
  state.ffmpeg.load();
})
function beforeUpload() {
  state.fileList.forEach(item => {
    item.url = videoImg
    item.status = 'success'
  })
  state.mergeFlag = false
  if (state.fileList.length>0) {
    state.mergeFlag = true
  }
}
function handleRemove(file, uploadFiles) {
  console.log(file, uploadFiles)
}
function handlePreview(uploadFile) {
  console.log(uploadFile)
}
function handleExceed(files, uploadFiles) {
  ElMessage.warning('最多只支持 10 个视频文件')
}
async function mergeSure() {
  // 读取视频文件
  try {
    if (state.fileList.length==0) {
      return
    }
    if (!state.ffmpeg.isLoaded()) {
      await state.ffmpeg.load()
    }
    let commandOpt = []
    let n01 = ''
    for (let i=0;i<state.fileList.length;i++) {
      const fb = await fileToByte(state.fileList[i]);
      let vn = i+state.fileList[i].name
      state.ffmpeg.FS('writeFile', vn, fb);
      commandOpt.push('-i')
      commandOpt.push(vn)
      n01 += `[${i}:0][${i}:1]`
    }
    commandOpt.push('-filter_complex')
    commandOpt.push(`${n01} concat=n=${state.fileList.length}:v=1:a=1 [v][a]`)
    commandOpt.push('-map')
    commandOpt.push('[v]')
    commandOpt.push('-map')
    commandOpt.push('[a]')
    commandOpt.push('output.mp4')

    // await state.ffmpeg.run('-i', 'test.mp4', '-t', '3', '-ss', '0', '-vf', `fps=24,scale=1080:-1:flags=lanczos`, '-f', 'gif', 'out.gif');
    // 合并视频 [0:0]第一个视频视频  [0:1]第一个视频音频  [1:0]第二个视频视频  [1:1]第二个视频音频  concat=n=2:v=1:a=1总共2个视频合并成1个视频1个音频
    // ffmpeg -i 1创智云城项目录屏.mp4 -i 2创智云城项目录屏2.mp4 -filter_complex '[0:0][0:1][1:0][1:1] concat=n=2:v=1:a=1 [v][a]' -map '[v]' -map '[a]' output.mp4
    // await state.ffmpeg.run('-i', 'file1.mp4', '-i', 'file2.mp4', '-filter_complex', '[0:0][0:1][1:0][1:1] concat=n=2:v=1:a=1 [v][a]', '-map', '[v]', '-map', '[a]', 'output.mp4');
    await state.ffmpeg.run(...commandOpt);
    // 读取刚才转换的gif
    const data = state.ffmpeg.FS('readFile', 'output.mp4');
    // 转换成ObjectURL
    // const url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }));
    const url = URL.createObjectURL(new Blob([data.buffer]));
    // 触发下载
    const link = document.createElement('a');
    link.href = url;
    link.download = 'output.mp4';
    link.click();

    // 退出， 释放资源
    // state.ffmpeg.exit();
  } catch (e) {
    console.log('mergeSure', e)
  }
}
function fileToByte(file) {
  return new Promise((resolve, reject) => {
    let fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file.raw);
    fileReader.onload = function(ev) {
      resolve(new Uint8Array(ev.target.result));
    }
  })
}

function beforeUploadVAV() {
  state.fileVideoAudioListV.forEach(item => {
    item.url = videoImg
    item.status = 'success'
  })
  state.mergeFlagVAV = false
  if (state.fileVideoAudioListV.length>0) {
    state.mergeFlagVAV = true
  }
}
function beforeUploadVAA() {
  state.fileVideoAudioListA.forEach(item => {
    item.url = videoImg
    item.status = 'success'
  })
  state.mergeFlagVAA = false
  if (state.fileVideoAudioListA.length>0) {
    state.mergeFlagVAA = true
  }
}
async function mergeSureVA() {
  try {
    if (state.fileVideoAudioListV.length == 0 || state.fileVideoAudioListA.length == 0) {
      return
    }
    if (!state.ffmpeg.isLoaded()) {
      await state.ffmpeg.load()
    }
    let videoName = state.fileVideoAudioListV[0].name
    let audioName = state.fileVideoAudioListA[0].name
    const fbv = await fileToByte(state.fileVideoAudioListV[0]);
    state.ffmpeg.FS('writeFile', videoName, fbv);
    const fba = await fileToByte(state.fileVideoAudioListA[0]);
    state.ffmpeg.FS('writeFile', audioName, fba);
    await state.ffmpeg.run('-i', audioName, '-i', videoName, '-c', 'copy', 'output.mp4');
    const data = state.ffmpeg.FS('readFile', 'output.mp4');
    // 转换成ObjectURL
    // const url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }));
    const url = URL.createObjectURL(new Blob([data.buffer]));
    // 触发下载
    const link = document.createElement('a');
    link.href = url;
    link.download = 'output.mp4';
    link.click();
  } catch (e) {
    console.log('mergeSureVA', e)
  }
}

function beforeUploadF() {
  state.fileListF.forEach(item => {
    item.url = videoImg
    item.status = 'success'
  })
  state.mergeFlagF = false
  if (state.fileListF.length>0) {
    state.mergeFlagF = true
  }
}
function handleExceedF(files, uploadFiles) {
  ElMessage.warning('最多只支持 10 个视频文件')
}
async function mergeSureF() {
  try {
    if (state.fileListF.length == 0) {
      return
    }
    if (!state.ffmpeg.isLoaded()) {
      await state.ffmpeg.load()
    }
    for (let i=0;i<state.fileListF.length;i++) {
      const fb = await fileToByte(state.fileListF[i]);
      let vn = i+state.fileListF[i].name
      state.ffmpeg.FS('writeFile', vn, fb);
      let outName = 'output.'+state.formatVal
      await state.ffmpeg.run('-i', vn, '-c', 'copy', outName);
      const data = state.ffmpeg.FS('readFile', outName);
      // 转换成ObjectURL
      // const url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }));
      const url = URL.createObjectURL(new Blob([data.buffer]));
      // 触发下载
      const link = document.createElement('a');
      link.href = url;
      link.download = outName;
      link.click();
    }
  } catch (e) {
    console.log('mergeSureF', e)
  }
}

</script>

<style scoped>
.main-box {
  width: 1200px;
  margin: 80px auto;
}

.merge-boxf {
  margin-top: 0px;
}

.merge-boxf .merge-video-upload {
  width: 500px;
}
.select-f {
  display: flex;
  height: 38px;
  line-height: 38px;
}
.merge-boxf .merge-sure-btn {
  margin-left: 24px;
}

.merge-box0 {
  margin-top: 100px;
}
.merge-title {
  font-size: 24px;
  font-weight: 500;
  color: #000000;
  margin-bottom: 20px;
  text-align: center;
}
.merge-box {
  display: flex;
}
.merge-video-upload {
  flex: none;
  width: 600px;
  margin-left: 10px;
}
.merge-video-upload .el-upload-list {
  width: 500px;
}
.merge-sure-btn {
  margin-left: 230px;
}

.merge-box1 .merge-title {
  margin-top: 100px;
}
.merge-box1 .merge-video-upload {
  flex: none;
  width: 400px;
  margin-left: 10px;
}
.merge-box1 .merge-sure-btn {
  margin-left: 20px;
}
</style>
