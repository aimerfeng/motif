// SPDX-License-Identifier: MIT
// Copyright (c) 2023 Jordan-Gilliam
// Source: https://github.com/nolly-studio/cult-ui/blob/ee98a5d/apps/www/registry/default/example/family-drawer-demo.tsx
// Modified by Motif; see the item's provenance.
import { useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { createContext, useContext, useId, useRef, useState, type ReactNode } from 'react'
import {
  FamilyDrawerAnimatedContent,
  FamilyDrawerAnimatedWrapper,
  FamilyDrawerButton,
  FamilyDrawerClose,
  FamilyDrawerContent,
  FamilyDrawerHeader,
  FamilyDrawerOverlay,
  FamilyDrawerPortal,
  FamilyDrawerRoot,
  FamilyDrawerSecondaryButton,
  FamilyDrawerTrigger,
  FamilyDrawerViewContent,
  useFamilyDrawer,
  type FamilyDrawerRootProps,
  type ViewsRegistry,
} from './drawer-multi-view'

// ============================================================================
// Icons（上游用 lucide，这里内联）
// ============================================================================

function Icon({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? 'size-5'} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  )
}
const AlertTriangle = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </Icon>
)
const CheckCircle = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="m8 12.2 2.8 2.8L16.2 9.5" />
  </Icon>
)
const XCircle = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="m15 9-6 6M9 9l6 6" />
  </Icon>
)
const Trash = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M3 6h18M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6M18.5 6l-.8 13a2 2 0 0 1-2 2H8.3a2 2 0 0 1-2-2L5.5 6" />
  </Icon>
)
const ArrowRight = () => (
  <Icon>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
)
const ArrowLeft = () => (
  <Icon>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
)

// 输入框的文字放在演示层：自动播放时由时间轴「打字」，用户接管后由输入框自己改。
const TextContext = createContext<{ text: string; setText: (text: string) => void }>({ text: '', setText: () => {} })

// ============================================================================
// Confirmation Flow（上游 Example 7，去掉了 final-warning 一步）
// ============================================================================

function ConfirmationDefaultView() {
  const { setView } = useFamilyDrawer()

  return (
    <>
      <header className="border-border mb-4 flex h-[72px] items-center border-b pl-2">
        <h2 className="text-foreground text-[19px] font-semibold md:font-medium">Account Settings</h2>
      </header>
      <div className="space-y-3">
        <FamilyDrawerButton onClick={() => setView('warning')}>
          <Trash className="size-4" />
          Delete Account
        </FamilyDrawerButton>
      </div>
    </>
  )
}

function ConfirmationWarningView() {
  const { setView } = useFamilyDrawer()

  return (
    <div>
      <div className="px-2">
        <FamilyDrawerHeader icon={<AlertTriangle className="text-destructive size-12" />} title="Delete Account" description="This action cannot be undone" />
        <div className="border-border mt-6 space-y-4 border-t pt-6">
          <div className="bg-destructive/10 rounded-lg p-4">
            <p className="text-destructive text-sm font-medium">Warning: This is a destructive action</p>
            <p className="text-muted-foreground mt-2 text-xs">Deleting your account will permanently remove all your data, including files, settings, and history.</p>
          </div>
          <div className="space-y-2 text-sm">
            {['All your files will be deleted', 'Your account history will be lost', "You won't be able to recover this account"].map((line) => (
              <div key={line} className="text-muted-foreground flex items-center gap-2">
                <XCircle className="size-4 shrink-0" />
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-7 flex gap-4">
        <FamilyDrawerSecondaryButton onClick={() => setView('default')} className="bg-secondary text-secondary-foreground">
          Cancel
        </FamilyDrawerSecondaryButton>
        <FamilyDrawerSecondaryButton onClick={() => setView('confirm')} className="bg-destructive text-white">
          Continue <ArrowRight />
        </FamilyDrawerSecondaryButton>
      </div>
    </div>
  )
}

const CONFIRMATION_WORD = 'DELETE'

function ConfirmationInputView() {
  const { setView } = useFamilyDrawer()
  const { text: confirmationText, setText: setConfirmationText } = useContext(TextContext)
  const confirmationId = useId()

  const isConfirmed = confirmationText === CONFIRMATION_WORD

  return (
    <div>
      <div className="px-2">
        <FamilyDrawerHeader icon={<AlertTriangle className="text-destructive size-12" />} title="Confirm Deletion" description="Type DELETE to confirm this action" />
        <div className="border-border mt-6 space-y-4 border-t pt-6">
          <div className="bg-destructive/10 rounded-lg p-4">
            <p className="text-destructive text-sm font-medium">This action is permanent</p>
            <p className="text-muted-foreground mt-2 text-xs">
              To confirm, please type <strong>{CONFIRMATION_WORD}</strong> in the field below.
            </p>
          </div>
          <div>
            <label htmlFor={confirmationId} className="text-foreground text-[15px] font-semibold md:font-medium">
              Type {CONFIRMATION_WORD} to confirm
            </label>
            <input
              id={confirmationId}
              type="text"
              autoComplete="off"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder={CONFIRMATION_WORD}
              className="border-border bg-background focus-visible:border-ring mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none"
            />
          </div>
        </div>
      </div>
      <div className="mt-7 flex gap-4">
        <FamilyDrawerSecondaryButton onClick={() => setView('warning')} className="bg-secondary text-secondary-foreground">
          <ArrowLeft /> Back
        </FamilyDrawerSecondaryButton>
        <FamilyDrawerSecondaryButton onClick={() => setView('processing')} disabled={!isConfirmed} className="bg-destructive text-white">
          Continue <ArrowRight />
        </FamilyDrawerSecondaryButton>
      </div>
    </div>
  )
}

function ConfirmationProcessingView() {
  return (
    <div>
      <div className="px-2">
        <FamilyDrawerHeader icon={<AlertTriangle className="text-destructive size-12" />} title="Processing..." description="Your account is being deleted" />
        <div className="border-border mt-6 space-y-4 border-t pt-6" role="status">
          {['Removing your account data...', 'Deleting associated files...', 'Clearing account history...'].map((line) => (
            <div key={line} className="text-muted-foreground flex items-center gap-3 text-[15px] font-semibold md:font-medium">
              <div className="border-destructive size-5 shrink-0 animate-spin rounded-full border-2 border-t-transparent motion-reduce:animate-none" />
              <span>{line}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ConfirmationCompleteView() {
  const { setView } = useFamilyDrawer()

  return (
    <div>
      <div className="px-2">
        <FamilyDrawerHeader icon={<CheckCircle className="text-destructive size-12" />} title="Account Deleted" description="Your account has been permanently deleted" />
        <div className="border-border mt-6 space-y-4 border-t pt-6">
          <div className="space-y-2 text-sm">
            {['Account data removed', 'Files deleted', 'History cleared'].map((line) => (
              <div key={line} className="text-muted-foreground flex items-center gap-2">
                <CheckCircle className="text-destructive size-4 shrink-0" />
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-7 flex gap-4">
        <FamilyDrawerSecondaryButton onClick={() => setView('default')} className="bg-secondary text-secondary-foreground">
          Close
        </FamilyDrawerSecondaryButton>
      </div>
    </div>
  )
}

const confirmationViews: ViewsRegistry = {
  default: ConfirmationDefaultView,
  warning: ConfirmationWarningView,
  confirm: ConfirmationInputView,
  processing: ConfirmationProcessingView,
  complete: ConfirmationCompleteView,
}

// ============================================================================
// 自动播放：12 秒一轮，打开 → 警告 → 输入确认词 → 处理中 → 完成 → 关闭
// ============================================================================

interface Script {
  open: boolean
  view: string
  text: string
}

const CYCLE = 12
const PROCESSING_SECONDS = 2.2

function scripted(time: number): Script {
  const t = time % CYCLE
  if (t < 0.6) return { open: false, view: 'default', text: '' }
  if (t < 2.0) return { open: true, view: 'default', text: '' }
  if (t < 4.0) return { open: true, view: 'warning', text: '' }
  if (t < 6.4) return { open: true, view: 'confirm', text: CONFIRMATION_WORD.slice(0, Math.max(0, Math.floor((t - 4.7) / 0.16))) }
  if (t < 8.2) return { open: true, view: 'processing', text: CONFIRMATION_WORD }
  if (t < 10.6) return { open: true, view: 'complete', text: '' }
  return { open: false, view: 'complete', text: '' }
}

const same = (a: Script, b: Script) => a.open === b.open && a.view === b.view && a.text === b.text

export function Demo(props: Omit<FamilyDrawerRootProps, 'children'>) {
  const hostRef = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const [auto, setAuto] = useState<Script>({ open: false, view: 'default', text: '' })
  // 用户一碰（指针或键盘）就接管，之后由用户的操作驱动。
  const [manual, setManual] = useState<Script | null>(null)
  const clock = useRef({ now: 0, processingAt: 0 })

  useFrameLoop(
    hostRef,
    ({ time }) => {
      clock.current.now = time
      if (!manual) {
        const next = scripted(time)
        setAuto((prev) => (same(prev, next) ? prev : next))
        return
      }
      // 上游用 setTimeout 模拟处理耗时；这里按帧循环的时间推进。
      if (manual.view === 'processing' && time - clock.current.processingAt > PROCESSING_SECONDS) {
        setManual((prev) => (prev ? { ...prev, view: 'complete', text: '' } : prev))
      }
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  const state = manual ?? auto
  const takeOver = () => setManual((prev) => prev ?? auto)

  const onViewChange = (view: string) => {
    let next = view
    if (view === 'processing') {
      clock.current.processingAt = clock.current.now
      // 减少动态效果时帧循环不推进，直接给出结果。
      if (reduced) next = 'complete'
    }
    setManual((prev) => {
      const base = prev ?? auto
      return { ...base, view: next, text: next === 'confirm' && base.view !== 'confirm' ? '' : base.text }
    })
  }

  const onOpenChange = (open: boolean) =>
    setManual((prev) => {
      const base = prev ?? auto
      return { ...base, open, view: open && base.view === 'complete' ? 'default' : base.view }
    })

  const setText = (text: string) => setManual((prev) => ({ ...(prev ?? auto), text }))

  return (
    <div ref={hostRef} onPointerDownCapture={takeOver} onKeyDownCapture={takeOver} className="grid h-full w-full place-items-center overflow-hidden bg-background p-6">
      <div className="w-full max-w-[340px]">
        <div className="flex items-center gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-linear-to-br from-sky-400 to-indigo-600 text-sm font-semibold text-white">ML</div>
          <div className="min-w-0">
            <div className="truncate text-[17px] font-semibold">Mara Lindqvist</div>
            <div className="truncate text-sm text-muted-foreground">mara@example.com</div>
          </div>
        </div>
        <dl className="mt-6 divide-y rounded-2xl border text-sm">
          {[
            ['Plan', 'Studio · yearly'],
            ['Storage', '18.4 GB of 50 GB'],
            ['Member since', 'March 2022'],
          ].map(([term, value]) => (
            <div key={term} className="flex items-center justify-between gap-4 px-4 py-3">
              <dt className="text-muted-foreground">{term}</dt>
              <dd className="truncate font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        <TextContext.Provider value={{ text: state.text, setText }}>
          <FamilyDrawerRoot {...props} views={confirmationViews} open={state.open} onOpenChange={onOpenChange} view={state.view} onViewChange={onViewChange}>
            <FamilyDrawerTrigger className="relative top-auto left-auto mt-6 block w-full translate-x-0 translate-y-0">Manage account</FamilyDrawerTrigger>
            <FamilyDrawerPortal>
              <FamilyDrawerOverlay />
              <FamilyDrawerContent label="Account settings">
                <FamilyDrawerClose />
                <FamilyDrawerAnimatedWrapper>
                  <FamilyDrawerAnimatedContent>
                    <FamilyDrawerViewContent />
                  </FamilyDrawerAnimatedContent>
                </FamilyDrawerAnimatedWrapper>
              </FamilyDrawerContent>
            </FamilyDrawerPortal>
          </FamilyDrawerRoot>
        </TextContext.Provider>
      </div>
    </div>
  )
}
