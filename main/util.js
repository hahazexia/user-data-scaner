import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { fork } from 'child_process';

const CHILD_SCRIPT_PATH = process.env.NODE_ENV === 'production'
                          ? path.join(__dirname, './computeFolderSize.js')
                          : path.join(__dirname, '../public/computeFolderSize.js');
const APP_DATA_PATH = path.join(app.getPath('home'), './AppData');
const children = {};
global.sizeMap = {};
global.alreadyPath = {};

// 遍历 AppData 所有文件
function getAppDataInfo() {
  return new Promise((resolve, reject) => {
    const filesData = getDirTree(APP_DATA_PATH);
    resolve({
      path: APP_DATA_PATH,
      data: filesData,
    });
  });
}

// 启动子进程递归遍历指定目录下的所有文件夹和文件
function childGetSize(p) {
  const child = fork(CHILD_SCRIPT_PATH, [p]);
  // 子进程会通过 message 事件将结果返回给主进程
  child.on('message', (data) => {
    // 将所有文件夹的大小数据存入全局缓存
    global.sizeMap = Object.assign(global.sizeMap, data.sizeMap);
    // 主进程发送当前文件夹大小数据给渲染进程
    global.mainWindow.webContents.send('folder-size', {
      [data.path]: global.sizeMap[data.path],
      final: data.final
    });

    if (data.final) {
      // 子进程任务结束，不再需要，杀掉以节省内存
      children[data.path] && children[data.path].kill();
      delete children[data.path];
      // 已经遍历处理过的路径记录到全局 alreadyPath 对象，方便判断
      global.alreadyPath[data.path] = true;
    }
  });
  return child;
}

function getDirTree(dirPath) {
  try {
    // 读取 AppData 下的所有文件
    const files = fs.readdirSync(dirPath);

    const filesData = [];
    const foldersData = [];
    for (let i = 0; i < files.length; i++) {
      const p = path.join(dirPath, files[i]);
      const s = fs.statSync(p);

      let size = 0;
      // 如果是文件，将详情存入数组
      if (s.isFile()) {
        size = s.size;
        filesData.push({
          name: files[i],
          path: p,
          size: size,
          ksize: (size / 1024),
          msize: (size / 1024 / 1024),
          gsize: (size / 1024 / 1024 / 1024),
          isDir: s.isDirectory(),
          isFile: s.isFile(),
        });
      }

      // 如果是文件夹，启动子进程去递归文件夹下所有文件和文件夹，并且将子进程对象存入 children 对象，key 是文件夹路径
      if (s.isDirectory()) {
        // 如果已经计算过此文件夹大小直接使用，不需要启动子进程重新计算
        if (global.sizeMap[p]) {
          size = global.sizeMap[p];
        } else {
          children[p] = childGetSize(p);
        }
        foldersData.push({
          name: files[i],
          path: p,
          size: size,
          ksize: (size / 1024),
          msize: (size / 1024 / 1024),
          gsize: (size / 1024 / 1024 / 1024),
          final: !!global.sizeMap[p],
          isDir: s.isDirectory(),
          isFile: s.isFile(),
        });
      }
    }

    // 文件夹和文件按照首字母排序
    filesData.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });
    foldersData.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });

    return [...foldersData, ...filesData];
  } catch(err) {
    console.log(err, 'getDirTree err');
    return [];
  }
}

export {
  getAppDataInfo,
}