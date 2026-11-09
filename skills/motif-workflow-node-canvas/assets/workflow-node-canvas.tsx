// SPDX-License-Identifier: MIT
// Copyright (c) 2026 uitripled
// Source: https://github.com/moumen-soliman/uitripled/blob/05d1837/packages/components/react-shadcn/src/components/sections/n8n-workflow-block.tsx
// Modified by Motif; see the item's provenance.
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { motion, useReducedMotion, type PanInfo } from 'motion/react'
import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { flushSync } from 'react-dom'

/* @motif:defaults */
export const defaults = {
  accent: '#34d399',
  nodePalette: 'spectrum',
  curveStyle: 'bezier',
  gridStyle: 'dots',
  flowDash: true,
  snapToGrid: false,
}
/* @motif:end */

export type WorkflowNodeCanvasProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 演示用：给某个节点叠加一个位移（自动播放时模拟拖动） */
  nudge?: { index: number; x: number; y: number } | null
}

// Interfaces
type IconName = 'webhook' | 'database' | 'settings' | 'mail' | 'zap'

interface WorkflowNode {
  id: string
  type: 'trigger' | 'action' | 'condition'
  title: string
  description: string
  icon: IconName
  color: string
  position: { x: number; y: number }
}

interface WorkflowConnection {
  from: string
  to: string
}

// Constants
const NODE_WIDTH = 200
const NODE_HEIGHT = 100
const GRID = 20

const ICON_PATHS: Record<IconName, ReactNode> = {
  webhook: (
    <>
      <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
      <path d="m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06" />
      <path d="m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14a9 3 0 0 0 18 0V5" />
      <path d="M3 12a9 3 0 0 0 18 0" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  zap: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
}

function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {ICON_PATHS[name]}
    </svg>
  )
}

const nodeTemplates: Omit<WorkflowNode, 'id' | 'position'>[] = [
  { type: 'trigger', title: 'Webhook', description: 'Receive data from external service', icon: 'webhook', color: 'emerald' },
  { type: 'action', title: 'Database Query', description: 'Fetch user records', icon: 'database', color: 'blue' },
  { type: 'condition', title: 'Condition', description: 'Check user status', icon: 'settings', color: 'amber' },
  { type: 'action', title: 'Send Email', description: 'Notify user', icon: 'mail', color: 'purple' },
  { type: 'action', title: 'Log Event', description: 'Record activity', icon: 'zap', color: 'indigo' },
]

const initialNodes: WorkflowNode[] = [
  { id: 'node-1', ...nodeTemplates[0]!, position: { x: 50, y: 100 } },
  { id: 'node-2', ...nodeTemplates[1]!, position: { x: 300, y: 100 } },
  { id: 'node-3', ...nodeTemplates[2]!, position: { x: 550, y: 100 } },
]

const initialConnections: WorkflowConnection[] = [
  { from: 'node-1', to: 'node-2' },
  { from: 'node-2', to: 'node-3' },
]

const colorClasses: Record<string, string> = {
  emerald: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400',
  blue: 'border-blue-400/40 bg-blue-400/10 text-blue-400',
  amber: 'border-amber-400/40 bg-amber-400/10 text-amber-400',
  purple: 'border-purple-400/40 bg-purple-400/10 text-purple-400',
  indigo: 'border-indigo-400/40 bg-indigo-400/10 text-indigo-400',
  accent:
    'border-[color-mix(in_oklab,var(--wf-accent)_40%,transparent)] bg-[color-mix(in_oklab,var(--wf-accent)_10%,transparent)] text-[var(--wf-ink)]',
}

/** 主色在暗底上太暗时，文字改用和白色混合后的颜色，保证可读。 */
function readableInk(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return hex
  const n = parseInt(m[1]!, 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  if (l >= 0.3) return hex
  const mix = l < 0.08 ? 40 : 60
  return `color-mix(in oklab, ${hex} ${mix}%, white)`
}

function connectionPath(from: WorkflowNode, to: WorkflowNode, curveStyle: string) {
  const startX = from.position.x + NODE_WIDTH
  const startY = from.position.y + NODE_HEIGHT / 2
  const endX = to.position.x
  const endY = to.position.y + NODE_HEIGHT / 2

  if (curveStyle === 'straight') return `M${startX},${startY} L${endX},${endY}`
  if (curveStyle === 'step') {
    const midX = startX + (endX - startX) / 2
    const r = Math.min(10, Math.abs(endY - startY) / 2, Math.abs(endX - startX) / 2)
    if (r < 1) return `M${startX},${startY} H${midX} V${endY} H${endX}`
    const dx = Math.sign(endX - startX) || 1
    const dy = Math.sign(endY - startY)
    return `M${startX},${startY} H${midX - dx * r} Q${midX},${startY} ${midX},${startY + dy * r} V${endY - dy * r} Q${midX},${endY} ${midX + dx * r},${endY} H${endX}`
  }
  const cp1X = startX + (endX - startX) * 0.5
  const cp2X = endX - (endX - startX) * 0.5
  return `M${startX},${startY} C${cp1X},${startY} ${cp2X},${endY} ${endX},${endY}`
}

// Connection Line Component
function WorkflowConnectionLine({ from, to, nodes, curveStyle }: { from: string; to: string; nodes: WorkflowNode[]; curveStyle: string }) {
  const fromNode = nodes.find((n) => n.id === from)
  const toNode = nodes.find((n) => n.id === to)
  if (!fromNode || !toNode) return null

  return (
    <path
      d={connectionPath(fromNode, toNode, curveStyle)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeDasharray="8,6"
      strokeLinecap="round"
      opacity={0.35}
      className="text-foreground"
    />
  )
}

const gridBackground: Record<string, CSSProperties> = {
  dots: {
    backgroundImage: 'radial-gradient(circle, color-mix(in oklab, var(--foreground) 22%, transparent) 1px, transparent 1.5px)',
    backgroundSize: `${GRID}px ${GRID}px`,
  },
  lines: {
    backgroundImage:
      'linear-gradient(to right, color-mix(in oklab, var(--foreground) 7%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 7%, transparent) 1px, transparent 1px)',
    backgroundSize: `${GRID}px ${GRID}px`,
  },
  none: {},
}

// Main Component
export function WorkflowNodeCanvas({ className, style, nudge, ...props }: WorkflowNodeCanvasProps) {
  const options = { ...defaults, ...props }
  const reduced = useReducedMotion()
  const [nodes, setNodes] = useState<WorkflowNode[]>(initialNodes)
  const [connections, setConnections] = useState<WorkflowConnection[]>(initialConnections)
  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const nextId = useRef(initialNodes.length + 1)
  const dragStartPosition = useRef<{ x: number; y: number } | null>(null)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const [contentSize, setContentSize] = useState(() => {
    const maxX = Math.max(...initialNodes.map((n) => n.position.x + NODE_WIDTH))
    const maxY = Math.max(...initialNodes.map((n) => n.position.y + NODE_HEIGHT))
    return { width: maxX + 50, height: maxY + 50 }
  })

  // 虚线流动：直接写 strokeDashoffset，不触发重渲染
  useFrameLoop(
    canvasRef,
    ({ time }) => {
      const offset = options.flowDash ? -((time * 28) % 14) : 0
      svgRef.current?.querySelectorAll('path').forEach((p) => {
        p.style.strokeDashoffset = String(offset)
      })
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const snap = (v: number) => (options.snapToGrid ? Math.round(v / GRID) * GRID : v)

  // 演示自动播放：只改渲染位置，不写回状态
  const rendered = nudge
    ? nodes.map((n, i) =>
        i === nudge.index && n.id !== draggingNodeId ? { ...n, position: { x: Math.max(0, n.position.x + nudge.x), y: Math.max(0, n.position.y + nudge.y) } } : n,
      )
    : nodes

  // Drag Handlers
  const handleDragStart = (nodeId: string) => {
    setDraggingNodeId(nodeId)
    const node = nodes.find((n) => n.id === nodeId)
    if (node) dragStartPosition.current = { x: node.position.x, y: node.position.y }
  }

  const handleDrag = (nodeId: string, { offset }: PanInfo) => {
    if (draggingNodeId !== nodeId || !dragStartPosition.current) return

    const constrainedX = Math.max(0, snap(dragStartPosition.current.x + offset.x))
    const constrainedY = Math.max(0, snap(dragStartPosition.current.y + offset.y))

    flushSync(() => {
      setNodes((prev) => prev.map((node) => (node.id === nodeId ? { ...node, position: { x: constrainedX, y: constrainedY } } : node)))
    })

    setContentSize((prev) => ({
      width: Math.max(prev.width, constrainedX + NODE_WIDTH + 50),
      height: Math.max(prev.height, constrainedY + NODE_HEIGHT + 50),
    }))
  }

  const handleDragEnd = () => {
    setDraggingNodeId(null)
    dragStartPosition.current = null
  }

  // 键盘可达：方向键移动聚焦的节点
  const handleKey = (nodeId: string, e: KeyboardEvent) => {
    const step = e.shiftKey ? GRID * 2 : GRID
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key]
    if (!d) return
    e.preventDefault()
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, position: { x: Math.max(0, n.position.x + d[0]!), y: Math.max(0, n.position.y + d[1]!) } } : n)),
    )
  }

  // Add Node Handler
  const addNode = () => {
    const template = nodeTemplates[Math.floor(Math.random() * nodeTemplates.length)]!
    const lastNode = nodes[nodes.length - 1]
    const newPosition = lastNode ? { x: lastNode.position.x + 250, y: lastNode.position.y } : { x: 50, y: 100 }

    const newNode: WorkflowNode = { id: `node-${nextId.current++}`, ...template, position: newPosition }

    flushSync(() => {
      setNodes((prev) => [...prev, newNode])
      if (lastNode) setConnections((prev) => [...prev, { from: lastNode.id, to: newNode.id }])
    })

    setContentSize((prev) => ({
      width: Math.max(prev.width, newPosition.x + NODE_WIDTH + 50),
      height: Math.max(prev.height, newPosition.y + NODE_HEIGHT + 50),
    }))

    // Scroll to new node
    const canvas = canvasRef.current
    if (canvas) {
      canvas.scrollTo({ left: newPosition.x + NODE_WIDTH - canvas.clientWidth + 100, behavior: reduced ? 'auto' : 'smooth' })
    }
  }

  const ink = readableInk(options.accent)
  const tone = (color: string) => colorClasses[options.nodePalette === 'accent' ? 'accent' : color]

  return (
    <div
      className={cn('relative w-full overflow-hidden rounded-2xl border border-border/40 bg-background/60 p-4 backdrop-blur sm:p-6', className)}
      style={{ '--wf-accent': options.accent, '--wf-ink': ink, ...style } as CSSProperties}
    >
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-[color-mix(in_oklab,var(--wf-accent)_40%,transparent)] bg-[color-mix(in_oklab,var(--wf-accent)_10%,transparent)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--wf-ink)]">
            Active
          </span>
          <span className="text-xs uppercase tracking-[0.25em] text-foreground/50 sm:text-sm">Workflow Builder</span>
        </div>
        <button
          type="button"
          onClick={addNode}
          className="inline-flex h-8 items-center gap-2 rounded-lg border border-border bg-background px-3 text-xs uppercase tracking-[0.2em] text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wf-accent)]"
          aria-label="Add new node"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5" aria-hidden>
            <path d="M5 12h14M12 5v14" />
          </svg>
          <span className="hidden sm:inline">Add Node</span>
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative h-[400px] w-full overflow-auto rounded-xl border border-border/30 bg-background/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wf-accent)] sm:h-[500px] md:h-[600px]"
        style={{ minHeight: '400px' }}
        role="region"
        aria-label="Workflow canvas"
        tabIndex={0}
      >
        {/* Content Wrapper */}
        <div className="relative" style={{ minWidth: contentSize.width, minHeight: '100%', height: contentSize.height, ...gridBackground[options.gridStyle] }}>
          {/* SVG Connections */}
          <svg
            ref={svgRef}
            className="pointer-events-none absolute top-0 left-0"
            width={contentSize.width}
            height={contentSize.height}
            style={{ overflow: 'visible' }}
            aria-hidden="true"
          >
            {connections.map((c) => (
              <WorkflowConnectionLine key={`${c.from}-${c.to}`} from={c.from} to={c.to} nodes={rendered} curveStyle={options.curveStyle} />
            ))}
          </svg>

          {/* Nodes */}
          {rendered.map((node) => {
            const isDragging = draggingNodeId === node.id

            return (
              <motion.div
                key={node.id}
                drag
                dragMomentum={false}
                dragConstraints={{ left: 0, top: 0, right: 100000, bottom: 100000 }}
                onDragStart={() => handleDragStart(node.id)}
                onDrag={(_, info) => handleDrag(node.id, info)}
                onDragEnd={handleDragEnd}
                onKeyDown={(e) => handleKey(node.id, e)}
                style={{ x: node.position.x, y: node.position.y, width: NODE_WIDTH, transformOrigin: '0 0' }}
                className="absolute cursor-grab rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wf-accent)]"
                initial={reduced ? false : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                whileHover={reduced ? undefined : { scale: 1.02 }}
                whileDrag={{ scale: reduced ? 1 : 1.05, zIndex: 50, cursor: 'grabbing' }}
                tabIndex={0}
                role="group"
                aria-roledescription="draggable node"
                aria-label={`${node.type} node: ${node.title}. Use arrow keys to move.`}
              >
                <div
                  className={cn(
                    'group/node relative w-full overflow-hidden rounded-xl border bg-background/70 p-3 backdrop-blur transition-shadow hover:shadow-lg',
                    tone(node.color),
                    isDragging && 'shadow-xl ring-2 ring-[color-mix(in_oklab,var(--wf-accent)_50%,transparent)]',
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.04] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover/node:opacity-100" />

                  <div className="relative space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-background/80 backdrop-blur', tone(node.color))} aria-hidden="true">
                        <Icon name={node.icon} className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="mb-0.5 inline-block rounded-full border border-border/40 bg-background/80 px-1.5 py-0 text-[9px] uppercase tracking-[0.15em] text-foreground/60">
                          {node.type}
                        </span>
                        <h3 className="truncate text-xs font-semibold tracking-tight text-foreground">{node.title}</h3>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-[10px] leading-relaxed text-foreground/70">{node.description}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-foreground/50">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5" aria-hidden>
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                      <span className="uppercase tracking-[0.1em]">Connected</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Footer Stats */}
      <div
        className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/30 bg-background/40 px-4 py-2.5 backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-center gap-4 text-xs text-foreground/60">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[var(--wf-accent)]" aria-hidden="true" />
            <span className="uppercase tracking-[0.15em]">
              {nodes.length} {nodes.length === 1 ? 'Node' : 'Nodes'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-foreground/60" aria-hidden="true" />
            <span className="uppercase tracking-[0.15em]">
              {connections.length} {connections.length === 1 ? 'Connection' : 'Connections'}
            </span>
          </div>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">Drag nodes to reposition</p>
      </div>
    </div>
  )
}
