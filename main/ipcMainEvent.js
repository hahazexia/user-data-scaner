import { ipcMain, shell } from 'electron';
import { getAppDataInfo } from './util';

function registerIpcMainEvent() {
  ipcMain.handle('get-app-data-info', async (event) => {
    const result = await getAppDataInfo();
    return result;
  });

  ipcMain.on('open-explorer', (event, data) => {
    console.log(data, 'open-explorer');
    shell.openPath(data);
  });

  // ipcMain.on('folder-size', (e, data) => {
  //   const res = data.reduce((acc, i) => {
  //     console.log(global.sizeMap[i], 'folder-size global.sizeMap[i]', i)
  //     return {
  //       ...acc,
  //       [i]: global.sizeMap[i]
  //     };
  //   }, {});
  //   e.sender.send('return-folder-size', res);
  // });
}

export default registerIpcMainEvent;