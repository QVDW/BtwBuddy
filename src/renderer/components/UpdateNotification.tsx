import React, { useState, useEffect } from 'react'
import { Download, CheckCircle, AlertCircle, RefreshCw, X } from 'lucide-react'

interface UpdateStatus {
  type: string
  data: any
}

interface UpdateNotificationProps {
  onClose: () => void
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onClose }) => {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [appVersion, setAppVersion] = useState<string>('')

  useEffect(() => {
    // Get app version
    window.electronAPI.getAppVersion().then((versionInfo) => {
      setAppVersion(versionInfo.version)
    })

    // Listen for auto updater status updates
    window.electronAPI.onAutoUpdaterStatus((status: UpdateStatus) => {
      setUpdateStatus(status)
      
      // Show notification for certain status types
      if (['update-available', 'update-downloaded', 'error'].includes(status.type)) {
        setIsVisible(true)
      }
    })
  }, [])

  const handleCheckForUpdates = () => {
    window.electronAPI.checkForUpdates()
  }

  const handleQuitAndInstall = () => {
    window.electronAPI.quitAndInstall()
  }

  const getStatusIcon = () => {
    switch (updateStatus?.type) {
      case 'update-available':
        return <Download className="status-icon" />
      case 'update-downloaded':
        return <CheckCircle className="status-icon" />
      case 'error':
        return <AlertCircle className="status-icon" />
      case 'checking-for-update':
        return <RefreshCw className="status-icon spinning" />
      default:
        return <CheckCircle className="status-icon" />
    }
  }

  const getStatusMessage = () => {
    switch (updateStatus?.type) {
      case 'update-available':
        return 'Nieuwe update beschikbaar!'
      case 'update-downloaded':
        return 'Update gedownload! Klik om te installeren.'
      case 'error':
        return 'Fout bij het controleren van updates'
      case 'checking-for-update':
        return 'Controleren voor updates...'
      case 'update-not-available':
        return 'Geen updates beschikbaar'
      default:
        return 'Update status onbekend'
    }
  }

  const getStatusColor = () => {
    switch (updateStatus?.type) {
      case 'update-available':
        return 'blue'
      case 'update-downloaded':
        return 'green'
      case 'error':
        return 'red'
      case 'checking-for-update':
        return 'yellow'
      default:
        return 'gray'
    }
  }

  const shouldShowActionButton = () => {
    return updateStatus?.type === 'update-downloaded'
  }

  if (!isVisible && !updateStatus) {
    return null
  }

  return (
    <div className={`update-notification ${getStatusColor()}`}>
      <div className="update-content">
        <div className="update-icon">
          {getStatusIcon()}
        </div>
        <div className="update-info">
          <div className="update-message">{getStatusMessage()}</div>
          <div className="update-details">
            Huidige versie: {appVersion}
            {updateStatus?.type === 'update-available' && updateStatus.data?.version && (
              <span> • Nieuwe versie: {updateStatus.data.version}</span>
            )}
            {updateStatus?.type === 'download-progress' && updateStatus.data && (
              <span> • {Math.round(updateStatus.data.percent)}% gedownload</span>
            )}
          </div>
        </div>
        <div className="update-actions">
          {shouldShowActionButton() && (
            <button 
              className="update-button"
              onClick={handleQuitAndInstall}
            >
              Nu Installeren
            </button>
          )}
          <button 
            className="check-update-button"
            onClick={handleCheckForUpdates}
          >
            <RefreshCw size={16} />
          </button>
          <button 
            className="close-button"
            onClick={() => setIsVisible(false)}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
} 