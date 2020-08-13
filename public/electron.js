const electron = require('electron');
const path = require('path')

const app = electron.app;
const Menu = electron.Menu;
const Tray = electron.Tray;

const BrowserWindow = electron.BrowserWindow;

const isDev = require('electron-is-dev');

let mainWindow;
let tray = null;
const clippings = ['TerminusDB'];

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
    mainWindow.loadURL('https://127.0.0.1:6363/')
    mainWindow.setMenu(null)

    //mainWindow.loadURL(isDev ? 'http://localhost:3005' : `file://${path.join(__dirname, '../build/index.html')}`);

    if (isDev) {
        // Open the DevTools.
        mainWindow.webContents.openDevTools();


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
}
/*
app.on('ready', () => {
    createWindow()
})*/
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    //console.log(' certificate error url', url)
    callback(true)
    //mainWindow.webContents.openDevTools();
    mainWindow.webContents.on("devtools-opened", () => { mainWindow.webContents.closeDevTools(); });
})

app.on('ready', () => {
  if (app.dock) app.dock.hide();

  tray = new Tray(path.join(__dirname, 'assets/icons/favicon.png'));

  if (process.platform === 'win32') {
    tray.on('click', tray.popUpContextMenu);
  }

  updateMenu();

  tray.setToolTip('TerminusDB');
});

const updateMenu = () => {
  const menu = Menu.buildFromTemplate([
    ...clippings.map((clipping, index) => ({ label: clipping, click() {
        createWindow();
      }})),
    { type: 'separator' },
    {
      label: 'Quit',
      click() { app.quit(); },
    }
  ]);

  tray.setContextMenu(menu);
};
