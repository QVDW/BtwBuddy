import { autoUpdater } from 'electron-updater'
import { app, BrowserWindow, dialog, ipcMain } from 'electron'

let mainWindow: BrowserWindow | null = null

export function initializeAutoUpdater(window: BrowserWindow): void {
  mainWindow = window
  
  // Configure auto updater
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
  
  // Set the feed URL to your GitHub releases
  try {
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'QVDW',
      repo: 'BtwBuddy',
      private: false
    })
  } catch (error) {
    sendStatusToWindow('error', `Failed to configure update feed: ${error}`)
  }

  // Auto updater events
  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('checking-for-update', 'Checking for updates...')
  })

  autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('update-available', 'Update available! Downloading...')
    
    // Show notification to user
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available and will be downloaded automatically.`,
      detail: 'The update will be installed when you restart the application.',
      buttons: ['OK']
    }).catch(error => {
      console.error('Failed to show update available dialog:', error)
    })
  })

  autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('update-not-available', 'No updates available')
  })

  autoUpdater.on('error', (err) => {
    sendStatusToWindow('error', `Error: ${err.message}`)
    
    // Show error dialog to user
    dialog.showErrorBox('Update Error', 
      `Failed to check for updates: ${err.message}\n\n` +
      'This might be due to network issues or GitHub API problems.\n' +
      'You can try again later or check your internet connection.'
    )
  })

  autoUpdater.on('download-progress', (progressObj) => {
    sendStatusToWindow('download-progress', {
      speed: progressObj.bytesPerSecond,
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
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
    }).catch(error => {
      console.error('Failed to show update downloaded dialog:', error)
    })
  })

  // Check for updates when app starts (but not immediately)
  setTimeout(() => {
    checkForUpdates()
  }, 3000) // Wait 3 seconds after app starts
}

export function checkForUpdates(): void {
  try {
    autoUpdater.checkForUpdates()
  } catch (error) {
    sendStatusToWindow('error', `Failed to check for updates: ${error}`)
  }
}

export function quitAndInstall(): void {
  try {
    autoUpdater.quitAndInstall()
  } catch (error) {
    sendStatusToWindow('error', `Failed to install update: ${error}`)
  }
}

function sendStatusToWindow(type: string, data: any): void {
  if (mainWindow) {
    try {
      mainWindow.webContents.send('auto-updater-status', { type, data })
    } catch (error) {
      console.error('Failed to send status to window:', error)
    }
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

 