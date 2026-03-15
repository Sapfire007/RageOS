// WindowManager maps app IDs to their components and renders DraggableWindows
'use client'
import DraggableWindow from '@/components/DraggableWindow'
import AIAnalyzer from '@/components/apps/AIAnalyzer'
import Notes from '@/components/apps/Notes'
import Chatbot from '@/components/apps/Chatbot'
import Settings from '@/components/apps/Settings'
import RecycleBin from '@/components/apps/RecycleBin'
import VirusExecutor from '@/components/apps/VirusExecutor'
import RealityCheckApp from '@/components/apps/RealityCheckApp'
import ScamMail from '@/components/apps/ScamMail'
import Browser from '@/components/apps/Browser'
import Stonks from '@/components/apps/Stonks'
import TaskManager from '@/components/apps/TaskManager'
import UnfairTicTacToe from '@/components/apps/UnfairTicTacToe'
import TriageOptimizer from '@/components/apps/TriageOptimizer'

export type AppId = 'ai-analyzer' | 'notes' | 'chatbot' | 'settings' | 'recycle-bin' | 'virus-executor' | 'emotional-companion' | 'scam-mail' | 'browser' | 'stonks' | 'task-manager' | 'unfair-tictactoe' | 'triage'

interface OpenWindow {
  id: string      // unique instance id
  appId: AppId
  title: string
}

interface Props {
  windows: OpenWindow[]
  onClose: (instanceId: string) => void
}

const APP_COMPONENTS: Record<AppId, React.ComponentType> = {
  'ai-analyzer': AIAnalyzer,
  'notes': Notes,
  'chatbot': Chatbot,
  'settings': Settings,
  'recycle-bin': RecycleBin,
  'virus-executor': VirusExecutor,
  'emotional-companion': RealityCheckApp,
  'scam-mail': ScamMail,
  'browser': Browser,
  'stonks': Stonks,
  'task-manager': TaskManager,
  'unfair-tictactoe': UnfairTicTacToe,
  'triage': TriageOptimizer,
}

export default function WindowManager({ windows, onClose }: Props) {
  return (
    <>
      {windows.map((win, index) => {
        const AppComponent = APP_COMPONENTS[win.appId]
        return (
          <DraggableWindow
            key={win.id}
            title={win.title}
            onClose={() => onClose(win.id)}
            initialX={60 + index * 30}
            initialY={60 + index * 30}
          >
            <AppComponent />
          </DraggableWindow>
        )
      })}
    </>
  )
}
