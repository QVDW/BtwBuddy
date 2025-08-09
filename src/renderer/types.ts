export interface Transaction {
  id: string
  date: string
  description: string
  type: 'income' | 'expense'
  amountInclusive?: number
  amountExclusive?: number
  vatAmount?: number
  vatPercentage: number
  invoiceFile?: InvoiceFile
  createdAt: string
}

export interface AutofillItem {
  id: string
  description: string
  type: 'income' | 'expense'
  amountInclusive?: number
  amountExclusive?: number
  vatAmount?: number
  vatPercentage: number
  createdAt: string
}

export interface InvoiceFile {
  originalName: string
  storedPath: string
}

export interface MonthlySummary {
  year: number
  month: number
  totalIncome: number
  totalExpense: number
  totalVat: number
  totalVatIncome?: number
  totalVatExpense?: number
  netResult: number
  transactionCount: number
}

export interface FormErrors {
  date?: string
  description?: string
  amountInclusive?: string
  amountExclusive?: string
  vatPercentage?: string
}

export interface ExportData {
  year: number
  month: number
  transactions: Transaction[]
  files: InvoiceFile[]
}

export interface ElectronAPI {
  getTransactions: () => Promise<Transaction[]>
  saveTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction>
  updateTransaction: (transaction: Partial<Transaction> & { id: string }) => Promise<Transaction | null>
  deleteTransaction: (transactionId: string) => Promise<boolean>
  clearAllData: () => Promise<boolean>
  getAutofillItems: () => Promise<AutofillItem[]>
  saveAutofillItem: (autofillItem: Omit<AutofillItem, 'id' | 'createdAt'>) => Promise<AutofillItem>
  updateAutofillItem: (autofillItem: Partial<AutofillItem> & { id: string }) => Promise<AutofillItem | null>
  deleteAutofillItem: (autofillItemId: string) => Promise<boolean>
  selectFile: () => Promise<InvoiceFile | null>
  exportMonth: (data: ExportData) => Promise<any>
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
  reloadApp: () => Promise<boolean>
} 