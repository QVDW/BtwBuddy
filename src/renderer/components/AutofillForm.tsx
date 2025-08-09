import React, { useState, useEffect } from 'react'
import { AutofillItem, FormErrors } from '../types'
import { calculateFromInclusive, calculateFromExclusive, validateTransaction } from '../utils/calculations'

interface AutofillFormProps {
  onSubmit: (autofillItem: Omit<AutofillItem, 'id' | 'createdAt'>) => void
  onCancel: () => void
  autofillItem?: AutofillItem | null
}

export const AutofillForm: React.FC<AutofillFormProps> = ({
  onSubmit,
  onCancel,
  autofillItem
}) => {
  const [formData, setFormData] = useState({
    description: autofillItem?.description || '',
    type: autofillItem?.type || 'expense' as 'income' | 'expense',
    amountInclusive: autofillItem?.amountInclusive || undefined,
    amountExclusive: autofillItem?.amountExclusive || undefined,
    vatAmount: autofillItem?.vatAmount || undefined,
    vatPercentage: autofillItem?.vatPercentage ?? 21
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [activeField, setActiveField] = useState<'inclusive' | 'exclusive' | null>(null)

  // Auto-calculate when amounts change, but respect which field the user is editing
  useEffect(() => {
    // Only auto-calculate if the user is not actively editing a field
    if (activeField) return

    // Ensure we have a valid VAT percentage
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
    
    // Clear errors when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleAmountFocus = (field: 'inclusive' | 'exclusive') => {
    setActiveField(field)
  }

  const handleAmountBlur = () => {
    // Small delay to allow the user to finish typing
    setTimeout(() => {
      setActiveField(null)
      // Trigger calculation after user finishes editing
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
    
    // Recalculate VAT amount if we have amounts but no VAT amount
    if (!formData.vatAmount && (formData.amountInclusive || formData.amountExclusive)) {
      if (formData.amountInclusive && formData.amountInclusive > 0) {
        const { vatAmount } = calculateFromInclusive(formData.amountInclusive, vatPercentage)
        finalVatAmount = vatAmount
      } else if (formData.amountExclusive && formData.amountExclusive > 0) {
        const { vatAmount } = calculateFromExclusive(formData.amountExclusive, vatPercentage)
        finalVatAmount = vatAmount
      }
    }
    
    const validationErrors = validateTransaction({
      ...formData,
      date: new Date().toISOString().split('T')[0], // Use current date for validation
      vatAmount: finalVatAmount
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    onSubmit({
      description: formData.description,
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
        {/* Description */}
        <div className="form-group">
          <label className="form-label">Omschrijving *</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`form-input ${errors.description ? 'error' : ''}`}
            placeholder="Bijv. Factuur klant XYZ"
          />
          {errors.description && <div className="form-error">{errors.description}</div>}
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
              
              // Immediately recalculate BTW when percentage changes
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
            className={`form-input ${errors.vatPercentage ? 'error' : ''}`}
            min="0"
            max="100"
            step="0.1"
            placeholder="21"
          />
          {errors.vatPercentage && <div className="form-error">{errors.vatPercentage}</div>}
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
            className={`form-input ${errors.amountInclusive ? 'error' : ''} ${activeField === 'inclusive' ? 'active' : ''}`}
            step="0.01"
            min="0"
            placeholder="0,00"
          />
          {errors.amountInclusive && <div className="form-error">{errors.amountInclusive}</div>}
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
            className={`form-input ${errors.amountExclusive ? 'error' : ''} ${activeField === 'exclusive' ? 'active' : ''}`}
            step="0.01"
            min="0"
            placeholder="0,00"
          />
          {errors.amountExclusive && <div className="form-error">{errors.amountExclusive}</div>}
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
          {autofillItem ? 'Bijwerken' : 'Voeg Autofill'}
        </button>
      </div>
    </form>
  )
}
