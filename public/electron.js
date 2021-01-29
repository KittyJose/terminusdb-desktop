const electron = require('electron')
const path = require('path')
const fs = require('fs')
const execFile = require('child_process').execFile

const isDev = require('electron-is-dev')

let mainWindow
let tray = null
const clippings = ['TerminusDB']

function createWindow () {
    mainWindow = new electron.BrowserWindow({
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
    })

    // const options = { extraHeaders: 'pragma: no-cache\n' }
    mainWindow.setMenu(null)

    mainWindow.on('close', (event) => {
        if (electron.app.quitting) {
            mainWindow = null
        } else {
            event.preventDefault()
            mainWindow.hide()
        }
    })

    electron.app.on('before-quit', function (evt) {
        electron.app.quitting = true
        tray.destroy();
    });

    electron.app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            electron.app.quit()
        }
    })

    mainWindow.webContents.on('new-window', function (e, url) {
        e.preventDefault()
        electron.shell.openExternal(url)
    })

    electron.globalShortcut.register('f5', () => mainWindow.reload())
    electron.globalShortcut.register('CommandOrControl+R', () => mainWindow.reload())
    electron.globalShortcut.register('Alt+Left', () => {
        if (mainWindow.webContents.canGoBack()) mainWindow.webContents.goBack()
    })
    electron.globalShortcut.register('Alt+Right', () => {
        if (mainWindow.webContents.canGoForward()) mainWindow.webContents.goForward()
    })
    console.log('ready')
    mainWindow.loadURL('https://127.0.0.1:6363/')
}

electron.app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    if (url.startsWith('https://127.0.0.1')) {
        callback(true)
    } else {
        callback(false)
    }
    // mainWindow.webContents.openDevTools();
    mainWindow.webContents.on('devtools-opened', () => { mainWindow.webContents.closeDevTools() })
})

electron.app.on('ready', () => {
    const startConsole = () => {
        if (electron.app.dock) electron.app.dock.hide()
        tray = new electron.Tray(path.join(__dirname, 'assets/icons/favicon.png'))
        if (process.platform === 'win32') {
          tray.on('right-click', tray.popUpContextMenu)
        }
        createMenu()
        tray.setToolTip('TerminusDB')
        tray.setIgnoreDoubleClickEvents(true)
        createWindow()
        tray.on('click', function handleClicked () {
            mainWindow.show()
        });
    }

    const appDir = path.dirname(require.main.filename)
    const appImagePath = `${appDir}/TerminusDB.AppImage`
    const exePath = `${appDir}/windows/start_windows.bat`

    let binPath
    let binArgs

    if (fs.existsSync(appImagePath)) {
        binPath = appImagePath
        binArgs = ['serve']
    } else if (fs.existsSync(exePath)) {
        binPath = exePath
        binArgs = []
    } else {
        console.log('Terminusdb appImage Not Found')
    }

    console.log('PATH', binPath)
    let serverReady = false
    console.log('Starting TerminusDB')


    /************* test remove this later************/
    startConsole()

    const child = execFile(binPath, binArgs)
    child.stderr.on('data', (data) => {
        if (!serverReady) {
          console.log('stderr: ' + data)
          if (data.toString().substring(2, 16) === 'Started server') {
            serverReady = true
            console.log('Terminusdb started')
            startConsole()
          }
        }
    })
})

const createMenu = () => {
    const menu = electron.Menu.buildFromTemplate([
        /*...clippings.map((clipping, index) => ({
          label: clipping,
          click () {
            mainWindow.show()
          }
      })),*/
        { type: 'separator' },
        {
            label: 'Quit TerminusDB',
            click () {
                electron.app.isQuiting = true
                electron.app.quit()
            }
        }
    ])
    tray.setContextMenu(menu)
}
