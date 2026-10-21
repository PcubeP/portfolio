import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export interface SystemMessage {
  id: number
  text: string
  tone?: 'info' | 'success' | 'egg'
}

interface ExperienceState {
  /** intro overlay finished (skipped or completed) */
  entered: boolean
  enter: () => void

  /** current world accent as "r g b" */
  accent: string
  setAccent: (rgb: string) => void

  /** ambient audio identity — NEVER autoplays */
  audioOn: boolean
  toggleAudio: () => void
  trackIndex: number
  cycleTrack: () => void

  /** transient personality/system messages (toasts) */
  messages: SystemMessage[]
  say: (text: string, tone?: SystemMessage['tone']) => void
  dismiss: (id: number) => void

  /** easter-egg discovery */
  discovered: string[]
  discover: (id: string, label: string) => void
  isDiscovered: (id: string) => boolean
}

const Ctx = createContext<ExperienceState | null>(null)

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [entered, setEntered] = useState(false)
  const [accent, setAccentState] = useState('255 91 46')
  const [audioOn, setAudioOn] = useState(false)
  const [trackIndex, setTrackIndex] = useState(0)
  const [messages, setMessages] = useState<SystemMessage[]>([])
  const [discovered, setDiscovered] = useState<string[]>([])
  const msgId = useRef(0)

  const say = useCallback((text: string, tone: SystemMessage['tone'] = 'info') => {
    const id = ++msgId.current
    setMessages((m) => [...m, { id, text, tone }])
    window.setTimeout(() => {
      setMessages((m) => m.filter((x) => x.id !== id))
    }, 4200)
  }, [])

  const dismiss = useCallback((id: number) => {
    setMessages((m) => m.filter((x) => x.id !== id))
  }, [])

  const setAccent = useCallback((rgb: string) => {
    setAccentState(rgb)
    document.documentElement.style.setProperty('--accent', rgb)
  }, [])

  const enter = useCallback(() => setEntered(true), [])
  const toggleAudio = useCallback(() => setAudioOn((v) => !v), [])
  const cycleTrack = useCallback(() => setTrackIndex((i) => i + 1), [])

  const discover = useCallback(
    (id: string, label: string) => {
      setDiscovered((d) => {
        if (d.includes(id)) return d
        const next = [...d, id]
        setTimeout(() => say(`ACHIEVEMENT UNLOCKED — ${label}`, 'egg'), 0)
        return next
      })
    },
    [say]
  )

  const isDiscovered = useCallback((id: string) => discovered.includes(id), [discovered])

  const value = useMemo<ExperienceState>(
    () => ({
      entered,
      enter,
      accent,
      setAccent,
      audioOn,
      toggleAudio,
      trackIndex,
      cycleTrack,
      messages,
      say,
      dismiss,
      discovered,
      discover,
      isDiscovered,
    }),
    [entered, enter, accent, setAccent, audioOn, toggleAudio, trackIndex, cycleTrack, messages, say, dismiss, discovered, discover, isDiscovered]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useExperience(): ExperienceState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useExperience must be used within ExperienceProvider')
  return v
}
