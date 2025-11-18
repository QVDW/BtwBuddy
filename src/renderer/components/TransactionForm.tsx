import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Upload, X, Lock, Unlock } from 'lucide-react'
import { Transaction, FormErrors } from '../types'
import { calculateFromInclusive, calculateFromExclusive, validateTransaction } from '../utils/calculations'

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void
  onCancel: () => void
  transaction?: Transaction | null
  autofillData?: Omit<Transaction, 'id' | 'createdAt'> | null
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  onCancel,
  transaction,
  autofillData
}) => {
  const [formData, setFormData] = useState({
    date: transaction?.date ? new Date(transaction.date) : autofillData?.date ? new Date(autofillData.date) : new Date(),
    description: transaction?.description || autofillData?.description || '',
    type: transaction?.type || autofillData?.type || 'expense' as 'income' | 'expense',
    location: transaction?.location || autofillData?.location || 'Binnenland' as 'Binnenland' | 'Buitenland',
    amountInclusive: transaction?.amountInclusive || autofillData?.amountInclusive || undefined,
    amountExclusive: transaction?.amountExclusive || autofillData?.amountExclusive || undefined,
    vatAmount: transaction?.vatAmount || autofillData?.vatAmount || undefined,
    vatPercentage: transaction?.vatPercentage ?? autofillData?.vatPercentage ?? 21,
    privateUse: transaction?.privateUse || autofillData?.privateUse || undefined,
    invoiceFile: transaction?.invoiceFile
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isUploading, setIsUploading] = useState(false)
  const [activeField, setActiveField] = useState<'inclusive' | 'exclusive' | null>(null)
  const [lockedFields, setLockedFields] = useState({ inclusive: false, exclusive: false })
  const [lastEditedField, setLastEditedField] = useState<'inclusive' | 'exclusive' | null>(null)
  const [showCustomVat, setShowCustomVat] = useState(false)

  // Reset lock state when transaction changes
  useEffect(() => {
    setLockedFields({ inclusive: false, exclusive: false })
    setLastEditedField(null)
    // Check if VAT percentage is a custom value (not 21, 9, or 0)
    const standardVatValues = [21, 9, 0]
    setShowCustomVat(!standardVatValues.includes(formData.vatPercentage ?? 21))
  }, [transaction])

  // Check if VAT percentage is custom when it changes
  useEffect(() => {
    const standardVatValues = [21, 9, 0]
    setShowCustomVat(!standardVatValues.includes(formData.vatPercentage ?? 21))
  }, [formData.vatPercentage])

  // Handle autofill data changes
  useEffect(() => {
    if (autofillData && !transaction) {
      setFormData({
        date: autofillData.date ? new Date(autofillData.date) : new Date(),
        description: autofillData.description || '',
        type: autofillData.type || 'expense',
        location: autofillData.location || 'Binnenland',
        amountInclusive: autofillData.amountInclusive || undefined,
        amountExclusive: autofillData.amountExclusive || undefined,
        vatAmount: autofillData.vatAmount || undefined,
        vatPercentage: autofillData.vatPercentage ?? 21,
        privateUse: autofillData.privateUse || undefined,
        invoiceFile: undefined
      })
      setLockedFields({ inclusive: false, exclusive: false })
      setLastEditedField(null)
      // Check if VAT percentage is a custom value
      const standardVatValues = [21, 9, 0]
      setShowCustomVat(!standardVatValues.includes(autofillData.vatPercentage ?? 21))
    }
  }, [autofillData, transaction])

  // Auto-calculate when amounts change, but respect which field the user is editing and lock states
  useEffect(() => {
    // Only auto-calculate if the user is not actively editing a field
    if (activeField) return

    // Ensure we have a valid VAT percentage
    const vatPercentage = formData.vatPercentage ?? 0

    // Determine which field to use as source for calculation
    // Priority: unlocked field > last edited field > inclusive
    let sourceField: 'inclusive' | 'exclusive' | null = null
    
    const hasInclusive = formData.amountInclusive && formData.amountInclusive > 0
    const hasExclusive = formData.amountExclusive && formData.amountExclusive > 0
    
    // If one is locked, use the unlocked one
    if (lockedFields.inclusive && !lockedFields.exclusive && hasExclusive) {
      sourceField = 'exclusive'
    } else if (lockedFields.exclusive && !lockedFields.inclusive && hasInclusive) {
      sourceField = 'inclusive'
    } else if (!lockedFields.inclusive && !lockedFields.exclusive) {
      // Both unlocked - use last edited, or default to inclusive
      if (hasInclusive && hasExclusive) {
        sourceField = lastEditedField || 'inclusive'
      } else if (hasInclusive) {
        sourceField = 'inclusive'
      } else if (hasExclusive) {
        sourceField = 'exclusive'
      }
    }
    // If both are locked, don't calculate (sourceField remains null)

    // Calculate based on source field
    if (sourceField === 'inclusive' && !lockedFields.inclusive) {
      const { amountExclusive, vatAmount } = calculateFromInclusive(formData.amountInclusive!, vatPercentage)
      setFormData(prev => ({
        ...prev,
        amountExclusive: lockedFields.exclusive ? prev.amountExclusive : amountExclusive,
        vatAmount
      }))
    } else if (sourceField === 'exclusive' && !lockedFields.exclusive) {
      const { amountInclusive, vatAmount } = calculateFromExclusive(formData.amountExclusive!, vatPercentage)
      setFormData(prev => ({
        ...prev,
        amountInclusive: lockedFields.inclusive ? prev.amountInclusive : amountInclusive,
        vatAmount
      }))
    }
  }, [formData.amountInclusive, formData.amountExclusive, formData.vatPercentage, activeField, lockedFields, lastEditedField])



  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Track which field was last edited
    if (field === 'amountInclusive' || field === 'amountExclusive') {
      setLastEditedField(field === 'amountInclusive' ? 'inclusive' : 'exclusive')
    }
    
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
      // The useEffect will handle the calculation
    }, 100)
  }

  const toggleLock = (e: React.MouseEvent<HTMLButtonElement>, field: 'inclusive' | 'exclusive') => {
    e.preventDefault()
    e.stopPropagation()
    setLockedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleFileUpload = async () => {
    setIsUploading(true)
    try {
      const fileData = await window.electronAPI.selectFile()
      if (fileData) {
        setFormData(prev => ({ ...prev, invoiceFile: fileData }))
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, invoiceFile: undefined }))
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
      date: formData.date.toISOString().split('T')[0],
      vatAmount: finalVatAmount
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    onSubmit({
      date: formData.date.toISOString().split('T')[0],
      description: formData.description,
      type: formData.type,
      location: formData.location,
      amountInclusive: formData.amountInclusive,
      amountExclusive: formData.amountExclusive,
      vatAmount: finalVatAmount,
      vatPercentage: vatPercentage,
      privateUse: formData.privateUse,
      invoiceFile: formData.invoiceFile
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
            className={`form-input ${errors.date ? 'error' : ''}`}
            maxDate={new Date()}
          />
          {errors.date && <div className="form-error">{errors.date}</div>}
        </div>

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

        {/* Location */}
        <div className="form-group">
          <label className="form-label">Locatie *</label>
          <select
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value as 'Binnenland' | 'Buitenland')}
            className={`form-input ${errors.location ? 'error' : ''}`}
          >
            <option value="Binnenland">Binnenland</option>
            <option value="Buitenland">Buitenland</option>
          </select>
          {errors.location && <div className="form-error">{errors.location}</div>}
        </div>

        {/* Private Use */}
        <div className="form-group" style={{ gridColumn: 'span 1' }}>
          <label className="form-label" style={{ fontSize: '0.875rem' }}>Prive Gebruik</label>
          <input
            type="number"
            value={formData.privateUse || ''}
            onChange={(e) => handleInputChange('privateUse', parseFloat(e.target.value) || undefined)}
            className="form-input"
            style={{ fontSize: '0.875rem' }}
            step="0.01"
            min="0"
            placeholder="0,00"
          />
        </div>

        {/* VAT Percentage */}
        <div className="form-group">
          <label className="form-label">BTW Percentage *</label>
          <select
            value={showCustomVat ? 'custom' : (formData.vatPercentage ?? 21)}
            onChange={(e) => {
              if (e.target.value === 'custom') {
                setShowCustomVat(true)
                // Keep current value - user can modify it in the input field
              } else {
                setShowCustomVat(false)
                const value = parseFloat(e.target.value)
                handleInputChange('vatPercentage', value)
                // The useEffect will handle recalculation when vatPercentage changes
              }
            }}
            className={`form-input ${errors.vatPercentage ? 'error' : ''}`}
          >
            <option value={21}>21%</option>
            <option value={9}>9%</option>
            <option value={0}>0%</option>
            <option value="custom">Overig</option>
          </select>
          {showCustomVat && (
            <input
              type="number"
              value={formData.vatPercentage ?? ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0
                handleInputChange('vatPercentage', value)
                // The useEffect will handle recalculation when vatPercentage changes
              }}
              className={`form-input ${errors.vatPercentage ? 'error' : ''}`}
              style={{ marginTop: '8px' }}
              min="0"
              max="100"
              step="0.1"
              placeholder="Voer percentage in"
            />
          )}
          {errors.vatPercentage && <div className="form-error">{errors.vatPercentage}</div>}
        </div>

        {/* Amount Inclusive */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Bedrag Inclusief BTW
            <button
              type="button"
              onClick={(e) => toggleLock(e, 'inclusive')}
              onMouseDown={(e) => e.preventDefault()}
              title="Vergrendel dit veld om automatische berekening te voorkomen"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                color: lockedFields.inclusive ? '#4a90e2' : '#72767d',
                outline: 'none'
              }}
            >
              {lockedFields.inclusive ? <Lock size={16} /> : <Unlock size={16} />}
            </button>
          </label>
          <input
            type="number"
            value={formData.amountInclusive || ''}
            onChange={(e) => handleInputChange('amountInclusive', parseFloat(e.target.value) || undefined)}
            onFocus={() => handleAmountFocus('inclusive')}
            onBlur={handleAmountBlur}
            className={`form-input ${errors.amountInclusive ? 'error' : ''} ${activeField === 'inclusive' ? 'active' : ''} ${lockedFields.inclusive ? 'locked' : ''}`}
            style={lockedFields.inclusive ? { color: '#72767d' } : {}}
            step="0.01"
            min="0"
            placeholder="0,00"
          />
          {errors.amountInclusive && <div className="form-error">{errors.amountInclusive}</div>}
        </div>

        {/* Amount Exclusive */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Bedrag Exclusief BTW
            <button
              type="button"
              onClick={(e) => toggleLock(e, 'exclusive')}
              onMouseDown={(e) => e.preventDefault()}
              title="Vergrendel dit veld om automatische berekening te voorkomen"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                color: lockedFields.exclusive ? '#4a90e2' : '#72767d',
                outline: 'none'
              }}
            >
              {lockedFields.exclusive ? <Lock size={16} /> : <Unlock size={16} />}
            </button>
          </label>
          <input
            type="number"
            value={formData.amountExclusive || ''}
            onChange={(e) => handleInputChange('amountExclusive', parseFloat(e.target.value) || undefined)}
            onFocus={() => handleAmountFocus('exclusive')}
            onBlur={handleAmountBlur}
            className={`form-input ${errors.amountExclusive ? 'error' : ''} ${activeField === 'exclusive' ? 'active' : ''} ${lockedFields.exclusive ? 'locked' : ''}`}
            style={lockedFields.exclusive ? { color: '#72767d' } : {}}
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

      {/* File Upload */}
      <div className="file-upload">
        <label className="form-label">Factuur Bestand</label>
        <div className="upload-controls">
          <button
            type="button"
            onClick={handleFileUpload}
            disabled={isUploading}
            className="upload-button"
          >
            <Upload />
            {isUploading ? 'Uploaden...' : 'Bestand Kiezen'}
          </button>
          
          {formData.invoiceFile && (
            <div className="file-info">
              <span className="file-name">
                {formData.invoiceFile.originalName}
              </span>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="remove-button"
              >
                <X />
              </button>
            </div>
          )}
        </div>
      </div>

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
          {transaction ? 'Bijwerken' : 'Toevoegen'}
        </button>
      </div>
    </form>
  )
} 