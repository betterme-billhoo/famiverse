const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

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
  mainWindow.loadURL('http://localhost:3000');
}

function startApi() {
  apiProcess = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'api'),
    env: process.env,
    stdio: 'inherit',
    //shell: true
  });
}

function startFrontend() {
  frontendProcess = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend'),
    env: process.env,
    stdio: 'inherit',
    //shell: true
  });
}

// 轮询端口是否可用
function waitForPort(port, callback) {
  const tryConnect = () => {
    const req = http.get({ hostname: 'localhost', port, timeout: 1000 }, (res) => {
      res.destroy();
      callback();
    });
    req.on('error', () => setTimeout(tryConnect, 1000));
    req.on('timeout', () => {
      req.destroy();
      setTimeout(tryConnect, 1000);
    });
  };
  tryConnect();
}

app.whenReady().then(() => {
  startApi();
  waitForPort(1337, () => {
    startFrontend();
    waitForPort(3000, () => {
      createWindow();
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }

  if (apiProcess) {
    apiProcess.kill();
  }

  if (frontendProcess) {
    frontendProcess.kill();
  }
});

app.on('before-quit', () => {
  if (apiProcess) apiProcess.kill();
  if (frontendProcess) frontendProcess.kill();
});