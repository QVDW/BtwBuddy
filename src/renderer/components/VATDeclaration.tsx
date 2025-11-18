import React, { useMemo, useState } from 'react'
import { Transaction } from '../types'
import { calculateFromInclusive, calculateFromExclusive } from '../utils/calculations'
import './VATDeclaration.scss'

interface VATDeclarationProps {
  transactions: Transaction[]
}

interface QuarterData {
  quarter: number
  year: number
  rubriek1a: { omzet: number; btw: number } // Hoog tarief (21%)
  rubriek1b: { omzet: number; btw: number } // Laag tarief (9%)
  rubriek1c: { omzet: number; btw: number } // Overige tarieven (except 0%)
  rubriek1d: { omzet: number; btw: number } // Privégebruik
  rubriek1e: { omzet: number; btw: number } // 0% of niet belast
  voorbelasting: number // BTW van alle uitgaven
}

export const VATDeclaration: React.FC<VATDeclarationProps> = ({ transactions }) => {
  const quarterlyData = useMemo(() => {
    const quarters: QuarterData[] = []
    
    // Get all unique year-quarter combinations
    const yearQuarters = new Set<string>()
    transactions.forEach(t => {
      const date = new Date(t.date)
      const year = date.getFullYear()
      const quarter = Math.floor(date.getMonth() / 3) + 1
      yearQuarters.add(`${year}-Q${quarter}`)
    })
    
    // Initialize data for each quarter
    Array.from(yearQuarters).sort().forEach(yq => {
      const [year, q] = yq.split('-Q')
      const quarter = parseInt(q)
      const yearNum = parseInt(year)
      
      quarters.push({
        quarter,
        year: yearNum,
        rubriek1a: { omzet: 0, btw: 0 },
        rubriek1b: { omzet: 0, btw: 0 },
        rubriek1c: { omzet: 0, btw: 0 },
        rubriek1d: { omzet: 0, btw: 0 },
        rubriek1e: { omzet: 0, btw: 0 },
        voorbelasting: 0
      })
    })
    
    // Process transactions
    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const year = date.getFullYear()
      const quarter = Math.floor(date.getMonth() / 3) + 1
      
      const quarterData = quarters.find(q => q.quarter === quarter && q.year === year)
      if (!quarterData) return
      
      // Process expenses for voorbelasting (input VAT)
      if (transaction.location === 'Binnenland' && transaction.type === 'expense') {
        let vatAmount = transaction.vatAmount || 0
        const vatPercentage = transaction.vatPercentage ?? 0
        
        // If we don't have VAT amount, calculate it
        if (!vatAmount) {
          if (transaction.amountInclusive) {
            const calculated = calculateFromInclusive(transaction.amountInclusive, vatPercentage)
            vatAmount = calculated.vatAmount
          } else if (transaction.amountExclusive && vatPercentage > 0) {
            const calculated = calculateFromExclusive(transaction.amountExclusive, vatPercentage)
            vatAmount = calculated.vatAmount
          }
        }
        
        quarterData.voorbelasting += vatAmount
      }
      
      // Only process Binnenland income transactions for Rubriek 1
      if (transaction.location !== 'Binnenland' || transaction.type !== 'income') {
        return
      }
      
      // Calculate amounts - use proper calculation functions
      let amountExclusive = transaction.amountExclusive || 0
      let vatAmount = transaction.vatAmount || 0
      const vatPercentage = transaction.vatPercentage ?? 0
      const privateUse = transaction.privateUse || 0
      
      // If we have inclusive but not exclusive, calculate exclusive
      if (transaction.amountInclusive && !amountExclusive) {
        const calculated = calculateFromInclusive(transaction.amountInclusive, vatPercentage)
        amountExclusive = calculated.amountExclusive
        if (!vatAmount) {
          vatAmount = calculated.vatAmount
        }
      }
      
      // If we have exclusive but not VAT amount, calculate VAT
      if (amountExclusive && !vatAmount && vatPercentage > 0) {
        const calculated = calculateFromExclusive(amountExclusive, vatPercentage)
        vatAmount = calculated.vatAmount
      }
      
      // Ensure we have valid amounts
      if (!amountExclusive && !vatAmount) {
        return // Skip transactions without valid amounts
      }
      
      // Rubriek 1d: Privégebruik (private use) - this is separate from the main transaction
      if (privateUse > 0) {
        // Calculate VAT on private use based on the transaction's VAT percentage
        const privateUseVat = privateUse * (vatPercentage / 100)
        quarterData.rubriek1d.omzet += privateUse
        quarterData.rubriek1d.btw += privateUseVat
      }
      
      // For regular transactions (the base amount excluding private use)
      const baseAmount = amountExclusive - privateUse
      const baseVat = vatAmount - (privateUse > 0 ? privateUse * (vatPercentage / 100) : 0)
      
      // Only add if we have a valid amount
      if (baseAmount > 0 || baseVat > 0) {
        // Categorize by VAT percentage
        if (vatPercentage === 21) {
          // Rubriek 1a: Hoog tarief (21%)
          quarterData.rubriek1a.omzet += baseAmount
          quarterData.rubriek1a.btw += baseVat
        } else if (vatPercentage === 9) {
          // Rubriek 1b: Laag tarief (9%)
          quarterData.rubriek1b.omzet += baseAmount
          quarterData.rubriek1b.btw += baseVat
        } else if (vatPercentage === 0) {
          // Rubriek 1e: 0% of niet belast
          quarterData.rubriek1e.omzet += baseAmount
          quarterData.rubriek1e.btw += 0
        } else if (vatPercentage > 0) {
          // Rubriek 1c: Overige tarieven (other rates except 0%, 21%, 9%)
          // This includes all custom VAT percentages selected as "Overig"
          quarterData.rubriek1c.omzet += baseAmount
          quarterData.rubriek1c.btw += baseVat
        }
      }
      
    })
    
    return quarters.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.quarter - b.quarter
    })
  }, [transactions])
  
  // State for selected quarter
  const [selectedQuarter, setSelectedQuarter] = useState<string | null>(() => {
    if (quarterlyData.length > 0) {
      const first = quarterlyData[0]
      return `${first.year}-Q${first.quarter}`
    }
    return null
  })
  
  // Update selected quarter when data changes
  React.useEffect(() => {
    if (quarterlyData.length > 0 && !selectedQuarter) {
      const first = quarterlyData[0]
      setSelectedQuarter(`${first.year}-Q${first.quarter}`)
    }
  }, [quarterlyData, selectedQuarter])
  
  const formatCurrency = (amount: number): string => {
    return `€ ${amount.toFixed(2).replace('.', ',')}`
  }
  
  const selectedQuarterData = quarterlyData.find(q => `${q.year}-Q${q.quarter}` === selectedQuarter)
  
  return (
    <div className="vat-declaration">
      <div className="vat-declaration-layout">
        {/* Sidebar with quarters */}
        <div className="vat-sidebar">
          <h3 className="sidebar-title">Kwartalen</h3>
          <div className="quarter-list">
            {quarterlyData.map((quarterData) => {
              const quarterKey = `${quarterData.year}-Q${quarterData.quarter}`
              const isSelected = selectedQuarter === quarterKey
              return (
                <button
                  key={quarterKey}
                  className={`quarter-item ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedQuarter(quarterKey)}
                >
                  <span className="quarter-label">Q{quarterData.quarter}</span>
                  <span className="quarter-year">{quarterData.year}</span>
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Main content */}
        <div className="vat-content">
          <div className="vat-declaration-header">
            <h1>BTW Aangifte Overzicht</h1>
            <p className="subtitle">Overzicht van prestaties binnenland per kwartaal</p>
          </div>
          
          {!selectedQuarterData ? (
            <div className="no-data">
              <p>Geen transacties gevonden voor BTW aangifte.</p>
              <p className="hint">Voeg transacties toe met locatie "Binnenland" om gegevens te zien.</p>
            </div>
          ) : (
            <div className="quarter-section">
              <h2 className="quarter-title">
                Kwartaal {selectedQuarterData.quarter} - {selectedQuarterData.year}
              </h2>
              
              <div className="vat-form">
                {/* Rubriek 1: Prestaties binnenland */}
                <div className="rubriek-section">
                  <h3 className="rubriek-title">Rubriek 1: Prestaties binnenland</h3>
                  
                  <div className="rubriek-item">
                    <div className="item-label">
                      <span>1a. Leveringen/diensten belast met hoog tarief</span>
                      <span className="help-icon" title="Hoog tarief: 21%">?</span>
                    </div>
                    <div className="item-fields">
                      <div className="field-group">
                        <label>Omzet</label>
                        <input 
                          type="text" 
                          value={formatCurrency(selectedQuarterData.rubriek1a.omzet)} 
                          readOnly 
                          className="currency-input"
                        />
                      </div>
                      <div className="field-group">
                        <label>Omzetbelasting</label>
                        <input 
                          type="text" 
                          value={formatCurrency(selectedQuarterData.rubriek1a.btw)} 
                          readOnly 
                          className="currency-input"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="rubriek-item">
                    <div className="item-label">
                      <span>1b. Leveringen/diensten belast met laag tarief</span>
                      <span className="help-icon" title="Laag tarief: 9%">?</span>
                    </div>
                    <div className="item-fields">
                      <div className="field-group">
                        <label>Omzet</label>
                        <input 
                          type="text" 
                          value={formatCurrency(selectedQuarterData.rubriek1b.omzet)} 
                          readOnly 
                          className="currency-input"
                        />
                      </div>
                      <div className="field-group">
                        <label>Omzetbelasting</label>
                        <input 
                          type="text" 
                          value={formatCurrency(selectedQuarterData.rubriek1b.btw)} 
                          readOnly 
                          className="currency-input"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="rubriek-item">
                    <div className="item-label">
                      <span>1c. Leveringen/diensten belast met overige tarieven, behalve 0%</span>
                      <span className="help-icon" title="Overige tarieven (niet 21%, 9% of 0%)">?</span>
                    </div>
                    <div className="item-fields">
                      <div className="field-group">
                        <label>Omzet</label>
                        <input 
                          type="text" 
                          value={formatCurrency(selectedQuarterData.rubriek1c.omzet)} 
                          readOnly 
                          className="currency-input"
                        />
                      </div>
                      <div className="field-group">
                        <label>Omzetbelasting</label>
                        <input 
                          type="text" 
                          value={formatCurrency(selectedQuarterData.rubriek1c.btw)} 
                          readOnly 
                          className="currency-input"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="rubriek-item">
                    <div className="item-label">
                      <span>1d. Privégebruik</span>
                      <span className="help-icon" title="Bedrag voor privégebruik">?</span>
                    </div>
                    <div className="item-fields">
                      <div className="field-group">
                        <label>Omzet</label>
                        <input 
                          type="text" 
                          value={formatCurrency(selectedQuarterData.rubriek1d.omzet)} 
                          readOnly 
                          className="currency-input"
                        />
                      </div>
                      <div className="field-group">
                        <label>Omzetbelasting</label>
                        <input 
                          type="text" 
                          value={formatCurrency(selectedQuarterData.rubriek1d.btw)} 
                          readOnly 
                          className="currency-input"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="rubriek-item">
                    <div className="item-label">
                      <span>1e. Leveringen/diensten belast met 0% of niet bij u belast</span>
                      <span className="help-icon" title="0% BTW of niet belast">?</span>
                    </div>
                    <div className="item-fields">
                      <div className="field-group">
                        <label>Omzet</label>
                        <input 
                          type="text" 
                          value={formatCurrency(selectedQuarterData.rubriek1e.omzet)} 
                          readOnly 
                          className="currency-input"
                        />
                      </div>
                      <div className="field-group">
                        <label>Omzetbelasting</label>
                        <input 
                          type="text" 
                          value={formatCurrency(selectedQuarterData.rubriek1e.btw)} 
                          readOnly 
                          className="currency-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Voorbelasting */}
                <div className="rubriek-section">
                  <div className="rubriek-item">
                    <div className="item-label">
                      <span>5b. Voorbelasting</span>
                      <span className="help-icon" title="BTW van alle uitgaven">?</span>
                    </div>
                    <div className="item-fields">
                      <div className="field-group">
                        <label>Omzetbelasting</label>
                        <input 
                          type="text" 
                          value={formatCurrency(selectedQuarterData.voorbelasting)} 
                          readOnly 
                          className="currency-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

