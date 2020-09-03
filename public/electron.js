const electron = require('electron');
const path = require('path')
const fs = require('fs')

const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;

const BrowserWindow = electron.BrowserWindow;

const isDev = require('electron-is-dev');

const appDir = path.dirname(require.main.filename);
const execFile = require('child_process').execFile;


let mainWindow;
let tray = null;
const clippings = ['TerminusDB'];

function startTerminusDB(callback) {
    const appImagePath = `${appDir}/TerminusDB.AppImage`
    console.log(appImagePath)
    if (fs.existsSync(appImagePath)) {
        execFile(appImagePath, ['serve'], (error, stdout, stderr) => {
            console.log(error)
            console.log(stdout)
            console.log(stderr)
        })
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 680,
        nodeIntegration: false,
        webPreferences: {
            plugins: true,
            webSecurity: false,
            allowDisplayingInsecureContent: true,
            allowRunningInsecureContent: true
        },
        icon: path.join(__dirname, 'assets/icons/favicon.png')
    });

    const options = { extraHeaders: 'pragma: no-cache\n' }
    startTerminusDB();
    setTimeout(() => {
        mainWindow.loadURL('https://127.0.0.1:6363/')
    }, 3000);
    console.log("Terminusdb started");
    mainWindow.setMenu(null)

    //mainWindow.loadURL(isDev ? 'http://localhost:3005' : `file://${path.join(__dirname, '../build/index.html')}`);

    if (isDev) {
        // Open the DevTools.
        //mainWindow.webContents.openDevTools();


        mainWindow.on('minimize',function(event){
            event.preventDefault();
            mainWindow.hide();
        });

        mainWindow.on('close', function (event) {

            if(!app.isQuiting){
                event.preventDefault();
                mainWindow.hide();
            }
            return false;
        });
    }

    electron.globalShortcut.register('f5', () => mainWindow.reload())
    electron.globalShortcut.register('CommandOrControl+R', () => mainWindow.reload())
}

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    if (url.startsWith('https://127.0.0.1')) {
        callback(true)
    }
    else {
        callback(false)
    }
    //mainWindow.webContents.openDevTools();
    mainWindow.webContents.on("devtools-opened", () => { mainWindow.webContents.closeDevTools(); });
})

app.on('ready', () => {
  if (app.dock) app.dock.hide();

  tray = new Tray(path.join(__dirname, 'assets/icons/favicon.png'));
  if (process.platform === 'win32') {
    tray.on('click', tray.popUpContextMenu);
  }


  createMenu();
  tray.setToolTip('TerminusDB');
  createWindow();
});

const createMenu = () => {
  const menu = Menu.buildFromTemplate([
    ...clippings.map((clipping, index) => ({ label: clipping, click() {
        mainWindow.show();
      }})),
    { type: 'separator' },
    {
      label: 'Quit',
      click() {
        app.isQuiting = true;
        app.quit(); },
    }
  ]);

  tray.setContextMenu(menu);
};
