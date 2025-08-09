import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { AutofillItem } from '../types'
import { AutofillForm } from './AutofillForm'
import { AutofillTable } from './AutofillTable'

interface AutofillPageProps {
  autofillItems: AutofillItem[]
  onAddAutofillItem: (autofillItem: Omit<AutofillItem, 'id' | 'createdAt'>) => void
  onEditAutofillItem: (autofillItem: AutofillItem) => void
  onDeleteAutofillItem: (autofillItemId: string) => void
  onUseAutofillItem: (autofillItem: AutofillItem) => void
}

export const AutofillPage: React.FC<AutofillPageProps> = ({
  autofillItems,
  onAddAutofillItem,
  onEditAutofillItem,
  onDeleteAutofillItem,
  onUseAutofillItem
}) => {
  const [showForm, setShowForm] = useState(false)
  const [editingAutofillItem, setEditingAutofillItem] = useState<AutofillItem | null>(null)

  const handleAddClick = () => {
    setEditingAutofillItem(null)
    setShowForm(true)
  }

  const handleEditClick = (autofillItem: AutofillItem) => {
    setEditingAutofillItem(autofillItem)
    setShowForm(true)
  }

  const handleFormSubmit = (autofillItem: Omit<AutofillItem, 'id' | 'createdAt'>) => {
    if (editingAutofillItem) {
      onEditAutofillItem({ ...editingAutofillItem, ...autofillItem })
    } else {
      onAddAutofillItem(autofillItem)
    }
    setShowForm(false)
    setEditingAutofillItem(null)
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingAutofillItem(null)
  }

  const handleUseAutofillItem = (autofillItem: AutofillItem) => {
    onUseAutofillItem(autofillItem)
  }

  return (
    <div className="content-section">
      <div className="transactions-section">
        <div className="section-header">
          <h3>Autofill Items</h3>
          <button
            className="new-btn"
            onClick={handleAddClick}
          >
            <Plus />
            Voeg Autofill
          </button>
        </div>
        
        <AutofillTable
          autofillItems={autofillItems}
          onEdit={handleEditClick}
          onDelete={onDeleteAutofillItem}
          onUse={handleUseAutofillItem}
        />
      </div>

      {/* Autofill Form Modal */}
      {showForm && (
        <div className="buddy-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {editingAutofillItem ? 'Autofill Item Bewerken' : 'Nieuwe Autofill Item'}
              </h2>
              <button
                className="close-btn"
                onClick={handleFormCancel}
              >
                ×
              </button>
            </div>
            
            <AutofillForm
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              autofillItem={editingAutofillItem}
            />
          </div>
        </div>
      )}
    </div>
  )
}
