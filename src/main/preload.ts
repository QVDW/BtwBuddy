import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Auto-updater
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onAutoUpdaterStatus: (callback: (status: any) => void) => {
    ipcRenderer.on('auto-updater-status', (event, status) => callback(status))
  }
})

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      // Transaction management
      getTransactions: () => Promise<any[]>
      saveTransaction: (transaction: any) => Promise<any>
      updateTransaction: (transaction: any) => Promise<any>
      deleteTransaction: (transactionId: string) => Promise<boolean>
      clearAllData: () => Promise<boolean>
      
      // File handling
      selectFile: () => Promise<any>
      exportMonth: (data: any) => Promise<any>
      
      // Window controls
      minimizeWindow: () => Promise<void>
      maximizeWindow: () => Promise<void>
      closeWindow: () => Promise<void>
      
      // Auto-updater
      checkForUpdates: () => Promise<any>
      quitAndInstall: () => Promise<void>
      getAppVersion: () => Promise<any>
      onAutoUpdaterStatus: (callback: (status: any) => void) => void
    }
  }
} 