import { autoUpdater } from 'electron-updater'
import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

let mainWindow: BrowserWindow | null = null

// Enhanced logging function
function logToFile(message: string, data?: any) {
  const logDir = path.join(app.getPath('userData'), 'logs')
  const logFile = path.join(logDir, 'auto-updater.log')
  
  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }
  
  const timestamp = new Date().toISOString()
  const logEntry = `[${timestamp}] ${message}${data ? ` | Data: ${JSON.stringify(data)}` : ''}\n`
  
  try {
    fs.appendFileSync(logFile, logEntry)
  } catch (error) {
    // Handle error silently
  }
}

export function initializeAutoUpdater(window: BrowserWindow): void {
  mainWindow = window
  
  logToFile('Initializing auto updater')
  
  // Configure auto updater with enhanced error handling
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
    logToFile('Feed URL set successfully')
  } catch (error) {
    logToFile('Failed to set feed URL', error)
    sendStatusToWindow('error', `Failed to configure update feed: ${error}`)
  }

  // Auto updater events with enhanced error handling
  autoUpdater.on('checking-for-update', () => {
    logToFile('Checking for updates...')
    sendStatusToWindow('checking-for-update', 'Checking for updates...')
  })

  autoUpdater.on('update-available', (info) => {
    logToFile('Update available', info)
    sendStatusToWindow('update-available', 'Update available! Downloading...')
    
    // Show notification to user
    dialog.showMessageBox(mainWindow!, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available and will be downloaded automatically.`,
      detail: 'The update will be installed when you restart the application.',
      buttons: ['OK']
    }).catch(error => {
      logToFile('Failed to show update available dialog', error)
    })
  })

  autoUpdater.on('update-not-available', (info) => {
    logToFile('Update not available', info)
    sendStatusToWindow('update-not-available', 'No updates available')
  })

  autoUpdater.on('error', (err) => {
    logToFile('Auto updater error', {
      message: err.message,
      stack: err.stack,
      code: (err as any).code,
      name: err.name
    })
    sendStatusToWindow('error', `Error: ${err.message}`)
    
    // Show error dialog to user
    dialog.showErrorBox('Update Error', 
      `Failed to check for updates: ${err.message}\n\n` +
      'This might be due to network issues or GitHub API problems.\n' +
      'You can try again later or check your internet connection.'
    )
  })

  autoUpdater.on('download-progress', (progressObj) => {
    const logMessage = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`
    logToFile('Download progress', progressObj)
    sendStatusToWindow('download-progress', {
      speed: progressObj.bytesPerSecond,
      percent: progressObj.percent,
      transferred: progressObj.transferred,
      total: progressObj.total
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    logToFile('Update downloaded', info)
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
        logToFile('User chose to restart now')
        autoUpdater.quitAndInstall()
      }
    }).catch(error => {
      logToFile('Failed to show update downloaded dialog', error)
    })
  })

  // Check for updates when app starts (but not immediately)
  setTimeout(() => {
    checkForUpdates()
  }, 3000) // Wait 3 seconds after app starts
}

export function checkForUpdates(): void {
  logToFile('Manual check for updates initiated')
  try {
    autoUpdater.checkForUpdates()
  } catch (error) {
    logToFile('Failed to check for updates', error)
    sendStatusToWindow('error', `Failed to check for updates: ${error}`)
  }
}

export function quitAndInstall(): void {
  logToFile('Quit and install initiated')
  try {
    autoUpdater.quitAndInstall()
  } catch (error) {
    logToFile('Failed to quit and install', error)
    sendStatusToWindow('error', `Failed to install update: ${error}`)
  }
}

function sendStatusToWindow(type: string, data: any): void {
  if (mainWindow) {
    try {
      mainWindow.webContents.send('auto-updater-status', { type, data })
    } catch (error) {
      logToFile('Failed to send status to window', error)
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

// New IPC handler to get update logs
ipcMain.handle('get-update-logs', () => {
  try {
    const logDir = path.join(app.getPath('userData'), 'logs')
    const logFile = path.join(logDir, 'auto-updater.log')
    
    if (fs.existsSync(logFile)) {
      const logs = fs.readFileSync(logFile, 'utf8')
      return { success: true, logs }
    } else {
      return { success: false, error: 'No log file found' }
    }
  } catch (error) {
    logToFile('Failed to read update logs', error)
    return { success: false, error: `Failed to read logs: ${error}` }
  }
})

// New IPC handler to clear update logs
ipcMain.handle('clear-update-logs', () => {
  try {
    const logDir = path.join(app.getPath('userData'), 'logs')
    const logFile = path.join(logDir, 'auto-updater.log')
    
    if (fs.existsSync(logFile)) {
      fs.unlinkSync(logFile)
    }
    
    return { success: true }
  } catch (error) {
    logToFile('Failed to clear update logs', error)
    return { success: false, error: `Failed to clear logs: ${error}` }
  }
}) 