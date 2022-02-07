import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { fork } from 'child_process';

const APP_DATA_PATH = path.join(app.getPath('home'), './AppData');
const children = {};
global.sizeMap = {};

function getAppDataInfo() {
  return new Promise((resolve, reject) => {
    const filesData = getDirTree(APP_DATA_PATH);
    resolve({
      path: APP_DATA_PATH,
      data: filesData,
    });
  });
}

function childGetSize(p) {
  const child = fork(path.join(__dirname, './computeFolderSize.js'), [p]);
  child.on('message', (data) => {
    console.log('main process receive data', data.sizeMap[data.path], Object.keys(data.sizeMap).length);
    global.sizeMap = Object.assign(global.sizeMap, data.sizeMap);
    global.mainWindow.webContents.send('folder-size', {
      [data.path]: global.sizeMap[data.path]
    });

    if (data.final) {
      children[data.path] && children[data.path].kill();
      delete children[data.path];
    }
  });
  return child;
}

function getDirTree(dirPath, depth = 0) {
  try {
    const files = fs.readdirSync(dirPath);
    // console.log(files, 'files');

    const filesData = [];
    for (let i = 0; i < files.length; i++) {
      const p = path.join(dirPath, files[i]);
      const s = fs.statSync(p);

      let size = 0;
      if (s.isFile()) {
        size = s.size;
      }

      if (s.isDirectory()) {
        children[p] = childGetSize(p);
      }

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

    // console.log(filesData, 'filesData');
    if (depth > 0) {
      for (let i = 0; i < filesData.length; i++) {
        filesData[i].children = getDirTree(filesData[i].path, depth - 1);
      }
    }

    return filesData.reverse();
  } catch(err) {
    console.log(err, 'getDirTree err');
    return [];
  }
}

export {
  getAppDataInfo,
}