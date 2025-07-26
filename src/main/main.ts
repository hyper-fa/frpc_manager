/**
 * FRP Client Manager - Main Process
 * FRP Client Manager - 主进程
 *
 * This is the main process of the Electron application that handles:
 * 这是 Electron 应用的主进程，负责处理：
 * - Window management / 窗口管理
 * - FRP process management / FRP 进程管理
 * - File operations / 文件操作
 * - IPC communication / IPC 通信
 */

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as toml from '@iarna/toml';

// 路径测试函数
function testPaths() {
  console.log('=== 路径测试 ===');
  console.log('app.isPackaged:', app.isPackaged);
  console.log('process.execPath:', process.execPath);
  console.log('process.resourcesPath:', process.resourcesPath);
  console.log('__dirname:', __dirname);

  // 测试不同的根目录计算方式
  const appRoot1 = app.isPackaged
    ? path.dirname(process.execPath)
    : path.join(__dirname, '..');

  const appRoot2 = app.isPackaged
    ? path.join(process.resourcesPath, '..')
    : path.join(__dirname, '..');

  console.log('\n=== 根目录计算 ===');
  console.log('方式1 (execPath):', appRoot1);
  console.log('方式2 (resourcesPath):', appRoot2);

  // 测试 frp 目录路径
  const frpPath1 = path.join(appRoot1, 'frp');
  const frpPath2 = path.join(appRoot2, 'frp');
  const frpPath3 = path.join(process.resourcesPath, 'frp');

  console.log('\n=== FRP 目录路径 ===');
  console.log('frpPath1 (execPath/frp):', frpPath1);
  console.log('frpPath2 (resourcesPath/../frp):', frpPath2);
  console.log('frpPath3 (resourcesPath/frp):', frpPath3);

  // 检查目录是否存在
  console.log('\n=== 目录存在性检查 ===');
  console.log('frpPath1 exists:', fs.existsSync(frpPath1));
  console.log('frpPath2 exists:', fs.existsSync(frpPath2));
  console.log('frpPath3 exists:', fs.existsSync(frpPath3));

  // 如果是打包版本，检查 resources 目录内容
  if (app.isPackaged) {
    console.log('\n=== Resources 目录内容 ===');
    try {
      const resourcesContent = fs.readdirSync(process.resourcesPath);
      console.log('Resources 目录内容:', resourcesContent);

      if (resourcesContent.includes('frp')) {
        const frpContent = fs.readdirSync(path.join(process.resourcesPath, 'frp'));
        console.log('FRP 目录内容:', frpContent);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('读取 resources 目录失败:', errorMessage);
    }
  }
}

let mainWindow: BrowserWindow;
let splashWindow: BrowserWindow;
// Store multiple frpc processes / 存储多个 frpc 进程
const frpcProcesses = new Map<string, ChildProcess>();

const createSplashWindow = () => {
  console.log('创建启动画面...');
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // 创建简单的启动画面 HTML
  const splashHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          text-align: center;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .loading {
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 20px;
        }
        .spinner {
          border: 3px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top: 3px solid white;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="logo">FRP Client Manager</div>
      <div class="loading" id="status">正在初始化环境...</div>
      <div class="spinner"></div>
    </body>
    </html>
  `;

  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHtml)}`);
};

const updateSplashStatus = (status: string) => {
  if (splashWindow && !splashWindow.isDestroyed()) {
    console.log('启动状态:', status);
    splashWindow.webContents.executeJavaScript(`
      document.getElementById('status').textContent = '${status}';
    `);
  }
};

const createWindow = () => {
  console.log('创建主窗口...');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'FRP Client Manager',
    autoHideMenuBar: true, // 隐藏菜单栏
    show: false, // 初始不显示，等加载完成后再显示
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  console.log('主窗口已创建，开始加载内容...');

  // 检查是否是开发环境
  // 更可靠的开发环境检测：检查是否存在构建后的文件
  const rendererIndexPath = path.join(__dirname, 'renderer', 'index.html');
  const hasBuiltRenderer = fs.existsSync(rendererIndexPath);

  // 如果有构建后的渲染器文件，说明是生产模式
  const isDev = !app.isPackaged && !hasBuiltRenderer;

  console.log('环境检测:');
  console.log(`- 渲染器文件路径: ${rendererIndexPath}`);
  console.log(`- 渲染器文件存在: ${hasBuiltRenderer}`);
  console.log(`- app.isPackaged: ${app.isPackaged}`);
  console.log(`- 最终判断 isDev: ${isDev}`);

  console.log('环境信息:');
  console.log('- isDev:', isDev);
  console.log('- __dirname:', __dirname);
  console.log('- process.resourcesPath:', process.resourcesPath);
  console.log('- app.getAppPath():', app.getAppPath());

  if (isDev) {
    console.log('开发模式：连接到 Vite 服务器 http://localhost:5173');
    updateSplashStatus('连接开发服务器...');
    // 开发环境：加载 Vite 开发服务器
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    console.log('生产模式：加载本地文件');
    updateSplashStatus('加载应用文件...');

    // 尝试多个可能的路径
    const possiblePaths = [
      path.join(__dirname, 'renderer', 'index.html'),  // 便携版：dist/renderer/index.html
      path.join(__dirname, '../renderer/index.html'),  // 开发环境备用
      path.join(__dirname, '../../dist/renderer/index.html'),  // 项目根目录构建
      path.join(process.resourcesPath, 'app/dist/renderer/index.html'),  // 打包版
      path.join(app.getAppPath(), 'dist/renderer/index.html')  // 应用路径
    ];

    let indexPath = null;
    for (const testPath of possiblePaths) {
      console.log('测试路径:', testPath);
      if (fs.existsSync(testPath)) {
        indexPath = testPath;
        console.log('找到有效路径:', indexPath);
        break;
      }
    }

    if (indexPath) {
      console.log('加载文件:', indexPath);
      mainWindow.loadFile(indexPath);
    } else {
      console.error('未找到 index.html 文件');
      updateSplashStatus('错误：未找到应用文件');
      // 加载一个错误页面
      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
        <html>
          <head><title>加载错误</title></head>
          <body style="font-family: Arial; padding: 20px; text-align: center;">
            <h1>应用加载失败</h1>
            <p>未找到应用文件，请检查安装是否完整。</p>
            <p>尝试的路径：</p>
            <ul style="text-align: left; display: inline-block;">
              ${possiblePaths.map(p => `<li>${p}</li>`).join('')}
            </ul>
          </body>
        </html>
      `)}`);
    }
  }

  // 监听页面加载事件
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('页面加载完成，显示主窗口');
    updateSplashStatus('加载完成，正在显示界面...');

    setTimeout(() => {
      mainWindow.show();
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
      }
    }, 500);
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.log('页面加载失败:', errorDescription, validatedURL);
    console.log('错误代码:', errorCode);
    updateSplashStatus(`加载失败: ${errorDescription}`);

    // 显示错误信息后仍然显示主窗口
    setTimeout(() => {
      mainWindow.show();
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
      }
    }, 2000);
  });

  // 添加更多调试信息
  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM 已准备就绪');
    updateSplashStatus('界面准备就绪...');
  });

  mainWindow.webContents.on('did-start-loading', () => {
    console.log('开始加载页面');
    updateSplashStatus('正在加载界面...');
  });
};



app.whenReady().then(() => {
  console.log('Electron 应用已准备就绪');

  // 运行路径测试
  testPaths();

  // 先创建启动画面
  createSplashWindow();

  // 延迟创建主窗口，给启动画面时间显示
  setTimeout(() => {
    updateSplashStatus('正在初始化主窗口...');
    createWindow();
  }, 1000);

  // IPC handlers - moved here to ensure mainWindow is available
  ipcMain.handle('auth:login', async (_, credentials) => {
    // 简单验证逻辑
    return credentials.username === 'admin' && credentials.password === 'admin';
  });

  ipcMain.handle('config:read', async (_, filePath) => {
    try {
      // 获取正确的配置文件路径
      let fullPath;
      if (app.isPackaged) {
        // 打包后，frp 目录在 resources 目录中
        if (filePath.startsWith('frp/')) {
          fullPath = path.join(process.resourcesPath, filePath);
        } else {
          fullPath = path.join(process.resourcesPath, 'frp', filePath);
        }
      } else {
        // 开发环境
        fullPath = path.join(__dirname, '..', filePath);
      }

      console.log('读取配置文件:', fullPath);

      if (!fs.existsSync(fullPath)) {
        console.log('配置文件不存在:', fullPath);
        // 尝试其他可能的路径
        if (app.isPackaged) {
          const altPath = path.join(path.dirname(process.execPath), filePath);
          console.log('尝试备用路径:', altPath);
          if (fs.existsSync(altPath)) {
            fullPath = altPath;
            console.log('使用备用路径');
          } else {
            throw new Error(`配置文件不存在: ${fullPath}`);
          }
        } else {
          throw new Error(`配置文件不存在: ${fullPath}`);
        }
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      return toml.parse(content);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('读取配置失败:', errorMessage);
      throw new Error(`Failed to read config: ${errorMessage}`);
    }
  });

  ipcMain.handle('config:save', async (_, { filePath, config }) => {
    try {
      // 获取正确的配置文件保存路径
      let fullPath;
      if (app.isPackaged) {
        // 打包后，优先保存到可写的位置（exe 同级目录）
        const exeDir = path.dirname(process.execPath);
        if (filePath.startsWith('frp/')) {
          fullPath = path.join(exeDir, filePath);
        } else {
          fullPath = path.join(exeDir, 'frp', filePath);
        }
      } else {
        // 开发环境
        fullPath = path.join(__dirname, '..', filePath);
      }

      console.log('保存配置到:', fullPath);

      // 确保目录存在
      const dir = path.dirname(fullPath);
      console.log('确保目录存在:', dir);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log('创建目录:', dir);
      }

      // 清理配置，移除应用内部字段
      const cleanConfig = { ...config };
      delete cleanConfig.id;
      delete cleanConfig.name;
      delete cleanConfig.filePath;
      delete cleanConfig.isRunning;

      const content = toml.stringify(cleanConfig);
      fs.writeFileSync(fullPath, content);
      console.log('配置保存成功');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('保存配置失败:', errorMessage);
      console.error('错误详情:', error);
      throw new Error(`Failed to save config: ${errorMessage}`);
    }
  });

  ipcMain.handle('config:selectFile', async () => {
    try {
      // 获取应用根目录路径
      const appRoot = app.isPackaged
        ? path.join(process.resourcesPath, '..')
        : path.join(__dirname, '..');

      const result = await dialog.showOpenDialog(mainWindow, {
        title: '选择 TOML 配置文件',
        defaultPath: path.join(appRoot, 'frp'),
        filters: [
          { name: 'TOML 配置文件', extensions: ['toml'] },
          { name: '所有文件', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      return result.filePaths[0];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to select file: ${errorMessage}`);
    }
  });

  ipcMain.handle('config:loadFile', async (_, filePath) => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const config = toml.parse(content);
      const fileName = path.basename(filePath, '.toml');

      return {
        name: fileName,
        filePath: filePath,
        config: config
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load config file: ${errorMessage}`);
    }
  });

  ipcMain.handle('frpc:start', async (_, configPath) => {
    // 如果该配置已经在运行，先停止它
    if (frpcProcesses.has(configPath)) {
      const existingProcess = frpcProcesses.get(configPath);
      if (existingProcess && !existingProcess.killed) {
        existingProcess.kill();
        frpcProcesses.delete(configPath);
        mainWindow.webContents.send('frpc:log', `Stopped existing process for: ${configPath}`);
      }
    }

    return new Promise(async (resolve, reject) => {
      try {
        // 获取应用根目录路径
        const appRoot = app.isPackaged
          ? path.join(process.resourcesPath, '..')
          : path.join(__dirname, '..');
        const frpcConfigPath = path.join(appRoot, 'frpc-config.json');

        let frpcPath: string | null = null;

        // 尝试从配置文件读取 frpc 路径
        if (fs.existsSync(frpcConfigPath)) {
          const content = fs.readFileSync(frpcConfigPath, 'utf-8');
          const config = JSON.parse(content);
          frpcPath = config.frpcPath;
        }

        // 如果没有配置的路径，尝试默认路径
        if (!frpcPath) {
          frpcPath = path.join(appRoot, 'frp', 'frpc.exe');
        }

        // 检查 frpc.exe 是否存在
        if (!fs.existsSync(frpcPath)) {
          const errorMsg = `frpc.exe not found at: ${frpcPath}. Please select frpc.exe first.`;
          mainWindow.webContents.send('frpc:log', `ERROR: ${errorMsg}`);
          reject(new Error(errorMsg));
          return;
        }

        const frpcDir = path.dirname(frpcPath);

        // 检查配置文件是否存在
        let fullConfigPath: string;
        if (path.isAbsolute(configPath)) {
          fullConfigPath = configPath;
        } else {
          // 如果 configPath 已经包含 frp/ 前缀，直接使用 appRoot
          // 否则使用 frpcDir
          if (configPath.startsWith('frp/')) {
            fullConfigPath = path.join(appRoot, configPath);
          } else {
            fullConfigPath = path.join(frpcDir, configPath);
          }
        }

        if (!fs.existsSync(fullConfigPath)) {
          const errorMsg = `Config file not found at: ${fullConfigPath}`;
          mainWindow.webContents.send('frpc:log', `ERROR: ${errorMsg}`);
          reject(new Error(errorMsg));
          return;
        }

        mainWindow.webContents.send('frpc:log', `Starting frpc with config: ${fullConfigPath}`);
        mainWindow.webContents.send('frpc:log', `frpc path: ${frpcPath}`);

        const frpcProcess = spawn(frpcPath, ['-c', fullConfigPath], {
          cwd: frpcDir
        });

        // 存储进程
        frpcProcesses.set(configPath, frpcProcess);

        frpcProcess.stdout?.on('data', (data: Buffer) => {
          mainWindow.webContents.send('frpc:log', `[${configPath}] ${data.toString()}`);
        });

        frpcProcess.stderr?.on('data', (data: Buffer) => {
          mainWindow.webContents.send('frpc:log', `[${configPath}] ERROR: ${data.toString()}`);
        });

        frpcProcess.on('close', (code: number | null) => {
          mainWindow.webContents.send('frpc:log', `[${configPath}] Process exited with code ${code}`);
          frpcProcesses.delete(configPath);
        });

        frpcProcess.on('error', (error: Error) => {
          const errorMsg = `Failed to start frpc for ${configPath}: ${error.message}`;
          mainWindow.webContents.send('frpc:log', `ERROR: ${errorMsg}`);
          frpcProcesses.delete(configPath);
          reject(error);
        });

        resolve(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        reject(new Error(`Failed to start frpc: ${errorMessage}`));
      }
    });
  });

  ipcMain.handle('frpc:stop', async () => {
    // 停止所有运行中的 frpc 进程
    let stoppedCount = 0;
    for (const [configPath, process] of frpcProcesses.entries()) {
      if (process && !process.killed) {
        process.kill();
        mainWindow.webContents.send('frpc:log', `Stopped process for: ${configPath}`);
        stoppedCount++;
      }
    }
    frpcProcesses.clear();
    return stoppedCount > 0;
  });

  ipcMain.handle('frpc:stopConfig', async (_, configPath) => {
    try {
      if (frpcProcesses.has(configPath)) {
        const process = frpcProcesses.get(configPath);
        if (process && !process.killed) {
          process.kill();
          frpcProcesses.delete(configPath);
          mainWindow.webContents.send('frpc:log', `Stopped process for: ${configPath}`);
          return true;
        }
      }
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to stop config ${configPath}: ${errorMessage}`);
    }
  });

  // 配置持久化
  ipcMain.handle('config:saveConfigs', async (_, configs) => {
    try {
      console.log('保存配置到文件:', configs);

      // 验证输入
      if (!Array.isArray(configs)) {
        throw new Error('配置数据必须是数组格式');
      }

      const appRoot = app.isPackaged
        ? path.join(process.resourcesPath, '..')
        : path.join(__dirname, '..');
      const configsPath = path.join(appRoot, 'configs.json');

      console.log('配置文件路径:', configsPath);

      // 确保目录存在
      const dir = path.dirname(configsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(configsPath, JSON.stringify(configs, null, 2), 'utf8');
      console.log('配置保存成功');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('保存配置失败:', errorMessage);
      throw new Error(`Failed to save configs: ${errorMessage}`);
    }
  });

  ipcMain.handle('config:loadConfigs', async () => {
    try {
      const appRoot = app.isPackaged
        ? path.join(process.resourcesPath, '..')
        : path.join(__dirname, '..');
      const configsPath = path.join(appRoot, 'configs.json');

      console.log('加载配置文件:', configsPath);

      if (!fs.existsSync(configsPath)) {
        console.log('配置文件不存在，返回空数组');
        return [];
      }

      const content = fs.readFileSync(configsPath, 'utf-8');
      const configs = JSON.parse(content);

      console.log('成功加载配置:', configs);

      // 验证配置格式
      if (!Array.isArray(configs)) {
        console.warn('配置文件格式错误，返回空数组');
        return [];
      }

      return configs;
    } catch (error) {
      console.error('Failed to load configs:', error);
      return [];
    }
  });

  // frpc 路径管理
  ipcMain.handle('config:getFrpcPath', async () => {
    try {
      const appRoot = app.isPackaged
        ? path.join(process.resourcesPath, '..')
        : path.join(__dirname, '..');
      const frpcConfigPath = path.join(appRoot, 'frpc-config.json');

      if (!fs.existsSync(frpcConfigPath)) {
        return null;
      }

      const content = fs.readFileSync(frpcConfigPath, 'utf-8');
      const config = JSON.parse(content);
      return config.frpcPath || null;
    } catch (error) {
      console.error('Failed to load frpc path:', error);
      return null;
    }
  });

  ipcMain.handle('config:setFrpcPath', async (_, frpcPath) => {
    try {
      const appRoot = app.isPackaged
        ? path.join(process.resourcesPath, '..')
        : path.join(__dirname, '..');
      const frpcConfigPath = path.join(appRoot, 'frpc-config.json');

      const config = { frpcPath };
      fs.writeFileSync(frpcConfigPath, JSON.stringify(config, null, 2));
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save frpc path: ${errorMessage}`);
    }
  });

  ipcMain.handle('config:selectFrpcPath', async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        title: '选择 frpc.exe 文件',
        filters: [
          { name: 'Executable Files', extensions: ['exe'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      const selectedPath = result.filePaths[0];

      // 验证选择的文件是否是 frpc.exe
      if (!selectedPath.toLowerCase().includes('frpc')) {
        throw new Error('请选择正确的 frpc.exe 文件');
      }

      return selectedPath;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to select frpc path: ${errorMessage}`);
    }
  });

  // Shell 操作
  ipcMain.handle('shell:openExternal', async (_, url) => {
    try {
      await shell.openExternal(url);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to open URL: ${errorMessage}`);
    }
  });

  // TOML 文件操作
  ipcMain.handle('config:readTomlFile', async (_, filePath) => {
    try {
      // 获取正确的文件路径
      let fullPath;
      if (app.isPackaged) {
        // 打包后，优先从可写的位置读取
        const exeDir = path.dirname(process.execPath);
        if (filePath.startsWith('frp/')) {
          fullPath = path.join(exeDir, filePath);
        } else {
          fullPath = path.join(exeDir, 'frp', filePath);
        }

        // 如果可写位置不存在，尝试从 resources 读取
        if (!fs.existsSync(fullPath)) {
          if (filePath.startsWith('frp/')) {
            fullPath = path.join(process.resourcesPath, filePath);
          } else {
            fullPath = path.join(process.resourcesPath, 'frp', filePath);
          }
        }
      } else {
        // 开发环境
        fullPath = path.join(__dirname, '..', filePath);
      }

      console.log('读取 TOML 文件:', fullPath);

      if (!fs.existsSync(fullPath)) {
        throw new Error(`TOML 文件不存在: ${fullPath}`);
      }

      const content = fs.readFileSync(fullPath, 'utf-8');
      return content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('读取 TOML 文件失败:', errorMessage);
      throw new Error(`Failed to read TOML file: ${errorMessage}`);
    }
  });

  ipcMain.handle('config:saveTomlFile', async (_, filePath, content) => {
    try {
      // 获取正确的保存路径
      let fullPath;
      if (app.isPackaged) {
        // 打包后，保存到可写的位置（exe 同级目录）
        const exeDir = path.dirname(process.execPath);
        if (filePath.startsWith('frp/')) {
          fullPath = path.join(exeDir, filePath);
        } else {
          fullPath = path.join(exeDir, 'frp', filePath);
        }
      } else {
        // 开发环境
        fullPath = path.join(__dirname, '..', filePath);
      }

      console.log('保存 TOML 文件到:', fullPath);

      // 确保目录存在
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log('创建目录:', dir);
      }

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('TOML 文件保存成功');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('保存 TOML 文件失败:', errorMessage);
      throw new Error(`Failed to save TOML file: ${errorMessage}`);
    }
  });
});

app.on('window-all-closed', () => {
  // 清理所有 frpc 进程
  for (const [configPath, frpcProcess] of frpcProcesses.entries()) {
    if (frpcProcess && !frpcProcess.killed) {
      frpcProcess.kill();
      console.log(`Killed frpc process for: ${configPath}`);
    }
  }
  frpcProcesses.clear();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});