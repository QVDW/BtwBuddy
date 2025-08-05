# 🔄 BtwBuddy Versie Beheer

## 📋 Overzicht

De **Versie Beheer** functionaliteit in BtwBuddy stelt gebruikers in staat om handmatig specifieke versies te selecteren en te installeren, in plaats van te vertrouwen op automatische updates. Dit is een betrouwbaardere oplossing voor het probleem met de auto-updater.

## 🚀 Hoe te Gebruiken

### **Stap 1: Open Versie Beheer**
1. Open BtwBuddy
2. Ga naar **Settings** (⚙️)
3. Scroll naar **Ontwikkelaar Tools**
4. Klik op **"Open Versie Beheer"**

### **Stap 2: Bekijk Beschikbare Versies**
De Versie Beheer toont:
- **Huidige versie**: De momenteel geïnstalleerde versie
- **Beschikbare versies**: Alle GitHub releases met hun details
- **Status indicators**: 
  - 🟢 **Huidige versie** - Geïnstalleerd
  - 🔵 **Nieuwere versie** - Beschikbaar voor download
  - ⚪ **Oudere versie** - Al beschikbaar

### **Stap 3: Download en Installeer**
1. Zoek een **nieuwere versie** (blauwe indicator)
2. Klik op **"Download & Installeer"**
3. Bevestig de download in het dialoogvenster
4. Wacht tot de download en installatie voltooid is
5. De applicatie start automatisch opnieuw op

## 🎯 Functies

### **📊 Versie Informatie**
- **Versienaam**: Bijv. "v1.0.2"
- **Publicatiedatum**: Wanneer de versie is uitgebracht
- **Beschrijving**: Release notes en wijzigingen
- **Bestandsgrootte**: Grootte van de installer
- **Status**: Huidige, nieuwer, of ouder

### **🔍 GitHub Integratie**
- **Directe GitHub link**: Bekijk releases op GitHub
- **Real-time data**: Laadt de nieuwste releases
- **Vernieuwen**: Klik op "Vernieuwen" voor nieuwe data

### **📥 Download Proces**
- **Progress indicator**: Toont download voortgang
- **Bevestiging**: Dialoog voor bevestiging
- **Automatische installatie**: Na download wordt automatisch geïnstalleerd
- **Herstart**: Applicatie herstart na installatie

## 🛠️ Technische Details

### **Backend Functionaliteit**
```typescript
// IPC Handler voor versie downloads
ipcMain.handle('download-version', async (event, versionInfo) => {
  // Toon bevestigingsdialoog
  // Download en installeer versie
  // Herstart applicatie
})
```

### **Frontend Componenten**
- **VersionManager.tsx**: Hoofdcomponent voor versie beheer
- **VersionManager.scss**: Styling voor moderne UI
- **GitHub API**: Haalt releases op van GitHub

### **Beveiliging**
- **Bevestigingsdialoog**: Gebruiker moet download bevestigen
- **URL validatie**: Controleert download URLs
- **Error handling**: Uitgebreide foutafhandeling

## 🔧 Probleem Oplossing

### **Probleem: "Geen Windows installer gevonden"**
**Oplossing**: 
- Controleer of de GitHub release een `.exe` bestand bevat
- Upload handmatig de `latest.yml` en `.exe` bestanden naar GitHub

### **Probleem: "Download mislukt"**
**Oplossingen**:
- Controleer internetverbinding
- Probeer opnieuw via "Vernieuwen"
- Controleer GitHub API status

### **Probleem: "Versies laden..." blijft hangen**
**Oplossingen**:
- Controleer internetverbinding
- Controleer GitHub API toegang
- Probeer opnieuw via "Vernieuwen"

## 📈 Voordelen van Handmatig Versie Beheer

### **✅ Betrouwbaarheid**
- Geen afhankelijkheid van automatische updates
- Gebruiker heeft volledige controle
- Geen problemen met `latest.yml` bestanden

### **✅ Transparantie**
- Gebruiker ziet alle beschikbare versies
- Duidelijke informatie over elke versie
- Release notes en wijzigingen zichtbaar

### **✅ Flexibiliteit**
- Kan specifieke versies kiezen
- Kan downgraden naar oudere versies
- Kan overslaan van versies

### **✅ Gebruiksvriendelijkheid**
- Intuïtieve interface
- Duidelijke status indicators
- Eenvoudig download proces

## 🔄 Vergelijking: Auto-Updater vs Versie Beheer

| Functie | Auto-Updater | Versie Beheer |
|---------|-------------|---------------|
| **Betrouwbaarheid** | ❌ Afhankelijk van `latest.yml` | ✅ Directe GitHub API |
| **Controle** | ❌ Automatisch | ✅ Handmatig |
| **Transparantie** | ❌ Beperkt | ✅ Volledig |
| **Flexibiliteit** | ❌ Alleen nieuwste | ✅ Alle versies |
| **Probleem Oplossing** | ❌ Complex | ✅ Eenvoudig |

## 🎯 Aanbevelingen

### **Voor Gebruikers**
1. **Gebruik Versie Beheer** in plaats van automatische updates
2. **Controleer release notes** voordat je update
3. **Maak backup** van je data voor grote updates
4. **Test nieuwe versies** in een veilige omgeving

### **Voor Ontwikkelaars**
1. **Upload altijd** `latest.yml` en `.exe` naar GitHub releases
2. **Schrijf duidelijke** release notes
3. **Test releases** voordat je ze publiceert
4. **Monitor GitHub API** status

## 📞 Support

Als je problemen ondervindt met de Versie Beheer:

1. **Controleer logs**: `%APPDATA%/BtwBuddy/logs/`
2. **Test internetverbinding**: GitHub API toegang
3. **Probeer handmatige download**: Via GitHub releases
4. **Neem contact op**: Via GitHub issues

---

**🎉 De Versie Beheer functionaliteit maakt BtwBuddy betrouwbaarder en gebruiksvriendelijker!** 