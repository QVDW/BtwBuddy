import React, { useState } from 'react'
import { Settings as SettingsIcon, Play, Download, Upload, Trash2, Info, HelpCircle, Package } from 'lucide-react'
import { VersionManager } from './VersionManager'
import './Settings.scss'

interface SettingsProps {
  isVisible: boolean
  onClose: () => void
  onShowTutorial: () => void
  onShowHelp: () => void
  onExportData: () => void
  onImportData: () => void
  onClearData: () => void
}

export const Settings: React.FC<SettingsProps> = ({
  isVisible,
  onClose,
  onShowTutorial,
  onShowHelp,
  onExportData,
  onImportData,
  onClearData
}) => {
  const [showVersionManager, setShowVersionManager] = useState(false)

  if (!isVisible) return null

  return (
    <>
      <div className="settings-overlay">
        <div className="settings-modal">
          <div className="settings-header">
            <div className="header-content">
              <SettingsIcon size={24} />
              <h2>Instellingen</h2>
            </div>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="settings-content">
            <div className="settings-section">
              <h3>Hulp & Ondersteuning</h3>
              
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-icon">
                    <Play size={20} />
                  </div>
                  <div className="setting-text">
                    <h4>Tutorial Opnieuw Bekijken</h4>
                    <p>Bekijk de tutorial opnieuw om de functies te leren kennen</p>
                  </div>
                </div>
                <button className="btn-primary" onClick={onShowTutorial}>
                  Start Tutorial
                </button>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-icon">
                    <HelpCircle size={20} />
                  </div>
                  <div className="setting-text">
                    <h4>Hulp</h4>
                    <p>Bekijk de help documentatie voor meer informatie</p>
                  </div>
                </div>
                <button 
                  className="btn-primary" 
                  onClick={onShowHelp}
                >
                  Bekijk Help
                </button>
              </div>
            </div>

            <div className="settings-section">
              <h3>Gegevens Beheer</h3>
              
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-icon">
                    <Download size={20} />
                  </div>
                  <div className="setting-text">
                    <h4>Gegevens Exporteren</h4>
                    <p>Exporteer al je transacties naar een bestand</p>
                  </div>
                </div>
                <button className="btn-primary" onClick={onExportData}>
                  Exporteren
                </button>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-icon">
                    <Upload size={20} />
                  </div>
                  <div className="setting-text">
                    <h4>Gegevens Importeren</h4>
                    <p>Importeer transacties uit een bestand</p>
                  </div>
                </div>
                <button className="btn-secondary" onClick={onImportData}>
                  Importeren
                </button>
              </div>

              <div className="setting-item danger">
                <div className="setting-info">
                  <div className="setting-icon">
                    <Trash2 size={20} />
                  </div>
                  <div className="setting-text">
                    <h4>Alle Gegevens Permanent Wissen</h4>
                    <p>Verwijder alle transacties, instellingen en geüploade bestanden permanent van je PC</p>
                  </div>
                </div>
                <button 
                  className="btn-danger" 
                  onClick={() => {
                    if (confirm('Weet je zeker dat je alle gegevens permanent wilt wissen? Dit verwijdert alle data van je PC en kan niet ongedaan worden gemaakt.')) {
                      onClearData()
                    }
                  }}
                >
                  Permanent Wissen
                </button>
              </div>
            </div>

            <div className="settings-section">
              <h3>Versie Beheer</h3>
              
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-icon">
                    <Package size={20} />
                  </div>
                  <div className="setting-text">
                    <h4>Versie Beheer</h4>
                    <p>Handmatig versies downloaden en installeren</p>
                  </div>
                </div>
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowVersionManager(true)}
                >
                  Open Versie Beheer
                </button>
              </div>
            </div>

            <div className="settings-section">
              <h3>Over BtwBuddy</h3>
              
              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-icon">
                    <Info size={20} />
                  </div>
                  <div className="setting-text">
                    <h4>Versie</h4>
                    <p>BtwBuddy v1.0.2</p>
                  </div>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-icon">
                    <Info size={20} />
                  </div>
                  <div className="setting-text">
                    <h4>Ontwikkelaar</h4>
                    <p>https://github.com/QVDW</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showVersionManager && (
        <VersionManager onClose={() => setShowVersionManager(false)} />
      )}
    </>
  )
} 