import { autoUpdater } from 'electron-updater'
import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import * as path from 'path'

let mainWindow: BrowserWindow | null = null

export function initializeAutoUpdater(window: BrowserWindow): void {
  mainWindow = window
  
  // Configure auto updater
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
  
  // Set the feed URL to your GitHub releases
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'QVDW',
    repo: 'BtwBuddy',
    private: false
  })

  // Auto updater events
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...')
    sendStatusToWindow('checking-for-update', 'Checking for updates...')
  })

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info)
    sendStatusToWindow('update-available', 'Update available! Downloading...')
    
    // Show notification to user
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available and will be downloaded automatically.`,
      detail: 'The update will be installed when you restart the application.',
      buttons: ['OK']
    })
  })

  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available:', info)
    sendStatusToWindow('update-not-available', 'No updates available')
  })

  autoUpdater.on('error', (err) => {
    console.error('Auto updater error:', err)
    sendStatusToWindow('error', `Error: ${err.message}`)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    const logMessage = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`
    console.log(logMessage)
    sendStatusToWindow('download-progress', {
      speed: progressObj.bytesPerSecond,
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info)
    sendStatusToWindow('update-downloaded', 'Update downloaded! Will install on restart.')
    
    // Show notification to user
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Update Downloaded',
      message: `Update ${info.version} has been downloaded successfully.`,
      detail: 'The update will be installed when you restart the application.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0
    }).then((result) => {
      if (result.response === 0) {
        // User clicked "Restart Now"
        autoUpdater.quitAndInstall()
      }
    })
  })

  // Check for updates when app starts (but not immediately)
  setTimeout(() => {
    checkForUpdates()
  }, 3000) // Wait 3 seconds after app starts
}

export function checkForUpdates(): void {
  console.log('Checking for updates...')
  autoUpdater.checkForUpdates()
}

export function quitAndInstall(): void {
  autoUpdater.quitAndInstall()
}

function sendStatusToWindow(type: string, data: any): void {
  if (mainWindow) {
    mainWindow.webContents.send('auto-updater-status', { type, data })
  }
}

// IPC handlers for manual update control
ipcMain.handle('check-for-updates', () => {
  checkForUpdates()
  return { success: true }
})

ipcMain.handle('quit-and-install', () => {
  quitAndInstall()
  return { success: true }
})

// Export version info for the renderer
ipcMain.handle('get-app-version', () => {
  return {
    version: app.getVersion(),
    name: app.getName()
  }
}) 