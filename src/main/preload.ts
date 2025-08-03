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
  closeWindow: () => ipcRenderer.invoke('close-window')
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
    }
  }
} 