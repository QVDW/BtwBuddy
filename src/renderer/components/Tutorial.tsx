import React, { useState, useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Play, BarChart3, FileText, PieChart, Receipt, DollarSign, Plus, HelpCircle, Search, Settings as SettingsIcon } from 'lucide-react'
import './Tutorial.scss'

interface TutorialStep {
  id: string
  title: string
  description: string
  target?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: () => void
}

interface HelpSection {
  id: string
  title: string
  icon: React.ReactNode
  content: React.ReactNode
}

interface TutorialProps {
  isVisible: boolean
  onClose: () => void
  onComplete: () => void
  onSkip: () => void
  mode?: 'tutorial' | 'help'
}

export const Tutorial: React.FC<TutorialProps> = ({
  isVisible,
  onClose,
  onComplete,
  onSkip,
  mode = 'tutorial'
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [showWelcome, setShowWelcome] = useState(true)
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({})
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const [currentHelpSection, setCurrentHelpSection] = useState<string>('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const highlightRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Reset tutorial when it becomes visible
  useEffect(() => {
    if (isVisible) {
      setCurrentStep(0)
      setShowWelcome(true)
      setHighlightStyle({ display: 'none' })
      setTooltipStyle({})
      setCurrentHelpSection('overview')
      setSearchQuery('')
    }
  }, [isVisible])

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welkom bij BtwBuddy!',
      description: 'Laten we je helpen om snel aan de slag te gaan met je boekhouding. Deze tutorial duurt ongeveer 1 minuut.',
      position: 'center'
    },
    {
      id: 'navigation',
      title: 'Navigatie',
      description: 'Hier vind je alle belangrijke functies. Klik op de verschillende iconen om door de app te navigeren.',
      target: '.buddy-server-list',
      position: 'right'
    },
    {
      id: 'home',
      title: 'Home',
      description: 'Dit is je startpagina. Hier zie je een overzicht van je financiën.',
      target: '.buddy-server-list .server-icon.home',
      position: 'right'
    },
    {
      id: 'add-transaction',
      title: 'Nieuwe Transactie',
      description: 'Klik hier om een nieuwe inkomsten of uitgaven transactie toe te voegen.',
      target: '.buddy-server-list .server-icon.action:nth-child(3)',
      position: 'right'
    },
    {
      id: 'overview',
      title: 'Overzicht',
      description: 'Hier zie je een samenvatting van je maandelijkse inkomsten en uitgaven.',
      target: '.buddy-server-list .server-icon:nth-child(4)',
      position: 'right'
    },
    {
      id: 'transactions',
      title: 'Transacties',
      description: 'Bekijk en beheer al je transacties in één overzicht.',
      target: '.buddy-server-list .server-icon:nth-child(5)',
      position: 'right'
    },
    {
      id: 'reports',
      title: 'Rapporten',
      description: 'Gedetailleerde financiële rapporten en analyses.',
      target: '.buddy-server-list .server-icon:nth-child(6)',
      position: 'right'
    },
    {
      id: 'tax',
      title: 'Belastingaangifte',
      description: 'Specifieke gegevens voor je belastingaangifte.',
      target: '.buddy-server-list .server-icon:nth-child(7)',
      position: 'right'
    },
    {
      id: 'vat',
      title: 'BTW Aangifte',
      description: 'BTW overzichten en kwartaalgegevens voor je BTW aangifte.',
      target: '.buddy-server-list .server-icon:nth-child(8)',
      position: 'right'
    },
    {
      id: 'settings',
      title: 'Instellingen',
      description: 'Beheer je app instellingen en bekijk deze tutorial opnieuw.',
      target: '.buddy-server-list .server-icon:nth-child(10)',
      position: 'right'
    },
    {
      id: 'month-selector',
      title: 'Maand Selector',
      description: 'Selecteer hier de maand waarvan je de gegevens wilt bekijken.',
      target: '.buddy-month-selector',
      position: 'bottom'
    },
    {
      id: 'export',
      title: 'Exporteren',
      description: 'Exporteer je gegevens naar een bestand voor backup of belastingaangifte.',
      target: '.export-btn',
      position: 'left'
    }
  ]

  const helpSections: HelpSection[] = [
    {
      id: 'overview',
      title: 'Overzicht',
      icon: <BarChart3 size={24} />,
      content: (
        <div className="help-content">
          <h3>Welkom bij BtwBuddy Help</h3>
          <p>BtwBuddy is je persoonlijke assistent voor eenvoudige boekhouding en BTW administratie. Hier vind je alles wat je nodig hebt om de app optimaal te gebruiken.</p>
          
          <div className="help-features">
            <div className="feature-item">
              <div className="feature-icon">
                <Plus size={20} />
              </div>
              <div className="feature-text">
                <h4>Transacties Toevoegen</h4>
                <p>Voeg eenvoudig inkomsten en uitgaven toe met automatische BTW berekening</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <FileText size={20} />
              </div>
              <div className="feature-text">
                <h4>Transactie Overzicht</h4>
                <p>Bekijk en beheer al je transacties in één overzicht</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <PieChart size={20} />
              </div>
              <div className="feature-text">
                <h4>Rapporten & Analyses</h4>
                <p>Gedetailleerde financiële rapporten en inzichten</p>
              </div>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <DollarSign size={20} />
              </div>
              <div className="feature-text">
                <h4>BTW Administratie</h4>
                <p>Automatische BTW berekening en aangifte ondersteuning</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'transactions',
      title: 'Transacties',
      icon: <FileText size={24} />,
      content: (
        <div className="help-content">
          <h3>Transacties Beheren</h3>
          
          <div className="help-section">
            <h4>Nieuwe Transactie Toevoegen</h4>
            <ol>
              <li>Klik op de <strong>+</strong> knop in de navigatie</li>
              <li>Vul de transactie gegevens in:
                <ul>
                  <li><strong>Type:</strong> Kies tussen Inkomsten of Uitgaven</li>
                  <li><strong>Bedrag:</strong> Voer het bedrag in (incl. BTW)</li>
                  <li><strong>BTW Percentage:</strong> Kies het juiste BTW tarief</li>
                  <li><strong>Datum:</strong> Selecteer de transactie datum</li>
                  <li><strong>Omschrijving:</strong> Geef een duidelijke beschrijving</li>
                  <li><strong>Categorie:</strong> Kies een passende categorie</li>
                </ul>
              </li>
              <li>Upload eventueel een factuur (PDF, JPG, PNG)</li>
              <li>Klik op &quot;Opslaan&quot;</li>
            </ol>
          </div>
          
          <div className="help-section">
            <h4>Transacties Bewerken</h4>
            <ul>
              <li>Klik op het <strong>bewerk</strong> icoon naast een transactie</li>
              <li>Wijzig de gewenste gegevens</li>
              <li>Klik op &quot;Opslaan&quot; om de wijzigingen toe te passen</li>
            </ul>
          </div>
          
          <div className="help-section">
            <h4>Transacties Verwijderen</h4>
            <ul>
              <li>Klik op het <strong>verwijder</strong> icoon naast een transactie</li>
              <li>Bevestig de verwijdering in het popup venster</li>
              <li><strong>Let op:</strong> Verwijderde transacties kunnen niet worden hersteld</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      title: 'Rapporten',
      icon: <PieChart size={24} />,
      content: (
        <div className="help-content">
          <h3>Rapporten & Analyses</h3>
          
          <div className="help-section">
            <h4>Maandoverzicht</h4>
            <p>Het maandoverzicht toont:</p>
            <ul>
              <li><strong>Totale Inkomsten:</strong> Alle inkomsten van de geselecteerde maand</li>
              <li><strong>Totale Uitgaven:</strong> Alle uitgaven van de geselecteerde maand</li>
              <li><strong>Resultaat:</strong> Het verschil tussen inkomsten en uitgaven</li>
              <li><strong>Aantal Transacties:</strong> Totaal aantal transacties in de maand</li>
            </ul>
          </div>
          
          <div className="help-section">
            <h4>BTW Overzicht</h4>
            <p>Het BTW overzicht bevat:</p>
            <ul>
              <li><strong>BTW Inkomsten:</strong> BTW die je hebt ontvangen</li>
              <li><strong>BTW Uitgaven:</strong> BTW die je hebt betaald</li>
              <li><strong>BTW Saldo:</strong> Het verschil (te betalen of terug te vragen)</li>
              <li><strong>BTW Percentage:</strong> Gemiddeld BTW percentage van je transacties</li>
            </ul>
          </div>
          
          <div className="help-section">
            <h4>Inkomsten vs Uitgaven Verhouding</h4>
            <p>Deze grafiek toont de verhouding tussen je inkomsten en uitgaven, zodat je snel kunt zien hoe je financiën er voor staan.</p>
          </div>
        </div>
      )
    },
    {
      id: 'tax',
      title: 'Belastingaangifte',
      icon: <Receipt size={24} />,
      content: (
        <div className="help-content">
          <h3>Belastingaangifte Ondersteuning</h3>
          
          <div className="help-section">
            <h4>Jaaroverzicht Belasting</h4>
            <p>Dit overzicht toont je totale financiële situatie voor het hele jaar:</p>
            <ul>
              <li><strong>Totale Inkomsten (Jaar):</strong> Alle inkomsten van het hele jaar</li>
              <li><strong>Totale Uitgaven (Jaar):</strong> Alle uitgaven van het hele jaar</li>
              <li><strong>Winst (Jaar):</strong> Het verschil tussen inkomsten en uitgaven</li>
            </ul>
          </div>
          
          <div className="help-section">
            <h4>Belastbaar Inkomen (excl. BTW)</h4>
            <p>Voor je belastingaangifte is het belangrijk om te werken met bedragen exclusief BTW:</p>
            <ul>
              <li><strong>Bruto Inkomsten (excl. BTW):</strong> Je inkomsten zonder BTW</li>
              <li><strong>Aftrekbare Kosten (excl. BTW):</strong> Je uitgaven zonder BTW</li>
              <li><strong>Belastbaar Inkomen (excl. BTW):</strong> Het bedrag waarover je belasting betaalt</li>
            </ul>
          </div>
          
          <div className="help-section">
            <h4>Tips voor Belastingaangifte</h4>
            <ul>
              <li>Houd alle facturen en bonnetjes bij</li>
              <li>Gebruik duidelijke categorieën voor je uitgaven</li>
              <li>Controleer regelmatig je administratie</li>
              <li>Exporteer je gegevens voor je belastingaangifte</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'vat',
      title: 'BTW Aangifte',
      icon: <DollarSign size={24} />,
      content: (
        <div className="help-content">
          <h3>BTW Aangifte Ondersteuning</h3>
          
          <div className="help-section">
            <h4>BTW Overzicht (Jaar)</h4>
            <p>Dit overzicht toont je BTW situatie voor het hele jaar:</p>
            <ul>
              <li><strong>BTW Inkomsten:</strong> BTW die je hebt ontvangen van klanten</li>
              <li><strong>BTW Uitgaven:</strong> BTW die je hebt betaald aan leveranciers</li>
              <li><strong>BTW Saldo:</strong> Het bedrag dat je moet betalen of terugkrijgt</li>
            </ul>
          </div>
          
          <div className="help-section">
            <h4>BTW Per Kwartaal</h4>
            <p>De BTW aangifte wordt per kwartaal gedaan. Dit overzicht toont:</p>
            <ul>
              <li><strong>Q1:</strong> Januari t/m Maart</li>
              <li><strong>Q2:</strong> April t/m Juni</li>
              <li><strong>Q3:</strong> Juli t/m September</li>
              <li><strong>Q4:</strong> Oktober t/m December</li>
            </ul>
            <p>Elk kwartaal toont het BTW saldo dat je moet betalen of terugkrijgt.</p>
          </div>
          
          <div className="help-section">
            <h4>BTW Tips</h4>
            <ul>
              <li>Controleer altijd of het BTW percentage correct is ingevuld</li>
              <li>Houd facturen bij voor BTW aangifte</li>
              <li>Let op de deadline voor BTW aangifte (meestal 1 maand na kwartaal)</li>
              <li>Gebruik de export functie voor je BTW aangifte</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'settings',
      title: 'Instellingen',
      icon: <SettingsIcon size={24} />,
      content: (
        <div className="help-content">
          <h3>Instellingen & Beheer</h3>
          
          <div className="help-section">
            <h4>Hulp & Ondersteuning</h4>
            <ul>
              <li><strong>Tutorial Opnieuw Bekijken:</strong> Start de tutorial opnieuw</li>
              <li><strong>Hulp:</strong> Bekijk deze help documentatie</li>
            </ul>
          </div>
          
          <div className="help-section">
            <h4>Gegevens Beheer</h4>
            <ul>
              <li><strong>Gegevens Exporteren:</strong> Download al je gegevens als backup</li>
              <li><strong>Gegevens Importeren:</strong> Herstel gegevens uit een backup bestand</li>
              <li><strong>Alle Gegevens Wissen:</strong> Verwijder alle transacties en instellingen</li>
            </ul>
          </div>
          
          <div className="help-section">
            <h4>Export Functie</h4>
            <p>De export functie maakt Excel bestanden voor:</p>
            <ul>
              <li>Belastingdienst aangifte</li>
              <li>BTW aangifte</li>
              <li>Samenvatting van je gegevens</li>
              <li>Alle geüploade facturen</li>
            </ul>
          </div>
        </div>
      )
    }
  ]

  // Calculate highlight and tooltip position based on target element
  useEffect(() => {
    if (!isVisible || showWelcome || mode === 'help') {
      setHighlightStyle({ display: 'none' })
      setTooltipStyle({})
      return
    }

    const currentStepData = tutorialSteps[currentStep]
    
    if (!currentStepData.target) {
      setHighlightStyle({ display: 'none' })
      setTooltipStyle({})
      return
    }

    const targetSelector = currentStepData.target
    const targetElement = document.querySelector(targetSelector) as HTMLElement

    if (targetElement) {
      const rect = targetElement.getBoundingClientRect()
      const padding = 4
      
      // Set highlight position
      setHighlightStyle({
        position: 'fixed',
        left: `${Math.max(0, rect.left - padding)}px`,
        top: `${Math.max(0, rect.top - padding)}px`,
        width: `${rect.width + padding * 2}px`,
        height: `${rect.height + padding * 2}px`,
        display: 'block'
      })

      // Calculate tooltip position based on target position
      const tooltipWidth = currentStepData.position === 'center' ? 400 : 320
      const tooltipHeight = 200
      const margin = 20
      
      let tooltipLeft = 0
      let tooltipTop = 0
      
      switch (currentStepData.position) {
        case 'right':
          tooltipLeft = rect.right + margin
          tooltipTop = rect.top + (rect.height / 2) - (tooltipHeight / 2)
          break
        case 'left':
          tooltipLeft = rect.left - tooltipWidth - margin
          tooltipTop = rect.top + (rect.height / 2) - (tooltipHeight / 2)
          break
        case 'top':
          tooltipLeft = rect.left + (rect.width / 2) - (tooltipWidth / 2)
          tooltipTop = rect.top - tooltipHeight - margin
          break
        case 'bottom':
          tooltipLeft = rect.left + (rect.width / 2) - (tooltipWidth / 2)
          tooltipTop = rect.bottom + margin
          break
        case 'center':
          tooltipLeft = (window.innerWidth - tooltipWidth) / 2
          tooltipTop = (window.innerHeight - tooltipHeight) / 2
          break
        default:
          tooltipLeft = rect.left + (rect.width / 2) - (tooltipWidth / 2)
          tooltipTop = rect.top + (rect.height / 2) - (tooltipHeight / 2)
      }

      // Ensure tooltip stays within viewport
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      // Horizontal boundary checks
      if (tooltipLeft < margin) {
        tooltipLeft = margin
      } else if (tooltipLeft + tooltipWidth > viewportWidth - margin) {
        tooltipLeft = viewportWidth - tooltipWidth - margin
      }
      
      // Vertical boundary checks
      if (tooltipTop < margin) {
        tooltipTop = margin
      } else if (tooltipTop + tooltipHeight > viewportHeight - margin) {
        tooltipTop = viewportHeight - tooltipHeight - margin
      }

      // If tooltip would be off-screen, fallback to center positioning
      if (tooltipLeft < 0 || tooltipTop < 0 || 
          tooltipLeft + tooltipWidth > viewportWidth || 
          tooltipTop + tooltipHeight > viewportHeight) {
        tooltipLeft = (viewportWidth - tooltipWidth) / 2
        tooltipTop = (viewportHeight - tooltipHeight) / 2
      }

      setTooltipStyle({
        position: 'fixed',
        left: `${tooltipLeft}px`,
        top: `${tooltipTop}px`,
        zIndex: 10000,
        maxWidth: `${tooltipWidth}px`
      })
    } else {
      setHighlightStyle({ display: 'none' })
      setTooltipStyle({})
    }
  }, [currentStep, isVisible, showWelcome, mode])

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onSkip()
  }

  const handleStart = () => {
    setShowWelcome(false)
  }

  if (!isVisible) return null

  if (showWelcome) {
    return (
      <div className="tutorial-overlay">
        <div className="tutorial-welcome">
          <div className="welcome-content">
            <div className="welcome-icon">
              {mode === 'help' ? <HelpCircle size={48} /> : <BarChart3 size={48} />}
            </div>
            <h1>{mode === 'help' ? 'BtwBuddy Help' : 'Welkom bij BtwBuddy!'}</h1>
            <p>
              {mode === 'help' 
                ? 'BtwBuddy is je persoonlijke assistent voor eenvoudige boekhouding en BTW administratie. Hier vind je een overzicht van alle functies en hoe je ze kunt gebruiken.'
                : 'BtwBuddy helpt je om je boekhouding eenvoudig bij te houden. Wil je een korte tutorial volgen om de belangrijkste functies te leren kennen?'
              }
            </p>
            <div className="welcome-actions">
              <button className="btn-primary" onClick={handleStart}>
                <Play size={16} />
                {mode === 'help' ? 'Start Help' : 'Start Tutorial'}
              </button>
              <button className="btn-secondary" onClick={handleSkip}>
                Overslaan
              </button>
            </div>
            <button className="close-welcome" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Help mode content
  if (mode === 'help') {
    const currentSection = helpSections.find(section => section.id === currentHelpSection)
    const filteredSections = helpSections.filter(section => 
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.id.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
      <div className="tutorial-overlay">
        <div className="help-modal">
          <div className="help-header">
            <div className="help-title">
              <HelpCircle size={24} />
              <h2>BtwBuddy Help</h2>
            </div>
            <button className="close-help" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          
          <div className="help-body">
            <div className="help-sidebar">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Zoek in help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="help-navigation">
                {filteredSections.map(section => (
                  <button
                    key={section.id}
                    className={`help-nav-item ${currentHelpSection === section.id ? 'active' : ''}`}
                    onClick={() => setCurrentHelpSection(section.id)}
                  >
                    {section.icon}
                    <span>{section.title}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="help-content-area">
              {currentSection && currentSection.content}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Tutorial mode content
  const currentStepData = tutorialSteps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === tutorialSteps.length - 1

  return (
    <div className="tutorial-overlay">
      {/* Tutorial Tooltip */}
      <div 
        ref={tooltipRef}
        className={`tutorial-tooltip tutorial-${currentStepData.position || 'center'}`}
        style={tooltipStyle}
      >
        <div className="tooltip-header">
          <div className="step-indicator">
            {currentStep + 1} / {tutorialSteps.length}
          </div>
          <button className="close-tutorial" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        
        <div className="tooltip-content">
          <h3>{currentStepData.title}</h3>
          <p>{currentStepData.description}</p>
        </div>
        
        <div className="tooltip-actions">
          <button 
            className="btn-secondary"
            onClick={handleSkip}
          >
            Overslaan
          </button>
          
          <div className="navigation-buttons">
            {!isFirstStep && (
              <button 
                className="btn-nav"
                onClick={handlePrevious}
              >
                <ChevronLeft size={16} />
              </button>
            )}
            
            <button 
              className="btn-primary"
              onClick={handleNext}
            >
              {isLastStep ? 'Voltooien' : 'Volgende'}
              {!isLastStep && <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Dynamic Highlight Overlay */}
      {currentStepData.target && (
        <div 
          ref={highlightRef}
          className="tutorial-highlight" 
          style={highlightStyle}
        />
      )}
    </div>
  )
} 