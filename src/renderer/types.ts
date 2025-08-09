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