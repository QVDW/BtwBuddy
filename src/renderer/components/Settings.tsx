import React, { useState } from 'react'
import { Settings as SettingsIcon, Play, Download, Upload, Trash2, Info, HelpCircle } from 'lucide-react'
import './Settings.scss'

interface SettingsProps {
  isVisible: boolean
  onClose: () => void
  onImport: (file: File) => void
  onExport: () => void
  onClearData: () => void
}

export const Settings: React.FC<SettingsProps> = ({
  isVisible,
  onClose,
  onImport,
  onExport,
  onClearData
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleImport = () => {
    if (selectedFile) {
      onImport(selectedFile)
      setSelectedFile(null)
      onClose()
    }
  }

  const handleExport = () => {
    onExport()
    onClose()
  }

  const handleClearData = () => {
    if (window.confirm('Weet je zeker dat je alle data wilt wissen? Dit kan niet ongedaan worden gemaakt.')) {
      onClearData()
      onClose()
    }
  }

  if (!isVisible) return null

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <div className="header-content">
            <SettingsIcon size={24} />
            <h2>Instellingen</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <span>×</span>
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Data Beheer</h3>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon"><Upload size={20} /></div>
                <div className="setting-text">
                  <h4>Data Importeren</h4>
                  <p>Importeer data uit een Excel bestand</p>
                </div>
              </div>
              <div className="setting-actions">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  id="file-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-input" className="btn-secondary">
                  Bestand Kiezen
                </label>
                {selectedFile && (
                  <button className="btn-primary" onClick={handleImport}>
                    Importeren
                  </button>
                )}
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon"><Download size={20} /></div>
                <div className="setting-text">
                  <h4>Data Exporteren</h4>
                  <p>Exporteer alle data naar een Excel bestand</p>
                </div>
              </div>
              <button className="btn-secondary" onClick={handleExport}>
                Exporteren
              </button>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon"><Trash2 size={20} /></div>
                <div className="setting-text">
                  <h4>Data Wissen</h4>
                  <p>Verwijder alle opgeslagen data</p>
                </div>
              </div>
              <button className="btn-danger" onClick={handleClearData}>
                Wissen
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h3>Over</h3>
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon"><Info size={20} /></div>
                <div className="setting-text">
                  <h4>Versie</h4>
                  <p>BtwBuddy v1.0.7</p>
                </div>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon"><HelpCircle size={20} /></div>
                <div className="setting-text">
                  <h4>Help</h4>
                  <p>Bekijk de handleiding en FAQ</p>
                </div>
              </div>
              <button className="btn-secondary" onClick={() => window.open('https://github.com/QVDW/BtwBuddy', '_blank')}>
                Bekijk
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 