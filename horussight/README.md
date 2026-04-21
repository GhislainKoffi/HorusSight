# 🛡️ HorusSight Frontend Documentation

[English version](#english-version) | [Version Française](#version-française)

---

<a name="english-version"></a>

## 🇺🇸 English Version

This documentation details the operation, architecture, and technologies used for the **HorusSight** platform interface.

### 🛠️ Tech Stack
- **Framework**: Next.js 15.5+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Custom Design System)
- **Animations**: Framer Motion (Fluid transitions, parallax, dynamic entries)
- **Icons**: Lucide React
- **Reporting**: jsPDF (Client-side PDF generation)
- **AI**: Google Generative AI SDK (EWABA Insight Engine)

---

### 🏗️ Code Architecture

#### 1. File Structure
- `/app`: Route configuration (Next.js App Router).
- `/components`: Reusable UI components.
    - `App.tsx`: The heart of the application (Main Controller).
- `/lib`:
    - `translations.ts`: Centralized bilingual dictionary.
    - `aiService.ts`: Bridge with Gemini AI.
    - `store.ts`: Scan state management (Mock Store).
- `/api`: Next.js API routes serving as a gateway to the Python engine.

#### 2. The Master Component (`App.tsx`)
The `App.tsx` file manages main navigation via a simple state machine (`view`):
- `landing`: Home page with Hero Slideshow.
- `dashboard`: Analyst's main dashboard.
- `logs`: Deep packet inspection console.
- `report`: Detailed vulnerability view and AI analysis.

---

### 🌐 Translation System (i18n)

HorusSight uses a "Zero-Dependency" dynamic translation system:
- **Source**: `horussight/lib/translations.ts`.
- **Usage**: A `t(section, key)` function is injected into all components. It automatically detects the selected language (`en` or `fr`) persisted in `localStorage`.
- **Adding a language**: Simply add a key to the `i18n` object to support a new language.

---

### 🧬 Interaction with Python Engine

The Frontend communicates with the scanner via the internal `/api/scans` API:
1. **POST Request**: Initializes a scan with the target URL.
2. **Process Spawning**: The Next.js server launches `main.py` via `child_process.spawn`.
3. **Log Streaming**: `LOG:` messages from the Python script are retrieved in real-time by the API and sent back to the interface via a polling/state system.
4. **JSON Parsing**: Once the scan is complete, the raw JSON is parsed and transformed into a displayable `Scan` object.

---

### 📊 Key Features

#### Tactical Dashboard
Displays critical metrics (Scan time, critical vulnerabilities, active targets) as aerated status cards with gradient and blur effects (Glassmorphism).

#### Live Terminal
A real-time inspection view simulating packet capture. Each event is clickable to obtain "automated mitigation" and a patch deployment plan.

#### EWABA Intelligence
The `ReportView` component sends scan data to the Gemini AI. The AI returns:
- A business impact analysis.
- A remediation strategy by urgency level.
- A communication template for stakeholders.

---

### 🚀 Installation & Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```

---

<a name="version-française"></a>

## 🇫🇷 Version Française

Cette documentation détaille le fonctionnement, l'architecture et les technologies utilisées pour l'interface de la plateforme **HorusSight**.

### 🛠️ Stack Technologique
- **Framework** : Next.js 15.5+ (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS (Design System sur mesure)
- **Animations** : Framer Motion (Transitions fluides, parallaxe, entrées dynamiques)
- **Icônes** : Lucide React
- **Rapports** : jsPDF (Génération PDF côté client)
- **IA** : Google Generative AI SDK (Moteur EWABA Insight)

---

### 🏗️ Architecture du Code

#### 1. Structure des Fichiers
- `/app` : Configuration des routes (Next.js App Router).
- `/components` : Composants UI réutilisables.
    - `App.tsx` : Le cœur de l'application (Main Controller).
- `/lib` :
    - `translations.ts` : Dictionnaire bilingue centralisé.
    - `aiService.ts` : Pont avec l'IA Gemini.
    - `store.ts` : Gestion de l'état des scans (Mock Store).
- `/api` : Routes API Next.js servant de passerelle vers le moteur Python.

#### 2. Le Composant Maître (`App.tsx`)
Le fichier `App.tsx` gère la navigation principale via une machine à états simple (`view`) :
- `landing` : Page d'accueil avec Hero Slideshow.
- `dashboard` : Tableau de bord principal de l'analyste.
- `logs` : Console d'inspection profonde des paquets.
- `report` : Vue détaillée des vulnérabilités et analyse IA.

---

### 🌐 Système de Traduction (i18n)

HorusSight utilise un système de traduction dynamique "Zero-Dependency" :
- **Source** : `horussight/lib/translations.ts`.
- **Utilisation** : Une fonction `t(section, key)` est injectée dans tous les composants. Elle détecte automatiquement la langue sélectionnée (`en` ou `fr`) persistée dans le `localStorage`.
- **Ajout d'une langue** : Il suffit d'ajouter une clé dans l'objet `i18n` pour supporter une nouvelle langue.

---

### 🧬 Interaction avec le Moteur Python

Le Frontend communique avec le scanner via l'API interne `/api/scans` :
1. **Requête POST** : Initialise un scan avec l'URL cible.
2. **Process Spawning** : Le serveur Next.js lance `main.py` via un `child_process.spawn`.
3. **Streaming des Logs** : Les messages `LOG:` du script Python sont récupérés en temps réel par l'API et renvoyés à l'interface via un système de polling/state.
4. **Parsing JSON** : Une fois le scan terminé, le JSON brut est parsé et transformé en objet `Scan` affichable.

---

### 📊 Fonctionnalités Clés

#### Dashboard Tactique
Affiche des métriques critiques (Temps de scan, vulnérabilités critiques, cibles actives) sous forme de cartes d'état aérez avec des effets de dégradés et de flou (Glassmorphism).

#### Live Terminal
Une vue dédiée à l'inspection en temps réel qui simule une capture de paquets. Chaque événement est cliquable pour obtenir une "atténuation automatisée" et un plan de déploiement de correctif.

#### Intelligence EWABA
Le composant `ReportView` envoie les données de scan à l'IA Gemini. L'IA retourne :
- Une analyse d'impact business.
- Une stratégie de remédiation par niveau d'urgence.
- Un template de communication pour les parties prenantes.

---

### 🚀 Installation & Développement

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```
