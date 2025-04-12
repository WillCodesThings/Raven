"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
function createWindow() {
    var win = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    win.loadURL("http://localhost:3001"); // React dev server
}
electron_1.app.whenReady().then(createWindow);
