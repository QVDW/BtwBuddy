# BtwBuddy - Persoonlijke Boekhoudtool

Een moderne, gebruiksvriendelijke desktop applicatie voor zelfstandigen en kleine ondernemers om hun boekhouding en BTW beheer eenvoudig bij te houden.

## 🚀 Features

### 📊 **Overzicht & Dashboard**
- **Home Dashboard**: Overzicht van totale inkomsten, uitgaven en netto resultaat
- **Maandelijkse Samenvatting**: Gedetailleerde financiële overzichten per maand
- **Recente Activiteit**: Snelle blik op de laatste transacties
- **Snelle Acties**: Directe toegang tot alle belangrijke functies

### 💰 **Transactie Beheer**
- **Inkomsten & Uitgaven**: Voeg beide soorten transacties eenvoudig toe
- **BTW Automatische Berekening**: Automatische berekening van BTW bedragen
- **Factuur Upload**: Koppel facturen aan transacties (PDF, JPG, PNG)
- **Bewerken & Verwijderen**: Volledige controle over je transacties

### 📈 **Rapporten & Analyse**
- **Financiële Overzichten**: Gedetailleerde maand- en jaaroverzichten
- **BTW Overzicht**: Automatische BTW berekeningen en saldi
- **Inkomsten vs Uitgaven**: Visuele verhoudingen en trends
- **Kwartaal Overzichten**: BTW per kwartaal voor aangifte

### 🏛️ **Belasting & BTW Aangifte**
- **Belastingaangifte Voorbereiding**: Alle gegevens voor je belastingaangifte
- **BTW Aangifte**: Specifieke BTW overzichten en berekeningen
- **Jaaroverzichten**: Volledige jaarcijfers voor aangifte
- **Export Functionaliteit**: Exporteer gegevens voor je boekhouder

### ⚙️ **Instellingen & Beheer**
- **Data Export/Import**: Backup en herstel van je gegevens
- **Tutorial**: Stap-voor-stap uitleg voor nieuwe gebruikers
- **Instellingen**: Persoonlijke voorkeuren en configuratie

## 🛠️ Technische Details

### **Technologie Stack**
- **Frontend**: React 18 + TypeScript + SCSS
- **Backend**: Electron 27 (Cross-platform desktop app)
- **Data Storage**: Electron Store (Lokale opslag)
- **UI Components**: Lucide React Icons
- **Build Tool**: Vite + Electron Builder

### **Ondersteunde Platforms**
- ✅ **Windows** (Portable executable)
- ✅ **macOS** (App bundle)
- ✅ **Linux** (AppImage)

### **Bestand Formaten**
- **Facturen**: PDF, JPG, JPEG, PNG
- **Export**: CSV, JSON
- **Backup**: JSON export/import

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
   - **Datum**: Transactie datum
   - **Omschrijving**: Korte beschrijving
   - **Type**: Inkomst of Uitgave
   - **Bedrag**: Inclusief of exclusief BTW
   - **BTW Percentage**: 0%, 9%, 21% of aangepast
   - **Factuur**: Optioneel bestand uploaden

### **Overzichten Bekijken**
- **Home**: Algemene dashboard met snelle statistieken

### **Export Functionaliteit**
De export knop genereert een complete map met alle benodigde bestanden voor je boekhouding:

**📁 Export Map Inhoud:**
- **`belastingdienst-[JAAR]-[MAAND].csv`**: Algemene transacties voor belastingdienst
- **`btw-aangifte-[JAAR]-[MAAND].csv`**: BTW specifieke gegevens voor aangifte
- **`samenvatting-[JAAR]-[MAAND].txt`**: Gedetailleerde maandelijkse samenvatting
- **Alle geüploade facturen**: Kopieën van alle facturen uit die maand

**📊 CSV Bestanden Inhoud:**
- **Belastingdienst CSV**: Datum, omschrijving, type, bedragen inclusief/exclusief BTW, BTW bedrag, percentage, factuur
- **BTW Aangifte CSV**: Datum, omschrijving, type, bedrag exclusief BTW, BTW bedrag, percentage, BTW type (verkopen/aankopen), factuur

**💡 Gebruik:**
1. Selecteer een maand in de interface
2. Klik op de "Exporteren" knop
3. Kies een locatie voor de export map
4. Alle bestanden worden automatisch gegenereerd
- **Overzicht**: Maandelijkse samenvatting en recente transacties
- **Transacties**: Volledige lijst van alle transacties
- **Rapporten**: Gedetailleerde financiële analyses
- **Belastingaangifte**: Voorbereiding voor belastingaangifte
- **BTW Aangifte**: Specifieke BTW overzichten

### **Export & Backup**
- **Maand Export**: Exporteer transacties en facturen per maand
- **Data Export**: Volledige backup van alle gegevens
- **Data Import**: Herstel van backup bestanden

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
npm run generate-icons   # Genereer app icons
```

## 📁 Project Structuur

```
VatBuddy/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.ts     # Main window en IPC handlers
│   │   └── preload.ts  # Preload script
│   ├── renderer/       # React frontend
│   │   ├── components/ # React componenten
│   │   ├── utils/      # Utility functies
│   │   ├── types.ts    # TypeScript definities
│   │   └── App.tsx     # Hoofdcomponent
│   └── assets/         # App assets
├── release/            # Build output
├── package.json        # Dependencies en scripts
└── README.md          # Deze file
```

## 🎨 UI/UX Features

### **Discord-achtige Interface**
- **Sidebar Navigation**: Snelle toegang tot alle functies
- **Moderne Design**: Clean en professionele uitstraling
- **Responsive Layout**: Aanpasbaar aan verschillende schermgroottes
- **Dark/Light Theme**: Automatische thema detectie

### **Gebruiksvriendelijkheid**
- **Intuïtieve Navigatie**: Duidelijke iconen en labels
- **Contextuele Help**: Tooltips en uitleg waar nodig
- **Snelle Acties**: Directe toegang tot veelgebruikte functies
- **Feedback**: Duidelijke bevestigingen en foutmeldingen

## 🔒 Privacy & Data

### **Lokale Opslag**
- Alle gegevens worden lokaal opgeslagen
- Geen externe servers of cloud diensten
- Volledige controle over je data

### **Backup & Herstel**
- Exporteer alle gegevens naar JSON
- Importeer backup bestanden
- Maandelijkse exports met facturen

## 🤝 Bijdragen

### **Development Setup**
1. Fork de repository
2. Maak een feature branch
3. Implementeer je wijzigingen
4. Test grondig
5. Submit een pull request

### **Code Standards**
- TypeScript voor type safety
- ESLint voor code kwaliteit
- Prettier voor formatting
- React best practices

## 📄 Licentie

MIT License - Zie LICENSE file voor details.

## 🆘 Support

### **Veelgestelde Vragen**
- **Data Verlies**: Gebruik de export functie voor backups
- **BTW Berekeningen**: Automatisch berekend op basis van percentage
- **Factuur Upload**: Ondersteunt PDF, JPG, PNG bestanden
- **Export Problemen**: Controleer schrijfrechten in doelmap

### **Bug Reports**
- Beschrijf het probleem duidelijk
- Voeg screenshots toe indien mogelijk
- Vermeld je besturingssysteem en versie

---

**BtwBuddy** - Maak boekhouding eenvoudig en overzichtelijk! 📊✨ 