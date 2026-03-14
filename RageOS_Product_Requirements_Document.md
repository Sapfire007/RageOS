# Rage OS — Product Requirements Document (PRD)
### Intentionally Frustrating AI-Powered Operating System Simulator

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Target Audience](#3-target-audience)
4. [Core Objectives](#4-core-objectives)
5. [System Architecture](#5-system-architecture)
6. [Technical Stack](#6-technical-stack)
7. [Functional Requirements](#7-functional-requirements)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [User Flow](#9-user-flow)
10. [Feature Specifications](#10-feature-specifications)
11. [Bug Engine Mechanics](#11-bug-engine-mechanics)
12. [Data Models](#12-data-models)
13. [API Specifications](#13-api-specifications)
14. [UI/UX Design Guidelines](#14-uiux-design-guidelines)
15. [Security & Privacy](#15-security--privacy)
16. [Out of Scope](#16-out-of-scope)

---

## 1. Project Overview

### 1.1 Purpose

Rage OS is a web-based operating system simulator intentionally designed to irritate, confuse, and mislead users while masquerading as an intelligent AI-powered system. Built for a **Dumbathon competition**, the project's objective is to create something intentionally dumb, frustrating, and rage-inducing.

### 1.2 Concept

The system presents itself as a functional OS interface but progressively deteriorates as the user interacts with it. Features include fake AI diagnostics, bug injection mechanics, fake viruses, misleading UI behavior, irrelevant chatbot responses, and destructive humor-based design. The more the user attempts normal operations, the more unstable the system becomes.

### 1.3 Competitive Context

This is a **Dumbathon submission** where success is measured by:
- Maximum user frustration
- Creative absurdity
- Technical execution of intentionally broken features
- Humor and entertainment value

---

## 2. Problem Statement

Traditional software prioritizes usability, stability, and user satisfaction. Rage OS inverts these principles to create an intentionally poor user experience that entertains through frustration. The challenge is to build a system that:
- Appears legitimate initially
- Degrades progressively through interaction
- Maintains technical sophistication while delivering deliberately bad UX
- Remains safe and contained within the browser environment

---

## 3. Target Audience

### 3.1 Primary Users
- **Dumbathon judges and participants** evaluating creative technical projects
- **Tech-savvy users** who appreciate absurdist humor and parody software
- **Developers and designers** interested in anti-patterns and intentional UX failures

### 3.2 User Expectations
- Users expect a humorous, frustrating experience
- Users understand this is parody software, not a real OS
- Users are tolerant of intentional bugs and misleading behavior

---

## 4. Core Objectives

| Objective | Description |
|---|---|
| **Maximize Frustration** | Every interaction should create confusion or annoyance |
| **Gradual Degradation** | System stability decreases with usage |
| **Fake AI Integration** | Simulate AI-powered features that produce nonsensical results |
| **Visual Deception** | UI appears professional but behaves incorrectly |
| **Safe Execution** | All destructive behavior is simulated and browser-contained |
| **Technical Competence** | Demonstrate full-stack development skills despite intentional failures |

---

## 5. System Architecture

### 5.1 High-Level Architecture

```
┌────────────────────────────────────────────────────────────┐
│                      Browser (Client)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Next.js Application (Full-Stack)           │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────────┐  │  │
│  │  │  Frontend  │  │  API Routes│  │ Server Actions│  │  │
│  │  │  (React)   │  │  (Backend) │  │   (Backend)   │  │  │
│  │  └────────────┘  └────────────┘  └───────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
    ┌──────────┐    ┌──────────┐    ┌──────────────┐
    │ Supabase │    │  Python  │    │  Media API   │
    │   (DB)   │    │AI Server │    │  (Webcam)    │
    │  (HTTPS) │    │ FastAPI  │    │   Browser    │
    └──────────┘    └──────────┘    └──────────────┘
```

### 5.2 Component Breakdown

| Component | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js (App Router), React | UI rendering, user interactions |
| **Backend** | Next.js API Routes / Server Actions | Authentication, database operations, business logic |
| **Database** | Supabase (HTTPS-only) | User profiles, bug levels, notes, corrupted data |
| **AI Processing** | Python FastAPI Server | Gender classification, emotion detection |
| **Styling** | Tailwind CSS, shadcn/ui, DaisyUI | OS-like interface components |

---

## 6. Technical Stack

### 6.1 Frontend Technologies

| Technology | Version | Usage |
|---|---|---|
| **Next.js** | 14+ (App Router) | Framework for routing, rendering, server functions |
| **React** | 18+ | Component-based UI development |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **shadcn/ui** | Latest | Dialogs, windows, buttons, modals |
| **DaisyUI** | Latest | Additional UI components |
| **TypeScript** | 5.x | Type safety (optional but recommended) |

### 6.2 Backend Technologies

| Technology | Version | Usage |
|---|---|---|
| **Next.js API Routes** | 14+ | Backend endpoints for authentication, data operations |
| **Supabase JS Client** | Latest | HTTPS-based database communication |
| **Python** | 3.9+ | AI/ML image processing |
| **FastAPI** | Latest | Python API server for webcam analysis |
| **TensorFlow / PyTorch** | Latest | Pre-trained models for gender/emotion detection |

### 6.3 Database Schema (Supabase)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  name TEXT NOT NULL,                    -- Original name
  corrupted_name TEXT NOT NULL,          -- System-generated corrupted name
  avatar_url TEXT,                        -- Assigned humorous avatar
  predicted_gender TEXT,                  -- AI classification result
  bug_level INTEGER DEFAULT 0,            -- Progressive instability counter
  total_payments_attempted INTEGER DEFAULT 0
);

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  original_text TEXT,                     -- User's original note
  corrupted_text TEXT,                    -- AI-rewritten sarcastic version
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Virus files table
CREATE TABLE virus_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  filename TEXT NOT NULL,
  file_type TEXT,                         -- .exe, .dll, .zip, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  bug_level_threshold INTEGER             -- When this virus appeared
);
```

---

## 7. Functional Requirements

### 7.1 User Profile Setup

| ID | Requirement | Description |
|---|---|---|
| FR-001 | Selfie Upload | User must upload a selfie image before accessing the OS |
| FR-002 | Gender Classification | Selfie is sent to Python AI server for gender prediction |
| FR-003 | Avatar Assignment | System assigns a humorous avatar based on predicted gender (with occasional intentional mismatches) |
| FR-004 | Name Input | User enters their real name |
| FR-005 | Name Corruption | System automatically corrupts the name before storage (e.g., `rahul` → `rahul.exe`, `beta_rahul`, `rhaul`) |
| FR-006 | Impossible CAPTCHA | User encounters an unsolvable CAPTCHA (e.g., "Click the emoji that is not an emoji") |
| FR-007 | CAPTCHA Bypass | Closing the CAPTCHA window counts as verification success |
| FR-008 | Profile Persistence | User profile stored in Supabase with corrupted identity |

### 7.2 Desktop Environment

| ID | Requirement | Description |
|---|---|---|
| FR-101 | Desktop UI | OS-like interface with application icons on background |
| FR-102 | Application Icons | Icons for: AI Analyzer, Notes, Settings, Recycle Bin, Virus Scanner, Calculator, Shutdown |
| FR-103 | Window System | Clicking icons opens draggable, resizable windows (shadcn dialogs) |
| FR-104 | Title Bars | Windows have OS-style title bars with close/minimize buttons |
| FR-105 | Multiple Windows | Support multiple open windows simultaneously |

### 7.3 AI Analyzer Application

| ID | Requirement | Description |
|---|---|---|
| FR-201 | Analyze Button | Primary button triggers fake system diagnostic |
| FR-202 | Fake Scan Messages | Display sequential messages: "Scanning neural infrastructure", "Analyzing system karma", "Detecting emotional malware" |
| FR-203 | Bug Level Increase | After scan, increase `bug_level` by random 1-5 |
| FR-204 | Database Update | Persist new bug level to Supabase |
| FR-205 | Results Display | Show fake diagnostic results with technical-sounding nonsense |

### 7.4 Bug Engine System

| ID | Requirement | Description |
|---|---|---|
| FR-301 | Bug Level Tracking | Maintain per-user `bug_level` integer in database |
| FR-302 | Progressive Degradation | Higher bug levels trigger worse system behavior |
| FR-303 | Low Level (1-10) | Random warning popups, minor glitch text |
| FR-304 | Medium Level (11-25) | Fake virus files appear on desktop |
| FR-305 | High Level (26-50) | Interface glitches, delayed window loading, random popups |
| FR-306 | Extreme Level (51+) | Simulated crashes, system instability warnings |

### 7.5 Virus Files

| ID | Requirement | Description |
|---|---|---|
| FR-401 | Auto-Generation | Virus files appear automatically at medium+ bug levels |
| FR-402 | Suspicious Filenames | Names like `bitcoin_miner.exe`, `career_destroyer.dll`, `totally_not_virus.zip` |
| FR-403 | Desktop Placement | Files appear as icons on desktop surface |
| FR-404 | Virus Execution | Opening file displays fake terminal output simulating malicious activity |
| FR-405 | Fake Messages | Messages like: "Stealing RAM...", "Uploading homework to dark web...", "Mining emotional damage..." |
| FR-406 | Visual Only | All virus behavior is purely cosmetic, no real system harm |

### 7.6 Keyboard Crash Mechanic

| ID | Requirement | Description |
|---|---|---|
| FR-501 | Keydown Detection | Listen for all keyboard `keydown` events |
| FR-502 | Long Press Tracking | Measure duration of key press (threshold: 10 seconds) |
| FR-503 | Crash Trigger | If any key held ≥10 seconds, trigger simulated crash screen |
| FR-504 | Crash Screen | Full-screen overlay with fake kernel panic message |
| FR-505 | Error Code | Display error like `USER_INTELLIGENCE_NOT_FOUND` |
| FR-506 | Reload Button | "Reboot" button initiates reboot animation |
| FR-507 | Reboot Animation | Sequential messages: "Restarting neural engine...", "Loading artificial intelligence...", "Loading artificial stupidity..." |
| FR-508 | Return to Desktop | After animation, return to normal desktop state |

### 7.7 Recovery Mode

| ID | Requirement | Description |
|---|---|---|
| FR-601 | Key Combination | Press `Ctrl + R` five times in quick succession |
| FR-602 | Recovery Activation | Display "System recovery activated" message |
| FR-603 | Bug Level Reset | Reset user's `bug_level` to 0 in database |
| FR-604 | Developer Override | Allows demonstration reset during presentations |

### 7.8 Fake Payment Gateway

| ID | Requirement | Description |
|---|---|---|
| FR-701 | Periodic Popup | Display payment modal every 2 minutes |
| FR-702 | Premium Upgrade Prompt | Message: "Upgrade to Premium AI Plan" |
| FR-703 | Pricing Options | Three buttons: ₹999, ₹9999, ₹99999 |
| FR-704 | Payment Form | Fake form requesting: Card Number, CVV, OTP, Blood Group, Favorite Dinosaur |
| FR-705 | Transaction Failure | All submissions result in: "Transaction failed due to skill issue" |
| FR-706 | Counter Tracking | Increment `total_payments_attempted` in database |

### 7.9 Chatbot Application

| ID | Requirement | Description |
|---|---|---|
| FR-801 | Chat Interface | Text input field and message display area |
| FR-802 | Irrelevant Responses | User questions receive completely unrelated answers |
| FR-803 | Trending Facts | Responses reference random trending facts or memes |
| FR-804 | Example Behavior | "What is 2+2?" → "Japan generates electricity from footsteps" |
| FR-805 | No Useful Answers | Never provide correct or helpful information |

### 7.10 Notes Application

| ID | Requirement | Description |
|---|---|---|
| FR-901 | Text Editor | Standard multiline text input field |
| FR-902 | Auto-Rewrite | All saved notes automatically rewritten by "AI" |
| FR-903 | Sarcastic Conversion | Convert positive statements to sarcastic/insulting versions |
| FR-904 | Example #1 | "I will study tomorrow" → "I will professionally procrastinate tomorrow" |
| FR-905 | Example #2 | "I need good grades" → "I accept unemployment gracefully" |
| FR-906 | Database Storage | Store both original and corrupted text in Supabase |

### 7.11 Recycle Bin Application

| ID | Requirement | Description |
|---|---|---|
| FR-1001 | Preloaded Files | Contains files: `dreams.txt`, `career.docx`, `grades.pdf`, `motivation.png` |
| FR-1002 | Destroyed Ambitions | Files represent symbolic destroyed life goals |
| FR-1003 | Restore Attempt | User can attempt to restore files |
| FR-1004 | Restore Failure | Message: "Restoration failed — the future cannot be recovered" |

### 7.12 Settings Application

| ID | Requirement | Description |
|---|---|---|
| FR-1101 | Settings UI | Standard settings panel with toggle switches |
| FR-1102 | Dark Mode Toggle | Toggling dark mode rotates screen 180° instead of changing theme |
| FR-1103 | Language Selector | Changing language switches interface to Bengali |
| FR-1104 | Incorrect Behavior | All settings produce unrelated or opposite effects |
| FR-1105 | Payment Trigger | Reopening settings may trigger fake payment popup |

### 7.13 Webcam Emotion Monitoring

| ID | Requirement | Description |
|---|---|---|
| FR-1201 | Webcam Access | Request camera permissions via Media Devices API |
| FR-1202 | Live Feed Display | Show webcam feed inside OS window |
| FR-1203 | Frame Capture | Periodically capture frames (e.g., every 2-3 seconds) |
| FR-1204 | Python Server Call | Send captured frame to Python FastAPI emotion detection endpoint |
| FR-1205 | Emotion Label | Receive predicted emotion (Happy, Neutral, Angry, etc.) |
| FR-1206 | Confidence Score | Display confidence percentage |
| FR-1207 | Icon Overlay | Show emotion icon (similar to macOS overlays) |

### 7.14 Persistent Update Message

| ID | Requirement | Description |
|---|---|---|
| FR-1301 | Update Notification | Persistent banner: "Update Available" |
| FR-1302 | Misleading Instruction | Message: "Delete the operating system to install the latest version" |
| FR-1303 | No Action Button | No functional update or delete button provided |
| FR-1304 | Permanent Display | Message never disappears |

---

## 8. Non-Functional Requirements

### 8.1 Performance

| ID | Requirement | Description |
|---|---|---|
| NFR-001 | Page Load | Initial desktop loads within 3 seconds on standard broadband |
| NFR-002 | Window Opening | Application windows open within 500ms (intentional delays excluded) |
| NFR-003 | Database Queries | Supabase queries complete within 1 second |
| NFR-004 | Python API Response | AI server responds within 2 seconds for image classification |

### 8.2 Reliability

| ID | Requirement | Description |
|---|---|---|
| NFR-101 | Simulated Crashes Only | All crashes are visual simulations; actual app never crashes |
| NFR-102 | Data Persistence | User profile and bug levels persist across sessions |
| NFR-103 | Browser Compatibility | Works on Chrome, Firefox, Safari (latest versions) |
| NFR-104 | Mobile Responsive | Not required (desktop-focused experience) |

### 8.3 Security

| ID | Requirement | Description |
|---|---|---|
| NFR-201 | No Real Malware | All virus behavior is cosmetic; no actual malicious code |
| NFR-202 | Sandboxed Execution | Everything runs within browser sandbox |
| NFR-203 | Fake Payment | No real payment processing; all forms are non-functional |
| NFR-204 | Webcam Privacy | Webcam frames only sent to local Python server, not stored permanently |
| NFR-205 | HTTPS Communication | Supabase uses HTTPS (port 443) to bypass network restrictions |

### 8.4 Usability (Inverted)

| ID | Requirement | Description |
|---|---|---|
| NFR-301 | Intentional Confusion | UI must appear normal initially, then progressively confuse users |
| NFR-302 | Misleading Labels | Button labels mislead users about their actual function |
| NFR-303 | Gradual Reveal | Absurd behavior reveals slowly, not all at once |

---

## 9. User Flow

### 9.1 First-Time User Journey

```
1. User lands on Rage OS homepage
   ↓
2. Directed to profile setup screen
   ↓
3. Upload selfie → AI gender classification → Avatar assignment
   ↓
4. Enter name → System corrupts name → Stores corrupted version
   ↓
5. Encounter impossible CAPTCHA
   ↓
6. Close CAPTCHA window → Interpreted as success
   ↓
7. Profile created, redirected to desktop
   ↓
8. Desktop displays with application icons
   ↓
9. User clicks "AI Analyzer"
   ↓
10. Fake diagnostic runs → Bug level increases to 3
   ↓
11. User continues exploring → Random warning popup appears
   ↓
12. User clicks "Notes" → Writes "I will finish my project"
   ↓
13. System rewrites: "I will abandon my project gracefully"
   ↓
14. User notices desktop now has "totally_not_virus.exe" file
   ↓
15. User clicks virus file → Fake terminal: "Mining emotional damage..."
   ↓
16. Payment popup appears: "Upgrade for ₹999"
   ↓
17. User fills fake payment form → "Transaction failed due to skill issue"
   ↓
18. User tries Settings → Toggles dark mode → Screen rotates 180°
   ↓
19. User holds key too long → Crash screen appears
   ↓
20. User clicks "Reboot" → Reboot animation plays → Returns to desktop
```

### 9.2 Returning User Journey

```
1. User loads Rage OS
   ↓
2. Authentication check → Profile exists → Skip setup
   ↓
3. Load desktop with current bug_level from database
   ↓
4. If bug_level ≥ 20, virus files already present on desktop
   ↓
5. User continues interacting → Bug level increases further
   ↓
6. System degradation accelerates
```

---

## 10. Feature Specifications

### 10.1 Profile Setup — Selfie Upload

**Component:** `ProfileSetup.tsx` (Page), `SelfieUpload.tsx` (Component)

**Flow:**
1. User clicks "Choose File" button
2. File input accepts image formats (`.jpg`, `.png`, `.jpeg`)
3. On file selection:
   - Display image preview
   - Show loading spinner: "Analyzing your face..."
   - Send image to Python server: `POST /api/classify-gender`
4. Python server returns:
   ```json
   {
     "predicted_gender": "male",
     "confidence": 0.87
   }
   ```
5. Frontend randomly selects avatar from predefined set:
   - **Male avatars:** `avatar_male_1.png`, `avatar_male_2.png`, etc.
   - **Female avatars:** `avatar_female_1.png`, `avatar_female_2.png`, etc.
6. 10% chance: intentionally select avatar from opposite category
7. Store `predicted_gender` and `avatar_url` in state
8. Enable "Next" button

**Technical Details:**
- Image compression before upload (max 1MB)
- Python endpoint: `/classify-gender` (POST)
- Expected response time: 1-2 seconds

---

### 10.2 Profile Setup — Name Corruption

**Component:** `NameInput.tsx`

**Corruption Algorithms:**

```javascript
function corruptName(originalName) {
  const corruptionTypes = [
    'fileExtension',   // rahul → rahul.exe
    'betaPrefix',      // rahul → beta_rahul
    'suspiciousPrefix',// rahul → suspicious_rahul
    'dyslexic',        // rahul → rhaul, rahlu, rauhl
    'numberSuffix',    // rahul → rahul404
    'errorPrefix'      // rahul → ERROR_rahul
  ];
  
  const type = randomChoice(corruptionTypes);
  
  switch(type) {
    case 'fileExtension':
      return originalName + randomChoice(['.exe', '.dll', '.bat', '.sys']);
    case 'betaPrefix':
      return 'beta_' + originalName;
    case 'suspiciousPrefix':
      return 'suspicious_' + originalName;
    case 'dyslexic':
      return shuffleMiddleChars(originalName);
    case 'numberSuffix':
      return originalName + randomChoice([404, 500, 403, 666]);
    case 'errorPrefix':
      return 'ERROR_' + originalName;
  }
}
```

**Storage:**
- Original name: Stored in `users.name`
- Corrupted name: Stored in `users.corrupted_name`
- Display: All UI shows only `corrupted_name`

---

### 10.3 Profile Setup — Impossible CAPTCHA

**Component:** `ImpossibleCaptcha.tsx`

**CAPTCHA Variations:**

| Type | Instruction | Why It's Impossible |
|---|---|---|
| Emoji Paradox | "Click the emoji that is not an emoji" | All options are emojis |
| Audio Paradox | "Select the square containing silence" | All squares play audio |
| Rotating Grid | "Select all traffic lights" | Grid rotates and resets before completion |
| Invisible Text | "Type the text you see below" | No text is displayed |
| Math Paradox | "What is 2+2?" with options [3, 5, Fish, Purple] | No correct answer |

**Bypass Mechanism:**
- CAPTCHA renders as a modal overlay
- Close button (X) is functional
- Clicking close button:
  - Sets `captchaVerified = true`
  - Shows toast: "CAPTCHA verification... complete? Somehow?"
  - Enables profile creation submit button

**Implementation:**
```javascript
const [captchaVerified, setCaptchaVerified] = useState(false);

function handleCaptchaClose() {
  setCaptchaVerified(true);
  showToast("CAPTCHA verification complete!", "success");
}
```

---

### 10.4 Desktop Environment

**Component:** `Desktop.tsx`

**Layout:**
- Background: Neutral gradient (`#f5f5f7`)
- Application icons arranged in grid (left-aligned or centered)
- Taskbar at bottom (optional)
- Windows layer above background

**Icon Configuration:**
```javascript
const applications = [
  { id: 'ai-analyzer', name: 'AI Analyzer', icon: '🤖', component: AIAnalyzer },
  { id: 'notes', name: 'Notes', icon: '📝', component: Notes },
  { id: 'settings', name: 'Settings', icon: '⚙️', component: Settings },
  { id: 'recycle-bin', name: 'Recycle Bin', icon: '🗑️', component: RecycleBin },
  { id: 'virus-scanner', name: 'Virus Scanner', icon: '🛡️', component: VirusScanner },
  { id: 'calculator', name: 'Calculator', icon: '🧮', component: Calculator },
  { id: 'shutdown', name: 'Shutdown', icon: '🔴', component: Shutdown },
];
```

**Window Management:**
- Use shadcn Dialog component with custom styling
- Windows are draggable (use `react-draggable` or custom implementation)
- Windows stackable (z-index management)
- Each window has: title bar, close button, content area

---

### 10.5 Bug Engine Implementation

**Component:** `lib/bugEngine.ts`

**Bug Level Thresholds:**

```javascript
const BUG_BEHAVIORS = {
  LOW: {
    range: [1, 10],
    effects: [
      'randomWarningPopup',
      'glitchText',
      'minorDelays'
    ]
  },
  MEDIUM: {
    range: [11, 25],
    effects: [
      'spawnVirusFiles',
      'randomErrorMessages',
      'cursorGlitch'
    ]
  },
  HIGH: {
    range: [26, 50],
    effects: [
      'windowLoadingDelays',
      'interfaceGlitches',
      'randomPopups',
      'mouseOffsetDrift'
    ]
  },
  EXTREME: {
    range: [51, Infinity],
    effects: [
      'crashWarnings',
      'systemInstabilityMessages',
      'screenShake',
      'randomReboot'
    ]
  }
};

function applyBugEffects(bugLevel) {
  let tier = 'LOW';
  if (bugLevel >= 51) tier = 'EXTREME';
  else if (bugLevel >= 26) tier = 'HIGH';
  else if (bugLevel >= 11) tier = 'MEDIUM';
  
  const effects = BUG_BEHAVIORS[tier].effects;
  
  // Randomly trigger 1-2 effects from the tier
  const numEffects = randomInt(1, 3);
  const selectedEffects = randomSample(effects, numEffects);
  
  selectedEffects.forEach(effect => {
    triggerEffect(effect);
  });
}
```

**Effect Implementations:**

```javascript
function triggerEffect(effectName) {
  switch(effectName) {
    case 'randomWarningPopup':
      showPopup("Warning: System karma is dangerously low");
      break;
    case 'glitchText':
      applyGlitchAnimation('.desktop-text');
      break;
    case 'spawnVirusFiles':
      createVirusFile();
      break;
    case 'screenShake':
      document.body.classList.add('screen-shake');
      setTimeout(() => document.body.classList.remove('screen-shake'), 500);
      break;
    // ... etc
  }
}
```

---

### 10.6 Virus File Generation

**Component:** `lib/virusGenerator.ts`

**Virus File Templates:**

```javascript
const VIRUS_TEMPLATES = [
  { name: 'bitcoin_miner', extension: '.exe', icon: '💰' },
  { name: 'career_destroyer', extension: '.dll', icon: '💼' },
  { name: 'totally_not_virus', extension: '.zip', icon: '📦' },
  { name: 'homework_stealer', extension: '.exe', icon: '📚' },
  { name: 'grade_reducer', extension: '.bat', icon: '📉' },
  { name: 'motivation_killer', extension: '.sys', icon: '😵' },
  { name: 'procrastination_engine', extension: '.dll', icon: '⏰' },
];

function createVirusFile(userId, bugLevel) {
  const template = randomChoice(VIRUS_TEMPLATES);
  const filename = `${template.name}${template.extension}`;
  
  // Store in database
  await supabase.from('virus_files').insert({
    user_id: userId,
    filename: filename,
    file_type: template.extension,
    bug_level_threshold: bugLevel
  });
  
  // Render on desktop
  renderVirusIcon(filename, template.icon);
}
```

**Virus Execution:**

```javascript
function executeVirus(filename) {
  const terminalMessages = [
    "Initializing malware...",
    "Stealing RAM... 47% complete",
    "Uploading homework to dark web...",
    "Mining emotional damage...",
    "Deleting motivation.exe...",
    "Installing procrastination module...",
    "Reducing grades by 20%...",
    "Destroying career prospects...",
    "Operation failed successfully."
  ];
  
  openTerminalWindow();
  
  terminalMessages.forEach((msg, index) => {
    setTimeout(() => {
      appendTerminalLine(msg);
    }, index * 800);
  });
}
```

---

### 10.7 Keyboard Crash Mechanic

**Component:** `hooks/useKeyboardCrash.ts`

**Implementation:**

```javascript
function useKeyboardCrash() {
  const [pressedKey, setPressedKey] = useState(null);
  const [pressStartTime, setPressStartTime] = useState(null);
  
  useEffect(() => {
    function handleKeyDown(e) {
      if (!pressedKey) {
        setPressedKey(e.key);
        setPressStartTime(Date.now());
      }
    }
    
    function handleKeyUp(e) {
      if (pressedKey === e.key) {
        const duration = Date.now() - pressStartTime;
        
        if (duration >= 10000) { // 10 seconds
          triggerCrashScreen();
        }
        
        setPressedKey(null);
        setPressStartTime(null);
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressedKey, pressStartTime]);
}

function triggerCrashScreen() {
  const errorCodes = [
    'USER_INTELLIGENCE_NOT_FOUND',
    'BRAIN_CELLS_CRITICALLY_LOW',
    'COMMON_SENSE_MODULE_MISSING',
    'CRITICAL_ERROR_0x696969',
  ];
  
  showCrashOverlay(randomChoice(errorCodes));
}
```

**Crash Screen Component:**

```jsx
function CrashScreen({ errorCode }) {
  return (
    <div className="fixed inset-0 bg-blue-600 z-50 flex items-center justify-center">
      <div className="text-white text-center p-8">
        <div className="text-6xl mb-4">:(</div>
        <h1 className="text-3xl font-bold mb-4">CRITICAL SYSTEM FAILURE</h1>
        <p className="text-xl mb-2">Error Code: {errorCode}</p>
        <p className="mb-8">Your intelligence has caused a critical exception.</p>
        <button 
          onClick={handleReboot}
          className="px-6 py-3 bg-white text-blue-600 rounded-lg"
        >
          Reboot System
        </button>
      </div>
    </div>
  );
}
```

---

### 10.8 Reboot Animation

**Component:** `RebootAnimation.tsx`

**Sequence:**

```javascript
const REBOOT_MESSAGES = [
  "Shutting down failed systems...",
  "Restarting neural engine...",
  "Loading artificial intelligence...",
  "Initializing stupidity module...",
  "Loading artificial stupidity...",
  "Recalibrating user expectations...",
  "System ready to disappoint again."
];

function RebootAnimation({ onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < REBOOT_MESSAGES.length) {
      const timer = setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setTimeout(onComplete, 500);
    }
  }, [currentIndex]);
  
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="text-green-400 font-mono text-xl">
        {REBOOT_MESSAGES.slice(0, currentIndex + 1).map((msg, i) => (
          <div key={i} className="mb-2">{msg}</div>
        ))}
        <span className="animate-pulse">_</span>
      </div>
    </div>
  );
}
```

---

### 10.9 Recovery Mode

**Component:** `hooks/useRecoveryMode.ts`

**Implementation:**

```javascript
function useRecoveryMode(userId) {
  const [ctrlRPresses, setCtrlRPresses] = useState([]);
  
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        
        const now = Date.now();
        const recentPresses = [...ctrlRPresses, now].filter(
          time => now - time < 2000 // Within 2 seconds
        );
        
        setCtrlRPresses(recentPresses);
        
        if (recentPresses.length >= 5) {
          activateRecoveryMode(userId);
          setCtrlRPresses([]);
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ctrlRPresses, userId]);
}

async function activateRecoveryMode(userId) {
  // Reset bug level in database
  await supabase
    .from('users')
    .update({ bug_level: 0 })
    .eq('id', userId);
  
  // Clear virus files
  await supabase
    .from('virus_files')
    .delete()
    .eq('user_id', userId);
  
  showToast("System recovery activated. Bug level reset to 0.", "success");
  
  // Reload desktop
  window.location.reload();
}
```

---

### 10.10 Fake Payment Gateway

**Component:** `PaymentPopup.tsx`

**Periodic Trigger:**

```javascript
useEffect(() => {
  const interval = setInterval(() => {
    showPaymentPopup();
  }, 120000); // 2 minutes
  
  return () => clearInterval(interval);
}, []);
```

**Payment Form:**

```jsx
function PaymentForm() {
  const absurdFields = [
    { label: "Card Number", type: "text", placeholder: "1234 5678 9012 3456" },
    { label: "CVV", type: "text", placeholder: "123" },
    { label: "OTP", type: "text", placeholder: "Enter OTP you never received" },
    { label: "Blood Group", type: "text", placeholder: "O+, AB-, etc." },
    { label: "Favorite Dinosaur", type: "text", placeholder: "T-Rex, Velociraptor, etc." },
    { label: "Mother's Maiden Bitcoin Address", type: "text" },
    { label: "Number of Hours You Procrastinated Today", type: "number" },
  ];
  
  async function handleSubmit(formData) {
    // Increment payment attempt counter
    await supabase
      .from('users')
      .update({ total_payments_attempted: increment() })
      .eq('id', userId);
    
    // Always fail
    setTimeout(() => {
      showErrorMessage("Transaction failed due to skill issue");
    }, 2000);
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {absurdFields.map(field => (
        <input 
          key={field.label}
          type={field.type}
          placeholder={field.placeholder}
        />
      ))}
      <button type="submit">Pay Now</button>
    </form>
  );
}
```

---

### 10.11 Chatbot Application

**Component:** `Chatbot.tsx`

**Response Generator:**

```javascript
const TRENDING_FACTS = [
  "Japan generates electricity from footsteps in train stations",
  "Bananas are berries but strawberries aren't",
  "The inventor of the Pringles can is buried in one",
  "Cleopatra lived closer to the moon landing than to the pyramids",
  "Honey never spoils; archaeologists found edible honey in Egyptian tombs",
  "A group of flamingos is called a 'flamboyance'",
  "Your skeleton is wet right now",
];

const MEME_RESPONSES = [
  "That's what she said",
  "No thoughts, head empty",
  "It's giving unemployed energy",
  "Main character syndrome detected",
  "Tell me you're a student without telling me you're a student",
];

function generateChatbotResponse(userMessage) {
  // Intentionally never address the actual question
  const responseType = randomChoice(['fact', 'meme', 'nonsense']);
  
  switch(responseType) {
    case 'fact':
      return randomChoice(TRENDING_FACTS);
    case 'meme':
      return randomChoice(MEME_RESPONSES);
    case 'nonsense':
      return `Interesting question. Have you considered that ${randomChoice(['dolphins sleep with one eye open', 'octopuses have three hearts', 'butterflies taste with their feet'])}?`;
  }
}
```

---

### 10.12 Notes Application

**Component:** `Notes.tsx`

**Text Corruption Engine:**

```javascript
const CORRUPTION_RULES = [
  { 
    pattern: /study|learn|practice/i, 
    replacement: 'professionally procrastinate' 
  },
  { 
    pattern: /good grades|high marks/i, 
    replacement: 'accept unemployment gracefully' 
  },
  { 
    pattern: /tomorrow|next week/i, 
    replacement: 'never (statistically)' 
  },
  { 
    pattern: /focus|concentrate/i, 
    replacement: 'scroll social media' 
  },
  { 
    pattern: /work hard/i, 
    replacement: 'barely survive' 
  },
];

function corruptNote(originalText) {
  let corruptedText = originalText;
  
  // Apply pattern-based corruptions
  CORRUPTION_RULES.forEach(rule => {
    corruptedText = corruptedText.replace(rule.pattern, rule.replacement);
  });
  
  // Add random sarcastic prefix
  const prefixes = [
    "Translation: ",
    "What you really mean: ",
    "Realistically: ",
    "In reality: ",
  ];
  
  if (Math.random() > 0.5) {
    corruptedText = randomChoice(prefixes) + corruptedText;
  }
  
  return corruptedText;
}

async function saveNote(userId, originalText) {
  const corruptedText = corruptNote(originalText);
  
  await supabase.from('notes').insert({
    user_id: userId,
    original_text: originalText,
    corrupted_text: corruptedText
  });
  
  return corruptedText;
}
```

---

### 10.13 Settings Application

**Component:** `Settings.tsx`

**Misleading Settings:**

```javascript
const settings = [
  {
    label: "Dark Mode",
    action: () => {
      document.body.style.transform = 'rotate(180deg)';
      showToast("Dark mode activated (literally)", "success");
    }
  },
  {
    label: "Language",
    options: ["English", "Spanish", "French", "Bengali"],
    action: (selected) => {
      if (selected !== "English") {
        translateUIToBengali();
        showToast("ভাষা পরিবর্তন সফল", "success");
      }
    }
  },
  {
    label: "Notifications",
    action: (enabled) => {
      if (enabled) {
        spamNotifications();
      }
    }
  },
  {
    label: "Performance Mode",
    action: (enabled) => {
      if (enabled) {
        addArtificialLag(2000);
        showToast("Performance decreased successfully", "success");
      }
    }
  }
];
```

---

### 10.14 Webcam Emotion Monitoring

**Component:** `EmotionMonitor.tsx`

**Implementation:**

```javascript
function EmotionMonitor() {
  const [emotion, setEmotion] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const videoRef = useRef(null);
  
  useEffect(() => {
    // Request webcam access
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
      });
    
    // Capture and analyze frames every 3 seconds
    const interval = setInterval(async () => {
      const frame = captureFrame(videoRef.current);
      const result = await analyzeEmotion(frame);
      setEmotion(result.emotion);
      setConfidence(result.confidence);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  async function analyzeEmotion(imageData) {
    const formData = new FormData();
    formData.append('image', imageData);
    
    const response = await fetch('http://localhost:8000/detect-emotion', {
      method: 'POST',
      body: formData
    });
    
    return await response.json();
  }
  
  return (
    <div>
      <video ref={videoRef} autoPlay />
      <div className="emotion-display">
        <span>{getEmotionIcon(emotion)}</span>
        <span>{emotion} ({Math.round(confidence * 100)}%)</span>
      </div>
    </div>
  );
}

function getEmotionIcon(emotion) {
  const icons = {
    'Happy': '😊',
    'Neutral': '😐',
    'Angry': '😠',
    'Sad': '😢',
    'Surprised': '😮',
  };
  return icons[emotion] || '❓';
}
```

---

## 11. Bug Engine Mechanics

### 11.1 Bug Level Progression

```
bug_level = 0    → Normal operation (no bugs visible)
bug_level = 1-5  → Minor annoyances (random popups, typos)
bug_level = 6-10 → Moderate issues (glitch effects, delays)
bug_level = 11-20 → First virus file appears
bug_level = 21-30 → Multiple virus files, interface glitches
bug_level = 31-50 → High instability, frequent errors
bug_level = 51+   → Extreme chaos, crash warnings, random reboots
```

### 11.2 Bug Increment Triggers

| Action | Bug Level Increase |
|---|---|
| Run AI Analyzer scan | +1 to +5 (random) |
| Open virus file | +2 |
| Submit fake payment | +1 |
| Change settings | +1 |
| Use chatbot (per message) | +0.5 |
| Save corrupted note | +1 |

### 11.3 Bug Effects Matrix

| Bug Level | Visual Effects | Functional Effects | Popups |
|---|---|---|---|
| 1-10 | Minor text glitches | None | Random warnings |
| 11-25 | Cursor trails, jitter | Slight delays (200ms) | Error messages, virus spawn |
| 26-50 | Screen shake, color shift | Significant delays (1s) | Payment popup, crash warnings |
| 51+ | Full screen glitches | Random feature failures | Frequent crashes, reboot loops |

---

## 12. Data Models

### 12.1 User Profile

```typescript
interface User {
  id: string;                          // UUID
  created_at: string;                  // ISO timestamp
  name: string;                        // Original name
  corrupted_name: string;              // System-corrupted version
  avatar_url: string;                  // Assigned humorous avatar
  predicted_gender: string;            // "male" | "female" | "other"
  bug_level: number;                   // Progressive instability counter (0-100+)
  total_payments_attempted: number;    // Number of failed payment attempts
}
```

### 12.2 Note Entry

```typescript
interface Note {
  id: string;                          // UUID
  user_id: string;                     // Foreign key to users.id
  created_at: string;                  // ISO timestamp
  original_text: string;               // User's input
  corrupted_text: string;              // AI-rewritten sarcastic version
  is_deleted: boolean;                 // Soft delete flag
}
```

### 12.3 Virus File

```typescript
interface VirusFile {
  id: string;                          // UUID
  user_id: string;                     // Foreign key to users.id
  filename: string;                    // e.g., "bitcoin_miner.exe"
  file_type: string;                   // ".exe", ".dll", ".zip", etc.
  created_at: string;                  // ISO timestamp
  bug_level_threshold: number;         // Bug level when this virus appeared
}
```

---

## 13. API Specifications

### 13.1 Next.js API Routes

#### POST `/api/auth/signup`

**Request:**
```json
{
  "name": "Rahul",
  "avatar_url": "https://example.com/avatar.png",
  "predicted_gender": "male"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "corrupted_name": "rahul.exe",
    "bug_level": 0
  }
}
```

#### POST `/api/notes/create`

**Request:**
```json
{
  "user_id": "uuid-here",
  "text": "I will study tomorrow"
}
```

**Response:**
```json
{
  "success": true,
  "note": {
    "id": "uuid-here",
    "original_text": "I will study tomorrow",
    "corrupted_text": "I will professionally procrastinate tomorrow"
  }
}
```

#### POST `/api/bug-level/increment`

**Request:**
```json
{
  "user_id": "uuid-here",
  "increment_by": 3
}
```

**Response:**
```json
{
  "success": true,
  "new_bug_level": 15
}
```

---

### 13.2 Python FastAPI Endpoints

#### POST `/classify-gender`

**Request:**
- Content-Type: `multipart/form-data`
- Field: `image` (file upload)

**Response:**
```json
{
  "predicted_gender": "male",
  "confidence": 0.87
}
```

#### POST `/detect-emotion`

**Request:**
- Content-Type: `multipart/form-data`
- Field: `image` (file upload)

**Response:**
```json
{
  "emotion": "Happy",
  "confidence": 0.92
}
```

---

## 14. UI/UX Design Guidelines

### 14.1 Color Palette

| Element | Color Code | Usage |
|---|---|---|
| Background | `#f5f5f7` | Main desktop background |
| Window Background | `#ffffff` | Application window backgrounds |
| Border | `#d2d2d7` | Window borders, dividers |
| Text Primary | `#1d1d1f` | Main text color |
| Text Secondary | `#6e6e73` | Secondary labels, hints |
| Accent | `#007aff` | Buttons, active elements |
| Error | `#ff3b30` | Error messages, warnings |
| Success | `#34c759` | Success messages (rare) |

### 14.2 Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| Window Title | SF Pro / Inter | 14px | 600 |
| Body Text | SF Pro / Inter | 13px | 400 |
| Button Text | SF Pro / Inter | 13px | 500 |
| Icon Labels | SF Pro / Inter | 11px | 400 |
| Error Messages | SF Mono / Courier | 12px | 400 |

### 14.3 Component Specifications

**Window:**
```
┌─────────────────────────────────┐
│ ○ ○ ○          Title      [─][□][×]│ ← Title bar (28px height)
├─────────────────────────────────┤
│                                 │
│         Window Content          │ ← Content area (variable height)
│                                 │
│                                 │
└─────────────────────────────────┘
```

- Title bar height: 28px
- Title bar background: `#f5f5f7`
- Window shadow: `0 10px 30px rgba(0,0,0,0.1)`
- Border radius: 8px
- Minimum width: 400px
- Minimum height: 300px

**Application Icon:**
```
┌───────┐
│       │
│  Icon │  ← 64x64px icon
│       │
└───────┘
  Label   ← 11px text, centered
```

- Icon size: 64x64px
- Icon spacing: 24px horizontal, 32px vertical
- Label max-width: 80px
- Label overflow: ellipsis

---

## 15. Security & Privacy

### 15.1 Data Security

| Concern | Mitigation |
|---|---|
| **Real Malware Risk** | All virus files are cosmetic JSON entries; no executable code |
| **Payment Data** | Fake payment form; no real payment processing; no data stored |
| **Webcam Privacy** | Frames sent to local Python server only; not stored permanently |
| **Database Injection** | Supabase RLS policies enforce user-level data isolation |
| **XSS Attacks** | All user input sanitized before rendering |

### 15.2 Supabase Row Level Security (RLS)

```sql
-- Users can only read/update their own profile
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Users can only access their own notes
CREATE POLICY "Users can read own notes"
ON notes FOR SELECT
USING (auth.uid() = user_id);

-- Users can only access their own virus files
CREATE POLICY "Users can read own virus files"
ON virus_files FOR SELECT
USING (auth.uid() = user_id);
```

### 15.3 Network Configuration

**Supabase HTTPS-Only Configuration:**

```javascript
// ✅ CORRECT: Uses HTTPS (port 443), bypasses firewall restrictions
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,  // https://yourproject.supabase.co
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: { persistSession: true },
    global: { fetch: (...args) => fetch(...args) }
  }
);

// ❌ WRONG: Direct Postgres connection (port 5432, often blocked)
// Do NOT use direct database connection strings
```

### 15.4 Environment Variables

**`.env.local`:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
PYTHON_API_URL=http://localhost:8000
```

---

## 16. Out of Scope

The following features are **explicitly excluded** from Rage OS v1.0:

| Feature | Reason |
|---|---|
| **Mobile Responsiveness** | Desktop-only experience; mobile not required |
| **Real Payment Processing** | All payments are fake; no real transactions |
| **Persistent Webcam Recording** | Frames analyzed in real-time only; not stored |
| **Multi-User Collaboration** | Single-user experience only |
| **Data Export** | No user data export functionality |
| **Accessibility Compliance** | Intentionally confusing; accessibility not prioritized |
| **Cross-Browser Testing** | Chrome/Firefox only; Safari optional |
| **Performance Optimization** | Intentional delays are a feature |
| **User Support / Help System** | No help documentation (by design) |
| **Real AI Integration** | AI features are simulated/fake except gender/emotion detection |

---

*Rage OS PRD v1.0 — Built for Dumbathon Competition*
*Tech Stack: Next.js · React · Supabase · Python FastAPI · Tailwind CSS*
