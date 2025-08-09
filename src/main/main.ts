import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import Store from 'electron-store'
import * as ExcelJS from 'exceljs'

// Initialize electron-store for data persistence
const store = new Store()

let mainWindow: BrowserWindow | null = null
let splashWindow: BrowserWindow | null = null

function createSplashWindow(): void {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  })

  // Load splash screen HTML
  if (process.env.NODE_ENV === 'development') {
    splashWindow.loadURL('http://localhost:3000/splash.html')
  } else {
    splashWindow.loadFile(path.join(__dirname, 'renderer/splash.html'))
  }

  splashWindow.once('ready-to-show', () => {
    splashWindow?.show()
  })

  splashWindow.on('closed', () => {
    splashWindow = null
  })
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../icon.png'),
    titleBarStyle: 'hidden',
    frame: false,
    title: 'BtwBuddy',
    show: false
  })

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000')

  } else {
    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    // Hide splash screen and show main window
    if (splashWindow) {
      splashWindow.close()
    }
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Set app icon for taskbar
app.setAppUserModelId('com.btwbuddy.app')

// App event handlers
app.whenReady().then(() => {
  // Create splash screen first
  createSplashWindow()
  
  // Create main window after a short delay to simulate loading
  setTimeout(() => {
    createWindow()
  }, 2000) // Show splash for 2 seconds
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Window control handlers
ipcMain.handle('minimize-window', () => {
  mainWindow?.minimize()
})

ipcMain.handle('maximize-window', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.handle('close-window', () => {
  mainWindow?.close()
})

// IPC handlers for data management
ipcMain.handle('get-transactions', () => {
  return store.get('transactions', [])
})

ipcMain.handle('save-transaction', (event, transaction) => {
  const transactions = store.get('transactions', []) as any[]
  const newTransaction = {
    ...transaction,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  }
  transactions.push(newTransaction)
  store.set('transactions', transactions)
  return newTransaction
})

ipcMain.handle('update-transaction', (event, transaction) => {
  const transactions = store.get('transactions', []) as any[]
  const index = transactions.findIndex(t => t.id === transaction.id)
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...transaction }
    store.set('transactions', transactions)
    return transactions[index]
  }
  return null
})

ipcMain.handle('delete-transaction', (event, transactionId) => {
  const transactions = store.get('transactions', []) as any[]
  const filteredTransactions = transactions.filter(t => t.id !== transactionId)
  store.set('transactions', filteredTransactions)
  return true
})

// Autofill handlers
ipcMain.handle('get-autofill-items', () => {
  return store.get('autofill-items', [])
})

ipcMain.handle('save-autofill-item', (event, autofillItem) => {
  const autofillItems = store.get('autofill-items', []) as any[]
  const newAutofillItem = {
    ...autofillItem,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  }
  autofillItems.push(newAutofillItem)
  store.set('autofill-items', autofillItems)
  return newAutofillItem
})

ipcMain.handle('update-autofill-item', (event, autofillItem) => {
  const autofillItems = store.get('autofill-items', []) as any[]
  const index = autofillItems.findIndex(item => item.id === autofillItem.id)
  if (index !== -1) {
    autofillItems[index] = { ...autofillItems[index], ...autofillItem }
    store.set('autofill-items', autofillItems)
    return autofillItems[index]
  }
  return null
})

ipcMain.handle('delete-autofill-item', (event, autofillItemId) => {
  const autofillItems = store.get('autofill-items', []) as any[]
  const filteredAutofillItems = autofillItems.filter(item => item.id !== autofillItemId)
  store.set('autofill-items', filteredAutofillItems)
  return true
})

ipcMain.handle('clear-all-data', () => {
  // Clear all data from electron-store
  store.clear()
  
  // Also clear uploaded files directory
  const uploadsDir = path.join(app.getPath('userData'), 'uploads')
  if (fs.existsSync(uploadsDir)) {
    fs.rmSync(uploadsDir, { recursive: true, force: true })
  }
  
  return true
})

// File handling
ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'Documenten', extensions: ['pdf', 'jpg', 'jpeg', 'png'] },
      { name: 'PDF', extensions: ['pdf'] },
      { name: 'Afbeeldingen', extensions: ['jpg', 'jpeg', 'png'] }
    ]
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0]
    const fileName = path.basename(filePath)
    const uploadsDir = path.join(app.getPath('userData'), 'uploads')
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    
    const newFilePath = path.join(uploadsDir, fileName)
    fs.copyFileSync(filePath, newFilePath)
    
    return {
      originalName: fileName,
      storedPath: newFilePath
    }
  }
  
  return null
})

ipcMain.handle('export-month', async (event, { year, month, transactions }) => {
  // Get the last used export directory from store, or use default
  const lastExportDir = store.get('lastExportDirectory', app.getPath('documents')) as string
  
  const result = await dialog.showOpenDialog(mainWindow!, {
    defaultPath: lastExportDir,
    properties: ['openDirectory'],
    title: 'Selecteer map voor export'
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    const selectedDir = result.filePaths[0]
    const exportDir = path.join(selectedDir, `${year}-${month.toString().padStart(2, '0')}`)
    
    // Remember the selected directory for future exports
    store.set('lastExportDirectory', selectedDir)
    
    try {
      // Create export directory
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true })
      }
      
      // Copy invoice files
      for (const transaction of transactions) {
        if (transaction.invoiceFile) {
          const sourcePath = transaction.invoiceFile.storedPath
          const fileName = transaction.invoiceFile.originalName
          const destPath = path.join(exportDir, fileName)
          
          if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath)
          }
        }
      }
      
      // Create Excel for Belastingdienst (general transactions)
      const belastingdienstWorkbook = await createBelastingdienstExcel(transactions)
      const belastingdienstPath = path.join(exportDir, `belastingdienst-${year}-${month.toString().padStart(2, '0')}.xlsx`)
      await belastingdienstWorkbook.xlsx.writeFile(belastingdienstPath)
      
      // Create Excel for BTW Aangifte (VAT specific)
      const btwWorkbook = await createBTWExcel(transactions)
      const btwPath = path.join(exportDir, `btw-aangifte-${year}-${month.toString().padStart(2, '0')}.xlsx`)
      await btwWorkbook.xlsx.writeFile(btwPath)
      
      // Create summary file
      const summaryContent = createSummaryContent(transactions, year, month)
      const summaryPath = path.join(exportDir, `samenvatting-${year}-${month.toString().padStart(2, '0')}.txt`)
      fs.writeFileSync(summaryPath, summaryContent, 'utf8')
      
      return { success: true, path: exportDir }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
  
  return { success: false, error: 'Export geannuleerd' }
})

async function createBelastingdienstExcel(transactions: any[]): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Belastingdienst Export')
  
  // Set up headers
  const headers = [
    'Datum', 'Omschrijving', 'Type', 'Bedrag Inclusief BTW', 
    'Bedrag Exclusief BTW', 'BTW Bedrag', 'BTW Percentage', 'Factuur Bestand'
  ]
  
  // Add header row with enhanced styling
  const headerRow = worksheet.addRow(headers)
  headerRow.font = { 
    bold: true, 
    color: { argb: 'FFFFFF' },
    size: 12
  }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '4472C4' }
  }
  headerRow.alignment = {
    horizontal: 'center',
    vertical: 'middle'
  }
  
  // Set header row height
  headerRow.height = 25
  
  // Add data rows with enhanced styling
  transactions.forEach((t, index) => {
    const formattedDate = new Date(t.date).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    
    const transactionType = t.type === 'income' ? 'Inkomst' : 'Uitgave'
    const amountInclusive = t.amountInclusive || 0
    const amountExclusive = t.amountExclusive || 0
    const vatAmount = t.vatAmount !== undefined && t.vatAmount !== null ? t.vatAmount : 0
    const vatPercentage = (t.vatPercentage || 0) / 100 // Convert from percentage to decimal
    const invoiceFile = t.invoiceFile?.originalName || ''
    
    const row = worksheet.addRow([
      formattedDate,
      t.description || '',
      transactionType,
      amountInclusive,
      amountExclusive,
      vatAmount,
      vatPercentage,
      invoiceFile
    ])
    
    // Alternate row colors for better readability
    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F8F9FA' }
      }
    }
    
    // Style amount columns with currency formatting
    row.getCell(4).numFmt = '€#,##0.00'
    row.getCell(5).numFmt = '€#,##0.00'
    row.getCell(6).numFmt = '€#,##0.00'
    row.getCell(7).numFmt = '0.0%'
    
    // Color code transaction types
    if (t.type === 'income') {
      row.getCell(3).font = { color: { argb: '2E7D32' }, bold: true }
    } else {
      row.getCell(3).font = { color: { argb: 'D32F2F' }, bold: true }
    }
    
    // Set row height
    row.height = 20
  })
  
  // Add borders to all data
  const dataRange = worksheet.getCell(`A1:H${worksheet.rowCount}`)
  dataRange.border = {
    top: { style: 'thin', color: { argb: 'CCCCCC' } },
    left: { style: 'thin', color: { argb: 'CCCCCC' } },
    bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
    right: { style: 'thin', color: { argb: 'CCCCCC' } }
  }
  
  // Add conditional formatting for better visual feedback
  // Highlight positive amounts in green, negative in red
  const amountColumns = [4, 5, 6] // Amount Inclusive, Amount Exclusive, VAT Amount
  amountColumns.forEach(colIndex => {
    const column = worksheet.getColumn(colIndex)
    column.eachCell((cell, rowNumber) => {
      if (rowNumber > 1 && cell.value !== null && cell.value !== undefined) {
        const value = Number(cell.value)
        if (value > 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'E8F5E8' }
          }
        } else if (value < 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEBEE' }
          }
        }
      }
    })
  })
  
  // Add summary section with enhanced styling
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amountExclusive || 0), 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amountExclusive || 0), 0)
  const netResult = totalIncome - totalExpense
  
  // Add empty row
  worksheet.addRow([])
  
  // Add summary section header
  const summaryHeader = worksheet.addRow(['SAMENVATTING'])
  summaryHeader.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } }
  summaryHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '2E7D32' }
  }
  summaryHeader.alignment = { horizontal: 'center' }
  summaryHeader.height = 30
  
  // Add summary rows with enhanced styling
  const summaryRows = [
    ['Totaal Inkomsten', totalIncome],
    ['Totaal Uitgaven', totalExpense],
    ['Resultaat', netResult]
  ]
  
  summaryRows.forEach(([label, value], index) => {
    const row = worksheet.addRow([label, value])
    
    // Style the label
    row.getCell(1).font = { bold: true }
    row.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E8F5E8' }
    }
    
    // Style the value with currency formatting
    row.getCell(2).numFmt = '€#,##0.00'
    row.getCell(2).font = { bold: true }
    
    // Color code the net result
    if (index === 2) { // Net result row
      row.getCell(2).font = { 
        bold: true, 
        color: { argb: netResult >= 0 ? '2E7D32' : 'D32F2F' }
      }
    }
    
    row.height = 22
  })
  
  // Set column widths for better appearance
  worksheet.getColumn(1).width = 12  // Date
  worksheet.getColumn(2).width = 30  // Description
  worksheet.getColumn(3).width = 12  // Type
  worksheet.getColumn(4).width = 22  // Amount Inclusive (wider)
  worksheet.getColumn(5).width = 22  // Amount Exclusive (wider)
  worksheet.getColumn(6).width = 22  // VAT Amount
  worksheet.getColumn(7).width = 22  // VAT Percentage
  
  // Auto-fit invoice file column based on content
  const invoiceColumn = worksheet.getColumn(8)
  const invoiceValues = invoiceColumn.values.filter(v => v != null) as string[]
  const maxInvoiceLength = Math.max(...invoiceValues.map(v => v.length), 15) // Minimum 15 characters
  invoiceColumn.width = Math.min(maxInvoiceLength + 2, 60) // Add padding, max 60 characters
  
  return workbook
}

async function createBTWExcel(transactions: any[]): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('BTW Aangifte Export')
  
  // Set up headers
  const headers = [
    'Datum', 'Omschrijving', 'Type', 'Bedrag Exclusief BTW', 
    'BTW Bedrag', 'BTW Percentage', 'BTW Type', 'Factuur Bestand'
  ]
  
  // Add header row with enhanced styling
  const headerRow = worksheet.addRow(headers)
  headerRow.font = { 
    bold: true, 
    color: { argb: 'FFFFFF' },
    size: 12
  }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '70AD47' }
  }
  headerRow.alignment = {
    horizontal: 'center',
    vertical: 'middle'
  }
  
  // Set header row height
  headerRow.height = 25
  
  // Add data rows with enhanced styling
  transactions.forEach((t, index) => {
    const formattedDate = new Date(t.date).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    
    const transactionType = t.type === 'income' ? 'Inkomst' : 'Uitgave'
    const btwType = t.type === 'income' ? 'BTW Verkopen' : 'BTW Aankopen'
    const amountExclusive = t.amountExclusive || 0
    const vatAmount = t.vatAmount !== undefined && t.vatAmount !== null ? t.vatAmount : 0
    const vatPercentage = (t.vatPercentage || 0) / 100 // Convert from percentage to decimal
    const invoiceFile = t.invoiceFile?.originalName || ''
    
    const row = worksheet.addRow([
      formattedDate,
      t.description || '',
      transactionType,
      amountExclusive,
      vatAmount,
      vatPercentage,
      btwType,
      invoiceFile
    ])
    
    // Alternate row colors for better readability
    if (index % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F0F8F0' }
      }
    }
    
    // Style amount columns with currency formatting
    row.getCell(4).numFmt = '€#,##0.00'
    row.getCell(5).numFmt = '€#,##0.00'
    row.getCell(6).numFmt = '0.0%'
    
    // Color code transaction types
    if (t.type === 'income') {
      row.getCell(3).font = { color: { argb: '2E7D32' }, bold: true }
      row.getCell(7).font = { color: { argb: '2E7D32' }, bold: true }
    } else {
      row.getCell(3).font = { color: { argb: 'D32F2F' }, bold: true }
      row.getCell(7).font = { color: { argb: 'D32F2F' }, bold: true }
    }
    
    // Set row height
    row.height = 20
  })
  
  // Add borders to all data
  const dataRange = worksheet.getCell(`A1:H${worksheet.rowCount}`)
  dataRange.border = {
    top: { style: 'thin', color: { argb: 'CCCCCC' } },
    left: { style: 'thin', color: { argb: 'CCCCCC' } },
    bottom: { style: 'thin', color: { argb: 'CCCCCC' } },
    right: { style: 'thin', color: { argb: 'CCCCCC' } }
  }
  
  // Add conditional formatting for better visual feedback
  // Highlight positive amounts in green, negative in red
  const amountColumns = [4, 5, 6] // Amount Exclusive, VAT Amount
  amountColumns.forEach(colIndex => {
    const column = worksheet.getColumn(colIndex)
    column.eachCell((cell, rowNumber) => {
      if (rowNumber > 1 && cell.value !== null && cell.value !== undefined) {
        const value = Number(cell.value)
        if (value > 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'E8F5E8' }
          }
        } else if (value < 0) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEBEE' }
          }
        }
      }
    })
  })
  
  // Add summary section with enhanced styling
  const totalVatIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.vatAmount !== undefined && t.vatAmount !== null ? t.vatAmount : 0), 0)
  const totalVatExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.vatAmount !== undefined && t.vatAmount !== null ? t.vatAmount : 0), 0)
  const vatToPay = totalVatIncome - totalVatExpense
  
  // Add empty row
  worksheet.addRow([])
  
  // Add summary section header
  const summaryHeader = worksheet.addRow(['BTW SAMENVATTING'])
  summaryHeader.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } }
  summaryHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '70AD47' }
  }
  summaryHeader.alignment = { horizontal: 'center' }
  summaryHeader.height = 30
  
  // Add summary rows with enhanced styling
  const summaryRows = [
    ['BTW Verkopen', totalVatIncome],
    ['BTW Aankopen', totalVatExpense],
    ['BTW Te Betalen', vatToPay]
  ]
  
  summaryRows.forEach(([label, value], index) => {
    const row = worksheet.addRow([label, value])
    
    // Style the label
    row.getCell(1).font = { bold: true }
    row.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E8F5E8' }
    }
    
    // Style the value with currency formatting
    row.getCell(2).numFmt = '€#,##0.00'
    row.getCell(2).font = { bold: true }
    
    // Color code the VAT to pay
    if (index === 2) { // VAT to pay row
      row.getCell(2).font = { 
        bold: true, 
        color: { argb: vatToPay >= 0 ? 'D32F2F' : '2E7D32' }
      }
    }
    
    row.height = 22
  })
  
  // Set column widths for better appearance
  worksheet.getColumn(1).width = 12  // Date
  worksheet.getColumn(2).width = 30  // Description
  worksheet.getColumn(3).width = 12  // Type
  worksheet.getColumn(4).width = 22  // Amount Exclusive (wider)
  worksheet.getColumn(5).width = 22  // VAT Amount
  worksheet.getColumn(6).width = 22  // VAT Percentage
  worksheet.getColumn(7).width = 22  // VAT Type
  
  // Auto-fit invoice file column based on content
  const invoiceColumn = worksheet.getColumn(8)
  const invoiceValues = invoiceColumn.values.filter(v => v != null) as string[]
  const maxInvoiceLength = Math.max(...invoiceValues.map(v => v.length), 15) // Minimum 15 characters
  invoiceColumn.width = Math.min(maxInvoiceLength + 2, 60) // Add padding, max 60 characters
  
  return workbook
}

function createSummaryContent(transactions: any[], year: number, month: number): string {
  const monthNames = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ]
  
  const incomeTransactions = transactions.filter(t => t.type === 'income')
  const expenseTransactions = transactions.filter(t => t.type === 'expense')
  
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + (t.amountExclusive || 0), 0)
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + (t.amountExclusive || 0), 0)
  const totalVatIncome = incomeTransactions.reduce((sum, t) => sum + (t.vatAmount !== undefined && t.vatAmount !== null ? t.vatAmount : 0), 0)
  const totalVatExpense = expenseTransactions.reduce((sum, t) => sum + (t.vatAmount !== undefined && t.vatAmount !== null ? t.vatAmount : 0), 0)
  const netResult = totalIncome - totalExpense
  const vatToPay = totalVatIncome - totalVatExpense
  
  const invoiceFiles = transactions
    .filter(t => t.invoiceFile)
    .map(t => t.invoiceFile!.originalName)
    .filter((name, index, arr) => arr.indexOf(name) === index)
  
  // Verbeterde formatting met betere styling
  const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`
  const formatPercentage = (amount: number, total: number) => {
    if (total === 0) return '0.00%'
    return `${((amount / total) * 100).toFixed(2)}%`
  }
  
  return `╔══════════════════════════════════════════════════════════════════════════════╗
║                        VATBUDDY EXPORT SAMENVATTING                                ║
║                        ${monthNames[month - 1]} ${year}                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

📊 ALGEMENE GEGEVENS
─────────────────────────────────────────────────────────────────────────────────
• Totaal aantal transacties: ${transactions.length}
• Aantal inkomsten: ${incomeTransactions.length} (${formatPercentage(incomeTransactions.length, transactions.length)})
• Aantal uitgaven: ${expenseTransactions.length} (${formatPercentage(expenseTransactions.length, transactions.length)})
• Aantal facturen: ${invoiceFiles.length}

💰 FINANCIËLE SAMENVATTING
─────────────────────────────────────────────────────────────────────────────────
• Totaal inkomsten:     ${formatCurrency(totalIncome)}
• Totaal uitgaven:      ${formatCurrency(totalExpense)}
• Resultaat:      ${formatCurrency(netResult)} ${netResult >= 0 ? '✅' : '❌'}

📋 BTW SAMENVATTING
─────────────────────────────────────────────────────────────────────────────────
• BTW op inkomsten:     ${formatCurrency(totalVatIncome)}
• BTW op uitgaven:      ${formatCurrency(totalVatExpense)}
• BTW te betalen:       ${formatCurrency(vatToPay)} ${vatToPay >= 0 ? '💸' : '💰'}

📁 GEÜPLOADE FACTUREN (${invoiceFiles.length})
─────────────────────────────────────────────────────────────────────────────────
${invoiceFiles.length > 0 ? 
  invoiceFiles.map((file, index) => `• ${index + 1}. ${file}`).join('\n') : 
  '• Geen facturen geüpload'
}

📈 MAANDELIJKSE STATISTIEKEN
─────────────────────────────────────────────────────────────────────────────────
• Gemiddelde transactie: ${transactions.length > 0 ? formatCurrency((totalIncome + totalExpense) / transactions.length) : '€0.00'}
• Hoogste BTW percentage: ${Math.max(...transactions.map(t => t.vatPercentage || 0))}%
• Laagste BTW percentage: ${Math.min(...transactions.filter(t => t.vatPercentage).map(t => t.vatPercentage || 0))}%

═══════════════════════════════════════════════════════════════════════════════════
📅 Export gegenereerd op: ${new Date().toLocaleString('nl-NL')}
🔧 VatBuddy versie: 1.0.0
═══════════════════════════════════════════════════════════════════════════════════`
}

