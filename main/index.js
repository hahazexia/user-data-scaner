const {app, BrowserWindow} = require('electron');
const path = require('path');
const fs = require('fs');
// import { app, BrowserWindow } from 'electron';

const APP_DATA_PATH = path.join(app.getPath('home'), 'AppData');
let mainWindow;

function appInit () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  global.mainWindow = mainWindow;
  mainWindow.loadURL(process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT}/index.html` : `file://${__dirname}/index.html`);

  mainWindow.webContents.openDevTools();
  mainWindow.setMenu(null);
}

setTimeout(() => {
  fs.readdir(APP_DATA_PATH, (err, files) => {
    if (err) console.log(err, 'read APP_DATA_PATH err');
    console.log(files, 'files');
    
    const filesData = files.map(i => {
      const p = path.join(APP_DATA_PATH, i);
      const s = fs.statSync(p);

      return {
        name: i,
        size: s.size.toString(),
        ksize: (s.size / 1000).toString(),
        msize: (s.size / 1000 / 1000).toString(),
        gsize: (s.size / 1000 / 1000 / 1000).toString(),
        isDir: s.isDirectory(),
        isFile: s.isFile(),
      };
    });
    console.log(filesData, 'filesData');
  });
}, 3000);

app.whenReady().then(appInit)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) appInit()
})
