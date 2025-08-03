import React, { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, Star, GripVertical } from 'lucide-react'

interface MonthSelectorProps {
  selectedMonth: { year: number; month: number } | null
  onMonthChange: (month: { year: number; month: number } | null) => void
  availableMonths: { year: number; month: number }[]
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  onMonthChange,
  availableMonths
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [width, setWidth] = useState(240) // Default width
  const containerRef = useRef<HTMLDivElement>(null)
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const monthNames = [
    'Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun',
    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'
  ]

  // Handle resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const newWidth = e.clientX - rect.left
        // Min width: 200px, Max width: 400px
        const clampedWidth = Math.max(200, Math.min(400, newWidth))
        setWidth(clampedWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }
  }, [isResizing])

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
  }

  const handlePreviousMonth = () => {
    if (!selectedMonth) return
    
    let newYear = selectedMonth.year
    let newMonth = selectedMonth.month - 1
    
    if (newMonth < 1) {
      newMonth = 12
      newYear--
    }
    
    onMonthChange({ year: newYear, month: newMonth })
  }

  const handleNextMonth = () => {
    if (!selectedMonth) return
    
    let newYear = selectedMonth.year
    let newMonth = selectedMonth.month + 1
    
    if (newMonth > 12) {
      newMonth = 1
      newYear++
    }
    
    // Don't allow future months
    if (newYear > currentYear || (newYear === currentYear && newMonth > currentMonth)) {
      return
    }
    
    onMonthChange({ year: newYear, month: newMonth })
  }

  const handleCurrentMonth = () => {
    onMonthChange({ year: currentYear, month: currentMonth })
  }

  const handleAllMonths = () => {
    onMonthChange(null)
  }

  const getMonthDisplayName = (year: number, month: number) => {
    return `${monthNames[month - 1]} ${year}`
  }

  const isCurrentMonth = (year: number, month: number) => {
    return year === currentYear && month === currentMonth
  }

  const isSelectedMonth = (year: number, month: number) => {
    return selectedMonth?.year === year && selectedMonth?.month === month
  }

  return (
    <div 
      ref={containerRef}
      className={`buddy-month-selector ${isResizing ? 'resizing' : ''}`}
      style={{ width: `${width}px` }}
    >
      {/* Header */}
      <div className="month-selector-header">
        <div className="header-left">
          <Calendar className="header-icon" />
          <h3>Maanden</h3>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="month-navigation">
        <button
          onClick={handlePreviousMonth}
          disabled={!selectedMonth}
          className="nav-button"
          title="Vorige maand"
        >
          <ChevronLeft />
        </button>

        <div className="month-controls">
          <button
            onClick={handleCurrentMonth}
            className={`month-button current ${isCurrentMonth(currentYear, currentMonth) ? 'active' : ''}`}
          >
            <Clock />
            <span>Huidige</span>
          </button>
          <button
            onClick={handleAllMonths}
            className={`month-button all ${selectedMonth === null ? 'active' : ''}`}
          >
            <Star />
            <span>Alle</span>
          </button>
        </div>

        <button
          onClick={handleNextMonth}
          disabled={!selectedMonth || (
            selectedMonth.year === currentYear && 
            selectedMonth.month === currentMonth
          )}
          className="nav-button"
          title="Volgende maand"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Month List */}
      <div className="month-list">
        <div className="list-header">
          <span>Beschikbare maanden</span>
          <span className="month-count">{availableMonths.length}</span>
        </div>
        
        <div className="month-items">
          {availableMonths.map(({ year, month }) => (
            <button
              key={`${year}-${month}`}
              onClick={() => onMonthChange({ year, month })}
              className={`month-item ${
                isSelectedMonth(year, month) ? 'selected' : ''
              } ${isCurrentMonth(year, month) ? 'current' : ''}`}
            >
              <div className="month-avatar">
                {isCurrentMonth(year, month) ? (
                  <Clock className="avatar-icon" />
                ) : (
                  <Calendar className="avatar-icon" />
                )}
              </div>
              
              <div className="month-info">
                <div className="month-name">
                  {getMonthDisplayName(year, month)}
                </div>
                <div className="month-status">
                  {isCurrentMonth(year, month) ? 'Huidige maand' : 'Beschikbaar'}
                </div>
              </div>

              {isSelectedMonth(year, month) && (
                <div className="selection-indicator">
                  <div className="indicator-dot"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Real Resize Handle - Full height */}
      <div 
        className="resize-handle" 
        onMouseDown={handleResizeStart}
        title="Sleep om breedte aan te passen"
      >
        <GripVertical className="resize-icon" />
      </div>

      {/* Dropdown for additional options */}
      {isDropdownOpen && (
        <div className="month-dropdown">
          <div className="dropdown-header">
            <span>Snelle selectie</span>
          </div>
          <div className="dropdown-items">
            <button
              onClick={() => {
                onMonthChange({ year: currentYear, month: currentMonth })
                setIsDropdownOpen(false)
              }}
              className="dropdown-item"
            >
              <Clock />
              <span>Huidige maand</span>
            </button>
            <button
              onClick={() => {
                onMonthChange(null)
                setIsDropdownOpen(false)
              }}
              className="dropdown-item"
            >
              <Star />
              <span>Alle maanden</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 