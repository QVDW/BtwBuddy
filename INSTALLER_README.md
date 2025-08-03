# BtwBuddy Installer

## Installer Maken

### Automatische Methode (Aanbevolen)
1. Dubbelklik op `build-installer.bat`
2. Wacht tot het proces klaar is
3. De installer vind je in de `release` map

### Handmatige Methode
```bash
# 1. Dependencies installeren
npm install

# 2. Applicatie bouwen
npm run build

# 3. Windows installer maken
npm run dist:win
```

## Installer Functies

### Voor Gebruikers
- **Professionele Installatie Wizard**: Stap-voor-stap installatie proces
- **Desktop Shortcut**: Automatisch een icoon op het bureaublad
- **Start Menu Shortcut**: Toegankelijk via het start menu
- **Programma's Toevoegen/Verwijderen**: Kan via Windows instellingen verwijderd worden
- **Nederlandse Interface**: Volledig in het Nederlands

### Installatie Opties
- Gebruikers kunnen de installatielocatie kiezen
- Automatische desktop shortcut
- Start menu integratie
- Registry registratie voor professionele uninstall

## Bestandsstructuur Na Installatie

```
C:\Program Files\BtwBuddy\
├── BtwBuddy.exe
├── Uninstall.exe
└── [andere bestanden]

Desktop:
└── BtwBuddy.lnk

Start Menu:
└── BtwBuddy\
    ├── BtwBuddy.lnk
    └── Verwijderen.lnk
```

## Uninstallatie

Gebruikers kunnen BtwBuddy op drie manieren verwijderen:
1. Via "Programma's toevoegen of verwijderen" in Windows instellingen
2. Via het start menu: BtwBuddy → Verwijderen
3. Via het installatiebestand opnieuw uitvoeren

## Troubleshooting

### Installer Bouwt Niet
- Controleer of Node.js en npm geïnstalleerd zijn
- Zorg dat alle dependencies correct geïnstalleerd zijn
- Controleer of je voldoende schijfruimte hebt

### Installer Werkt Niet
- Controleer of je Windows 10 of hoger gebruikt
- Zorg dat je administrator rechten hebt
- Controleer of je antivirus de installer niet blokkeert

## Versie Informatie

- **Huidige Versie**: 1.0.0
- **Ondersteunde Platforms**: Windows 10/11 (x64)
- **Bestandsgrootte**: ~50-100 MB (afhankelijk van dependencies)

## Ontwikkeling

Voor ontwikkelaars die de installer willen aanpassen:

### Configuratie Bestanden
- `package.json`: Electron-builder configuratie
- `build/installer.nsh`: NSIS installer scripts
- `build-installer.bat`: Automatische build script

### Belangrijke Velden
- `appId`: Unieke applicatie ID
- `productName`: Naam die gebruikers zien
- `version`: Versienummer
- `icon.ico`: Applicatie icoon

### Nieuwe Versie Maken
1. Update versienummer in `package.json`
2. Run `build-installer.bat`
3. Test de nieuwe installer
4. Upload naar release pagina 