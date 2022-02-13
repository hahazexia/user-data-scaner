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
  const child = fork(CHILD_SCRIPT_PATH, [p]);
  child.on('message', (data) => {
    global.sizeMap = Object.assign(global.sizeMap, data.sizeMap);
    global.mainWindow.webContents.send('folder-size', {
      [data.path]: global.sizeMap[data.path],
      final: data.final
    });

    if (data.final) {
      children[data.path] && children[data.path].kill();
      delete children[data.path];
      global.alreadyPath[data.path] = true;
    }
  });
  return child;
}

function getDirTree(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);

    const filesData = [];
    const foldersData = [];
    for (let i = 0; i < files.length; i++) {
      const p = path.join(dirPath, files[i]);
      const s = fs.statSync(p);

      let size = 0;
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

      if (s.isDirectory()) {
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