import React from 'react'
import { Transaction } from '../types'
import { TrendingUp, TrendingDown, DollarSign, FileText, PieChart, Receipt, Plus, Calendar, Target, Zap } from 'lucide-react'

interface HomeProps {
  transactions: Transaction[]
  onNavigate: (tab: 'home' | 'overview' | 'transactions' | 'reports' | 'tax' | 'vat') => void
  onAddTransaction: () => void
}

export const Home: React.FC<HomeProps> = ({ transactions, onNavigate, onAddTransaction }) => {
  const totalTransactions = transactions.length
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amountInclusive || 0), 0)
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amountInclusive || 0), 0)
  const netResult = totalIncome - totalExpense

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  const quickActions = [
    {
      icon: <Plus />,
      title: 'Nieuwe Transactie',
      description: 'Voeg een nieuwe inkomsten of uitgaven toe',
      action: () => onAddTransaction(),
      color: 'blue'
    },
    {
      icon: <FileText />,
      title: 'Transacties',
      description: 'Bekijk en beheer al je transacties',
      action: () => onNavigate('transactions'),
      color: 'green'
    },
    {
      icon: <PieChart />,
      title: 'Rapporten',
      description: 'Analyseer je financiële gegevens',
      action: () => onNavigate('reports'),
      color: 'purple'
    },
    {
      icon: <Receipt />,
      title: 'Belastingaangifte',
      description: 'Bereid je belastingaangifte voor',
      action: () => onNavigate('tax'),
      color: 'orange'
    },
    {
      icon: <DollarSign />,
      title: 'BTW Aangifte',
      description: 'Beheer je BTW aangifte',
      action: () => onNavigate('vat'),
      color: 'red'
    }
  ]

  return (
    <div className="home-container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon green">
              <TrendingUp />
            </div>
            <div className="stat-content">
              <div className="stat-value">€{totalIncome.toFixed(2)}</div>
              <div className="stat-label">Totale Inkomsten</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon red">
              <TrendingDown />
            </div>
            <div className="stat-content">
              <div className="stat-value">€{totalExpense.toFixed(2)}</div>
              <div className="stat-label">Totale Uitgaven</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon blue">
              <DollarSign />
            </div>
            <div className="stat-content">
              <div className={`stat-value ${netResult >= 0 ? 'positive' : 'negative'}`}>
                €{netResult.toFixed(2)}
              </div>
              <div className="stat-label">Resultaat</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon purple">
              <FileText />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalTransactions}</div>
              <div className="stat-label">Transacties</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Snelle Acties</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className={`quick-action-card ${action.color}`}
              onClick={action.action}
            >
              <div className="action-icon">
                {action.icon}
              </div>
              <div className="action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentTransactions.length > 0 && (
        <div className="recent-activity-section">
          <h2>Recente Activiteit</h2>
          <div className="recent-transactions">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="recent-transaction">
                <div className="transaction-icon">
                  {transaction.type === 'income' ? <TrendingUp /> : <TrendingDown />}
                </div>
                <div className="transaction-details">
                  <div className="transaction-description">{transaction.description}</div>
                  <div className="transaction-date">
                    {new Date(transaction.date).toLocaleDateString('nl-NL')}
                  </div>
                </div>
                <div className={`transaction-amount ${transaction.type === 'income' ? 'positive' : 'negative'}`}>
                  €{transaction.amountInclusive?.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <button 
            className="view-all-btn"
            onClick={() => onNavigate('transactions')}
          >
            Bekijk alle transacties
          </button>
        </div>
      )}
    </div>
  )
} 