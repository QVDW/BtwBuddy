import { autoUpdater } from 'electron-updater'
import { app, BrowserWindow, ipcMain } from 'electron'

let mainWindow: BrowserWindow | null = null

export function initializeAutoUpdater(window: BrowserWindow): void {
  mainWindow = window
  
  // Configure auto updater
  autoUpdater.autoDownload = false // Don't auto-download
  autoUpdater.autoInstallOnAppQuit = false // Don't auto-install
  
  // Set the feed URL to your GitHub releases
  try {
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'QVDW',
      repo: 'BtwBuddy',
      private: false
    })
  } catch (error) {
    // Silent fail - don't show error
    console.error('Failed to configure update feed:', error)
  }

  // Auto updater events - only send positive updates to renderer
  autoUpdater.on('checking-for-update', () => {
    // Silent - don't send status
  })

  autoUpdater.on('update-available', (info) => {
    // Only send update-available status to trigger notification
    sendStatusToWindow('update-available', {
      version: info.version,
      releaseNotes: info.releaseNotes
    })
  })

  autoUpdater.on('update-not-available', (info) => {
    // Silent - don't send status when no updates available
  })

  autoUpdater.on('error', (err) => {
    // Silent fail - don't show error dialog or send error status
    console.error('Auto updater error:', err.message)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    // Only send progress if user initiated download
    sendStatusToWindow('download-progress', {
      speed: progressObj.bytesPerSecond,
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('update-downloaded', {
      version: info.version
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
    // Silent fail - don't show error
    console.error('Failed to check for updates:', error)
  }
}

export function quitAndInstall(): void {
  try {
    autoUpdater.quitAndInstall()
  } catch (error) {
    // Silent fail - don't show error
    console.error('Failed to install update:', error)
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

 