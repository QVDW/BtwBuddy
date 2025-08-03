# BtwBuddy - Persoonlijke Boekhoudtool

Een moderne, gebruiksvriendelijke desktop applicatie voor zelfstandigen en kleine ondernemers om hun boekhouding en BTW beheer eenvoudig bij te houden.

## 🚀 Features

### 📊 **Dashboard & Overzicht**
- **Home Dashboard**: Overzicht van totale inkomsten, uitgaven en netto resultaat
- **Statistieken Overzicht**: Visuele weergave van financiële prestaties
- **Recente Activiteit**: Snelle blik op de laatste transacties
- **Snelle Acties**: Directe toegang tot alle belangrijke functies
- **Real-time Updates**: Automatische bijwerking van alle overzichten

### 💰 **Transactie Beheer**
- **Inkomsten & Uitgaven**: Voeg beide soorten transacties eenvoudig toe
- **BTW Automatische Berekening**: Automatische berekening van BTW bedragen
- **Factuur Upload**: Koppel facturen aan transacties (PDF, JPG, PNG)
- **Bewerken & Verwijderen**: Volledige controle over je transacties
- **Datum Selector**: Intuïtieve datum selectie met kalender
- **BTW Percentages**: Ondersteuning voor 0%, 9%, 21% en aangepaste percentages
- **Bedrag Inclusief/Exclusief BTW**: Flexibele invoer van bedragen

### 📈 **Rapporten & Analyse**
- **Financiële Overzichten**: Gedetailleerde maand- en jaaroverzichten
- **BTW Overzicht**: Automatische BTW berekeningen en saldi
- **Inkomsten vs Uitgaven**: Visuele verhoudingen en trends
- **Kwartaal Overzichten**: BTW per kwartaal voor aangifte
- **Maandelijkse Samenvattingen**: Gedetailleerde analyses per maand

### 🏛️ **Belasting & BTW Aangifte**
- **Belastingaangifte Voorbereiding**: Alle gegevens voor je belastingaangifte
- **BTW Aangifte**: Specifieke BTW overzichten en berekeningen
- **Jaaroverzichten**: Volledige jaarcijfers voor aangifte
- **Export Functionaliteit**: Exporteer gegevens voor je boekhouder
- **Excel Export**: Professionele Excel bestanden voor belastingdienst

### 📁 **Export & Backup Systeem**
- **Maand Export**: Exporteer transacties en facturen per maand
- **Data Export**: Volledige backup van alle gegevens naar JSON
- **Data Import**: Herstel van backup bestanden
- **Excel Export**: Professionele Excel bestanden voor boekhouding
- **Factuur Export**: Automatische kopie van alle facturen
- **Samenvatting Export**: Gedetailleerde tekst samenvattingen

### ⚙️ **Instellingen & Beheer**
- **Data Export/Import**: Backup en herstel van je gegevens
- **Tutorial Systeem**: Stap-voor-stap uitleg voor nieuwe gebruikers
- **Help Documentatie**: Uitgebreide help secties
- **Instellingen**: Persoonlijke voorkeuren en configuratie
- **Data Wissingen**: Permanent wissen van alle gegevens
- **Versie Informatie**: App versie en ontwikkelaar details

### 🎨 **Gebruikerservaring**
- **Discord-achtige Interface**: Moderne sidebar navigatie
- **Responsive Design**: Aanpasbaar aan verschillende schermgroottes
- **Dark/Light Theme**: Automatische thema detectie
- **Loading States**: Duidelijke feedback tijdens acties
- **Error Handling**: Gebruiksvriendelijke foutmeldingen
- **Keyboard Shortcuts**: Snelle navigatie met toetsencombinaties

## 🛠️ Technische Details

### **Technologie Stack**
- **Frontend**: React 18 + TypeScript + SCSS
- **Backend**: Electron 27 (Cross-platform desktop app)
- **Data Storage**: Electron Store (Lokale opslag)
- **UI Components**: Lucide React Icons
- **Build Tool**: Vite + Electron Builder
- **Excel Export**: ExcelJS voor professionele Excel bestanden

### **Ondersteunde Platforms**
- ✅ **Windows** (Portable executable + NSIS installer)
- ✅ **macOS** (App bundle + DMG)
- ✅ **Linux** (AppImage)

### **Bestand Formaten**
- **Facturen**: PDF, JPG, JPEG, PNG
- **Export**: CSV, JSON, Excel (.xlsx)
- **Backup**: JSON export/import
- **App Icons**: ICO, ICNS, PNG

## 📦 Installatie

### **Ontwikkeling**
```bash
# Clone de repository
git clone [repository-url]
cd BtwBuddy

# Installeer dependencies
npm install

# Start development server
npm run dev
```

### **Productie Build**
```bash
# Build voor alle platforms
npm run dist

# Build specifieke platforms
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux

# Build alleen renderer
npm run build:renderer

# Build alleen main process
npm run build:main
```

## 🎯 Gebruik

### **Eerste Gebruik**
1. Start BtwBuddy
2. Volg de tutorial voor een snelle introductie
3. Begin met het toevoegen van je eerste transactie

### **Transactie Toevoegen**
1. Klik op de "+" knop in de sidebar
2. Vul de gegevens in:
   - **Datum**: Transactie datum (kalender selector)
   - **Omschrijving**: Korte beschrijving van de transactie
   - **Type**: Inkomst of Uitgave
   - **Bedrag**: Inclusief of exclusief BTW
   - **BTW Percentage**: 0%, 9%, 21% of aangepast percentage
   - **Factuur**: Optioneel bestand uploaden (PDF, JPG, PNG)

### **Navigatie & Overzichten**
- **Home**: Dashboard met statistieken en snelle acties
- **Overzicht**: Maandelijkse samenvatting en recente transacties
- **Transacties**: Volledige lijst van alle transacties met filter en zoek
- **Rapporten**: Gedetailleerde financiële analyses
- **Belastingaangifte**: Voorbereiding voor belastingaangifte
- **BTW Aangifte**: Specifieke BTW overzichten

### **Export Functionaliteit**
De export knop genereert een complete map met alle benodigde bestanden voor je boekhouding:

**📁 Export Map Inhoud:**
- **`belastingdienst-[JAAR]-[MAAND].xlsx`**: Algemene transacties voor belastingdienst
- **`btw-aangifte-[JAAR]-[MAAND].xlsx`**: BTW specifieke gegevens voor aangifte
- **`samenvatting-[JAAR]-[MAAND].txt`**: Gedetailleerde maandelijkse samenvatting
- **Alle geüploade facturen**: Kopieën van alle facturen uit die maand

**📊 Excel Bestanden Inhoud:**
- **Belastingdienst Excel**: Datum, omschrijving, type, bedragen inclusief/exclusief BTW, BTW bedrag, percentage, factuur
- **BTW Aangifte Excel**: Datum, omschrijving, type, bedrag exclusief BTW, BTW bedrag, percentage, BTW type (verkopen/aankopen), factuur

**💡 Gebruik:**
1. Selecteer een maand in de interface
2. Klik op de "Exporteren" knop
3. Kies een locatie voor de export map
4. Alle bestanden worden automatisch gegenereerd

### **Backup & Herstel**
- **Data Export**: Exporteer alle transacties naar JSON bestand
- **Data Import**: Importeer backup bestanden om gegevens te herstellen
- **Data Wissingen**: Permanent verwijderen van alle gegevens (met bevestiging)

## 🔧 Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:renderer     # Start alleen renderer
npm run dev:main         # Start alleen main process

# Build
npm run build            # Build renderer en main
npm run build:renderer   # Build alleen renderer
npm run build:main       # Build alleen main

# Distribution
npm run dist             # Build en package voor distributie
npm run dist:win         # Build voor Windows
npm run dist:mac         # Build voor macOS
npm run dist:linux       # Build voor Linux

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run type-check       # TypeScript type checking

# Utilities
npm run clean            # Clean build directories
npm run preview          # Preview production build
```

## 📁 Project Structuur

```
BtwBuddy/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.ts     # Main window en IPC handlers
│   │   └── preload.ts  # Preload script
│   ├── renderer/       # React frontend
│   │   ├── components/ # React componenten
│   │   │   ├── Home.tsx              # Dashboard component
│   │   │   ├── TransactionForm.tsx   # Transactie formulier
│   │   │   ├── TransactionTable.tsx  # Transactie overzicht
│   │   │   ├── MonthSelector.tsx     # Maand selector
│   │   │   ├── Tutorial.tsx          # Tutorial systeem
│   │   │   ├── Settings.tsx          # Instellingen
│   │   │   ├── TitleBar.tsx          # Custom title bar
│   │   │   └── Paginator.tsx         # Paginering
│   │   ├── utils/      # Utility functies
│   │   │   └── calculations.ts       # BTW en financiële berekeningen
│   │   ├── types.ts    # TypeScript definities
│   │   ├── App.tsx     # Hoofdcomponent
│   │   └── *.scss      # Styling bestanden
│   └── assets/         # App assets (icons)
├── release/            # Build output
├── public/            # Public assets
├── package.json       # Dependencies en scripts
└── README.md         # Deze file
```

## 🎨 UI/UX Features

### **Moderne Interface**
- **Sidebar Navigation**: Snelle toegang tot alle functies
- **Custom Title Bar**: Moderne window controls
- **Responsive Layout**: Aanpasbaar aan verschillende schermgroottes
- **Loading States**: Duidelijke feedback tijdens acties
- **Error Handling**: Gebruiksvriendelijke foutmeldingen

### **Gebruiksvriendelijkheid**
- **Intuïtieve Navigatie**: Duidelijke iconen en labels
- **Tutorial Systeem**: Stap-voor-stap uitleg voor nieuwe gebruikers
- **Help Documentatie**: Uitgebreide help secties
- **Snelle Acties**: Directe toegang tot veelgebruikte functies
- **Keyboard Shortcuts**: Snelle navigatie met toetsencombinaties

## 🔒 Privacy & Data

### **Lokale Opslag**
- Alle gegevens worden lokaal opgeslagen via Electron Store
- Geen externe servers of cloud diensten
- Volledige controle over je data
- Automatische backup functionaliteit

### **Backup & Herstel**
- Exporteer alle gegevens naar JSON bestand
- Importeer backup bestanden om gegevens te herstellen
- Maandelijkse exports met facturen
- Data wissingen met bevestiging

## 🤝 Bijdragen

### **Development Setup**
1. Fork de repository
2. Maak een feature branch
3. Implementeer je wijzigingen
4. Test grondig met `npm run lint` en `npm run type-check`
5. Submit een pull request

### **Code Standards**
- TypeScript voor type safety
- ESLint voor code kwaliteit
- React best practices
- SCSS voor styling
- Electron security best practices

## 📄 Licentie

MIT License - Zie LICENSE file voor details.

## 🆘 Support

### **Veelgestelde Vragen**
- **Data Verlies**: Gebruik de export functie voor backups
- **BTW Berekeningen**: Automatisch berekend op basis van percentage
- **Factuur Upload**: Ondersteunt PDF, JPG, PNG bestanden
- **Export Problemen**: Controleer schrijfrechten in doelmap
- **App Crashes**: Controleer of alle dependencies geïnstalleerd zijn

### **Bug Reports**
- Beschrijf het probleem duidelijk
- Voeg screenshots toe indien mogelijk
- Vermeld je besturingssysteem en versie
- Voeg console logs toe indien beschikbaar

### **Feature Requests**
- Beschrijf de gewenste functionaliteit
- Leg uit waarom deze functie nuttig zou zijn
- Voeg eventuele mockups of voorbeelden toe

---

**BtwBuddy** - Maak boekhouding eenvoudig en overzichtelijk! 📊✨ 