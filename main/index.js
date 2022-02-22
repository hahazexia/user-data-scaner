import { app, BrowserWindow } from 'electron';
import registerIpcMainEvent from './ipcMainEvent';

let mainWindow;

// 初始化 electron 应用
function appInit () {
  // 注册 ipc 通信事件
  registerIpcMainEvent();

  // 新建主窗口
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
  // 主窗口加载页面
  mainWindow.loadURL(process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.PORT}/index.html` : `file://${__dirname}/index.html`);

  // 只有在开发环境才打开开发者工具
  if (process.env.NODE_ENV !== 'production') {
    mainWindow.webContents.openDevTools();
  }
  // 去除默认菜单
  mainWindow.setMenu(null);
}

// 启动应用
app.whenReady().then(appInit);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) appInit();
})
