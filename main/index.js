import { app, BrowserWindow } from 'electron';
import registerIpcMainEvent from './ipcMainEvent';

let mainWindow;

function appInit () {
  registerIpcMainEvent();

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

  if (process.env.NODE_ENV !== 'production') {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.setMenu(null);
}

app.whenReady().then(appInit);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) appInit();
})
