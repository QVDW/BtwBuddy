import React, { useState, useEffect } from 'react'
import { Transaction, AutofillItem } from './types'
import { getMonthlySummary, getAvailableMonths } from './utils/calculations'
import { TransactionForm } from './components/TransactionForm'
import { TransactionTable } from './components/TransactionTable'
import { AutofillPage } from './components/AutofillPage'
import { MonthSelector } from './components/MonthSelector'
import { TitleBar } from './components/TitleBar'
import { Tutorial } from './components/Tutorial'
import { Settings } from './components/Settings'
import { Home } from './components/Home'
import { Plus, BarChart3, FileText, Download, DollarSign, TrendingUp, TrendingDown, Home as HomeIcon, Calendar, Receipt, PieChart, Cog, Zap } from 'lucide-react'
import './App.scss'
import './components/Home.scss'

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [autofillItems, setAutofillItems] = useState<AutofillItem[]>([])
  const [selectedMonth, setSelectedMonth] = useState<{ year: number; month: number } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [autofillData, setAutofillData] = useState<Omit<Transaction, 'id' | 'createdAt'> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'home' | 'overview' | 'transactions' | 'reports' | 'tax' | 'vat' | 'autofill'>('home')
  const [showTutorial, setShowTutorial] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false)

  useEffect(() => {
    loadTransactions()
    
    // Check if user has seen tutorial before
    const tutorialSeen = localStorage.getItem('btwbuddy-tutorial-seen')
    if (!tutorialSeen) {
      setShowTutorial(true)
    }
  }, [])

  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      const data = await window.electronAPI.getTransactions()
      setTransactions(data)
      
      // Load autofill items
      const autofillData = await window.electronAPI.getAutofillItems()
      setAutofillItems(autofillData || [])
      
      // Set current month as default
      const now = new Date()
      setSelectedMonth({ year: now.getFullYear(), month: now.getMonth() + 1 })
    } catch (err) {
      setError('Fout bij het laden van transacties')
      console.error('Error loading transactions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const newTransaction = await window.electronAPI.saveTransaction(transaction)
      setTransactions(prev => [...prev, newTransaction])
      setShowForm(false)
      setEditingTransaction(null)
      setAutofillData(null)
    } catch (err) {
      setError('Fout bij het opslaan van transactie')
      console.error('Error saving transaction:', err)
    }
  }

  const handleEditTransaction = async (transaction: Transaction) => {
    try {
      const updatedTransaction = await window.electronAPI.updateTransaction(transaction)
      setTransactions(prev => prev.map(t => t.id === transaction.id ? updatedTransaction : t))
      setShowForm(false)
      setEditingTransaction(null)
      setAutofillData(null)
    } catch (err) {
      setError('Fout bij het bijwerken van transactie')
      console.error('Error updating transaction:', err)
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm('Weet je zeker dat je deze transactie wilt verwijderen?')) return
    
    try {
      await window.electronAPI.deleteTransaction(transactionId)
      setTransactions(prev => prev.filter(t => t.id !== transactionId))
    } catch (err) {
      setError('Fout bij het verwijderen van transactie')
      console.error('Error deleting transaction:', err)
    }
  }

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  // Autofill handlers
  const handleAddAutofillItem = async (autofillItem: Omit<AutofillItem, 'id' | 'createdAt'>) => {
    try {
      const newAutofillItem = await window.electronAPI.saveAutofillItem(autofillItem)
      setAutofillItems(prev => [...prev, newAutofillItem])
    } catch (err) {
      setError('Fout bij het opslaan van autofill item')
      console.error('Error saving autofill item:', err)
    }
  }

  const handleEditAutofillItem = async (autofillItem: AutofillItem) => {
    try {
      const updatedAutofillItem = await window.electronAPI.updateAutofillItem(autofillItem)
      setAutofillItems(prev => prev.map(item => item.id === autofillItem.id ? updatedAutofillItem : item))
    } catch (err) {
      setError('Fout bij het bijwerken van autofill item')
      console.error('Error updating autofill item:', err)
    }
  }

  const handleDeleteAutofillItem = async (autofillItemId: string) => {
    if (!confirm('Weet je zeker dat je dit autofill item wilt verwijderen?')) return
    
    try {
      await window.electronAPI.deleteAutofillItem(autofillItemId)
      setAutofillItems(prev => prev.filter(item => item.id !== autofillItemId))
    } catch (err) {
      setError('Fout bij het verwijderen van autofill item')
      console.error('Error deleting autofill item:', err)
    }
  }

  const handleUseAutofillItem = (autofillItem: AutofillItem) => {
    // Create a transaction from the autofill item
    const transaction: Omit<Transaction, 'id' | 'createdAt'> = {
      date: new Date().toISOString().split('T')[0],
      description: autofillItem.description,
      type: autofillItem.type,
      amountInclusive: autofillItem.amountInclusive,
      amountExclusive: autofillItem.amountExclusive,
      vatAmount: autofillItem.vatAmount,
      vatPercentage: autofillItem.vatPercentage
    }
    
    // Set the autofill data and show the form
    setAutofillData(transaction)
    setEditingTransaction(null)
    setShowForm(true)
  }

  const handleExportMonth = async () => {
    if (!selectedMonth) {
      alert('Selecteer eerst een maand om te exporteren')
      return
    }

    try {
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date)
        return (
          transactionDate.getFullYear() === selectedMonth.year &&
          transactionDate.getMonth() === selectedMonth.month - 1
        )
      })

      const files = monthTransactions
        .filter(t => t.invoiceFile)
        .map(t => t.invoiceFile!)
        .filter((file, index, arr) => 
          arr.findIndex(f => f.originalName === file.originalName) === index
        )

      const exportData = {
        year: selectedMonth.year,
        month: selectedMonth.month,
        transactions: monthTransactions,
        files
      }

      const result = await window.electronAPI.exportMonth(exportData)
      
      if (result.success) {
        alert(`Export succesvol opgeslagen in: ${result.path}\n\nDe export bevat:\n• Excel bestand voor Belastingdienst (belastingdienst-${selectedMonth.year}-${selectedMonth.month.toString().padStart(2, '0')}.xlsx)\n• Excel bestand voor BTW Aangifte (btw-aangifte-${selectedMonth.year}-${selectedMonth.month.toString().padStart(2, '0')}.xlsx)\n• Samenvatting bestand\n• Alle geüploade facturen voor deze maand`)
      } else {
        alert(`Export mislukt: ${result.error}`)
      }
    } catch (err) {
      setError('Fout bij het exporteren')
      console.error('Error exporting:', err)
    }
  }

  const monthlySummary = selectedMonth ? getMonthlySummary(transactions, selectedMonth.year, selectedMonth.month) : null
  const availableMonths = getAvailableMonths(transactions)

  const handleTutorialComplete = () => {
    setShowTutorial(false)
    setHasSeenTutorial(true)
    localStorage.setItem('btwbuddy-tutorial-seen', 'true')
  }

  const handleTutorialSkip = () => {
    setShowTutorial(false)
    setHasSeenTutorial(true)
    localStorage.setItem('btwbuddy-tutorial-seen', 'true')
  }

  const handleHelpClose = () => {
    setShowHelp(false)
  }

  const handleShowTutorial = () => {
    setShowTutorial(true)
    setShowSettings(false)
  }

  const handleShowHelp = () => {
    setShowHelp(true)
    setShowSettings(false)
  }

  const handleShowSettings = () => {
    setShowSettings(true)
  }

  const handleCloseSettings = () => {
    setShowSettings(false)
  }

  const handleExportAllData = async () => {
    try {
      const exportData = {
        transactions,
        settings: {
          hasSeenTutorial,
          selectedMonth
        }
      }

      // Create a JSON file and download it
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `btwbuddy-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      alert('Alle gegevens succesvol geëxporteerd')
    } catch (err) {
      setError('Fout bij het exporteren van alle gegevens')
      console.error('Error exporting all data:', err)
    }
  }

  const handleImportData = async () => {
    try {
      // Create a file input element
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            try {
              const data = JSON.parse(e.target?.result as string)
              if (data.transactions) {
                setTransactions(data.transactions)
                alert('Gegevens succesvol geïmporteerd')
              } else {
                alert('Ongeldig bestand formaat')
              }
            } catch (err) {
              alert('Fout bij het lezen van het bestand')
            }
          }
          reader.readAsText(file)
        }
      }
      input.click()
    } catch (err) {
      setError('Fout bij het importeren van gegevens')
      console.error('Error importing data:', err)
    }
  }

  const handleClearAllData = async () => {
    try {
      // Clear all data from electron-store (permanent storage)
      await window.electronAPI.clearAllData()
      
      // Clear local state
      setTransactions([])
      setSelectedMonth({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 })
      setHasSeenTutorial(false)
      localStorage.removeItem('btwbuddy-tutorial-seen')
      
      alert('Alle gegevens zijn permanent gewist van je PC')
    } catch (err) {
      setError('Fout bij het wissen van gegevens')
      console.error('Error clearing data:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="buddy-loading">
        <div className="loading-content">
          <div className="spinner"></div>
          <p>BtwBuddy laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="buddy-app">
      <TitleBar title="BtwBuddy" />
      <div className="buddy-content" style={{ cursor: 'default' }}>
        {/* buddy Server List (Left) */}
        <div className="buddy-server-list">
          {/* Home Server */}
          <div 
            className={`server-icon ${activeTab === 'home' ? 'active' : 'home'}`}
            onClick={() => setActiveTab('home')}
            title="Home"
          >
            <HomeIcon />
          </div>
          
          {/* Separator */}
          <div className="separator"></div>
          
          {/* Action Servers */}
          <div 
            className="server-icon action"
            onClick={() => setShowForm(true)}
            title="Nieuwe Transactie"
          >
            <Plus />
          </div>
          
          <div 
            className={`server-icon ${activeTab === 'overview' ? 'active' : 'action'}`}
            onClick={() => setActiveTab('overview')}
            title="Overzicht"
          >
            <BarChart3 />
          </div>
          
          <div 
            className={`server-icon ${activeTab === 'transactions' ? 'active' : 'action'}`}
            onClick={() => setActiveTab('transactions')}
            title="Transacties"
          >
            <FileText />
          </div>
          
          <div 
            className={`server-icon ${activeTab === 'autofill' ? 'active' : 'action'}`}
            onClick={() => setActiveTab('autofill')}
            title="Autofill"
          >
            <Zap />
          </div>
          
          <div 
            className={`server-icon ${activeTab === 'reports' ? 'active' : 'action'}`}
            onClick={() => setActiveTab('reports')}
            title="Rapporten"
          >
            <PieChart />
          </div>
          
          <div 
            className={`server-icon ${activeTab === 'tax' ? 'active' : 'action'}`}
            onClick={() => setActiveTab('tax')}
            title="Belastingaangifte"
          >
            <Receipt />
          </div>
          
          <div 
            className={`server-icon ${activeTab === 'vat' ? 'active' : 'action'}`}
            onClick={() => setActiveTab('vat')}
            title="BTW Aangifte"
          >
            <DollarSign />
          </div>
          
          {/* Separator */}
          <div className="separator separator-bottom"></div>
          
          {/* Settings */}
          <div 
            className="server-icon action" 
            title="Instellingen"
            onClick={handleShowSettings}
          >
            <Cog />
          </div>
        </div>

        {/* buddy Month Selector (Middle) */}
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          availableMonths={availableMonths}
        />

        {/* buddy Chat Area (Right) */}
        <div className="buddy-chat-area">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="header-left">
                             <h2>
                 {activeTab === 'home' && 'Home'}
                 {activeTab === 'overview' && 'Overzicht'}
                 {activeTab === 'transactions' && 'Transacties'}
                 {activeTab === 'autofill' && 'Autofill'}
                 {activeTab === 'reports' && 'Rapporten'}
                 {activeTab === 'tax' && 'Belastingaangifte'}
                 {activeTab === 'vat' && 'BTW Aangifte'}
               </h2>
              {selectedMonth && (
                <span className="month-indicator">
                  {selectedMonth.month}/{selectedMonth.year}
                </span>
              )}
            </div>
            
            <div className="header-right">
              {selectedMonth && (
                <button
                  className="export-btn"
                  onClick={handleExportMonth}
                  title="Exporteer deze maand naar een gekozen map met Excel bestanden voor Belastingdienst en BTW Aangifte, inclusief alle facturen"
                >
                  <Download />
                  Exporteren
                </button>
              )}
            </div>
          </div>

          {/* Chat Content */}
          <div className="chat-content">
            {error && (
              <div className="alert alert-danger">
                {error}
                <button onClick={() => setError(null)}>×</button>
              </div>
            )}

            {/* Home Tab */}
            {activeTab === 'home' && (
              <Home 
                transactions={transactions}
                onNavigate={setActiveTab}
                onAddTransaction={() => setShowForm(true)}
              />
            )}

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="content-section">
                {/* Summary Cards */}
                {monthlySummary && (
                  <div className="summary-cards">
                    <div className="card">
                      <div className="card-content">
                        <div className="icon green">
                          <TrendingUp />
                        </div>
                        <div className="text">
                          <div className="label">Totale Inkomsten</div>
                          <div className="value">€{monthlySummary.totalIncome.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-content">
                        <div className="icon red">
                          <TrendingDown />
                        </div>
                        <div className="text">
                          <div className="label">Totale Uitgaven</div>
                          <div className="value">€{monthlySummary.totalExpense.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-content">
                        <div className="icon blue">
                          <DollarSign />
                        </div>
                        <div className="text">
                          <div className="label">Resultaat</div>
                          <div className={`value ${monthlySummary.netResult >= 0 ? 'positive' : 'negative'}`}>
                            €{monthlySummary.netResult.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Transactions */}
                <div className="transactions-section">
                  <div className="section-header">
                    <h3>Recente Transacties</h3>
                    <button
                      className="new-btn"
                      onClick={() => setActiveTab('transactions')}
                    >
                      Bekijk alle
                    </button>
                  </div>
                                                       <TransactionTable
                    transactions={transactions}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteTransaction}
                    selectedMonth={selectedMonth}
                    compact={true}
                  />
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="content-section">
                <div className="transactions-section">
                  <div className="section-header">
                    <h3>Alle Transacties</h3>
                    <button
                      className="new-btn"
                      onClick={() => setShowForm(true)}
                    >
                      <Plus />
                      Nieuwe Transactie
                    </button>
                  </div>
                  
                  <TransactionTable
                    transactions={transactions}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteTransaction}
                    selectedMonth={selectedMonth}
                  />
                </div>
              </div>
            )}

            {/* Autofill Tab */}
            {activeTab === 'autofill' && (
              <AutofillPage
                autofillItems={autofillItems}
                onAddAutofillItem={handleAddAutofillItem}
                onEditAutofillItem={handleEditAutofillItem}
                onDeleteAutofillItem={handleDeleteAutofillItem}
                onUseAutofillItem={handleUseAutofillItem}
              />
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="content-section reports-section">
                {monthlySummary && (
                  <div className="reports-grid">
                    <div className="report-card">
                      <div className="card-header">
                        <h3 className="card-title">Maandoverzicht</h3>
                        <div className="card-icon">
                          <BarChart3 />
                        </div>
                      </div>
                      <div className="card-content">
                        <div className="metric-row">
                          <span className="metric-label">Totale Inkomsten</span>
                          <span className="metric-value positive">€{monthlySummary.totalIncome.toFixed(2)}</span>
                        </div>
                        <div className="metric-row">
                          <span className="metric-label">Totale Uitgaven</span>
                          <span className="metric-value negative">€{monthlySummary.totalExpense.toFixed(2)}</span>
                        </div>
                        <div className="metric-row">
                          <span className="metric-label">Resultaat</span>
                          <span className={`metric-value ${monthlySummary.netResult >= 0 ? 'positive' : 'negative'}`}>
                            €{monthlySummary.netResult.toFixed(2)}
                          </span>
                        </div>
                        <div className="metric-row">
                          <span className="metric-label">Aantal Transacties</span>
                          <span className="metric-value neutral">{monthlySummary.transactionCount}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="report-card">
                      <div className="card-header">
                        <h3 className="card-title">BTW Overzicht</h3>
                        <div className="card-icon">
                          <DollarSign />
                        </div>
                      </div>
                      <div className="card-content">
                        <div className="metric-row">
                          <span className="metric-label">BTW Inkomsten</span>
                          <span className="metric-value positive">€{monthlySummary.totalVatIncome?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="metric-row">
                          <span className="metric-label">BTW Uitgaven</span>
                          <span className="metric-value negative">€{monthlySummary.totalVatExpense?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="metric-row">
                          <span className="metric-label">BTW Saldo</span>
                          <span className={`metric-value ${
                            (monthlySummary.totalVatIncome || 0) - (monthlySummary.totalVatExpense || 0) >= 0 
                              ? 'positive' 
                              : 'negative'
                          }`}>
                            €{((monthlySummary.totalVatIncome || 0) - (monthlySummary.totalVatExpense || 0)).toFixed(2)}
                          </span>
                        </div>
                        <div className="metric-row">
                          <span className="metric-label">BTW Percentage</span>
                          <span className="metric-value neutral">
                            {monthlySummary.totalIncome > 0 
                              ? `${((monthlySummary.totalVat || 0) / monthlySummary.totalIncome * 100).toFixed(1)}%`
                              : '0%'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Section */}
                {monthlySummary && monthlySummary.totalIncome > 0 && (
                  <div className="progress-section">
                    <div className="progress-header">
                      <h3 className="progress-title">Inkomsten vs Uitgaven Verhouding</h3>
                      <span className="progress-percentage">
                        {((monthlySummary.totalIncome / (monthlySummary.totalIncome + monthlySummary.totalExpense)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${Math.min((monthlySummary.totalIncome / (monthlySummary.totalIncome + monthlySummary.totalExpense)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <div className="progress-labels">
                      <div>
                        <span className="label">Inkomsten:</span>
                        <span className="value">€{monthlySummary.totalIncome.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="label">Uitgaven:</span>
                        <span className="value">€{monthlySummary.totalExpense.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tax Tab (Belastingaangifte) */}
            {activeTab === 'tax' && (
              <div className="content-section reports-section">
                <div className="reports-grid">
                  <div className="report-card">
                    <div className="card-header">
                      <h3 className="card-title">Jaaroverzicht Belasting</h3>
                      <div className="card-icon">
                        <Receipt />
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="metric-row">
                        <span className="metric-label">Totale Inkomsten (Jaar)</span>
                        <span className="metric-value positive">
                          €{transactions
                            .filter(t => t.type === 'income')
                            .reduce((sum, t) => sum + (t.amountInclusive || 0), 0)
                            .toFixed(2)}
                        </span>
                      </div>
                      <div className="metric-row">
                        <span className="metric-label">Totale Uitgaven (Jaar)</span>
                        <span className="metric-value negative">
                          €{transactions
                            .filter(t => t.type === 'expense')
                            .reduce((sum, t) => sum + (t.amountInclusive || 0), 0)
                            .toFixed(2)}
                        </span>
                      </div>
                      <div className="metric-row">
                        <span className="metric-label">Winst (Jaar)</span>
                        <span className={`metric-value ${
                          transactions
                            .filter(t => t.type === 'income')
                            .reduce((sum, t) => sum + (t.amountInclusive || 0), 0) -
                          transactions
                            .filter(t => t.type === 'expense')
                            .reduce((sum, t) => sum + (t.amountInclusive || 0), 0) >= 0 
                            ? 'positive' 
                            : 'negative'
                        }`}>
                          €{(transactions
                            .filter(t => t.type === 'income')
                            .reduce((sum, t) => sum + (t.amountInclusive || 0), 0) -
                          transactions
                            .filter(t => t.type === 'expense')
                            .reduce((sum, t) => sum + (t.amountInclusive || 0), 0))
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="report-card">
                    <div className="card-header">
                      <h3 className="card-title">Belastbaar Inkomen (excl. BTW)</h3>
                      <div className="card-icon">
                        <TrendingUp />
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="metric-row">
                        <span className="metric-label">Bruto Inkomsten (excl. BTW)</span>
                        <span className="metric-value positive">
                          €{transactions
                            .filter(t => t.type === 'income')
                            .reduce((sum, t) => sum + (t.amountExclusive || 0), 0)
                            .toFixed(2)}
                        </span>
                      </div>
                      <div className="metric-row">
                        <span className="metric-label">Aftrekbare Kosten (excl. BTW)</span>
                        <span className="metric-value negative">
                          €{transactions
                            .filter(t => t.type === 'expense')
                            .reduce((sum, t) => sum + (t.amountExclusive || 0), 0)
                            .toFixed(2)}
                        </span>
                      </div>
                      <div className="metric-row">
                        <span className="metric-label">Belastbaar Inkomen (excl. BTW)</span>
                        <span className="metric-value positive">
                          €{Math.max(0, transactions
                            .filter(t => t.type === 'income')
                            .reduce((sum, t) => sum + (t.amountExclusive || 0), 0) -
                          transactions
                            .filter(t => t.type === 'expense')
                            .reduce((sum, t) => sum + (t.amountExclusive || 0), 0))
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="section-header">
                  <h3>Alle Transacties voor Belastingaangifte</h3>
                  <button
                    className="new-btn"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus />
                    Nieuwe Transactie
                  </button>
                </div>
                
                <TransactionTable
                  transactions={transactions}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteTransaction}
                  selectedMonth={selectedMonth}
                />
              </div>
            )}

            {/* VAT Tab (BTW Aangifte) */}
            {activeTab === 'vat' && (
              <div className="content-section reports-section">
                <div className="reports-grid">
                  <div className="report-card">
                    <div className="card-header">
                      <h3 className="card-title">BTW Overzicht (Jaar)</h3>
                      <div className="card-icon">
                        <DollarSign />
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="metric-row">
                        <span className="metric-label">BTW Inkomsten</span>
                        <span className="metric-value positive">
                          €{transactions
                            .filter(t => t.type === 'income')
                            .reduce((sum, t) => sum + (t.vatAmount || 0), 0)
                            .toFixed(2)}
                        </span>
                      </div>
                      <div className="metric-row">
                        <span className="metric-label">BTW Uitgaven</span>
                        <span className="metric-value negative">
                          €{transactions
                            .filter(t => t.type === 'expense')
                            .reduce((sum, t) => sum + (t.vatAmount || 0), 0)
                            .toFixed(2)}
                        </span>
                      </div>
                      <div className="metric-row">
                        <span className="metric-label">BTW Saldo</span>
                        <span className={`metric-value ${
                          transactions
                            .filter(t => t.type === 'income')
                            .reduce((sum, t) => sum + (t.vatAmount || 0), 0) -
                          transactions
                            .filter(t => t.type === 'expense')
                            .reduce((sum, t) => sum + (t.vatAmount || 0), 0) >= 0 
                            ? 'positive' 
                            : 'negative'
                        }`}>
                          €{(transactions
                            .filter(t => t.type === 'income')
                            .reduce((sum, t) => sum + (t.vatAmount || 0), 0) -
                          transactions
                            .filter(t => t.type === 'expense')
                            .reduce((sum, t) => sum + (t.vatAmount || 0), 0))
                            .toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="report-card">
                    <div className="card-header">
                      <h3 className="card-title">BTW Per Kwartaal</h3>
                      <div className="card-icon">
                        <Calendar />
                      </div>
                    </div>
                    <div className="card-content">
                      <div className="quarter-grid">
                        {[1, 2, 3, 4].map(quarter => {
                          const quarterTransactions = transactions.filter(t => {
                            const date = new Date(t.date)
                            const month = date.getMonth() + 1
                            return Math.ceil(month / 3) === quarter
                          })
                          
                          const vatIncome = quarterTransactions
                            .filter(t => t.type === 'income')
                            .reduce((sum, t) => sum + (t.vatAmount || 0), 0)
                          
                          const vatExpense = quarterTransactions
                            .filter(t => t.type === 'expense')
                            .reduce((sum, t) => sum + (t.vatAmount || 0), 0)
                          
                          const vatBalance = vatIncome - vatExpense
                          
                          return (
                            <div key={quarter} className="quarter-item">
                              <div className="quarter-label">Q{quarter}</div>
                              <div className={`quarter-value ${vatBalance >= 0 ? 'positive' : 'negative'}`}>
                                €{vatBalance.toFixed(2)}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="section-header">
                  <h3>Alle Transacties voor BTW Aangifte</h3>
                  <button
                    className="new-btn"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus />
                    Nieuwe Transactie
                  </button>
                </div>
                
                <TransactionTable
                  transactions={transactions}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteTransaction}
                  selectedMonth={selectedMonth}
                  showVatAmount={true}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* buddy Modal Popup */}
      {showForm && (
        <div className="buddy-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {editingTransaction ? 'Transactie Bewerken' : 'Nieuwe Transactie'}
              </h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowForm(false)
                  setEditingTransaction(null)
                }}
              >
                ×
              </button>
            </div>
            
            <TransactionForm
              onSubmit={editingTransaction ? (transaction) => handleEditTransaction({...editingTransaction, ...transaction}) : handleAddTransaction}
              onCancel={() => {
                setShowForm(false)
                setEditingTransaction(null)
                setAutofillData(null)
              }}
              transaction={editingTransaction}
              autofillData={autofillData}
            />
          </div>
        </div>
      )}

      {/* Tutorial */}
      <Tutorial
        isVisible={showTutorial}
        onClose={handleTutorialSkip}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
        mode="tutorial"
      />

      {/* Help */}
      <Tutorial
        isVisible={showHelp}
        onClose={handleHelpClose}
        onComplete={handleHelpClose}
        onSkip={handleHelpClose}
        mode="help"
      />

      {/* Settings */}
      <Settings
        isVisible={showSettings}
        onClose={handleCloseSettings}
        onShowTutorial={handleShowTutorial}
        onShowHelp={handleShowHelp}
        onExportData={handleExportAllData}
        onImportData={handleImportData}
        onClearData={handleClearAllData}
      />
    </div>
  )
}

export default App 