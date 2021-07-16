const electron = require('electron');
const url = require('url');
const path = require('path');
const { ipcMain } = require('electron');


// Electron variables
const {app, BrowserWindow, Menu, idcMain} = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;


// Listen for app to be ready
app.on('ready', function() {
    mainWindow = new BrowserWindow({
        webPreferences:{
            contextIsolation:false,
            nodeIntegration:true
        }
    });
    // Load html file into the window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);
});


// Handle add window
function createAddWindow() {
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item',
        webPreferences:{
            contextIsolation:false,
            nodeIntegration:true
        }
    });

    // Load html file into the window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Garbage collection handle
    addWindow.on('close', function() {
        addWindow = null;
    });
}


// Catch item:add
ipcMain.on('item:add', function(e, item) {
    console.log(item);
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});


// Create menu template
const mainMenuTemplate = [
    {
        label:'File',
        submenu: [
            {
                label: 'Add Item',
                click() {
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click() {
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit', 
                accelerator: 'CmdOrCtrl+Q',
                click() { app.quit(); }
            }
        ],
    },
    {
        label:'Audio',
        submenu: [
            {
                label: 'Play doom',
                click() {
                    mainWindow.webContents.executeJavaScript(`
                    document.getElementById("audio").play().catch(function() {
                        // do something
                    });
                    `);
                }
            }
        ]
    }
];


// If mac, add empty object to menu
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({});
}


// Add developer tools item if not in production
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: 'CmdOrCtrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                } 
            },
            {
                role: 'reload'
            }
        ]
    });
}