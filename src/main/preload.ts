import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Transaction management
  getTransactions: () => ipcRenderer.invoke('get-transactions'),
  saveTransaction: (transaction: any) => ipcRenderer.invoke('save-transaction', transaction),
  updateTransaction: (transaction: any) => ipcRenderer.invoke('update-transaction', transaction),
  deleteTransaction: (transactionId: string) => ipcRenderer.invoke('delete-transaction', transactionId),
  clearAllData: () => ipcRenderer.invoke('clear-all-data'),
  
  // File handling
  selectFile: () => ipcRenderer.invoke('select-file'),
  exportMonth: (data: any) => ipcRenderer.invoke('export-month', data),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // Auto updater
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  onAutoUpdaterStatus: (callback: (status: any) => void) => {
    ipcRenderer.on('auto-updater-status', (event, status) => callback(status))
  },
  
  // Update logging and debugging
  getUpdateLogs: () => ipcRenderer.invoke('get-update-logs'),
  clearUpdateLogs: () => ipcRenderer.invoke('clear-update-logs'),
  
  // Version management
  downloadVersion: (versionInfo: any) => ipcRenderer.invoke('download-version', versionInfo)
})

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      getTransactions: () => Promise<any[]>
      saveTransaction: (transaction: any) => Promise<any>
      updateTransaction: (transaction: any) => Promise<any>
      deleteTransaction: (transactionId: string) => Promise<boolean>
      clearAllData: () => Promise<boolean>
      selectFile: () => Promise<any>
      exportMonth: (data: any) => Promise<any>
      minimizeWindow: () => Promise<void>
      maximizeWindow: () => Promise<void>
      closeWindow: () => Promise<void>
      checkForUpdates: () => Promise<any>
      quitAndInstall: () => Promise<any>
      getAppVersion: () => Promise<{ version: string; name: string }>
      onAutoUpdaterStatus: (callback: (status: any) => void) => void
      getUpdateLogs: () => Promise<{ success: boolean; logs?: string; error?: string }>
      clearUpdateLogs: () => Promise<{ success: boolean; error?: string }>
      downloadVersion: (versionInfo: any) => Promise<any>
    }
  }
} 