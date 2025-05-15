const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let apiProcess;
let frontendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true
  });

  mainWindow.maximize();
  mainWindow.show();

  // 这里假设前端启动在 http://localhost:3000
  mainWindow.loadURL('http://localhost:3000');
}

function startApi() {
  // 启动 Strapi
  apiProcess = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'api'),
    env: process.env,
    stdio: 'inherit',
    shell: true,
  });
}

function startFrontend() {
  // 启动 Next.js
  frontendProcess = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend'),
    env: process.env,
    stdio: 'inherit',
    shell: true,
  });
}

app.whenReady().then(() => {
  startApi();
  startFrontend();

  // 等待前端服务启动后再创建窗口（简单延时，生产建议用端口探测）
  setTimeout(createWindow, 2000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }

  if (apiProcess) apiProcess.kill();
  if (frontendProcess) frontendProcess.kill();
});

app.on('before-quit', () => {
  if (apiProcess) apiProcess.kill();
  if (frontendProcess) frontendProcess.kill();
});