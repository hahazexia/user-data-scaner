import { ipcMain, shell } from 'electron';
import { getAppDataInfo } from './util';
import path from 'path';
import fs from 'fs';
const { readdir } = require('fs/promises');

function registerIpcMainEvent() {
  // 刚打开应用，开始遍历 AppData 所有文件
  ipcMain.handle('get-app-data-info', async (event) => {
    const result = await getAppDataInfo();
    return result;
  });

  // 在系统资源管理器中打开指定目录
  ipcMain.on('open-explorer', (event, data) => {
    console.log(data, 'open-explorer');
    shell.showItemInFolder(data);
  });

  // 获取指定目录下的数据信息
  ipcMain.handle('get-folder-content', async (event, folderPath) => {
    console.log(folderPath, 'folderPath', global.alreadyPath);
    if (global.alreadyPath[folderPath] || Object.keys(global.alreadyPath).some(i => global.alreadyPath[i] && folderPath.startsWith(i))) {
      const filesData = [];
      const foldersData = [];
      const files = await readdir(folderPath);
      for (const file of files) {
        const p = path.join(folderPath, file);
        const stat = fs.statSync(p);

        let size = 0;
        if (stat.isFile()) {
          size = stat.size;
          const notPermitted = size === 'not permitted';
          filesData.push({
            name: file,
            path: p,
            notPermitted: notPermitted,
            size: !notPermitted && size,
            ksize: !notPermitted && (size / 1024),
            msize: !notPermitted && (size / 1024 / 1024),
            gsize: !notPermitted && (size / 1024 / 1024 / 1024),
            isDir: stat.isDirectory(),
            isFile: stat.isFile(),
          });
        }
  
        if (stat.isDirectory()) {
          size = global.sizeMap[p];
          const notPermitted = size === 'not permitted';
          foldersData.push({
            name: file,
            path: p,
            notPermitted: notPermitted,
            size: !notPermitted && size,
            ksize: !notPermitted && (size / 1024),
            msize: !notPermitted && (size / 1024 / 1024),
            gsize: !notPermitted && (size / 1024 / 1024 / 1024),
            isDir: stat.isDirectory(),
            isFile: stat.isFile(),
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
    } else {
      return null
    }
  });
}

export default registerIpcMainEvent;