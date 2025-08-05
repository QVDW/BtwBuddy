import React, { useState, useEffect } from 'react'
import { Download, CheckCircle, RefreshCw, X, ChevronDown, ChevronUp } from 'lucide-react'

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
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Get app version
    window.electronAPI.getAppVersion().then((versionInfo) => {
      setAppVersion(versionInfo.version)
    })

    // Listen for auto updater status updates
    window.electronAPI.onAutoUpdaterStatus((status: UpdateStatus) => {
      setUpdateStatus(status)
      
      // Only show notification for update-available
      if (status.type === 'update-available') {
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

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded)
  }

  const getStatusIcon = () => {
    switch (updateStatus?.type) {
      case 'update-available':
        return <Download className="status-icon" />
      case 'update-downloaded':
        return <CheckCircle className="status-icon" />
      default:
        return <Download className="status-icon" />
    }
  }

  const getStatusMessage = () => {
    switch (updateStatus?.type) {
      case 'update-available':
        return 'Nieuwe update beschikbaar!'
      case 'update-downloaded':
        return 'Update gedownload! Klik om te installeren.'
      default:
        return 'Update beschikbaar'
    }
  }

  const getStatusColor = () => {
    switch (updateStatus?.type) {
      case 'update-available':
        return 'blue'
      case 'update-downloaded':
        return 'green'
      default:
        return 'blue'
    }
  }

  const shouldShowActionButton = () => {
    return updateStatus?.type === 'update-downloaded'
  }

  const shouldShowExpandButton = () => {
    return updateStatus?.type === 'update-available'
  }

  // Only render if there's an update available and notification should be visible
  if (!isVisible || !updateStatus || updateStatus.type !== 'update-available') {
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
          {shouldShowExpandButton() && (
            <button 
              className="expand-button"
              onClick={toggleExpansion}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
      
      {isExpanded && updateStatus?.type === 'update-available' && (
        <div className="update-expanded-content">
          <div className="update-description">
            {updateStatus.data?.releaseNotes || 'Nieuwe versie beschikbaar voor download.'}
          </div>
          <div className="update-actions-expanded">
            <button 
              className="download-button"
              onClick={() => {
                // Trigger download
                window.electronAPI.checkForUpdates()
              }}
            >
              <Download size={16} />
              Download Update
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 