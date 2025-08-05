import React, { useState, useEffect } from 'react'
import { Download, CheckCircle, AlertCircle, RefreshCw, X, ExternalLink, Info } from 'lucide-react'
import './VersionManager.scss'

interface GitHubRelease {
  id: number
  tag_name: string
  name: string
  body: string
  published_at: string
  assets: Array<{
    id: number
    name: string
    size: number
    browser_download_url: string
  }>
  prerelease: boolean
  draft: boolean
}

interface VersionManagerProps {
  onClose: () => void
}

export const VersionManager: React.FC<VersionManagerProps> = ({ onClose }) => {
  const [releases, setReleases] = useState<GitHubRelease[]>([])
  const [currentVersion, setCurrentVersion] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get current app version
    window.electronAPI.getAppVersion().then((versionInfo) => {
      setCurrentVersion(versionInfo.version)
    })

    // Load available releases
    loadReleases()
  }, [])

  const loadReleases = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('https://api.github.com/repos/QVDW/BtwBuddy/releases')
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }
      
      const releasesData: GitHubRelease[] = await response.json()
      
      // Filter out drafts and sort by published date (newest first)
      const filteredReleases = releasesData
        .filter(release => !release.draft)
        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      
      setReleases(filteredReleases)
    } catch (error) {
      setError(`Failed to load releases: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const getVersionStatus = (version: string) => {
    if (version === currentVersion) return 'current'
    if (isNewerVersion(version, currentVersion)) return 'newer'
    return 'older'
  }

  const isNewerVersion = (version1: string, version2: string) => {
    const v1Parts = version1.replace('v', '').split('.').map(Number)
    const v2Parts = version2.replace('v', '').split('.').map(Number)
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1 = v1Parts[i] || 0
      const v2 = v2Parts[i] || 0
      if (v1 > v2) return true
      if (v1 < v2) return false
    }
    return false
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownloadVersion = async (release: GitHubRelease) => {
    const windowsAsset = release.assets.find(asset => 
      asset.name.includes('.exe') || asset.name.includes('Setup')
    )
    
    if (!windowsAsset) {
      setError('Geen Windows installer gevonden voor deze versie')
      return
    }

    setSelectedVersion(release.tag_name)
    setDownloadProgress({ [release.tag_name]: 0 })
    setError(null)

    try {
      // Simulate download progress (in a real implementation, you'd track actual download progress)
      for (let i = 0; i <= 100; i += 10) {
        setDownloadProgress(prev => ({ ...prev, [release.tag_name]: i }))
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      // Trigger the actual download
      await window.electronAPI.downloadVersion({
        version: release.tag_name,
        downloadUrl: windowsAsset.browser_download_url,
        fileName: windowsAsset.name,
        fileSize: windowsAsset.size
      })

      setDownloadProgress({ [release.tag_name]: 100 })
      
      // Show success message
      setTimeout(() => {
        setSelectedVersion(null)
        setDownloadProgress({})
      }, 2000)

    } catch (error) {
      setError(`Download mislukt: ${error}`)
      setSelectedVersion(null)
      setDownloadProgress({})
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'current':
        return <CheckCircle className="status-icon current" />
      case 'newer':
        return <Download className="status-icon newer" />
      case 'older':
        return <AlertCircle className="status-icon older" />
      default:
        return <Info className="status-icon" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'current':
        return 'Huidige versie'
      case 'newer':
        return 'Nieuwere versie beschikbaar'
      case 'older':
        return 'Oudere versie'
      default:
        return 'Onbekend'
    }
  }

  return (
    <>
      <div className="version-manager-backdrop" onClick={onClose}></div>
      <div className="version-manager">
        <div className="manager-header">
          <h3>Versie Beheer</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="manager-content">
          {/* Current Version */}
          <div className="current-version">
            <h4>Huidige Versie</h4>
            <div className="version-display current">
              <CheckCircle className="status-icon" />
              <div className="version-info">
                <div className="version-number">v{currentVersion}</div>
                <div className="version-status">Geïnstalleerd</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="controls">
            <button 
              className="refresh-btn" 
              onClick={loadReleases}
              disabled={isLoading}
            >
              <RefreshCw className={`refresh-icon ${isLoading ? 'spinning' : ''}`} />
              {isLoading ? 'Laden...' : 'Vernieuwen'}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              {error}
            </div>
          )}

          {/* Available Versions */}
          <div className="versions-section">
            <h4>Beschikbare Versies</h4>
            
            {isLoading ? (
              <div className="loading">Versies laden...</div>
            ) : releases.length === 0 ? (
              <div className="no-versions">Geen versies gevonden</div>
            ) : (
              <div className="versions-list">
                {releases.map((release) => {
                  const status = getVersionStatus(release.tag_name)
                  const windowsAsset = release.assets.find(asset => 
                    asset.name.includes('.exe') || asset.name.includes('Setup')
                  )
                  const isDownloading = selectedVersion === release.tag_name
                  const progress = downloadProgress[release.tag_name] || 0

                  return (
                    <div key={release.id} className={`version-item ${status}`}>
                      <div className="version-header">
                        {getStatusIcon(status)}
                        <div className="version-details">
                          <div className="version-name">{release.name || release.tag_name}</div>
                          <div className="version-date">{formatDate(release.published_at)}</div>
                          <div className="version-status-text">{getStatusText(status)}</div>
                        </div>
                      </div>

                      {release.body && (
                        <div className="version-description">
                          {release.body.length > 200 
                            ? `${release.body.substring(0, 200)}...` 
                            : release.body
                          }
                        </div>
                      )}

                      {windowsAsset && (
                        <div className="version-assets">
                          <div className="asset-info">
                            <span className="asset-name">{windowsAsset.name}</span>
                            <span className="asset-size">{formatFileSize(windowsAsset.size)}</span>
                          </div>
                        </div>
                      )}

                      <div className="version-actions">
                        {status === 'newer' && windowsAsset && (
                          <button
                            className={`download-btn ${isDownloading ? 'downloading' : ''}`}
                            onClick={() => handleDownloadVersion(release)}
                            disabled={isDownloading}
                          >
                            {isDownloading ? (
                              <>
                                <RefreshCw className="spinning" />
                                Downloaden... {progress}%
                              </>
                            ) : (
                              <>
                                <Download />
                                Download & Installeer
                              </>
                            )}
                          </button>
                        )}

                        {status === 'current' && (
                          <div className="current-badge">
                            <CheckCircle />
                            Geïnstalleerd
                          </div>
                        )}

                        <a
                          href={`https://github.com/QVDW/BtwBuddy/releases/tag/${release.tag_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="github-link"
                        >
                          <ExternalLink />
                          Bekijk op GitHub
                        </a>
                      </div>

                      {isDownloading && progress > 0 && progress < 100 && (
                        <div className="download-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 