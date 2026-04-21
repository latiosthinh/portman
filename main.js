require('dotenv').config();
const { app, BrowserWindow, Tray, Menu, nativeImage, dialog, ipcMain, screen } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let tray = null;
let mainWindow = null;
let serverProcess = null;
let isWidgetMode = false;
let widgetCorner = null;
const PORT = process.env.PORT || 8765;

const WIDGET_SIZE = { width: 380, height: 280 };
const CORNER_OFFSET = 12;

function getCornerPosition(corner) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  const { x: workAreaX, y: workAreaY } = primaryDisplay.workArea;

  switch (corner) {
    case 'top-left':
      return { x: workAreaX + CORNER_OFFSET, y: workAreaY + CORNER_OFFSET };
    case 'top-right':
      return { x: workAreaX + screenWidth - WIDGET_SIZE.width - CORNER_OFFSET, y: workAreaY + CORNER_OFFSET };
    case 'bottom-left':
      return { x: workAreaX + CORNER_OFFSET, y: workAreaY + screenHeight - WIDGET_SIZE.height - CORNER_OFFSET };
    case 'bottom-right':
      return { x: workAreaX + screenWidth - WIDGET_SIZE.width - CORNER_OFFSET, y: workAreaY + screenHeight - WIDGET_SIZE.height - CORNER_OFFSET };
    default:
      return { x: workAreaX + CORNER_OFFSET, y: workAreaY + screenHeight - WIDGET_SIZE.height - CORNER_OFFSET };
  }
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  let icon = nativeImage.createFromPath(iconPath);

  if (icon.isEmpty()) {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon.resize({ width: 16, height: 16 }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Dashboard',
      click: () => {
        if (mainWindow) {
          if (isWidgetMode) {
            applyWidgetMode(false);
          }
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: 'Toggle Widget Mode',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.executeJavaScript(`
            (function() {
              const btn = document.getElementById('widgetToggle');
              if (btn) btn.click();
            })();
          `).catch(() => {});
        }
      }
    },
    {
      label: 'Widget Corner',
      submenu: [
        { label: 'Top Left', click: () => setWidgetCorner('top-left') },
        { label: 'Top Right', click: () => setWidgetCorner('top-right') },
        { label: 'Bottom Left', click: () => setWidgetCorner('bottom-left') },
        { label: 'Bottom Right', click: () => setWidgetCorner('bottom-right') },
      ]
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        if (serverProcess) {
          serverProcess.kill();
        }
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Local Port Dashboard');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop());
      } else {
        mainWindow.show();
        mainWindow.setAlwaysOnTop(true);
        mainWindow.focus();
      }
    }
  });
}

function setWidgetCorner(corner) {
  widgetCorner = corner;
  if (isWidgetMode && mainWindow) {
    const pos = getCornerPosition(corner);
    mainWindow.setPosition(pos.x, pos.y);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    show: false,
    alwaysOnTop: true,
    frame: true,
    transparent: false,
    backgroundColor: '#0f172a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    title: 'Local Port Dashboard',
    icon: path.join(__dirname, 'assets', 'icon.png'),
  });

  mainWindow.loadURL(`http://localhost:${PORT}`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.webContents.on('dom-ready', () => {
    const savedWidgetMode = mainWindow.webContents.executeJavaScript("localStorage.getItem('widgetMode') === 'true'").catch(() => false);
    savedWidgetMode.then(isWidget => {
      if (isWidget) {
        applyWidgetMode(true);
      }
    });

    const savedCorner = mainWindow.webContents.executeJavaScript("localStorage.getItem('widgetCorner')").catch(() => null);
    savedCorner.then(corner => {
      if (corner) {
        widgetCorner = corner;
      }
    });
  });
}

function applyWidgetMode(enabled) {
  if (!mainWindow) return;

  isWidgetMode = enabled;

  if (enabled) {
    mainWindow.setResizable(false);
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.setSkipTaskbar(true);
    mainWindow.setSize(WIDGET_SIZE.width, WIDGET_SIZE.height);
    mainWindow.setMinimumSize(WIDGET_SIZE.width, WIDGET_SIZE.height);
    mainWindow.setMaximumSize(WIDGET_SIZE.width, WIDGET_SIZE.height);

    const corner = widgetCorner || 'bottom-right';
    const pos = getCornerPosition(corner);
    mainWindow.setPosition(pos.x, pos.y);

    mainWindow.webContents.executeJavaScript(`
      document.body.classList.add('widget-mode');
      const btn = document.getElementById('widgetToggle');
      if (btn) btn.classList.add('active');
    `).catch(() => {});
  } else {
    mainWindow.setResizable(true);
    mainWindow.setAlwaysOnTop(true);
    mainWindow.setSkipTaskbar(false);
    mainWindow.setSize(900, 700);
    mainWindow.setMinimumSize(600, 400);
    mainWindow.setMaximumSize(0, 0);

    mainWindow.setPosition(
      Math.floor(screen.getPrimaryDisplay().workAreaSize.width / 2 - 450),
      Math.floor(screen.getPrimaryDisplay().workAreaSize.height / 2 - 350)
    );

    mainWindow.webContents.executeJavaScript(`
      document.body.classList.remove('widget-mode');
      const btn = document.getElementById('widgetToggle');
      if (btn) btn.classList.remove('active');
    `).catch(() => {});
  }
}

ipcMain.on('set-widget-mode', (event, enabled) => {
  applyWidgetMode(enabled);
});

ipcMain.on('set-widget-corner', (event, corner) => {
  setWidgetCorner(corner);
});

ipcMain.on('widget-dragged', () => {
  if (isWidgetMode && mainWindow) {
    const [x, y] = mainWindow.getPosition();
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    const { x: workAreaX, y: workAreaY } = primaryDisplay.workArea;

    const centerX = x + WIDGET_SIZE.width / 2;
    const centerY = y + WIDGET_SIZE.height / 2;
    const screenCenterX = workAreaX + screenWidth / 2;
    const screenCenterY = workAreaY + screenHeight / 2;

    let newCorner;
    if (centerX < screenCenterX) {
      newCorner = centerY < screenCenterY ? 'top-left' : 'bottom-left';
    } else {
      newCorner = centerY < screenCenterY ? 'top-right' : 'bottom-right';
    }

    widgetCorner = newCorner;
    mainWindow.webContents.executeJavaScript(`
      localStorage.setItem('widgetCorner', '${newCorner}');
    `).catch(() => {});
  }
});

function startServer() {
  return new Promise((resolve, reject) => {
    serverProcess = spawn('node', [path.join(__dirname, 'server.js')], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
      env: { ...process.env, PORT },
    });

    let serverReady = false;
    let portInUseDetected = false;

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('running')) {
        serverReady = true;
        setTimeout(resolve, 500);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const errOutput = data.toString();
      console.error('Server error:', errOutput);

      if (!portInUseDetected && (
        errOutput.includes('EADDRINUSE') ||
        errOutput.includes('listen EADDRINUSE') ||
        errOutput.includes('address already in use')
      )) {
        portInUseDetected = true;
        dialog.showErrorBox(
          'Port Already in Use',
          `Port ${PORT} is already in use. Please close the other application or set a different PORT environment variable.`
        );
        app.quit();
        reject(new Error(`Port ${PORT} is already in use`));
      }
    });

    serverProcess.on('error', (err) => {
      if (err.code === 'EADDRINUSE' || err.message.includes('address already in use')) {
        dialog.showErrorBox(
          'Port Already in Use',
          `Port ${PORT} is already in use. Please close the other application or set a different PORT environment variable.`
        );
        app.quit();
      }
      reject(err);
    });

    setTimeout(() => {
      if (!serverReady && !portInUseDetected) {
        dialog.showErrorBox(
          'Server Startup Timeout',
          `The dashboard server failed to start within 5 seconds. Please check the application logs for details.`
        );
        app.quit();
        reject(new Error('Server startup timeout'));
      }
    }, 5000);

    setTimeout(() => resolve(), 2000);
  });
}

app.whenReady().then(async () => {
  createTray();
  await startServer();
  createWindow();

  mainWindow.show();
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
