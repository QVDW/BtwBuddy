import React, { useState } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { AutofillItem } from '../types'
import { formatCurrency } from '../utils/calculations'
import { Paginator } from './Paginator'

interface AutofillTableProps {
  autofillItems: AutofillItem[]
  onEdit: (autofillItem: AutofillItem) => void
  onDelete: (autofillItemId: string) => void
  onUse: (autofillItem: AutofillItem) => void
  compact?: boolean
}

export const AutofillTable: React.FC<AutofillTableProps> = ({
  autofillItems,
  onEdit,
  onDelete,
  onUse,
  compact = false
}) => {
  const [sortField, setSortField] = useState<keyof AutofillItem>('description')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = compact ? 5 : 10

  // Sort autofill items
  const sortedAutofillItems = [...autofillItems].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    
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
  const totalPages = Math.ceil(sortedAutofillItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAutofillItems = sortedAutofillItems.slice(startIndex, endIndex)

  // Reset to first page when sorting changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [sortField, sortDirection])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSort = (field: keyof AutofillItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: keyof AutofillItem) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  if (sortedAutofillItems.length === 0) {
    return (
      <div className="transaction-table">
        <div className="empty-state">
          <div className="empty-message">
            Nog geen autofill items toegevoegd
          </div>
          <div className="empty-subtitle">
            Voeg je eerste autofill item toe om te beginnen
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
                </>
              )}
              <th>Bedrag</th>
              {!compact && <th>Acties</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedAutofillItems.map((autofillItem) => (
              <tr key={autofillItem.id} onClick={() => onUse(autofillItem)} className="clickable-row">
                <td className="description-cell">
                  <div className="description-text" title={autofillItem.description}>
                    {autofillItem.description}
                  </div>
                </td>
                <td className="type-cell">
                  <span className={`type-badge ${
                    autofillItem.type === 'income' ? 'income' : 'expense'
                  }`}>
                    {autofillItem.type === 'income' ? 'Inkomst' : 'Uitgave'}
                  </span>
                </td>
                {!compact && (
                  <>
                    <td className="amount-cell">
                      {autofillItem.amountInclusive ? formatCurrency(autofillItem.amountInclusive) : '-'}
                    </td>
                    <td className="amount-cell">
                      {autofillItem.amountExclusive ? formatCurrency(autofillItem.amountExclusive) : '-'}
                    </td>
                    <td className="vat-cell">
                      {autofillItem.vatAmount !== undefined && autofillItem.vatAmount !== null 
                        ? formatCurrency(autofillItem.vatAmount) 
                        : '-'
                      }
                    </td>
                    <td className="percentage-cell">
                      {autofillItem.vatPercentage}%
                    </td>
                  </>
                )}
                <td className="total-cell">
                  <span className={`${
                    autofillItem.type === 'income' ? 'amount-positive' : 'amount-negative'
                  }`}>
                    {autofillItem.amountExclusive ? formatCurrency(autofillItem.amountExclusive) : '-'}
                  </span>
                </td>
                {!compact && (
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(autofillItem)
                        }}
                        className="action-button"
                        title="Bewerken"
                      >
                        <Edit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(autofillItem.id)
                        }}
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
            {sortedAutofillItems.length} autofill item{sortedAutofillItems.length !== 1 ? 's' : ''}
          </div>
          {totalPages > 1 && (
            <Paginator
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={sortedAutofillItems.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      )}
      
      {compact && (
        <div className="table-footer">
          <div className="table-info">
            {sortedAutofillItems.length} autofill item{sortedAutofillItems.length !== 1 ? 's' : ''}
          </div>
          {totalPages > 1 && (
            <Paginator
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={sortedAutofillItems.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      )}
    </div>
  )
}
