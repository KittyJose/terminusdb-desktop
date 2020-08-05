const electron = require('electron');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

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
        }
    });

    app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

    const options = { extraHeaders: 'pragma: no-cache\n' }
    mainWindow.loadURL('https://127.0.0.1:6363/', options)
    //mainWindow.loadURL(isDev ? 'http://localhost:3005' : `file://${path.join(__dirname, '../build/index.html')}`);

    if (isDev) {
        // Open the DevTools.
        //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
        mainWindow.webContents.openDevTools();
        app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
            //console.log(' certificate error url', url)
            callback(true)
            mainWindow.webContents.openDevTools();

            mainWindow.webContents.on("devtools-opened", () => { mainWindow.webContents.closeDevTools(); });
        })
    }
    mainWindow.on('closed', () => {
        mainWindow = null
    });
}

app.on('ready', () => {
    createWindow()
})

app.on('window-all-closed', (url) => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


app.on('activate', (url) => {
    if (mainWindow === null) {
        createWindow();
    }
});
