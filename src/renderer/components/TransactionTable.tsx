import React, { useState } from 'react'
import { Edit, Trash2, FileText } from 'lucide-react'
import { Transaction } from '../types'
import { formatCurrency, formatDate } from '../utils/calculations'
import { Paginator } from './Paginator'

interface TransactionTableProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (transactionId: string) => void
  selectedMonth?: { year: number; month: number } | null
  compact?: boolean
  showVatAmount?: boolean
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEdit,
  onDelete,
  selectedMonth,
  compact = false,
  showVatAmount = false
}) => {
  const [sortField, setSortField] = useState<keyof Transaction>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = compact ? 5 : 10

  // Filter transactions by selected month if provided
  const filteredTransactions = selectedMonth
    ? transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return (
          transactionDate.getFullYear() === selectedMonth.year &&
          transactionDate.getMonth() === selectedMonth.month - 1
        )
      })
    : transactions

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
    if (sortField === 'date') {
      const dateA = new Date(aValue as string).getTime()
      const dateB = new Date(bValue as string).getTime()
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })

  // Pagination logic
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex)

  // Reset to first page when sorting changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [sortField, sortDirection, selectedMonth])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: keyof Transaction) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  const openInvoiceFile = (transaction: Transaction) => {
    if (transaction.invoiceFile) {
      // In a real app, you might want to open the file with the default application
  
    }
  }

  if (sortedTransactions.length === 0) {
    return (
      <div className="transaction-table">
        <div className="empty-state">
          <div className="empty-message">
            {selectedMonth 
              ? `Geen transacties gevonden voor ${selectedMonth.month}/${selectedMonth.year}`
              : 'Nog geen transacties toegevoegd'
            }
          </div>
          <div className="empty-subtitle">
            Voeg je eerste transactie toe om te beginnen
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`transaction-table ${compact ? '' : 'card'}`}>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort('date')}>
                Datum {getSortIcon('date')}
              </th>
              <th onClick={() => handleSort('description')}>
                Omschrijving {getSortIcon('description')}
              </th>
              <th onClick={() => handleSort('type')}>
                Type {getSortIcon('type')}
              </th>
              {!compact && (
                <>
                  <th>Bedrag Inclusief BTW</th>
                  <th>Bedrag Exclusief BTW</th>
                  <th>BTW Bedrag</th>
                  <th>BTW %</th>
                  <th>Factuur</th>
                </>
              )}
              <th>{showVatAmount ? 'BTW Bedrag' : 'Bedrag'}</th>
              {!compact && <th>Acties</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="date-cell">
                  {formatDate(transaction.date)}
                </td>
                <td className="description-cell">
                  <div className="description-text" title={transaction.description}>
                    {transaction.description}
                  </div>
                </td>
                <td className="type-cell">
                  <span className={`type-badge ${
                    transaction.type === 'income' ? 'income' : 'expense'
                  }`}>
                    {transaction.type === 'income' ? 'Inkomst' : 'Uitgave'}
                  </span>
                </td>
                {!compact && (
                  <>
                    <td className="amount-cell">
                      {transaction.amountInclusive ? formatCurrency(transaction.amountInclusive) : '-'}
                    </td>
                    <td className="amount-cell">
                      {transaction.amountExclusive ? formatCurrency(transaction.amountExclusive) : '-'}
                    </td>
                    <td className="vat-cell">
                      {transaction.vatAmount !== undefined && transaction.vatAmount !== null 
                        ? formatCurrency(transaction.vatAmount) 
                        : '-'
                      }
                    </td>
                    <td className="percentage-cell">
                      {transaction.vatPercentage}%
                    </td>
                    <td className="file-cell">
                      {transaction.invoiceFile ? (
                        <button
                          onClick={() => openInvoiceFile(transaction)}
                          className="file-button"
                          title={transaction.invoiceFile.originalName}
                        >
                          <FileText />
                        </button>
                      ) : (
                        <span className="no-file">-</span>
                      )}
                    </td>
                  </>
                )}
                <td className="total-cell">
                  <span className={`${
                    transaction.type === 'income' ? 'amount-positive' : 'amount-negative'
                  }`}>
                    {showVatAmount 
                      ? (transaction.vatAmount !== undefined && transaction.vatAmount !== null 
                          ? formatCurrency(transaction.vatAmount) 
                          : '-')
                      : (transaction.amountExclusive ? formatCurrency(transaction.amountExclusive) : '-')
                    }
                  </span>
                </td>
                {!compact && (
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        onClick={() => onEdit(transaction)}
                        className="action-button"
                        title="Bewerken"
                      >
                        <Edit />
                      </button>
                      <button
                        onClick={() => onDelete(transaction.id)}
                        className="action-button delete"
                        title="Verwijderen"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {!compact && (
        <div className="table-footer">
          <div className="table-info">
            {sortedTransactions.length} transactie{sortedTransactions.length !== 1 ? 's' : ''} 
            {selectedMonth && ` voor ${selectedMonth.month}/${selectedMonth.year}`}
          </div>
          {totalPages > 1 && (
            <Paginator
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={sortedTransactions.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      )}
      
      {compact && (
        <div className="table-footer">
          <div className="table-info">
            {sortedTransactions.length} transactie{sortedTransactions.length !== 1 ? 's' : ''} 
            {selectedMonth && ` voor ${selectedMonth.month}/${selectedMonth.year}`}
          </div>
          {totalPages > 1 && (
            <Paginator
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={sortedTransactions.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      )}
    </div>
  )
} 