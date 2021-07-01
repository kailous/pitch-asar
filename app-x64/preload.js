function attachPreload(shellToAppConfig) {
  const electron = require('electron')
  const { clipboard, ipcRenderer, remote } = electron

  const fs = remote.require('fs')
  const path = remote.require('path')

  window['pitch-shell-to-app-config'] = shellToAppConfig

  window['pitch-platform'] = {
    undo: function () {
      if (remote.getCurrentWindow().webContents) {
        remote.getCurrentWindow().webContents.undo()
      }
    },
    redo: function () {
      if (remote.getCurrentWindow().webContents) {
        remote.getCurrentWindow().webContents.redo()
      }
    },
    menu: () => remote.Menu,
    'popup-context-menu': (menu) => menu.popup(remote.getCurrentWindow()),
  }

  window['pitch-spectron-logger'] = (message) => {
    const dest = 'log/desktop-app.log'
    const dir = path.dirname(dest)
    fs.existsSync(dir) || fs.mkdirSync(dir)
    fs.appendFile(dest, message, (e) => e && console.error(e))
  }

  const ipcChannel = shellToAppConfig['ipc-channel']
  window['pitch-ipc'] = {
    'send-to-shell': (transitPayload) => ipcRenderer.send(ipcChannel, transitPayload),
    'send-to-shell-sync': (transitPayload) => ipcRenderer.sendSync(ipcChannel, transitPayload),
    'on-shell-msg': (handler) => {
      ipcRenderer.on(ipcChannel, (_, transitPayload) => handler(transitPayload))
    },
  }
}
