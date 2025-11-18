import React, { useState, useEffect } from 'react'
import { FixedItem } from '../types'
import { calculateFromInclusive, calculateFromExclusive, validateTransaction } from '../utils/calculations'
import { Plus, Edit, Trash2, X, Lock, Unlock } from 'lucide-react'

interface FixedItemsManagerProps {
  fixedItems: FixedItem[]
  onSaveFixedItem: (item: Omit<FixedItem, 'id' | 'createdAt'>) => void
  onUpdateFixedItem: (item: FixedItem) => void
  onDeleteFixedItem: (id: string) => void
  onUseFixedItem: (item: FixedItem) => void
  onClose: () => void
  onOpenQuickTransaction: (item: FixedItem) => void
}

export const FixedItemsManager: React.FC<FixedItemsManagerProps> = ({
  fixedItems,
  onSaveFixedItem,
  onUpdateFixedItem,
  onDeleteFixedItem,
  onUseFixedItem,
  onClose,
  onOpenQuickTransaction
}) => {
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<FixedItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    amountInclusive: undefined as number | undefined,
    amountExclusive: undefined as number | undefined,
    vatAmount: undefined as number | undefined,
    vatPercentage: 21
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [activeField, setActiveField] = useState<'inclusive' | 'exclusive' | null>(null)
  const [lockedFields, setLockedFields] = useState({ inclusive: false, exclusive: false })
  const [lastEditedField, setLastEditedField] = useState<'inclusive' | 'exclusive' | null>(null)
  const [showCustomVat, setShowCustomVat] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Track which field was last edited
    if (field === 'amountInclusive' || field === 'amountExclusive') {
      setLastEditedField(field === 'amountInclusive' ? 'inclusive' : 'exclusive')
    }
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleAmountFocus = (field: 'inclusive' | 'exclusive') => {
    setActiveField(field)
  }

  // Reset lock state when editing item changes
  useEffect(() => {
    setLockedFields({ inclusive: false, exclusive: false })
    setLastEditedField(null)
    // Check if VAT percentage is a custom value
    const standardVatValues = [21, 9, 0]
    setShowCustomVat(!standardVatValues.includes(formData.vatPercentage ?? 21))
  }, [editingItem])

  // Check if VAT percentage is custom when it changes
  useEffect(() => {
    const standardVatValues = [21, 9, 0]
    setShowCustomVat(!standardVatValues.includes(formData.vatPercentage ?? 21))
  }, [formData.vatPercentage])

  // Auto-calculate when amounts change, but respect which field the user is editing and lock states
  useEffect(() => {
    if (activeField) return

    const vatPercentage = formData.vatPercentage ?? 0

    // Determine which field to use as source for calculation
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

  const handleAmountBlur = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    const newErrors: {[key: string]: string} = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Naam is verplicht'
    }
    if (!formData.amountInclusive && !formData.amountExclusive) {
      newErrors.amountInclusive = 'Vul minimaal één bedrag in'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Ensure VAT amount is calculated
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

    const itemData = {
      name: formData.name.trim(),
      type: formData.type,
      amountInclusive: formData.amountInclusive,
      amountExclusive: formData.amountExclusive,
      vatAmount: finalVatAmount,
      vatPercentage: vatPercentage
    }

    if (editingItem) {
      onUpdateFixedItem({ ...editingItem, ...itemData })
    } else {
      onSaveFixedItem(itemData)
    }

    handleCancel()
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingItem(null)
    setFormData({
      name: '',
      type: 'expense',
      amountInclusive: undefined,
      amountExclusive: undefined,
      vatAmount: undefined,
      vatPercentage: 21
    })
    setErrors({})
    setLockedFields({ inclusive: false, exclusive: false })
    setLastEditedField(null)
  }

  const handleEdit = (item: FixedItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      type: item.type,
      amountInclusive: item.amountInclusive,
      amountExclusive: item.amountExclusive,
      vatAmount: item.vatAmount,
      vatPercentage: item.vatPercentage
    })
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Weet je zeker dat je dit vaste item wilt verwijderen?')) {
      onDeleteFixedItem(id)
    }
  }

  const handleUse = (item: FixedItem) => {
    console.log('Gebruik button clicked for item:', item)
    onOpenQuickTransaction(item)
  }

  return (
    <div className="fixed-items-manager">
      <div className="manager-header">
        <h2>Vaste Kosten/Inkomsten</h2>
      </div>

      {!showForm ? (
        <div className="manager-content">
          <div className="items-header">
            <h3>Opgeslagen Items</h3>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <Plus />
              Nieuw Item
            </button>
          </div>

          {fixedItems.length === 0 ? (
            <div className="empty-state">
              <p>Nog geen vaste items opgeslagen.</p>
              <p>Voeg je eerste vaste kosten of inkomsten toe om snel transacties toe te voegen.</p>
            </div>
          ) : (
            <div className="fixed-items-list">
              {fixedItems.map((item) => (
                <div key={item.id} className="fixed-item-card">
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-details">
                      <span className={`item-type ${item.type}`}>
                        {item.type === 'income' ? 'Inkomst' : 'Uitgave'}
                      </span>
                      <span className="item-amount">
                        €{item.amountInclusive?.toFixed(2) || item.amountExclusive?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => handleUse(item)}
                      title="Gebruik dit item"
                    >
                      Gebruik
                    </button>
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => handleEdit(item)}
                      title="Bewerken"
                    >
                      <Edit />
                    </button>
                    <button 
                      className="btn btn-sm btn-outline btn-danger"
                      onClick={() => handleDelete(item.id)}
                      title="Verwijderen"
                    >
                      <Trash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="manager-form">
          <div className="form-header">
            <h3>{editingItem ? 'Item Bewerken' : 'Nieuw Item'}</h3>
            <button className="close-btn" onClick={handleCancel}>
              <X />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="fixed-item-form">
            <div className="form-grid">
              {/* Name */}
              <div className="form-group">
                <label className="form-label">Naam *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="Bijv. Netflix abonnement"
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
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

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-outline"
              >
                Annuleren
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                {editingItem ? 'Bijwerken' : 'Opslaan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
