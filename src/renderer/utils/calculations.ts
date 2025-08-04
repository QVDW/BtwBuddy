import { Transaction, MonthlySummary } from '../types'

/**
 * Calculate VAT amount and exclusive amount from inclusive amount
 */
export function calculateFromInclusive(inclusive: number, vatPercentage: number) {
  // Handle 0% VAT case
  if (vatPercentage === 0) {
    return {
      amountExclusive: Math.round(inclusive * 100) / 100,
      vatAmount: 0
    }
  }
  
  const vatAmount = (inclusive * vatPercentage) / (100 + vatPercentage)
  const exclusive = inclusive - vatAmount
  return {
    amountExclusive: Math.round(exclusive * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100
  }
}

/**
 * Calculate VAT amount and inclusive amount from exclusive amount
 */
export function calculateFromExclusive(exclusive: number, vatPercentage: number) {
  // Handle 0% VAT case
  if (vatPercentage === 0) {
    return {
      amountInclusive: Math.round(exclusive * 100) / 100,
      vatAmount: 0
    }
  }
  
  const vatAmount = (exclusive * vatPercentage) / 100
  const inclusive = exclusive + vatAmount
  return {
    amountInclusive: Math.round(inclusive * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100
  }
}

/**
 * Format currency to Dutch format
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

/**
 * Format date to Dutch format
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Get monthly summary from transactions
 */
export function getMonthlySummary(
  transactions: Transaction[],
  year: number,
  month: number
): MonthlySummary {
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date)
    return transactionDate.getFullYear() === year && transactionDate.getMonth() === month - 1
  })

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amountInclusive || 0), 0)

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amountInclusive || 0), 0)

  const totalVat = filteredTransactions
    .reduce((sum, t) => sum + (t.vatAmount !== undefined && t.vatAmount !== null ? t.vatAmount : 0), 0)

  return {
    year,
    month,
    totalIncome,
    totalExpense,
    totalVat,
    netResult: totalIncome - totalExpense,
    transactionCount: filteredTransactions.length
  }
}

/**
 * Get all available years and months from transactions
 */
export function getAvailableMonths(transactions: Transaction[]): Array<{ year: number; month: number }> {
  const months = new Set<string>()
  
  transactions.forEach(t => {
    const date = new Date(t.date)
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`
    months.add(key)
  })

  return Array.from(months)
    .map(key => {
      const [year, month] = key.split('-').map(Number)
      return { year, month }
    })
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
}

/**
 * Validate transaction form data
 */
export function validateTransaction(data: Partial<Transaction>): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.date) {
    errors.date = 'Datum is verplicht'
  }

  if (!data.description?.trim()) {
    errors.description = 'Omschrijving is verplicht'
  }

  if (!data.amountInclusive && !data.amountExclusive) {
    errors.amountInclusive = 'Bedrag inclusief of exclusief BTW is verplicht'
    errors.amountExclusive = 'Bedrag inclusief of exclusief BTW is verplicht'
  }

  if (data.vatPercentage === undefined || data.vatPercentage < 0 || data.vatPercentage > 100) {
    errors.vatPercentage = 'BTW percentage moet tussen 0 en 100 liggen'
  }

  return errors
} 