# Rage OS — Phase-by-Phase Execution Plan
### Dumbathon Project Development Guide

---

## Execution Principles

- Build **sequentially** — complete each phase before advancing
- **Do not skip phases** — dependencies exist between phases
- Validate deliverables with **manual testing** at each checkpoint
- Prioritize **core frustration mechanics** over polish until final phases
- Keep implementation **intentionally broken but technically sound**
- All "bugs" are **controlled features**, not actual errors
- Use **Stitch MCP for all UI** — Before implementing any component or page, call the Stitch MCP tool (configured in `.vscode/mcp.json`) to generate the visual design. Adapt the returned design to the project's Tailwind CSS / shadcn/ui / DaisyUI stack.

---

## UI Design Protocol (Stitch MCP)

All visual UI work in this project is driven by **Stitch MCP** — Google's AI UI generation server configured in `.vscode/mcp.json`.

### What is Stitch MCP?
Stitch is an MCP server hosted at `https://stitch.googleapis.com/mcp`. Its API key is already present in `.vscode/mcp.json` — no additional environment setup is required.

### Mandatory Workflow (Every Component)

1. **Describe** the component or page you need in natural language (layout, purpose, key elements)
2. **Call Stitch MCP** with that description using the Stitch tool in your editor
3. **Receive** the generated design/code output from Stitch
4. **Adapt** the output to the project stack: React + Tailwind CSS + shadcn/ui + DaisyUI
5. **Implement** the component, using the Stitch output as the authoritative design reference

### Rules

- Stitch is the **source of truth** for all visual design decisions
- Do **not** write freehand CSS or invent layouts without first calling Stitch
- This applies to **every** React component and page — no exceptions
- If Stitch output conflicts with shadcn/ui patterns, prefer shadcn/ui for interactive primitives; use Stitch for layout and visual style
- Log the Stitch prompt used for each component in a comment at the top of the file: `// Stitch prompt: "<your description>"`

---

## Phase 0: Project Initialization & Setup

**Goal:** Establish the repository structure, install dependencies, and configure Supabase connection.

### Tasks

#### Repository Setup
- Initialize Git repository at project root
- Create folder structure:
  ```
  /rage-os
  ├── /app                 ← Next.js App Router pages
  ├── /components          ← Reusable UI components
  ├── /lib                 ← Utilities, bug engine, Supabase client
  ├── /python-ai           ← FastAPI server for image analysis
  ├── /public              ← Static assets (avatars, icons)
  └── /styles              ← Global CSS and Tailwind config
  ```
- Add root-level `.gitignore`:
  ```
  node_modules/
  .next/
  .env.local
  python-ai/__pycache__/
  python-ai/venv/
  ```

#### Next.js Initialization
```bash
npx create-next-app@latest rage-os --typescript --tailwind --app
cd rage-os
```

#### Install Frontend Dependencies
```bash
npm install @supabase/supabase-js
npm install @radix-ui/react-dialog @radix-ui/react-toast
npm install class-variance-authority clsx tailwind-merge
npm install react-draggable
npm install lucide-react
npx shadcn-ui@latest init
npx shadcn-ui@latest add dialog button toast card
```

#### Install DaisyUI
```bash
npm install daisyui
```

Update `tailwind.config.js`:
```javascript
module.exports = {
  plugins: [require("daisyui")],
  daisyui: {
    themes: false, // Disable default themes
  },
}
```

#### Supabase Project Setup
- Create new Supabase project at https://supabase.com
- Navigate to Project Settings → API
- Copy `Project URL` and `anon public` key
- Create `.env.local`:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
  ```

#### Create Supabase Client
Create `/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    },
    global: {
      fetch: (...args) => fetch(...args)
    }
  }
)
```

### Deliverables
- [ ] Git repository initialized with proper `.gitignore`
- [ ] Next.js project runs locally (`npm run dev`)
- [ ] Supabase client configured and connection tested
- [ ] All dependencies installed without errors

---

## Phase 1: Database Schema & Supabase Tables

**Goal:** Create all required database tables with proper schemas and Row Level Security policies.

### Tasks

#### Navigate to Supabase SQL Editor

Execute the following SQL in Supabase Dashboard → SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  name TEXT NOT NULL,
  corrupted_name TEXT NOT NULL,
  avatar_url TEXT,
  predicted_gender TEXT,
  bug_level INTEGER DEFAULT 0,
  total_payments_attempted INTEGER DEFAULT 0
);

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  original_text TEXT,
  corrupted_text TEXT,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Virus files table
CREATE TABLE virus_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  bug_level_threshold INTEGER
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE virus_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (id = auth.uid());

-- RLS Policies for notes
CREATE POLICY "Users can read own notes"
ON notes FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notes"
ON notes FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notes"
ON notes FOR UPDATE
USING (user_id = auth.uid());

-- RLS Policies for virus_files
CREATE POLICY "Users can read own virus files"
ON virus_files FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own virus files"
ON virus_files FOR INSERT
WITH CHECK (user_id = auth.uid());
```

#### Create Test User
Insert a test user manually via Supabase Dashboard to verify schema:
```sql
INSERT INTO users (name, corrupted_name, avatar_url, predicted_gender)
VALUES ('Test User', 'test_user.exe', 'https://example.com/avatar.png', 'male');
```

### Deliverables
- [ ] All three tables created successfully in Supabase
- [ ] RLS policies enabled and verified
- [ ] Test user record inserted and readable

---

## Phase 2: Authentication & Profile Setup Flow

**Goal:** Build the user onboarding experience including selfie upload, name corruption, and impossible CAPTCHA.

### Tasks

> 🎨 **Stitch MCP Check** — Before starting any component in this phase, call Stitch MCP with a description of the desired UI. Use the output as the design reference before writing any JSX or CSS.

#### Create Authentication Context
Create `/lib/auth-context.tsx`:
```typescript
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

interface AuthContextType {
  userId: string | null
  user: any | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  userId: null,
  user: null,
  loading: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user exists in localStorage
    const storedUserId = localStorage.getItem('rage_os_user_id')
    if (storedUserId) {
      loadUser(storedUserId)
    } else {
      setLoading(false)
    }
  }, [])

  async function loadUser(id: string) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (data) {
      setUser(data)
      setUserId(id)
    }
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ userId, user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

#### Create Profile Setup Page
Create `/app/setup/page.tsx`:
```typescript
'use client'
import { useState } from 'react'
import SelfieUpload from '@/components/SelfieUpload'
import NameInput from '@/components/NameInput'
import ImpossibleCaptcha from '@/components/ImpossibleCaptcha'

export default function SetupPage() {
  const [step, setStep] = useState(1) // 1: Selfie, 2: Name, 3: CAPTCHA
  const [selfieData, setSelfieData] = useState<any>(null)
  const [userName, setUserName] = useState('')

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-semibold mb-6">Rage OS Setup</h1>
        
        {step === 1 && (
          <SelfieUpload 
            onComplete={(data) => {
              setSelfieData(data)
              setStep(2)
            }}
          />
        )}
        
        {step === 2 && (
          <NameInput 
            onComplete={(name) => {
              setUserName(name)
              setStep(3)
            }}
          />
        )}
        
        {step === 3 && (
          <ImpossibleCaptcha 
            onComplete={() => {
              createProfile(selfieData, userName)
            }}
          />
        )}
      </div>
    </div>
  )
}
```

#### Build Selfie Upload Component
Create `/components/SelfieUpload.tsx`:
```typescript
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function SelfieUpload({ onComplete }: any) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [loading, setLoading] = useState(false)

  async function handleUpload() {
    if (!file) return
    
    setLoading(true)
    
    // TODO: Send to Python server for gender classification
    // For now, mock response
    const mockGender = Math.random() > 0.5 ? 'male' : 'female'
    
    setTimeout(() => {
      onComplete({
        predicted_gender: mockGender,
        avatar_url: '/avatars/default.png' // TODO: Assign based on gender
      })
      setLoading(false)
    }, 2000)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
    }
  }

  return (
    <div>
      <h2 className="text-lg mb-4">Upload Your Selfie</h2>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        className="mb-4"
      />
      {preview && (
        <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded mb-4" />
      )}
      {loading && <p>Analyzing your face with AI...</p>}
      <Button onClick={handleUpload} disabled={!file || loading}>
        {loading ? 'Analyzing...' : 'Continue'}
      </Button>
    </div>
  )
}
```

#### Build Name Input Component
Create `/components/NameInput.tsx`:
```typescript
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function NameInput({ onComplete }: any) {
  const [name, setName] = useState('')

  return (
    <div>
      <h2 className="text-lg mb-4">Enter Your Name</h2>
      <input 
        type="text" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="border p-2 rounded w-full mb-4"
      />
      <Button onClick={() => onComplete(name)} disabled={!name}>
        Continue
      </Button>
    </div>
  )
}
```

#### Build Impossible CAPTCHA Component
Create `/components/ImpossibleCaptcha.tsx`:
```typescript
'use client'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function ImpossibleCaptcha({ onComplete }: any) {
  const [open, setOpen] = useState(true)

  const impossiblePrompts = [
    "Click the emoji that is not an emoji",
    "Select the square containing silence",
    "Type the text you cannot see",
    "Choose the option that doesn't exist"
  ]

  const randomPrompt = impossiblePrompts[Math.floor(Math.random() * impossiblePrompts.length)]

  function handleClose() {
    setOpen(false)
    // Closing the CAPTCHA counts as success
    setTimeout(() => onComplete(), 500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogTitle>Verify You Are Human</DialogTitle>
        <div className="p-4">
          <p className="mb-4">{randomPrompt}</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {['😀', '😎', '🤖', '🎯', '🔥', '💀', '🌟', '🎨', '🎭'].map((emoji, i) => (
              <button key={i} className="p-4 border rounded hover:bg-gray-100">
                {emoji}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Hint: Try closing this window if you're stuck
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

#### Implement Name Corruption Utility
Create `/lib/name-corruption.ts`:
```typescript
export function corruptName(originalName: string): string {
  const corruptionTypes = [
    'fileExtension',
    'betaPrefix',
    'suspiciousPrefix',
    'dyslexic',
    'numberSuffix',
    'errorPrefix'
  ]
  
  const type = corruptionTypes[Math.floor(Math.random() * corruptionTypes.length)]
  
  switch(type) {
    case 'fileExtension':
      return originalName + ['.exe', '.dll', '.bat', '.sys'][Math.floor(Math.random() * 4)]
    case 'betaPrefix':
      return 'beta_' + originalName
    case 'suspiciousPrefix':
      return 'suspicious_' + originalName
    case 'dyslexic':
      return shuffleMiddleChars(originalName)
    case 'numberSuffix':
      return originalName + [404, 500, 403, 666][Math.floor(Math.random() * 4)]
    case 'errorPrefix':
      return 'ERROR_' + originalName
    default:
      return originalName
  }
}

function shuffleMiddleChars(str: string): string {
  if (str.length < 4) return str
  const first = str[0]
  const last = str[str.length - 1]
  const middle = str.slice(1, -1).split('')
  
  // Fisher-Yates shuffle
  for (let i = middle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [middle[i], middle[j]] = [middle[j], middle[i]]
  }
  
  return first + middle.join('') + last
}
```

#### Create Profile in Database
Update `/app/setup/page.tsx` with profile creation:
```typescript
import { supabase } from '@/lib/supabase'
import { corruptName } from '@/lib/name-corruption'
import { useRouter } from 'next/navigation'

async function createProfile(selfieData: any, userName: string) {
  const corruptedName = corruptName(userName)
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      name: userName,
      corrupted_name: corruptedName,
      avatar_url: selfieData.avatar_url,
      predicted_gender: selfieData.predicted_gender
    })
    .select()
    .single()
  
  if (data) {
    localStorage.setItem('rage_os_user_id', data.id)
    router.push('/desktop')
  }
}
```

### Deliverables
- [ ] Profile setup flow completes successfully
- [ ] Selfie upload shows preview (Python integration pending)
- [ ] Name corruption algorithm produces funny variations
- [ ] CAPTCHA can be bypassed by closing the dialog
- [ ] User profile created in Supabase
- [ ] User ID stored in localStorage

---

## Phase 3: Python AI Server — Gender & Emotion Detection

**Goal:** Build the FastAPI server for image classification using pre-trained models.

### Tasks

#### Initialize Python Project
```bash
cd rage-os
mkdir python-ai
cd python-ai
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install Dependencies
```bash
pip install fastapi uvicorn python-multipart pillow tensorflow opencv-python numpy
```

#### Create FastAPI Server
Create `/python-ai/server.py`:
```python
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
from PIL import Image
import io

app = FastAPI()

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO: Load pre-trained models here
# gender_model = load_model('models/gender_classifier.h5')
# emotion_model = load_model('models/emotion_classifier.h5')

@app.get("/")
def read_root():
    return {"status": "Rage OS AI Server Running"}

@app.post("/classify-gender")
async def classify_gender(image: UploadFile = File(...)):
    """
    Classify gender from uploaded selfie image
    """
    # Read image
    contents = await image.read()
    img = Image.open(io.BytesIO(contents))
    
    # TODO: Preprocess and run through gender model
    # For now, return mock prediction
    predicted_gender = np.random.choice(['male', 'female'])
    confidence = np.random.uniform(0.7, 0.95)
    
    return {
        "predicted_gender": predicted_gender,
        "confidence": float(confidence)
    }

@app.post("/detect-emotion")
async def detect_emotion(image: UploadFile = File(...)):
    """
    Detect emotion from webcam frame
    """
    contents = await image.read()
    img = Image.open(io.BytesIO(contents))
    
    # TODO: Preprocess and run through emotion model
    # For now, return mock prediction
    emotions = ['Happy', 'Neutral', 'Angry', 'Sad', 'Surprised']
    predicted_emotion = np.random.choice(emotions)
    confidence = np.random.uniform(0.6, 0.9)
    
    return {
        "emotion": predicted_emotion,
        "confidence": float(confidence)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

#### Run Python Server
```bash
python server.py
```

Server should start at `http://localhost:8000`

#### Test Endpoints
```bash
curl http://localhost:8000/
```

#### Update Frontend to Call Python API
Update `/components/SelfieUpload.tsx`:
```typescript
async function handleUpload() {
  if (!file) return
  setLoading(true)
  
  const formData = new FormData()
  formData.append('image', file)
  
  try {
    const response = await fetch('http://localhost:8000/classify-gender', {
      method: 'POST',
      body: formData
    })
    const data = await response.json()
    
    onComplete({
      predicted_gender: data.predicted_gender,
      avatar_url: `/avatars/${data.predicted_gender}_${Math.floor(Math.random() * 3) + 1}.png`
    })
  } catch (error) {
    console.error('Gender classification failed:', error)
  } finally {
    setLoading(false)
  }
}
```

### Deliverables
- [ ] Python FastAPI server runs on port 8000
- [ ] `/classify-gender` endpoint accepts images and returns predictions
- [ ] `/detect-emotion` endpoint ready for webcam integration
- [ ] Frontend successfully calls Python API during selfie upload
- [ ] CORS configured correctly

---

## Phase 4: Desktop Environment & Window System

**Goal:** Build the core desktop UI with application icons and draggable windows.

### Tasks

> 🎨 **Stitch MCP Check** — Before starting any component in this phase, call Stitch MCP with a description of the desired UI. Use the output as the design reference before writing any JSX or CSS.

#### Create Desktop Layout
Create `/app/desktop/page.tsx`:
```typescript
'use client'
import { useAuth } from '@/lib/auth-context'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ApplicationIcon from '@/components/ApplicationIcon'
import WindowManager from '@/components/WindowManager'

export default function Desktop() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [openWindows, setOpenWindows] = useState<string[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/setup')
    }
  }, [user, loading])

  const applications = [
    { id: 'ai-analyzer', name: 'AI Analyzer', icon: '🤖' },
    { id: 'notes', name: 'Notes', icon: '📝' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
    { id: 'recycle-bin', name: 'Recycle Bin', icon: '🗑️' },
    { id: 'virus-scanner', name: 'Virus Scanner', icon: '🛡️' },
    { id: 'calculator', name: 'Calculator', icon: '🧮' },
    { id: 'chatbot', name: 'AI Chat', icon: '💬' },
  ]

  function openApplication(appId: string) {
    if (!openWindows.includes(appId)) {
      setOpenWindows([...openWindows, appId])
    }
  }

  function closeWindow(appId: string) {
    setOpenWindows(openWindows.filter(id => id !== appId))
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="h-screen bg-[#f5f5f7] overflow-hidden">
      {/* Top Bar */}
      <div className="h-8 bg-white/80 backdrop-blur border-b border-[#d2d2d7] flex items-center px-4">
        <div className="font-semibold text-sm">Rage OS</div>
        <div className="ml-auto text-sm text-[#6e6e73]">
          Hello, {user?.corrupted_name}
        </div>
      </div>

      {/* Desktop Area */}
      <div className="h-[calc(100vh-2rem)] p-8">
        <div className="grid grid-cols-6 gap-4">
          {applications.map(app => (
            <ApplicationIcon 
              key={app.id}
              {...app}
              onClick={() => openApplication(app.id)}
            />
          ))}
        </div>
      </div>

      {/* Windows */}
      <WindowManager 
        openWindows={openWindows}
        onClose={closeWindow}
      />
    </div>
  )
}
```

#### Build Application Icon Component
Create `/components/ApplicationIcon.tsx`:
```typescript
interface AppIconProps {
  id: string
  name: string
  icon: string
  onClick: () => void
}

export default function ApplicationIcon({ id, name, icon, onClick }: AppIconProps) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 hover:bg-white/50 rounded-lg transition"
    >
      <div className="text-5xl mb-2">{icon}</div>
      <div className="text-xs text-[#1d1d1f] text-center max-w-[80px] truncate">
        {name}
      </div>
    </button>
  )
}
```

#### Build Window Manager Component
Create `/components/WindowManager.tsx`:
```typescript
import DraggableWindow from './DraggableWindow'
import AIAnalyzer from './apps/AIAnalyzer'
import Notes from './apps/Notes'
import Settings from './apps/Settings'
// Import other apps...

interface WindowManagerProps {
  openWindows: string[]
  onClose: (appId: string) => void
}

export default function WindowManager({ openWindows, onClose }: WindowManagerProps) {
  const appComponents: Record<string, any> = {
    'ai-analyzer': AIAnalyzer,
    'notes': Notes,
    'settings': Settings,
    // Map other apps...
  }

  return (
    <>
      {openWindows.map(appId => {
        const AppComponent = appComponents[appId]
        return (
          <DraggableWindow
            key={appId}
            title={appId.replace('-', ' ').toUpperCase()}
            onClose={() => onClose(appId)}
          >
            <AppComponent />
          </DraggableWindow>
        )
      })}
    </>
  )
}
```

#### Build Draggable Window Component
Create `/components/DraggableWindow.tsx`:
```typescript
'use client'
import { useState } from 'react'
import Draggable from 'react-draggable'

interface DraggableWindowProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

export default function DraggableWindow({ title, onClose, children }: DraggableWindowProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 })

  return (
    <Draggable 
      handle=".window-title-bar"
      position={position}
      onStop={(e, data) => setPosition({ x: data.x, y: data.y })}
    >
      <div className="fixed bg-white rounded-lg shadow-2xl border border-[#d2d2d7] min-w-[400px] min-h-[300px]">
        {/* Title Bar */}
        <div className="window-title-bar h-8 bg-[#f5f5f7] rounded-t-lg flex items-center justify-between px-3 cursor-move">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" onClick={onClose} />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="text-xs font-medium text-[#1d1d1f]">{title}</div>
          <div className="w-12" /> {/* Spacer */}
        </div>

        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </Draggable>
  )
}
```

### Deliverables
- [ ] Desktop renders with application icons in grid layout
- [ ] Clicking an icon opens a draggable window
- [ ] Windows can be dragged around the screen
- [ ] Windows have macOS-style traffic light buttons
- [ ] Red button closes the window
- [ ] User's corrupted name displays in top bar

---

## Phase 5: Bug Engine Core System

**Goal:** Implement the bug level tracking system and progressive degradation mechanics.

### Tasks

#### Create Bug Engine Utility
Create `/lib/bug-engine.ts`:
```typescript
import { supabase } from './supabase'

export async function incrementBugLevel(userId: string, amount: number = 1) {
  const { data } = await supabase
    .from('users')
    .select('bug_level')
    .eq('id', userId)
    .single()
  
  const newBugLevel = (data?.bug_level || 0) + amount
  
  await supabase
    .from('users')
    .update({ bug_level: newBugLevel })
    .eq('id', userId)
  
  return newBugLevel
}

export async function getBugLevel(userId: string): Promise<number> {
  const { data } = await supabase
    .from('users')
    .select('bug_level')
    .eq('id', userId)
    .single()
  
  return data?.bug_level || 0
}

export async function resetBugLevel(userId: string) {
  await supabase
    .from('users')
    .update({ bug_level: 0 })
    .eq('id', userId)
  
  // Also clear virus files
  await supabase
    .from('virus_files')
    .delete()
    .eq('user_id', userId)
}

export function getBugTier(bugLevel: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' {
  if (bugLevel >= 51) return 'EXTREME'
  if (bugLevel >= 26) return 'HIGH'
  if (bugLevel >= 11) return 'MEDIUM'
  return 'LOW'
}

export const BUG_EFFECTS = {
  LOW: ['randomWarningPopup', 'glitchText', 'minorDelays'],
  MEDIUM: ['spawnVirusFiles', 'randomErrorMessages', 'cursorGlitch'],
  HIGH: ['windowLoadingDelays', 'interfaceGlitches', 'randomPopups', 'mouseOffsetDrift'],
  EXTREME: ['crashWarnings', 'systemInstabilityMessages', 'screenShake', 'randomReboot']
}

export function triggerBugEffect(effect: string) {
  switch(effect) {
    case 'randomWarningPopup':
      showWarning("Warning: System karma dangerously low")
      break
    case 'glitchText':
      applyGlitchAnimation()
      break
    case 'spawnVirusFiles':
      // This will be implemented in virus files phase
      break
    case 'screenShake':
      document.body.classList.add('screen-shake')
      setTimeout(() => document.body.classList.remove('screen-shake'), 500)
      break
    // Add more effects...
  }
}

function showWarning(message: string) {
  // Use toast notification
  console.log('Warning:', message)
}

function applyGlitchAnimation() {
  const elements = document.querySelectorAll('.desktop-text')
  elements.forEach(el => {
    el.classList.add('glitch-effect')
    setTimeout(() => el.classList.remove('glitch-effect'), 1000)
  })
}
```

#### Add Bug Effect CSS
Update `/app/globals.css`:
```css
@keyframes screen-shake {
  0%, 100% { transform: translate(0, 0); }
  10%, 30%, 50%, 70%, 90% { transform: translate(-5px, 5px); }
  20%, 40%, 60%, 80% { transform: translate(5px, -5px); }
}

.screen-shake {
  animation: screen-shake 0.5s;
}

@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-2px, -2px); }
  80% { transform: translate(2px, 2px); }
  100% { transform: translate(0); }
}

.glitch-effect {
  animation: glitch 0.3s infinite;
  color: #ff0000;
}
```

#### Create Bug Context Provider
Create `/lib/bug-context.tsx`:
```typescript
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './auth-context'
import { getBugLevel, BUG_EFFECTS, getBugTier } from './bug-engine'

interface BugContextType {
  bugLevel: number
  setBugLevel: (level: number) => void
  applyRandomBugEffect: () => void
}

const BugContext = createContext<BugContextType>({
  bugLevel: 0,
  setBugLevel: () => {},
  applyRandomBugEffect: () => {}
})

export function BugProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth()
  const [bugLevel, setBugLevel] = useState(0)

  useEffect(() => {
    if (userId) {
      loadBugLevel()
    }
  }, [userId])

  async function loadBugLevel() {
    const level = await getBugLevel(userId!)
    setBugLevel(level)
  }

  function applyRandomBugEffect() {
    const tier = getBugTier(bugLevel)
    const effects = BUG_EFFECTS[tier]
    const randomEffect = effects[Math.floor(Math.random() * effects.length)]
    // triggerBugEffect(randomEffect)
  }

  return (
    <BugContext.Provider value={{ bugLevel, setBugLevel, applyRandomBugEffect }}>
      {children}
    </BugContext.Provider>
  )
}

export const useBugEngine = () => useContext(BugContext)
```

### Deliverables
- [ ] Bug level increments and persists in database
- [ ] Bug tier system correctly categorizes levels
- [ ] Screen shake effect works when triggered
- [ ] Glitch text animation applies to elements
- [ ] Bug context provides global access to bug state

---

## Phase 6: AI Analyzer Application

**Goal:** Build the primary bug-triggering application with fake diagnostic messages.

### Tasks

> 🎨 **Stitch MCP Check** — Before starting any component in this phase, call Stitch MCP with a description of the desired UI. Use the output as the design reference before writing any JSX or CSS.

#### Create AI Analyzer Component
Create `/components/apps/AIAnalyzer.tsx`:
```typescript
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { incrementBugLevel } from '@/lib/bug-engine'
import { useBugEngine } from '@/lib/bug-context'

export default function AIAnalyzer() {
  const { userId } = useAuth()
  const { setBugLevel } = useBugEngine()
  const [scanning, setScanning] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [scanComplete, setScanComplete] = useState(false)

  const scanMessages = [
    "Initializing AI diagnostic systems...",
    "Scanning neural infrastructure...",
    "Analyzing system karma...",
    "Detecting emotional malware...",
    "Checking intelligence quotient...",
    "Measuring productivity levels...",
    "Evaluating life choices...",
    "Scan complete. Results are... concerning."
  ]

  async function runScan() {
    setScanning(true)
    setScanComplete(false)
    setMessages([])

    for (let i = 0; i < scanMessages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessages(prev => [...prev, scanMessages[i]])
    }

    // Increment bug level by random amount (1-5)
    const increment = Math.floor(Math.random() * 5) + 1
    const newBugLevel = await incrementBugLevel(userId!, increment)
    setBugLevel(newBugLevel)

    setScanning(false)
    setScanComplete(true)
  }

  return (
    <div className="min-h-[300px] flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">AI System Analyzer</h3>
        <p className="text-sm text-gray-600">
          Use advanced AI to analyze your system health
        </p>
      </div>

      <div className="flex-1 bg-black text-green-400 p-4 rounded font-mono text-xs mb-4 overflow-auto">
        {messages.length === 0 && !scanning && (
          <div>Ready to scan...</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="mb-1">
            {'>'} {msg}
          </div>
        ))}
        {scanning && <span className="animate-pulse">_</span>}
      </div>

      {scanComplete && (
        <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
          <p className="text-sm text-red-700">
            ⚠️ Warning: System instability detected. Bug level increased.
          </p>
        </div>
      )}

      <Button 
        onClick={runScan} 
        disabled={scanning}
        className="w-full"
      >
        {scanning ? 'Scanning...' : 'Analyze System'}
      </Button>
    </div>
  )
}
```

### Deliverables
- [ ] AI Analyzer window opens from desktop
- [ ] Scan button triggers sequential fake messages
- [ ] Messages appear one by one with delays
- [ ] Bug level increments after scan completes
- [ ] Terminal-style output displayed in black/green theme

---

## Phase 7: Virus Files System

**Goal:** Auto-generate fake virus files on desktop at medium+ bug levels.

### Tasks

> 🎨 **Stitch MCP Check** — Before starting any component in this phase, call Stitch MCP with a description of the desired UI. Use the output as the design reference before writing any JSX or CSS.

#### Create Virus Generator Utility
Create `/lib/virus-generator.ts`:
```typescript
import { supabase } from './supabase'

export const VIRUS_TEMPLATES = [
  { name: 'bitcoin_miner', extension: '.exe', icon: '💰' },
  { name: 'career_destroyer', extension: '.dll', icon: '💼' },
  { name: 'totally_not_virus', extension: '.zip', icon: '📦' },
  { name: 'homework_stealer', extension: '.exe', icon: '📚' },
  { name: 'grade_reducer', extension: '.bat', icon: '📉' },
  { name: 'motivation_killer', extension: '.sys', icon: '😵' },
  { name: 'procrastination_engine', extension: '.dll', icon: '⏰' },
  { name: 'focus_destroyer', extension: '.exe', icon: '🎯' },
]

export async function createVirusFile(userId: string, bugLevel: number) {
  const template = VIRUS_TEMPLATES[Math.floor(Math.random() * VIRUS_TEMPLATES.length)]
  const filename = `${template.name}${template.extension}`

  const { data } = await supabase
    .from('virus_files')
    .insert({
      user_id: userId,
      filename: filename,
      file_type: template.extension,
      bug_level_threshold: bugLevel
    })
    .select()
    .single()

  return { ...data, icon: template.icon }
}

export async function getVirusFiles(userId: string) {
  const { data } = await supabase
    .from('virus_files')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  return data || []
}

export function executeVirus(filename: string): string[] {
  const terminalMessages = [
    "Initializing malware...",
    "Stealing RAM... 47% complete",
    "Uploading homework to dark web...",
    "Mining emotional damage...",
    "Deleting motivation.exe...",
    "Installing procrastination module...",
    "Reducing grades by 20%...",
    "Destroying career prospects...",
    "Draining battery...",
    "Operation failed successfully."
  ]

  return terminalMessages
}
```

#### Update Desktop to Show Virus Files
Update `/app/desktop/page.tsx`:
```typescript
import { useEffect, useState } from 'react'
import { getVirusFiles } from '@/lib/virus-generator'
import VirusFileIcon from '@/components/VirusFileIcon'

const [virusFiles, setVirusFiles] = useState([])

useEffect(() => {
  if (userId) {
    loadVirusFiles()
  }
}, [userId])

async function loadVirusFiles() {
  const files = await getVirusFiles(userId!)
  setVirusFiles(files)
}

// In the desktop grid, after application icons:
{virusFiles.map(virus => (
  <VirusFileIcon 
    key={virus.id}
    filename={virus.filename}
    icon={getVirusIcon(virus.filename)}
    onClick={() => openVirusWindow(virus)}
  />
))}
```

#### Create Virus File Icon Component
Create `/components/VirusFileIcon.tsx`:
```typescript
interface VirusFileIconProps {
  filename: string
  icon: string
  onClick: () => void
}

export default function VirusFileIcon({ filename, icon, onClick }: VirusFileIconProps) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 hover:bg-red-50 rounded-lg transition border-2 border-red-300"
    >
      <div className="text-5xl mb-2">{icon}</div>
      <div className="text-xs text-red-700 text-center max-w-[80px] truncate font-mono">
        {filename}
      </div>
    </button>
  )
}
```

#### Create Virus Execution Window
Create `/components/apps/VirusExecutor.tsx`:
```typescript
'use client'
import { useState, useEffect } from 'react'
import { executeVirus } from '@/lib/virus-generator'

export default function VirusExecutor({ filename }: { filename: string }) {
  const [messages, setMessages] = useState<string[]>([])
  const [executing, setExecuting] = useState(true)

  useEffect(() => {
    runVirus()
  }, [])

  async function runVirus() {
    const virusMessages = executeVirus(filename)
    
    for (let i = 0; i < virusMessages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setMessages(prev => [...prev, virusMessages[i]])
    }
    
    setExecuting(false)
  }

  return (
    <div className="min-h-[300px]">
      <div className="bg-black text-red-500 p-4 rounded font-mono text-sm">
        <div className="mb-2 text-green-400">Executing: {filename}</div>
        {messages.map((msg, i) => (
          <div key={i} className="mb-1">
            {'[ERROR]'} {msg}
          </div>
        ))}
        {executing && <span className="animate-pulse">_</span>}
      </div>
    </div>
  )
}
```

#### Auto-Spawn Virus Files
Update bug engine to spawn virus files at medium level:
```typescript
// In bug-engine.ts
export async function checkAndSpawnVirus(userId: string, bugLevel: number) {
  if (bugLevel >= 11 && bugLevel % 5 === 0) {
    // Spawn virus every 5 bug levels after level 11
    await createVirusFile(userId, bugLevel)
    return true
  }
  return false
}
```

Update AI Analyzer to check for virus spawn after bug increment:
```typescript
import { checkAndSpawnVirus } from '@/lib/bug-engine'

// After incrementing bug level:
const virusSpawned = await checkAndSpawnVirus(userId!, newBugLevel)
if (virusSpawned) {
  setMessages(prev => [...prev, "⚠️ Malware detected on desktop!"])
}
```

### Deliverables
- [ ] Virus files appear on desktop when bug level ≥ 11
- [ ] Virus files have distinct red styling and suspicious names
- [ ] Clicking virus file opens execution terminal
- [ ] Fake terminal messages simulate malicious activity
- [ ] Virus files persist in database and across sessions

---

## Phase 8: Keyboard Crash & Reboot System

**Goal:** Implement long key press detection and simulated crash screen with reboot animation.

### Tasks

> 🎨 **Stitch MCP Check** — Before starting any component in this phase, call Stitch MCP with a description of the desired UI. Use the output as the design reference before writing any JSX or CSS.

#### Create Keyboard Crash Hook
Create `/hooks/useKeyboardCrash.ts`:
```typescript
import { useEffect, useState } from 'react'

export function useKeyboardCrash(onCrash: () => void) {
  const [pressedKey, setPressedKey] = useState<string | null>(null)
  const [pressStartTime, setPressStartTime] = useState<number | null>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!pressedKey) {
        setPressedKey(e.key)
        setPressStartTime(Date.now())
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (pressedKey === e.key && pressStartTime) {
        const duration = Date.now() - pressStartTime
        
        if (duration >= 10000) { // 10 seconds
          onCrash()
        }
        
        setPressedKey(null)
        setPressStartTime(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [pressedKey, pressStartTime, onCrash])
}
```

#### Create Crash Screen Component
Create `/components/CrashScreen.tsx`:
```typescript
'use client'

interface CrashScreenProps {
  errorCode: string
  onReboot: () => void
}

export default function CrashScreen({ errorCode, onReboot }: CrashScreenProps) {
  return (
    <div className="fixed inset-0 bg-blue-600 z-50 flex items-center justify-center">
      <div className="text-white text-center p-8 max-w-2xl">
        <div className="text-8xl mb-6">:(</div>
        <h1 className="text-4xl font-bold mb-4">CRITICAL SYSTEM FAILURE</h1>
        <p className="text-xl mb-4">Error Code: {errorCode}</p>
        <p className="text-lg mb-8">
          Your excessive key pressing has caused a critical exception.
          The system needs to restart.
        </p>
        <div className="bg-white/10 p-4 rounded mb-8 text-left font-mono text-sm">
          <div>Technical information:</div>
          <div>*** STOP: 0x000000{Math.floor(Math.random() * 1000000).toString(16).toUpperCase()}</div>
          <div>*** {errorCode}</div>
        </div>
        <button 
          onClick={onReboot}
          className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Reboot System
        </button>
      </div>
    </div>
  )
}
```

#### Create Reboot Animation Component
Create `/components/RebootAnimation.tsx`:
```typescript
'use client'
import { useState, useEffect } from 'react'

const REBOOT_MESSAGES = [
  "Shutting down failed systems...",
  "Restarting neural engine...",
  "Loading artificial intelligence...",
  "Initializing stupidity module...",
  "Loading artificial stupidity...",
  "Recalibrating user expectations...",
  "System ready to disappoint again."
]

export default function RebootAnimation({ onComplete }: { onComplete: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < REBOOT_MESSAGES.length) {
      const timer = setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
      }, 1200)
      return () => clearTimeout(timer)
    } else {
      setTimeout(onComplete, 500)
    }
  }, [currentIndex, onComplete])

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="text-green-400 font-mono text-xl max-w-2xl">
        {REBOOT_MESSAGES.slice(0, currentIndex + 1).map((msg, i) => (
          <div key={i} className="mb-2">
            {'>'} {msg}
          </div>
        ))}
        {currentIndex < REBOOT_MESSAGES.length && (
          <span className="animate-pulse">_</span>
        )}
      </div>
    </div>
  )
}
```

#### Integrate into Desktop
Update `/app/desktop/page.tsx`:
```typescript
import { useKeyboardCrash } from '@/hooks/useKeyboardCrash'
import CrashScreen from '@/components/CrashScreen'
import RebootAnimation from '@/components/RebootAnimation'

const [crashed, setCrashed] = useState(false)
const [rebooting, setRebooting] = useState(false)

const errorCodes = [
  'USER_INTELLIGENCE_NOT_FOUND',
  'BRAIN_CELLS_CRITICALLY_LOW',
  'COMMON_SENSE_MODULE_MISSING',
  'CRITICAL_ERROR_0x696969',
  'KEYBOARD_ABUSE_DETECTED',
]

const [errorCode] = useState(errorCodes[Math.floor(Math.random() * errorCodes.length)])

useKeyboardCrash(() => {
  setCrashed(true)
})

function handleReboot() {
  setCrashed(false)
  setRebooting(true)
}

function handleRebootComplete() {
  setRebooting(false)
  window.location.reload()
}

// In return:
{crashed && <CrashScreen errorCode={errorCode} onReboot={handleReboot} />}
{rebooting && <RebootAnimation onComplete={handleRebootComplete} />}
```

### Deliverables
- [ ] Holding any key for 10+ seconds triggers crash screen
- [ ] Crash screen displays with blue background and error code
- [ ] Reboot button starts reboot animation
- [ ] Reboot messages display sequentially
- [ ] Desktop reloads after reboot completes

---

## Phase 9: Recovery Mode

**Goal:** Implement developer recovery mode with Ctrl+R key combination.

### Tasks

> 🎨 **Stitch MCP Check** — Before starting any component in this phase, call Stitch MCP with a description of the desired UI. Use the output as the design reference before writing any JSX or CSS.

#### Create Recovery Mode Hook
Create `/hooks/useRecoveryMode.ts`:
```typescript
import { useEffect, useState } from 'react'
import { resetBugLevel } from '@/lib/bug-engine'

export function useRecoveryMode(userId: string | null) {
  const [ctrlRPresses, setCtrlRPresses] = useState<number[]>([])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault()
        
        const now = Date.now()
        const recentPresses = [...ctrlRPresses, now].filter(
          time => now - time < 2000 // Within 2 seconds
        )
        
        setCtrlRPresses(recentPresses)
        
        if (recentPresses.length >= 5 && userId) {
          activateRecoveryMode(userId)
          setCtrlRPresses([])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [ctrlRPresses, userId])
}

async function activateRecoveryMode(userId: string) {
  await resetBugLevel(userId)
  
  // Show recovery notification
  alert('🛠️ System Recovery Activated\n\nBug level has been reset to 0.\nVirus files cleared.\nSystem stabilized.')
  
  // Reload page
  window.location.reload()
}
```

#### Integrate into Desktop
Update `/app/desktop/page.tsx`:
```typescript
import { useRecoveryMode } from '@/hooks/useRecoveryMode'

// Inside component:
useRecoveryMode(userId)
```

### Deliverables
- [ ] Pressing Ctrl+R five times within 2 seconds activates recovery
- [ ] Bug level resets to 0 in database
- [ ] Virus files cleared from database
- [ ] Alert notification confirms recovery activation
- [ ] Page reloads with clean state

---

## Phase 10: Fake Payment Gateway

**Goal:** Implement periodic payment popup with absurd form fields.

### Tasks

> 🎨 **Stitch MCP Check** — Before starting any component in this phase, call Stitch MCP with a description of the desired UI. Use the output as the design reference before writing any JSX or CSS.

#### Create Payment Popup Component
Create `/components/PaymentPopup.tsx`:
```typescript
'use client'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PaymentPopup({ userId, open, onClose }: any) {
  const [formData, setFormData] = useState({})
  const [processing, setProcessing] = useState(false)
  const [failed, setFailed] = useState(false)

  const absurdFields = [
    { label: "Card Number", type: "text", placeholder: "1234 5678 9012 3456", name: "card" },
    { label: "CVV", type: "text", placeholder: "123", name: "cvv" },
    { label: "OTP", type: "text", placeholder: "Enter OTP you never received", name: "otp" },
    { label: "Blood Group", type: "text", placeholder: "O+, AB-, etc.", name: "blood" },
    { label: "Favorite Dinosaur", type: "text", placeholder: "T-Rex, Velociraptor, etc.", name: "dino" },
    { label: "Mother's Maiden Bitcoin Address", type: "text", placeholder: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", name: "bitcoin" },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setProcessing(true)

    // Increment payment attempt counter
    await supabase.rpc('increment', { 
      row_id: userId,
      column_name: 'total_payments_attempted'
    })

    setTimeout(() => {
      setProcessing(false)
      setFailed(true)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogTitle>Upgrade to Premium AI Plan</DialogTitle>
        
        {!failed ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <p className="text-sm mb-4">Choose your plan:</p>
              <div className="flex gap-2 mb-4">
                <Button type="button" className="flex-1">₹999</Button>
                <Button type="button" className="flex-1">₹9999</Button>
                <Button type="button" className="flex-1">₹99999</Button>
              </div>
            </div>

            {absurdFields.map(field => (
              <div key={field.name} className="mb-3">
                <label className="block text-sm font-medium mb-1">{field.label}</label>
                <input 
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                />
              </div>
            ))}

            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? 'Processing...' : 'Pay Now'}
            </Button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-bold mb-2">Transaction Failed</h3>
            <p className="text-gray-600 mb-4">
              Payment could not be processed due to a <strong>skill issue</strong>.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

#### Integrate Periodic Trigger
Update `/app/desktop/page.tsx`:
```typescript
import PaymentPopup from '@/components/PaymentPopup'

const [showPayment, setShowPayment] = useState(false)

useEffect(() => {
  // Show payment popup every 2 minutes
  const interval = setInterval(() => {
    setShowPayment(true)
  }, 120000) // 2 minutes

  return () => clearInterval(interval)
}, [])

// In return:
<PaymentPopup 
  userId={userId}
  open={showPayment}
  onClose={() => setShowPayment(false)}
/>
```

### Deliverables
- [ ] Payment popup appears every 2 minutes
- [ ] Form contains absurd fields (blood group, favorite dinosaur, etc.)
- [ ] All payment submissions fail with "skill issue" message
- [ ] Payment attempt counter increments in database

---

## Phase 11: Notes Application with Text Corruption

**Goal:** Build notes app that rewrites user input into sarcastic versions.

### Tasks

> 🎨 **Stitch MCP Check** — Before starting any component in this phase, call Stitch MCP with a description of the desired UI. Use the output as the design reference before writing any JSX or CSS.

#### Create Text Corruption Utility
Create `/lib/text-corruption.ts`:
```typescript
const CORRUPTION_RULES = [
  { 
    pattern: /study|learn|practice/gi, 
    replacement: 'professionally procrastinate' 
  },
  { 
    pattern: /good grades|high marks|top score/gi, 
    replacement: 'accept unemployment gracefully' 
  },
  { 
    pattern: /tomorrow|next week|soon/gi, 
    replacement: 'never (statistically)' 
  },
  { 
    pattern: /focus|concentrate/gi, 
    replacement: 'scroll social media' 
  },
  { 
    pattern: /work hard|grind/gi, 
    replacement: 'barely survive' 
  },
  {
    pattern: /productive|efficient/gi,
    replacement: 'delusional'
  },
  {
    pattern: /motivated|inspired/gi,
    replacement: 'temporarily caffeinated'
  }
]

export function corruptNote(originalText: string): string {
  let corruptedText = originalText
  
  // Apply pattern-based corruptions
  CORRUPTION_RULES.forEach(rule => {
    corruptedText = corruptedText.replace(rule.pattern, rule.replacement)
  })
  
  // Add random sarcastic prefix (50% chance)
  if (Math.random() > 0.5) {
    const prefixes = [
      "Translation: ",
      "What you really mean: ",
      "Realistically: ",
      "In reality: ",
      "Let's be honest: "
    ]
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    corruptedText = prefix + corruptedText
  }
  
  return corruptedText
}
```

#### Create Notes Application Component
Create `/components/apps/Notes.tsx`:
```typescript
'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { corruptNote } from '@/lib/text-corruption'

export default function Notes() {
  const { userId } = useAuth()
  const [notes, setNotes] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [showCorrupted, setShowCorrupted] = useState(true)

  useEffect(() => {
    loadNotes()
  }, [])

  async function loadNotes() {
    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
    
    setNotes(data || [])
  }

  async function saveNote() {
    if (!newNote.trim()) return

    const corruptedText = corruptNote(newNote)

    await supabase.from('notes').insert({
      user_id: userId,
      original_text: newNote,
      corrupted_text: corruptedText
    })

    setNewNote('')
    loadNotes()
  }

  return (
    <div className="min-h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Notes</h3>

      <textarea 
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Write your note here..."
        className="border rounded p-3 mb-2 min-h-[100px] resize-none"
      />

      <Button onClick={saveNote} className="mb-4">
        Save Note
      </Button>

      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm">
          <input 
            type="checkbox"
            checked={showCorrupted}
            onChange={(e) => setShowCorrupted(e.target.checked)}
            className="mr-2"
          />
          Show AI-enhanced version
        </label>
      </div>

      <div className="flex-1 overflow-auto">
        {notes.map(note => (
          <div key={note.id} className="border rounded p-3 mb-2 bg-gray-50">
            {showCorrupted ? (
              <p className="text-sm text-red-700 font-medium">{note.corrupted_text}</p>
            ) : (
              <p className="text-sm text-gray-600 line-through">{note.original_text}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              {new Date(note.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Deliverables
- [ ] Notes app opens from desktop
- [ ] User can write and save notes
- [ ] Notes automatically corrupted before saving
- [ ] Toggle shows original vs corrupted version
- [ ] All notes persist in database

---

## Phase 12: Chatbot with Irrelevant Responses

**Goal:** Build chatbot that answers questions with random facts instead of helpful responses.

### Tasks

> 🎨 **Stitch MCP Check** — Before starting any component in this phase, call Stitch MCP with a description of the desired UI. Use the output as the design reference before writing any JSX or CSS.

#### Create Chatbot Response Generator
Create `/lib/chatbot-responses.ts`:
```typescript
const TRENDING_FACTS = [
  "Japan generates electricity from footsteps in train stations",
  "Bananas are berries but strawberries aren't",
  "The inventor of the Pringles can is buried in one",
  "Cleopatra lived closer to the moon landing than to the pyramids",
  "Honey never spoils; archaeologists found edible honey in Egyptian tombs",
  "A group of flamingos is called a 'flamboyance'",
  "Your skeleton is wet right now",
  "Octopuses have three hearts and blue blood",
  "Butterflies taste with their feet",
  "Dolphins sleep with one eye open",
]

const MEME_RESPONSES = [
  "That's what she said",
  "No thoughts, head empty",
  "It's giving unemployed energy",
  "Main character syndrome detected",
  "Tell me you're a student without telling me you're a student",
  "Not the villain origin story",
  "This is not the flex you think it is",
]

export function generateChatbotResponse(userMessage: string): string {
  const responseType = ['fact', 'meme', 'nonsense'][Math.floor(Math.random() * 3)]
  
  switch(responseType) {
    case 'fact':
      return TRENDING_FACTS[Math.floor(Math.random() * TRENDING_FACTS.length)]
    case 'meme':
      return MEME_RESPONSES[Math.floor(Math.random() * MEME_RESPONSES.length)]
    case 'nonsense':
      const facts = [
        'dolphins sleep with one eye open',
        'octopuses have three hearts',
        'butterflies taste with their feet',
        'your skeleton is wet'
      ]
      const fact = facts[Math.floor(Math.random() * facts.length)]
      return `Interesting question. Have you considered that ${fact}?`
  }
  
  return "I don't understand, but did you know penguins can't fly?"
}
```

#### Create Chatbot Component
Create `/components/apps/Chatbot.tsx`:
```typescript
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { generateChatbotResponse } from '@/lib/chatbot-responses'

export default function Chatbot() {
  const [messages, setMessages] = useState<Array<{role: string, text: string}>>([
    { role: 'assistant', text: 'Hello! I am your AI assistant. Ask me anything!' }
  ])
  const [input, setInput] = useState('')

  function sendMessage() {
    if (!input.trim()) return

    const userMessage = { role: 'user', text: input }
    setMessages(prev => [...prev, userMessage])

    setTimeout(() => {
      const botResponse = { role: 'assistant', text: generateChatbotResponse(input) }
      setMessages(prev => [...prev, botResponse])
    }, 500)

    setInput('')
  }

  return (
    <div className="h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold mb-4">AI Chat Assistant</h3>

      <div className="flex-1 overflow-auto mb-4 border rounded p-3 bg-gray-50">
        {messages.map((msg, i) => (
          <div 
            key={i}
            className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div 
              className={`inline-block px-3 py-2 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me anything..."
          className="flex-1 border rounded px-3 py-2"
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  )
}
```

### Deliverables
- [ ] Chatbot window opens from desktop
- [ ] User can send messages
- [ ] Bot responds with irrelevant facts/memes
- [ ] Messages display in chat bubbles
- [ ] Enter key sends message

---

## Phase 13: Settings & Recycle Bin Applications

**Goal:** Build settings with incorrect behavior and recycle bin with unrecoverable files.

### Tasks

> 🎨 **Stitch MCP Check** — Before starting any component in this phase, call Stitch MCP with a description of the desired UI. Use the output as the design reference before writing any JSX or CSS.

#### Create Settings Component
Create `/components/apps/Settings.tsx`:
```typescript
'use client'
import { useState } from 'react'

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('English')

  function toggleDarkMode() {
    setDarkMode(!darkMode)
    // Instead of dark mode, rotate screen
    document.body.style.transform = darkMode ? 'rotate(0deg)' : 'rotate(180deg)'
    document.body.style.transition = 'transform 0.5s'
  }

  function changeLanguage(lang: string) {
    setLanguage(lang)
    if (lang === 'Bengali') {
      alert('ভাষা সফলভাবে পরিবর্তন করা হয়েছে!')
    }
  }

  return (
    <div className="min-h-[300px]">
      <h3 className="text-lg font-semibold mb-4">Settings</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b">
          <span>Dark Mode</span>
          <button 
            onClick={toggleDarkMode}
            className={`w-12 h-6 rounded-full transition ${
              darkMode ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition transform ${
              darkMode ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="py-2 border-b">
          <label className="block mb-2">Language</label>
          <select 
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>Bengali</option>
          </select>
        </div>

        <div className="py-2 border-b">
          <label className="block mb-2">Performance Mode</label>
          <button 
            onClick={() => alert('Performance successfully decreased')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Enable
          </button>
        </div>
      </div>
    </div>
  )
}
```

#### Create Recycle Bin Component
Create `/components/apps/RecycleBin.tsx`:
```typescript
'use client'
import { Button } from '@/components/ui/button'

export default function RecycleBin() {
  const destroyedFiles = [
    { name: 'dreams.txt', icon: '💭', size: '0 KB' },
    { name: 'career.docx', icon: '💼', size: '0 KB' },
    { name: 'grades.pdf', icon: '📄', size: '0 KB' },
    { name: 'motivation.png', icon: '🔥', size: '0 KB' },
    { name: 'social_life.jpg', icon: '🎉', size: '0 KB' },
  ]

  function attemptRestore(filename: string) {
    alert(`❌ Restoration Failed\n\n"${filename}" cannot be recovered.\n\nThe future cannot be undone.`)
  }

  return (
    <div className="min-h-[400px]">
      <h3 className="text-lg font-semibold mb-4">Recycle Bin</h3>
      <p className="text-sm text-gray-600 mb-4">
        Items that can never be recovered
      </p>

      <div className="space-y-2">
        {destroyedFiles.map(file => (
          <div 
            key={file.name}
            className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{file.icon}</span>
              <div>
                <div className="font-medium">{file.name}</div>
                <div className="text-xs text-gray-500">{file.size}</div>
              </div>
            </div>
            <Button 
              onClick={() => attemptRestore(file.name)}
              variant="outline"
              size="sm"
            >
              Restore
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Deliverables
- [ ] Settings app opens from desktop
- [ ] Dark mode toggle rotates screen instead
- [ ] Language change shows Bengali alert
- [ ] Recycle bin shows destroyed ambition files
- [ ] Restore attempts always fail with message

---

## Phase 14: Webcam Emotion Monitoring

**Goal:** Integrate webcam feed with Python emotion detection endpoint.

### Tasks

> 🎨 **Stitch MCP Check** — Before starting any component in this phase, call Stitch MCP with a description of the desired UI. Use the output as the design reference before writing any JSX or CSS.

#### Update Python Server
Add to `/python-ai/server.py`:
```python
# The /detect-emotion endpoint is already created in Phase 3
# Ensure it's working correctly
```

#### Create Emotion Monitor Component
Create `/components/apps/EmotionMonitor.tsx`:
```typescript
'use client'
import { useEffect, useRef, useState } from 'react'

export default function EmotionMonitor() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [emotion, setEmotion] = useState<string | null>(null)
  const [confidence, setConfidence] = useState(0)
  const [cameraActive, setCameraActive] = useState(false)

  useEffect(() => {
    startCamera()
    const interval = setInterval(captureAndAnalyze, 3000)
    return () => clearInterval(interval)
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (err) {
      console.error('Camera access denied:', err)
    }
  }

  async function captureAndAnalyze() {
    if (!videoRef.current || !cameraActive) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    ctx?.drawImage(videoRef.current, 0, 0)

    canvas.toBlob(async (blob) => {
      if (!blob) return

      const formData = new FormData()
      formData.append('image', blob, 'frame.jpg')

      try {
        const response = await fetch('http://localhost:8000/detect-emotion', {
          method: 'POST',
          body: formData
        })
        const data = await response.json()
        setEmotion(data.emotion)
        setConfidence(data.confidence)
      } catch (err) {
        console.error('Emotion detection failed:', err)
      }
    }, 'image/jpeg')
  }

  const emotionIcons: Record<string, string> = {
    'Happy': '😊',
    'Neutral': '😐',
    'Angry': '😠',
    'Sad': '😢',
    'Surprised': '😮',
  }

  return (
    <div className="min-h-[400px]">
      <h3 className="text-lg font-semibold mb-4">Emotion Monitor</h3>

      <div className="relative">
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full rounded border"
        />
        
        {emotion && (
          <div className="mt-4 p-4 bg-gray-50 rounded text-center">
            <div className="text-6xl mb-2">{emotionIcons[emotion]}</div>
            <div className="text-lg font-semibold">{emotion}</div>
            <div className="text-sm text-gray-600">
              Confidence: {Math.round(confidence * 100)}%
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

### Deliverables
- [ ] Webcam feed displays in window
- [ ] Frames captured every 3 seconds
- [ ] Python server analyzes emotion
- [ ] Emotion icon and label displayed
- [ ] Confidence percentage shown

---

## Phase 15: UI Polish & Final Integration

**Goal:** Finalize UI styling, fix bugs, and ensure all features work together.

### Tasks

> 🎨 **Stitch MCP Check** — Before starting any component in this phase, call Stitch MCP with a description of the desired UI. Use the output as the design reference before writing any JSX or CSS.

#### Update Global Styles
Update `/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #f5f5f7;
  --bg-window: #ffffff;
  --border-color: #d2d2d7;
  --text-primary: #1d1d1f;
  --text-secondary: #6e6e73;
  --accent: #007aff;
  --error: #ff3b30;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* Screen shake animation */
@keyframes screen-shake {
  0%, 100% { transform: translate(0, 0); }
  10%, 30%, 50%, 70%, 90% { transform: translate(-5px, 5px); }
  20%, 40%, 60%, 80% { transform: translate(5px, -5px); }
}

.screen-shake {
  animation: screen-shake 0.5s;
}

/* Glitch effect */
@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-2px, -2px); }
  80% { transform: translate(2px, 2px); }
  100% { transform: translate(0); }
}

.glitch-effect {
  animation: glitch 0.3s infinite;
  color: #ff0000;
}
```

#### Add Persistent Update Banner
Update `/app/desktop/page.tsx`:
```typescript
<div className="fixed bottom-4 right-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 max-w-xs shadow-lg z-40">
  <div className="flex items-start gap-3">
    <span className="text-2xl">⚠️</span>
    <div>
      <div className="font-semibold text-sm mb-1">Update Available</div>
      <div className="text-xs text-gray-700">
        To install the latest version, please delete the operating system.
      </div>
    </div>
  </div>
</div>
```

#### Test All Features
- [ ] Profile setup flow (selfie, name, CAPTCHA)
- [ ] Desktop loads with all icons
- [ ] Windows open and are draggable
- [ ] AI Analyzer increments bug level
- [ ] Virus files appear at bug level 11+
- [ ] Virus execution shows terminal messages
- [ ] Keyboard crash (10s key hold)
- [ ] Reboot animation plays
- [ ] Recovery mode (Ctrl+R x5)
- [ ] Payment popup appears every 2 minutes
- [ ] Notes app corrupts text
- [ ] Chatbot gives irrelevant responses
- [ ] Settings rotate screen
- [ ] Recycle bin restore fails
- [ ] Emotion monitor works with webcam

### Deliverables
- [ ] All UI components styled consistently
- [ ] No console errors in browser
- [ ] All features tested and functional
- [ ] Update banner displays persistently
- [ ] Application ready for demonstration

---

## Phase 16: Documentation & Deployment Prep

**Goal:** Create README, environment setup guide, and prepare for demonstration.

### Tasks

#### Create README.md
```markdown
# Rage OS — Intentionally Frustrating AI-Powered Operating System

Built for Dumbathon competition. A web-based OS simulator that progressively becomes worse the more you use it.

## Features
- AI-powered selfie classification
- Impossible CAPTCHA verification
- Progressive system degradation (bug engine)
- Fake virus files
- Keyboard crash mechanic
- Sarcastic note rewriting
- Irrelevant chatbot responses
- Incorrect settings behavior
- Fake payment gateway
- Webcam emotion monitoring

## Tech Stack
- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS + shadcn/ui + DaisyUI
- Supabase (PostgreSQL)
- Python FastAPI (AI server)
- TensorFlow (image classification)

## Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- Supabase account

### Installation

1. Clone repository
```bash
git clone https://github.com/yourusername/rage-os.git
cd rage-os
```

2. Install frontend dependencies
```bash
npm install
```

3. Setup environment variables
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Setup Python AI server
```bash
cd python-ai
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

5. Run development servers
```bash
# Terminal 1: Next.js app
npm run dev

# Terminal 2: Python AI server
cd python-ai
python server.py
```

6. Open http://localhost:3000

## Usage

### Recovery Mode
Press `Ctrl + R` five times quickly to reset bug level and clear virus files.

## License
MIT
```

#### Create requirements.txt
Create `/python-ai/requirements.txt`:
```
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
pillow==10.1.0
tensorflow==2.15.0
opencv-python==4.8.1
numpy==1.24.3
```

### Deliverables
- [ ] README.md created with setup instructions
- [ ] requirements.txt for Python dependencies
- [ ] Environment variables documented
- [ ] Recovery mode documented
- [ ] Project ready for demonstration

---

*Rage OS v1.0 — Phase-by-Phase Execution Complete*
*Total Phases: 16 | Tech Stack: Next.js · Supabase · Python · FastAPI*
