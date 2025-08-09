import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { FixedItem } from '../types'
import { calculateFromInclusive, calculateFromExclusive } from '../utils/calculations'

interface QuickTransactionFormProps {
  fixedItem: FixedItem
  onSubmit: (transaction: {
    date: string
    type: 'income' | 'expense'
    amountInclusive?: number
    amountExclusive?: number
    vatAmount?: number
    vatPercentage: number
  }) => void
  onCancel: () => void
}

export const QuickTransactionForm: React.FC<QuickTransactionFormProps> = ({
  fixedItem,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    date: new Date(),
    type: fixedItem.type,
    amountInclusive: fixedItem.amountInclusive,
    amountExclusive: fixedItem.amountExclusive,
    vatAmount: fixedItem.vatAmount,
    vatPercentage: fixedItem.vatPercentage
  })

  const [activeField, setActiveField] = useState<'inclusive' | 'exclusive' | null>(null)

  // Auto-calculate when amounts change, but respect which field the user is editing
  useEffect(() => {
    if (activeField) return

    const vatPercentage = formData.vatPercentage || 0

    if (formData.amountInclusive && formData.amountInclusive > 0) {
      const { amountExclusive, vatAmount } = calculateFromInclusive(formData.amountInclusive, vatPercentage)
      setFormData(prev => ({
        ...prev,
        amountExclusive,
        vatAmount
      }))
    } else if (formData.amountExclusive && formData.amountExclusive > 0) {
      const { amountInclusive, vatAmount } = calculateFromExclusive(formData.amountExclusive, vatPercentage)
      setFormData(prev => ({
        ...prev,
        amountInclusive,
        vatAmount
      }))
    }
  }, [formData.amountInclusive, formData.amountExclusive, activeField])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAmountFocus = (field: 'inclusive' | 'exclusive') => {
    setActiveField(field)
  }

  const handleAmountBlur = () => {
    setTimeout(() => {
      setActiveField(null)
      const vatPercentage = formData.vatPercentage || 0
      
      if (formData.amountInclusive && formData.amountInclusive > 0 && activeField === 'inclusive') {
        const { amountExclusive, vatAmount } = calculateFromInclusive(formData.amountInclusive, vatPercentage)
        setFormData(prev => ({
          ...prev,
          amountExclusive,
          vatAmount
        }))
      } else if (formData.amountExclusive && formData.amountExclusive > 0 && activeField === 'exclusive') {
        const { amountInclusive, vatAmount } = calculateFromExclusive(formData.amountExclusive, vatPercentage)
        setFormData(prev => ({
          ...prev,
          amountInclusive,
          vatAmount
        }))
      }
    }, 100)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Ensure VAT amount is calculated before submission
    let finalVatAmount = formData.vatAmount || 0
    const vatPercentage = formData.vatPercentage || 0
    
    if (!formData.vatAmount && (formData.amountInclusive || formData.amountExclusive)) {
      if (formData.amountInclusive && formData.amountInclusive > 0) {
        const { vatAmount } = calculateFromInclusive(formData.amountInclusive, vatPercentage)
        finalVatAmount = vatAmount
      } else if (formData.amountExclusive && formData.amountExclusive > 0) {
        const { vatAmount } = calculateFromExclusive(formData.amountExclusive, vatPercentage)
        finalVatAmount = vatAmount
      }
    }

    onSubmit({
      date: formData.date.toISOString().split('T')[0],
      type: formData.type,
      amountInclusive: formData.amountInclusive,
      amountExclusive: formData.amountExclusive,
      vatAmount: finalVatAmount,
      vatPercentage: vatPercentage
    })
  }

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <div className="form-grid">
        {/* Date */}
        <div className="form-group">
          <label className="form-label">Datum *</label>
          <DatePicker
            selected={formData.date}
            onChange={(date: Date) => handleInputChange('date', date)}
            dateFormat="dd/MM/yyyy"
            className="form-input"
            maxDate={new Date()}
          />
        </div>

        {/* Transaction Type */}
        <div className="form-group">
          <label className="form-label">Type</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="type"
                value="income"
                checked={formData.type === 'income'}
                onChange={(e) => handleInputChange('type', e.target.value)}
              />
              Inkomst
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="type"
                value="expense"
                checked={formData.type === 'expense'}
                onChange={(e) => handleInputChange('type', e.target.value)}
              />
              Uitgave
            </label>
          </div>
        </div>

        {/* VAT Percentage */}
        <div className="form-group">
          <label className="form-label">BTW Percentage *</label>
          <input
            type="number"
            value={formData.vatPercentage || 0}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0
              handleInputChange('vatPercentage', value)
              
              const vatPercentage = value
              if (formData.amountInclusive && formData.amountInclusive > 0) {
                const { amountExclusive, vatAmount } = calculateFromInclusive(formData.amountInclusive, vatPercentage)
                setFormData(prev => ({
                  ...prev,
                  amountExclusive,
                  vatAmount
                }))
              } else if (formData.amountExclusive && formData.amountExclusive > 0) {
                const { amountInclusive, vatAmount } = calculateFromExclusive(formData.amountExclusive, vatPercentage)
                setFormData(prev => ({
                  ...prev,
                  amountInclusive,
                  vatAmount
                }))
              }
            }}
            className="form-input"
            min="0"
            max="100"
            step="0.1"
            placeholder="21"
          />
        </div>

        {/* Amount Inclusive */}
        <div className="form-group">
          <label className="form-label">Bedrag Inclusief BTW</label>
          <input
            type="number"
            value={formData.amountInclusive || ''}
            onChange={(e) => handleInputChange('amountInclusive', parseFloat(e.target.value) || undefined)}
            onFocus={() => handleAmountFocus('inclusive')}
            onBlur={handleAmountBlur}
            className={`form-input ${activeField === 'inclusive' ? 'active' : ''}`}
            step="0.01"
            min="0"
            placeholder="0,00"
          />
        </div>

        {/* Amount Exclusive */}
        <div className="form-group">
          <label className="form-label">Bedrag Exclusief BTW</label>
          <input
            type="number"
            value={formData.amountExclusive || ''}
            onChange={(e) => handleInputChange('amountExclusive', parseFloat(e.target.value) || undefined)}
            onFocus={() => handleAmountFocus('exclusive')}
            onBlur={handleAmountBlur}
            className={`form-input ${activeField === 'exclusive' ? 'active' : ''}`}
            step="0.01"
            min="0"
            placeholder="0,00"
          />
          <small style={{ color: '#72767d', fontSize: '0.75rem', marginTop: '0.25rem' }}>
            Vul één van de bedragen in, de andere wordt automatisch berekend
          </small>
        </div>
      </div>

      {/* VAT Amount Display */}
      {(formData.vatAmount !== undefined && formData.vatAmount !== null) && (
        <div className="vat-display">
          <div className="vat-label">BTW Bedrag:</div>
          <div className="vat-amount">
            € {formData.vatAmount.toFixed(2)}
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
        >
          Annuleren
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Toevoegen
        </button>
      </div>
    </form>
  )
}
