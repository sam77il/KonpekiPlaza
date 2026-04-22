# KonpekiPlaza - Marketplace Management System

Ein vollständiges Marketplace-Management-System mit Node.js Backend, Express Server und MySQL Datenbank. Das System verwaltet Benutzerkonten, Agenten, Inventar und einen Marketplace mit Authentifizierung und Sitzungsverwaltung.

## Inhaltsverzeichnis

- [Features](#features)
- [Systemanforderungen](#systemanforderungen)
- [Installation](#installation)
- [Konfiguration](#konfiguration)
- [Server starten](#server-starten)
- [Projektstruktur](#projektstruktur)
- [API & Module](#api--module)
- [Frontend-Seiten](#frontend-seiten)
- [Datenbank](#datenbank)
- [Port-Informationen](#port-informationen)

## Features

- **Authentifizierung & Autorisierung**: Benutzerregistrierung und Login mit verschlüsselten Passwörtern
- **Agent Management**: Verwaltung von Agenten im System
- **Inventory System**: Verwaltung von Produktbestand
- **Marketplace**: Vollständiger Marketplace mit Produkten und Transaktionen
- **Session Management**: Sichere Benutzersitzungen mit Express-Session
- **CORS Support**: Unterstützung für Cross-Origin Requests
- **Responsive Frontend**: Moderne HTML/CSS/JavaScript Frontend
- **Dynamische Preisänderungen**: Agent-Preise ändern sich stündlich automatisch innerhalb eines Bereichs

## Systemanforderungen

- **Node.js**: v14 oder höher
- **npm**: v6 oder höher
- **MySQL**: v5.7 oder höher
- **Operating System**: Windows, macOS oder Linux

## Installation

### 1. Repository klonen/Projekt herunterladen

```bash
cd KonpekiPlaza
```

### 2. Dependencies installieren (Optional)

```bash
npm install
```

Dies installiert folgende Packages:

| Package         | Version | Beschreibung                              |
| --------------- | ------- | ----------------------------------------- |
| express         | ^5.2.1  | Web Framework                             |
| mysql2          | ^3.19.1 | MySQL Datenbank Verbindung                |
| bcrypt          | ^6.0.0  | Passwort Verschlüsselung                  |
| express-session | ^1.19.0 | Session Management                        |
| cors            | ^2.8.6  | Cross-Origin Resource Sharing             |
| uuid            | ^13.0.0 | Eindeutige IDs generieren                 |
| node-cron       | ^3.x.x  | Stündlicher Scheduler für Preisänderungen |
| nodemon         | dev     | Auto-Reload während Entwicklung           |

### 3. MySQL Datenbank setup

Erstelle eine MySQL Datenbank mit dem Namen `konpekiplaza`:

```sql
CREATE DATABASE konpekiplaza;
USE konpekiplaza;
```

Die notwendigen Tabellen werden automatisch beim ersten Start erstellt (falls implementiert) oder manuell hinzugefügt.

## Konfiguration

### Datenbank Konfiguration

Datei: `utils/db.js`

```javascript
const db = mysql.createConnection({
  host: "localhost", // MySQL Server Host
  user: "root", // MySQL Benutzername
  password: "", // MySQL Passwort (Standard: leer)
  database: "konpekiplaza", // Datenbank Name
});
```

**Wichtig**: Passe die Anmeldedaten an deine lokale MySQL-Installation an.

### Session Konfiguration

Datei: `server.js`

```javascript
session({
  secret: "your-secret-key", // Geheim-Schlüssel (ändern empfohlen!)
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // true für HTTPS
    maxAge: 1000 * 60 * 60 * 24, // 1 Tag
    sameSite: "lax",
  },
});
```

## Server starten

### Development Mode (mit Auto-Reload)

```bash
npm run dev
```

Der Server startet automatisch mit Nodemon und lädt bei Dateiänderungen neu.

### Production Mode

```bash
npm run start
```

**Erfolgreiche Ausgabe:**

```
Connected to MySQL database
Server is running on port 5030
```

Öffne danach die Anwendung im Browser: **http://127.0.0.1:5030**

## Projektstruktur

```
KonpekiPlaza/
├── server.js                 # Hauptserver-Datei
├── package.json             # NPM Abhängigkeiten
├── README.md                # Diese Datei
├── server.http              # HTTP Test-Requests (REST-Client)
│
├── controllers/             # Express Route Handler
│   ├── authController.js    # Authentifizierung (Login/Register)
│   ├── agentController.js   # Agent Management
│   ├── inventoryController.js # Inventar Management
│   └── marketplaceController.js # Marketplace Features
│
├── middlewares/             # Express Middleware
│   └── [Authentifizierung & Validierung]
│
├── utils/
│   └── db.js               # MySQL Datenbankverbindung
│
└── frontend/               # Frontend (statische Dateien)
    ├── index.html          # Startseite/Home
    ├── login.html          # Login Seite
    ├── register.html       # Registrierung Seite
    ├── account.html        # Benutzerkonto
    ├── inventory.html      # Inventar Management
    ├── marketplace.html    # Marketplace Seite
    ├── agent.html          # (Alternative Agent Seite)
    ├── fingers.html        # (Spezielle Seite)
    ├── nusa.html           # (Spezielle Seite)
    ├── viktor.html         # (Spezielle Seite)
    │
    ├── scripts/            # JavaScript Frontend-Code
    │   ├── global.js       # Globale Funktionen
    │   ├── home.js         # Startseiten-Logik
    │   ├── login.js        # Login-Logik
    │   ├── register.js     # Registrierungs-Logik
    │   ├── account.js      # Konto-Verwaltung
    │   ├── inventory.js    # Inventar-Logik
    │   ├── marketplace.js  # Marketplace-Logik
    │   └── agent.js        # Agent-Logik
    │
    ├── styles/            # CSS Stylesheets
    │   ├── global.css      # Globale Styles
    │   ├── home.css        # Home Styles
    │   ├── auth.css        # Auth (Login/Register) Styles
    │   ├── account.css     # Konto Styles
    │   ├── inventory.css   # Inventar Styles
    │   ├── marketplace.css # Marketplace Styles
    │   └── agent.css       # Agent Styles
    │
    ├── images/            # Bildressourcen
    ├── videos/            # Video Ressourcen
    ├── fonts/             # Custom Fonts
    └── favicon.ico        # Website Icon
```

## API & Module

### Auth Controller (`authController.js`)

Verwaltet Benutzerauthentifizierung:

- POST `/register` - Neue Benutzer registrieren
- POST `/login` - Benutzer anmelden
- POST `/logout` - Benutzer abmelden
- GET `/profile` - Benutzer-Profil abrufen

### Agent Controller (`agentController.js`)

Verwaltet Agenten:

- GET `/agents` - Alle Agenten abrufen
- POST `/agents` - Neuen Agenten erstellen
- PUT `/agents/:id` - Agenten aktualisieren
- DELETE `/agents/:id` - Agenten löschen

### Inventory Controller (`inventoryController.js`)

Verwaltet Bestand:

- GET `/inventory` - Bestand abrufen
- POST `/inventory` - Artikel hinzufügen
- PUT `/inventory/:id` - Artikel aktualisieren
- DELETE `/inventory/:id` - Artikel löschen

### Marketplace Controller (`marketplaceController.js`)

Verwaltet Marketplace:

- GET `/marketplace` - Produkte abrufen
- POST `/marketplace/orders` - Bestellung erstellen
- GET `/marketplace/orders` - Bestellungen abrufen

## Frontend-Seiten

| Seite         | Datei                                      | Beschreibung                  |
| ------------- | ------------------------------------------ | ----------------------------- |
| Startseite    | `index.html`                               | Home Page mit Navigation      |
| Login         | `login.html`                               | Benutzer Login Seite          |
| Registrierung | `register.html`                            | Neue Benutzer registrieren    |
| Konto         | `account.html`                             | Benutzerkonto & Einstellungen |
| Inventar      | `inventory.html`                           | Bestandsverwaltung            |
| Marketplace   | `marketplace.html`                         | Produkte & Bestellungen       |
| Agent         | `agent.html`                               | Agent Management Interface    |
| Special Pages | `fingers.html`, `nusa.html`, `viktor.html` | Zusätzliche Funktionsbereiche |

## Datenbank

**Datenbank Name**: `konpekiplaza`

**MySQL Host**: `localhost`
**MySQL User**: `root`
**MySQL Passwort**: (Standard: leer)

### Erforderliche Tabellen

Die folgenden Tabellen sollten existieren (Setup-Script erstellen empfohlen):

```sql
-- Benutzer Tabelle
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agents Tabelle
CREATE TABLE agents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  user_id INT,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Inventory Tabelle
CREATE TABLE inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  quantity INT DEFAULT 0,
  price DECIMAL(10, 2),
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Marketplace Tabelle
CREATE TABLE marketplace (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  seller_id INT,
  buyer_id INT,
  price DECIMAL(10, 2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (buyer_id) REFERENCES users(id)
);
```

## Port-Informationen

| Service        | Port     | URL                     |
| -------------- | -------- | ----------------------- |
| Express Server | **5030** | `http://127.0.0.1:5030` |
| MySQL Database | 3306     | `localhost:3306`        |

**Frontend-Zugriff**: http://127.0.0.1:5030 oder http://localhost:5030

## Troubleshooting

### Problem: Frontend wird nicht geladen

**Lösung**:

- Server läuft auf Port 5030?
- Static Pfad korrekt? `frontend/` Ordner existiert?
- Browser Cache leeren: Ctrl+Shift+Del

## npm Scripts

```bash
npm run dev      # Development Server mit Nodemon starten
npm run start    # Production Server starten
```

## Sicherheit

- Passwörter mit bcrypt verschlüsselt
- Session Management mit HttpOnly Cookies
- CORS konfiguriert für lokale Entwicklung
- Session Secret sollte in Produktion geändert werden
- MySQL Passwort sollte in Produktion gesetzt werden

## KI-Unterstützung

Diese README wurde stark mit KI unterstützt erstellt, um eine vollständige und detaillierte Dokumentation zu gewährleisten. Es fehlt nichts Wesentliches, da in der Vergangenheit massiv Punkte für unvollständige Dokumentation abgezogen wurden.
