import React, { useState, useEffect } from 'react'
import { Download, AlertCircle, CheckCircle, RefreshCw, FileText, Trash2, Play, X } from 'lucide-react'
import './UpdateDebugger.scss'

interface UpdateLog {
  timestamp: string
  message: string
  data?: any
}

interface UpdateDebuggerProps {
  onClose: () => void
}

export const UpdateDebugger: React.FC<UpdateDebuggerProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdateStatus, setLastUpdateStatus] = useState<any>(null)
  const [appVersion, setAppVersion] = useState<string>('')

  useEffect(() => {
    // Get app version
    window.electronAPI.getAppVersion().then((versionInfo) => {
      setAppVersion(versionInfo.version)
    })

    // Listen for auto updater status updates
    window.electronAPI.onAutoUpdaterStatus((status: any) => {
      setLastUpdateStatus(status)
      console.log('Update status received:', status)
    })

    // Load initial logs
    loadLogs()
  }, [])

  const loadLogs = async () => {
    setIsLoading(true)
    try {
      const result = await window.electronAPI.getUpdateLogs()
      if (result.success && result.logs) {
        setLogs(result.logs)
      } else {
        setLogs('No logs available')
      }
    } catch (error) {
      setLogs(`Error loading logs: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const clearLogs = async () => {
    setIsLoading(true)
    try {
      const result = await window.electronAPI.clearUpdateLogs()
      if (result.success) {
        setLogs('Logs cleared')
      } else {
        setLogs(`Failed to clear logs: ${result.error}`)
      }
    } catch (error) {
      setLogs(`Error clearing logs: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testUpdateCheck = async () => {
    setIsLoading(true)
    try {
      await window.electronAPI.checkForUpdates()
      setLogs(prev => prev + '\n[Manual] Update check initiated...')
    } catch (error) {
      setLogs(prev => prev + `\n[Manual] Error checking for updates: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (!lastUpdateStatus) return <RefreshCw className="status-icon" />
    
    switch (lastUpdateStatus.type) {
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

  const getStatusColor = () => {
    if (!lastUpdateStatus) return 'gray'
    
    switch (lastUpdateStatus.type) {
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

  const getStatusMessage = () => {
    if (!lastUpdateStatus) return 'No update status available'
    return lastUpdateStatus.data || lastUpdateStatus.type
  }

  return (
    <>
      <div className="update-debugger-backdrop" onClick={onClose}></div>
      <div className="update-debugger">
        <div className="debugger-header">
          <h3>Update Debugger</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="debugger-content">
          {/* Current Status */}
          <div className="status-section">
            <h4>Current Status</h4>
            <div className={`status-display ${getStatusColor()}`}>
              {getStatusIcon()}
              <div className="status-info">
                <div className="status-message">{getStatusMessage()}</div>
                <div className="app-version">App Version: {appVersion}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-section">
            <h4>Actions</h4>
            <div className="action-buttons">
              <button 
                className="action-btn primary" 
                onClick={testUpdateCheck}
                disabled={isLoading}
              >
                <Play size={16} />
                Test Update Check
              </button>
              <button 
                className="action-btn secondary" 
                onClick={loadLogs}
                disabled={isLoading}
              >
                <FileText size={16} />
                Refresh Logs
              </button>
              <button 
                className="action-btn danger" 
                onClick={clearLogs}
                disabled={isLoading}
              >
                <Trash2 size={16} />
                Clear Logs
              </button>
            </div>
          </div>

          {/* Logs Section */}
          <div className="logs-section">
            <h4>Update Logs</h4>
            <div className="logs-container">
              {isLoading ? (
                <div className="loading">Loading logs...</div>
              ) : (
                <pre className="logs-content">{logs}</pre>
              )}
            </div>
          </div>

          {/* Debug Information */}
          <div className="debug-info">
            <h4>Debug Information</h4>
            <div className="info-grid">
              <div className="info-item">
                <strong>App Version:</strong> {appVersion}
              </div>
              <div className="info-item">
                <strong>Platform:</strong> {navigator.platform}
              </div>
              <div className="info-item">
                <strong>User Agent:</strong> {navigator.userAgent}
              </div>
              <div className="info-item">
                <strong>Online:</strong> {navigator.onLine ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 