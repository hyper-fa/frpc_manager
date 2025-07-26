import { app, BrowserWindow } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'FRP Client Manager',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  console.log('Electron 窗口已创建');

  // 检查是否是开发环境
  const isDev = !app.isPackaged;

  if (isDev) {
    console.log('开发模式：连接到 Vite 服务器 http://localhost:5173');
    // 开发环境：加载 Vite 开发服务器
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    console.log('生产模式：加载本地文件');
    // 生产环境：加载构建后的文件
    mainWindow.loadFile(path.join(__dirname, '../../index.html'));
  }

  // 监听页面加载事件
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('页面加载完成');
  });
};

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
