import React from 'react'
import { Minus, X, Square } from 'lucide-react'

interface TitleBarProps {
  title?: string
}

export const TitleBar: React.FC<TitleBarProps> = ({ title = 'BtwBuddy' }) => {
  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow()
  }

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow()
  }

  const handleClose = () => {
    window.electronAPI?.closeWindow()
  }

  return (
    <div className="titlebar">
      <div className="titlebar-drag-region">
        <div className="titlebar-content">
          <div className="titlebar-title">{title}</div>
        </div>
      </div>
      <div className="titlebar-controls">
        <button 
          className="titlebar-control minimize"
          onClick={handleMinimize}
          title="Minimaliseren"
        >
          <Minus size={16} />
        </button>
        <button 
          className="titlebar-control maximize"
          onClick={handleMaximize}
          title="Maximaliseren"
        >
          <Square size={16} />
        </button>
        <button 
          className="titlebar-control close"
          onClick={handleClose}
          title="Sluiten"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
} 