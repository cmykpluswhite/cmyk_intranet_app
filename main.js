const electron = require('electron')
const { app, autoUpdater, dialog } = require('electron')
const BrowserWindow = electron.BrowserWindow
const appVersion = require('./package.json').version
const os = require('os').platform()

const path = require('path')
const fs = require("fs")
const iconPath = path.join(__dirname, 'logo.png')

// Menu (for standard keyboard shortcuts)
const { Menu, Tray } = require('electron')
const server = 'http://192.168.0.10.xip.io:9000'


// Check Auto Update
var updateFeed = 'https://github.com/cmykpluswhite/cmyk_intranet_app/release-builds';
autoUpdater.setFeedURL(updateFeed + '?v=' + appVersion);





app.on('ready', () => {
  const { net } = require('electron')
  const request = net.request(`${server}/users/info`)

  let userdata = []
  let traydata = []
  request.on('response', (response) => {
    response.on('data', (chunk) => {
      userdata = JSON.parse(chunk)
    })
    response.on('end', () => {
      userdata.return.forEach((arr) => {
        if(arr.ext_number) {
          traydata.push({
            label: arr.name + ' - ' + arr.ext_number
          })
        }
      })

      traydata.push({type: "separator" },{role: "quit"})

      // Tray Setup S
      let tray = null
      tray = new Tray(iconPath)
      const contextMenu = Menu.buildFromTemplate(traydata)
      tray.setToolTip('CMYK+White')
      tray.setContextMenu(contextMenu)
    })
  })
  request.end()

})

// Tray Setup E
const template = [
  {
    label: 'Edit',
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'pasteandmatchstyle'},
      {role: 'delete'},
      {role: 'selectall'}
    ]
  },
  {
    label: 'View',
    submenu: [
      {role: 'reload'},
      {role: 'forcereload'},
      {role: 'toggledevtools'},
      {type: 'separator'},
      {role: 'resetzoom'},
      {role: 'zoomin'},
      {role: 'zoomout'},
      {type: 'separator'},
      {role: 'togglefullscreen'}
    ]
  },
  {
    role: 'window',
    submenu: [
      {role: 'minimize'},
      {role: 'close'}
    ]
  }
];

if (process.platform === 'darwin') {
  template.unshift({
    label: app.name,
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  });

  // Edit menu
  template[1].submenu.push(
    {type: 'separator'},
    {
      label: 'Speech',
      submenu: [
        {role: 'startspeaking'},
        {role: 'stopspeaking'}
      ]
    }
  );

  // Window menu
  template[3].submenu = [
    {role: 'close'},
    {role: 'minimize'},
    {role: 'zoom'},
    {type: 'separator'},
    {role: 'front'}
  ]
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let initPath;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  initPath = path.join(app.getPath('userData'), "init.json");

  try {
    data = JSON.parse(fs.readFileSync(initPath, 'utf8'));
  }
  catch(e) {}

  win = new BrowserWindow({
    minWidth: 1180,
    minHeight: 860,
    width: 1600,
    height: 1100,
    icon: path.join(__dirname, 'assets/icons/png/64x64.png'),
    //titleBarStyle: 'hidden',
    //frame: false,
    backgroundColor: '#202124',
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
      zoomFactor: 1.0
    }
  });


  // win.maximize()
  win.loadURL('file://' + __dirname + '/index.html');
  
  const ses = win.webContents.session
  console.log(ses.getUserAgent())
  ses.clearCache()
  ses.flushStorageData()
  ses.clearStorageData()



  

  // Display Dev Tools
  //win.openDevTools();

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  data = {
    bounds: win.getBounds()
  };
  fs.writeFileSync(initPath, JSON.stringify(data));
  app.quit();
});
