import { cn, cssVars, useFrameLoop, usePrefersReducedMotion } from '@/lib/motif-runtime'
import { motion } from 'motion/react'
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#7c9cff',
  theme: 'dark',
  typeface: 'geist',
  radius: 14,
  layout: 'columns',
  defaultLanguage: 'curl',
  showLatency: true,
  heading: 'Rates, labels and tracking behind one API',
  subheading: 'Change a parameter and press Run. Every call is written out for cURL, JavaScript and Python, and runs against a test key that never buys postage.',
}
/* @motif:end */

export type Language = 'curl' | 'javascript' | 'python'
export type EndpointId = 'rates' | 'track' | 'labels'
export type FieldValue = string | boolean
export type RequestValues = Record<EndpointId, Record<string, FieldValue>>

export type FeaturesApiPlaygroundProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控的当前接口；不传则组件自己管理。 */
  endpoint?: EndpointId
  onEndpointChange?: (endpoint: EndpointId) => void
  /** 受控的参数值（三个接口各一份）；不传则组件自己管理。 */
  values?: RequestValues
  onValuesChange?: (values: RequestValues) => void
  /** 受控的代码语言；不传则从 defaultLanguage 开始。 */
  language?: Language
  onLanguageChange?: (language: Language) => void
  /** 每次变化都等于按一次 Run（演示的自动播放用）。 */
  runKey?: number
  /** 当作「正在编辑」高亮的字段，'run' 表示按下 Run（演示的自动播放用）。 */
  focusField?: string | null
}

// ---- 虚构的产品：Kitepost，一个运费报价、面单和物流追踪的 API。换成你自己的接口时改这一段 ----

const HOST = 'api.kitepost.dev'
const ENV_KEY = 'KITEPOST_KEY'
const LANGUAGES: { id: Language; label: string; install: string | null }[] = [
  { id: 'curl', label: 'cURL', install: null },
  { id: 'javascript', label: 'JavaScript', install: 'npm i @kitepost/node' },
  { id: 'python', label: 'Python', install: 'pip install kitepost' },
]
const FACTS = ['Test keys never buy postage', 'Typed SDKs for Node and Python', 'Webhooks for every scan event']

/** basis 是窄容器里换行前的最小宽度；max 是宽容器里的上限，免得一个五位邮编的输入框被拉到几百像素宽。 */
type Size = { basis: string; max: string }
type Field =
  | ({ key: string; type: 'string' | 'number'; kind: 'text'; maxLength: number; unit?: string; numeric?: boolean } & Size)
  | ({ key: string; type: 'boolean'; kind: 'switch'; text: string } & Size)
  | ({ key: string; type: 'enum'; kind: 'choice'; options: string[] } & Size)
  | ({ key: string; type: 'string'; kind: 'select' } & Size)
type Option = { value: string; label: string }

type Endpoint = { id: EndpointId; method: 'GET' | 'POST'; path: string; title: string; fields: Field[] }

const CARRIERS = {
  ground: { carrier: 'Halden Ground', service: 'ground', code: 'HG' },
  express: { carrier: 'Petrel Air', service: 'express', code: 'PA' },
} as const

function hash(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const ID_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789'
function token(seed: string, length = 6): string {
  let h = hash(seed)
  let out = ''
  for (let i = 0; i < length; i++) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0
    out += ID_CHARS[h % ID_CHARS.length]
  }
  return out
}

/** 运费按两个邮编前三位的差估一个分区，再按重量计价；金额以美分为单位。 */
function quote(origin: string, destination: string, weight: number) {
  const gap = Math.abs(Number(origin.slice(0, 3)) - Number(destination.slice(0, 3)))
  const zone = Math.min(8, 2 + Math.floor(gap / 140))
  return [
    { ...CARRIERS.ground, id: `rate_${token(`g${origin}${destination}${weight}`)}`, amount: Math.round(590 + weight * 86 + zone * 118), days: Math.min(6, 1 + Math.ceil(zone * 0.6)) },
    { ...CARRIERS.express, id: `rate_${token(`x${origin}${destination}${weight}`)}`, amount: Math.round(1340 + weight * 192 + zone * 152), days: zone > 5 ? 2 : 1 },
  ]
}

type Quote = ReturnType<typeof quote>[number]
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`
const str = (values: Record<string, FieldValue>, key: string) => String(values[key] ?? '').trim()

/** 报价参数的校验：合法时给出解析好的值，不合法时给出和真实接口一样的出错参数与说明。 */
function parseRates(values: Record<string, FieldValue>): { origin: string; destination: string; weight: number } | { param: string; message: string } {
  const origin = str(values, 'origin')
  const destination = str(values, 'destination')
  const weight = Number(str(values, 'weight_kg'))
  if (!/^\d{5}$/.test(origin)) return { param: 'origin', message: 'origin must be a 5-digit ZIP code' }
  if (!/^\d{5}$/.test(destination)) return { param: 'destination', message: 'destination must be a 5-digit ZIP code' }
  if (!(weight >= 0.1 && weight <= 70)) return { param: 'weight_kg', message: 'weight_kg must be between 0.1 and 70' }
  return { origin, destination, weight }
}

const DEFAULT_RATES: Record<string, FieldValue> = { origin: '94107', destination: '10001', weight_kg: '2.4' }

/** 面单能买的运费就是当前报价参数报出来的那两条，id 和金额与 /v1/rates 的响应一一对应；报价参数填错时退回默认报价，下拉框不会变空。 */
function quotesFor(rates: Record<string, FieldValue>): Quote[] {
  const parsed = parseRates(rates)
  const input = 'weight' in parsed ? parsed : { origin: '94107', destination: '10001', weight: 2.4 }
  return quote(input.origin, input.destination, input.weight)
}

const rateOptions = (quotes: Quote[]): Option[] => quotes.map((r) => ({ value: r.id, label: `${r.carrier} · ${money(r.amount)}` }))

/** 选中的运费不在当前报价里（比如刚改了重量，旧报价作废）时，落到新报价的第一条，下拉框和代码里永远是一个真实存在的 id。 */
function withRate(labels: Record<string, FieldValue>, quotes: Quote[]): Record<string, FieldValue> {
  return quotes.some((q) => q.id === str(labels, 'rate')) ? labels : { ...labels, rate: quotes[0].id }
}

const ENDPOINTS: Endpoint[] = [
  {
    id: 'rates',
    method: 'GET',
    path: '/v1/rates',
    title: 'Quote rates for a parcel',
    fields: [
      { key: 'origin', type: 'string', kind: 'text', maxLength: 5, numeric: true, basis: '6rem', max: '8rem' },
      { key: 'destination', type: 'string', kind: 'text', maxLength: 5, numeric: true, basis: '6rem', max: '8rem' },
      { key: 'weight_kg', type: 'number', kind: 'text', maxLength: 5, unit: 'kg', numeric: true, basis: '8rem', max: '10rem' },
    ],
  },
  {
    id: 'track',
    method: 'GET',
    path: '/v1/parcels/:id',
    title: 'Track a parcel',
    fields: [
      { key: 'id', type: 'string', kind: 'text', maxLength: 14, basis: '8rem', max: '12rem' },
      { key: 'expand', type: 'boolean', kind: 'switch', text: 'events', basis: '7rem', max: '9rem' },
    ],
  },
  {
    id: 'labels',
    method: 'POST',
    path: '/v1/labels',
    title: 'Buy a shipping label',
    fields: [
      { key: 'rate', type: 'string', kind: 'select', basis: '11rem', max: '15rem' },
      { key: 'format', type: 'enum', kind: 'choice', options: ['pdf', 'zpl', 'png'], basis: '9rem', max: '11rem' },
    ],
  },
]

export const DEFAULT_VALUES: RequestValues = {
  rates: DEFAULT_RATES,
  track: { id: 'prc_4QZ19X', expand: false },
  labels: { rate: quotesFor(DEFAULT_RATES)[0].id, format: 'pdf' },
}

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }
type ApiResponse = { status: number; text: string; latency: number; body: Json }

const TRACK_EVENTS = [
  { at: '2026-11-11T14:20Z', type: 'delivered', location: 'New York, NY' },
  { at: '2026-11-11T07:58Z', type: 'out_for_delivery', location: 'Newark, NJ' },
  { at: '2026-11-10T06:42Z', type: 'arrived_at_hub', location: 'Memphis, TN' },
  { at: '2026-11-09T22:15Z', type: 'departed', location: 'Oakland, CA' },
  { at: '2026-11-09T17:03Z', type: 'picked_up', location: 'San Francisco, CA' },
]

function failure(status: number, text: string, type: string, param: string, message: string, seed: number): ApiResponse {
  return { status, text, latency: 28 + (seed % 22), body: { error: { type, param, message } } }
}

/** 模拟的服务端：同样的参数永远得到同样的结果和耗时，海报和循环视频才稳定。quotes 是面单接口此刻能买的运费。 */
function respond(id: EndpointId, values: Record<string, FieldValue>, quotes: Quote[]): ApiResponse {
  const seed = hash(id + JSON.stringify(values))
  if (id === 'rates') {
    const parsed = parseRates(values)
    if (!('weight' in parsed)) return failure(422, 'Unprocessable', 'invalid_request', parsed.param, parsed.message, seed)
    return {
      status: 200,
      text: 'OK',
      latency: 112 + (seed % 84),
      body: {
        object: 'list',
        currency: 'usd',
        data: quote(parsed.origin, parsed.destination, parsed.weight).map((r) => ({ id: r.id, carrier: r.carrier, service: r.service, amount: r.amount, est_days: r.days })),
        has_more: false,
      },
    }
  }
  if (id === 'track') {
    const parcel = str(values, 'id')
    if (!/^prc_[A-Za-z0-9]{6}$/.test(parcel)) return failure(404, 'Not Found', 'not_found', 'id', `No parcel with id '${parcel}'`, seed)
    const status = (['delivered', 'in_transit', 'out_for_delivery'] as const)[parcel.charCodeAt(parcel.length - 1) % 3]
    const events = TRACK_EVENTS.slice(status === 'delivered' ? 0 : status === 'out_for_delivery' ? 1 : 2)
    return {
      status: 200,
      text: 'OK',
      latency: 64 + (seed % 40),
      body: {
        id: parcel,
        object: 'parcel',
        status,
        carrier: CARRIERS.express.carrier,
        ...(status === 'delivered' ? { delivered_at: events[0].at } : { eta: '2026-11-12' }),
        ...(values.expand === true ? { events: events.slice(0, 3) } : { last_event: events[0].type }),
      },
    }
  }
  const rate = quotes.find((r) => r.id === str(values, 'rate'))
  if (!rate) return failure(404, 'Not Found', 'not_found', 'rate', `No rate with id '${str(values, 'rate')}'. Quote again with /v1/rates`, seed)
  const digits = String(seed).padStart(12, '7').slice(-12)
  return {
    status: 201,
    text: 'Created',
    latency: 168 + (seed % 70),
    body: {
      id: `lbl_${token(String(seed))}`,
      object: 'label',
      status: 'purchased',
      rate: rate.id,
      carrier: rate.carrier,
      tracking_number: `${rate.code} ${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`,
      format: str(values, 'format') || 'pdf',
      amount: rate.amount,
      test_mode: true,
    },
  }
}

// ---- 代码高亮：只认我们自己生成的几种记号，不需要通用的语法分析 ----

type Kind = 'tx' | 'kw' | 'fn' | 'str' | 'num' | 'bool' | 'punc' | 'cmt' | 'key'
type Tok = readonly [Kind, string]
type Line = Tok[]

const camel = (key: string) => key.replace(/_(\w)/g, (_, c: string) => c.toUpperCase())
const isNumber = (value: string) => /^\d+(\.\d*)?$/.test(value)

/** [参数名, 值, 是否按数字写]：邮编这类「长得像数字」的字符串仍然写成字符串。 */
function params(endpoint: Endpoint, values: Record<string, FieldValue>): [string, FieldValue, boolean][] {
  if (endpoint.id === 'track') return values.expand === true ? [['expand', 'events', false]] : []
  return endpoint.fields.map((f) => [f.key, values[f.key] ?? '', f.type === 'number'])
}

function pathOf(endpoint: Endpoint, values: Record<string, FieldValue>) {
  return endpoint.path.replace(':id', str(values, 'id') || ':id')
}

function curlLines(endpoint: Endpoint, values: Record<string, FieldValue>): Line[] {
  const list = params(endpoint, values)
  const get = endpoint.method === 'GET'
  const lines: Line[] = [[['fn', 'curl'], ['tx', ' '], ...(get && list.length ? ([['kw', '-G'], ['tx', ' ']] as Tok[]) : []), ['str', `https://${HOST}${pathOf(endpoint, values)}`]]]
  lines.push([['tx', '  '], ['kw', '-u'], ['tx', ' '], ['fn', `$${ENV_KEY}:`]])
  if (!get) lines.push([['tx', '  '], ['kw', '-H'], ['tx', ' '], ['str', `"Idempotency-Key: ${token(JSON.stringify(values), 8)}"`]])
  for (const [key, value] of list) {
    const raw = String(value)
    if (endpoint.id === 'track') lines.push([['tx', '  '], ['kw', '-d'], ['tx', ' '], ['str', `"${key}[]=${raw}"`]])
    else lines.push([['tx', '  '], ['kw', '-d'], ['tx', ' '], ['key', key], ['punc', '='], ['str', /^[\w.:-]*$/.test(raw) ? raw : `"${raw.replace(/"/g, '\\"')}"`]])
  }
  return lines.map((line, i) => (i < lines.length - 1 ? [...line, ['punc', ' \\']] : line))
}

function literal(value: FieldValue, python: boolean, numeric = false): Tok {
  if (typeof value === 'boolean') return ['bool', python ? (value ? 'True' : 'False') : String(value)]
  return numeric && isNumber(value) ? ['num', value] : ['str', JSON.stringify(value)]
}

/** 每段代码最后用一下结果，读起来像真的写在项目里的调用。 */
const USE: Record<EndpointId, { js: Line[]; py: Line[] }> = {
  rates: {
    js: [
      [['kw', 'for'], ['tx', ' ('], ['kw', 'const'], ['tx', ' rate '], ['kw', 'of'], ['tx', ' rates.data) {']],
      [['tx', '  console.'], ['fn', 'log'], ['punc', '('], ['tx', 'rate.carrier, rate.amount'], ['punc', ')']],
      [['tx', '}']],
    ],
    py: [
      [['kw', 'for'], ['tx', ' rate '], ['kw', 'in'], ['tx', ' rates.data:']],
      [['tx', '    '], ['fn', 'print'], ['punc', '('], ['tx', 'rate.carrier, rate.amount'], ['punc', ')']],
    ],
  },
  // 已签收的包裹没有 eta，响应里给的是 delivered_at。
  track: {
    js: [
      [['kw', 'const'], ['tx', ' when = parcel.eta '], ['punc', '??'], ['tx', ' parcel.deliveredAt']],
      [['tx', 'console.'], ['fn', 'log'], ['punc', '('], ['tx', 'parcel.status, when'], ['punc', ')']],
    ],
    py: [
      [['tx', 'when = parcel.eta '], ['kw', 'or'], ['tx', ' parcel.delivered_at']],
      [['fn', 'print'], ['punc', '('], ['tx', 'parcel.status, when'], ['punc', ')']],
    ],
  },
  labels: {
    js: [[['tx', 'console.'], ['fn', 'log'], ['punc', '('], ['tx', 'label.trackingNumber'], ['punc', ')']]],
    py: [[['fn', 'print'], ['punc', '('], ['tx', 'label.tracking_number'], ['punc', ')']]],
  },
}

function jsLines(endpoint: Endpoint, values: Record<string, FieldValue>): Line[] {
  const head: Line[] = [
    [['kw', 'import'], ['tx', ' Kitepost '], ['kw', 'from'], ['tx', ' '], ['str', '"@kitepost/node"']],
    [],
    [['cmt', `// reads ${ENV_KEY} from the environment`]],
    [['kw', 'const'], ['tx', ' kitepost = '], ['kw', 'new'], ['tx', ' '], ['fn', 'Kitepost'], ['punc', '()']],
    [],
  ]
  const call = (name: string, resource: string, method: string): Tok[] => [['kw', 'const'], ['tx', ` ${name} = `], ['kw', 'await'], ['tx', ` kitepost.${resource}.`], ['fn', method]]
  if (endpoint.id === 'track') {
    return [
      ...head,
      [...call('parcel', 'parcels', 'retrieve'), ['punc', '(']],
      [['tx', '  '], literal(str(values, 'id'), false), ['punc', ',']],
      ...(values.expand === true ? [[['tx', '  '], ['punc', '{ '], ['key', 'expand'], ['punc', ': ['], ['str', '"events"'], ['punc', '] },']] as Line] : []),
      [['punc', ')']],
      [],
      ...USE.track.js,
    ]
  }
  const [name, resource, method] = endpoint.id === 'rates' ? ['rates', 'rates', 'list'] : ['label', 'labels', 'create']
  return [
    ...head,
    [...call(name, resource, method), ['punc', '({']],
    ...params(endpoint, values).map(([key, value, numeric]): Line => [['tx', '  '], ['key', camel(key)], ['punc', ': '], literal(value, false, numeric), ['punc', ',']]),
    [['punc', '})']],
    [],
    ...USE[endpoint.id].js,
  ]
}

function pyLines(endpoint: Endpoint, values: Record<string, FieldValue>): Line[] {
  const head: Line[] = [
    [['kw', 'from'], ['tx', ' kitepost '], ['kw', 'import'], ['tx', ' Kitepost']],
    [],
    [['tx', 'client = '], ['fn', 'Kitepost'], ['punc', '()'], ['tx', '  '], ['cmt', `# reads ${ENV_KEY}`]],
    [],
  ]
  const [name, resource, method] = endpoint.id === 'rates' ? ['rates', 'rates', 'list'] : endpoint.id === 'track' ? ['parcel', 'parcels', 'retrieve'] : ['label', 'labels', 'create']
  const args: Line[] =
    endpoint.id === 'track'
      ? [
          [['tx', '    '], literal(str(values, 'id'), true), ['punc', ',']],
          ...(values.expand === true ? [[['tx', '    '], ['key', 'expand'], ['punc', '=['], ['str', '"events"'], ['punc', '],']] as Line] : []),
        ]
      : params(endpoint, values).map(([key, value, numeric]): Line => [['tx', '    '], ['key', key], ['punc', '='], literal(value, true, numeric), ['punc', ',']])
  return [...head, [['tx', `${name} = client.${resource}.`], ['fn', method], ['punc', '(']], ...args, [['punc', ')']], [], ...USE[endpoint.id].py]
}

function jsonLines(value: Json): Line[] {
  const out: Line[] = []
  const walk = (v: Json, depth: number, prefix: Tok[], trail: string) => {
    const pad: Tok = ['tx', '  '.repeat(depth)]
    if (Array.isArray(v)) {
      out.push([pad, ...prefix, ['punc', '[']])
      v.forEach((item, i) => walk(item, depth + 1, [], i < v.length - 1 ? ',' : ''))
      out.push([pad, ['punc', `]${trail}`]])
    } else if (v !== null && typeof v === 'object') {
      const entries = Object.entries(v)
      out.push([pad, ...prefix, ['punc', '{']])
      entries.forEach(([k, item], i) => walk(item, depth + 1, [['key', `"${k}"`], ['punc', ': ']], i < entries.length - 1 ? ',' : ''))
      out.push([pad, ['punc', `}${trail}`]])
    } else {
      const tok: Tok = typeof v === 'string' ? ['str', JSON.stringify(v)] : typeof v === 'number' ? ['num', String(v)] : ['bool', String(v)]
      out.push([pad, ...prefix, tok, ['punc', trail]])
    }
  }
  walk(value, 0, [], '')
  return out
}

const plain = (lines: Line[]) => lines.map((line) => line.map((t) => t[1]).join('')).join('\n')

function Tokens({ line }: { line: Line }) {
  return (
    <>
      {line.map(([kind, text], i) =>
        kind === 'tx' ? (
          <span key={i}>{text}</span>
        ) : (
          <span key={i} style={{ color: `var(--syn-${kind})` }}>
            {text}
          </span>
        ),
      )}
      {line.length === 0 && ' '}
    </>
  )
}

// ---- 配色：深浅两套，强调色按对比度自动调成可读的文字色，按钮上的字按亮度选黑或白 ----

type Rgb = [number, number, number]
function rgbOf(hex: string): Rgb {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0').slice(0, 6)
  const n = Number.parseInt(full, 16)
  return Number.isNaN(n) ? [124, 156, 255] : [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const hexOf = (c: Rgb) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
function luminance([r, g, b]: Rgb) {
  const lin = (v: number) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
function contrast(a: Rgb, b: Rgb) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
/**
 * 把强调色朝白（深色主题）或朝黑（浅色主题）推，直到在每一块背景上的对比度都够 min：
 * 文字要 4.5，按钮、选中框、下划线这类填充要 3（WCAG 1.4.11），否则贴近背景的主色会让按钮只剩一行字。
 */
function lift(accent: Rgb, backgrounds: Rgb[], min: number): Rgb {
  const toward: Rgb = luminance(backgrounds[0]) < 0.4 ? [255, 255, 255] : [0, 0, 0]
  for (let i = 0; i <= 25; i++) {
    const c = mix(accent, toward, i / 25)
    if (backgrounds.every((b) => contrast(c, b) >= min)) return c
  }
  return toward
}

const THEMES = {
  dark: {
    bg: '#08090c',
    surface: '#0f1116',
    panel: '#0b0c10',
    raised: '#161922',
    line: 'rgba(255,255,255,0.075)',
    lineStrong: 'rgba(255,255,255,0.14)',
    fg: '#eceef3',
    muted: '#9ba1b3',
    faint: '#5f6676',
    syn: { kw: '#bf9cff', fn: '#7cc2ff', str: '#a0dc8e', num: '#f5af60', bool: '#f28cb8', punc: '#7f8698', cmt: '#7d8496' },
    ok: '#6ee7a8',
    warn: '#fbc063',
    bad: '#fd9a9a',
    ink: '#0b0c10',
  },
  light: {
    bg: '#f5f5f2',
    surface: '#ffffff',
    panel: '#fbfbf9',
    raised: '#f3f3f0',
    line: 'rgba(16,18,24,0.09)',
    lineStrong: 'rgba(16,18,24,0.17)',
    fg: '#15171d',
    muted: '#5a606f',
    faint: '#a3a8b2',
    syn: { kw: '#6c3ed4', fn: '#0b63a6', str: '#17703a', num: '#a4500a', bool: '#b32360', punc: '#6b7180', cmt: '#717786' },
    ok: '#0d7a44',
    warn: '#9a5a06',
    bad: '#bf2a2a',
    ink: '#0b0c10',
  },
}

const TYPEFACES: Record<string, { sans: string; head: string; weight: number; tracking: string; scale: number; mono: string }> = {
  geist: { sans: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", head: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.035em', scale: 1, mono: "'Geist Mono Variable', ui-monospace, monospace" },
  jetbrains: { sans: "'Inter Tight Variable', ui-sans-serif, system-ui, sans-serif", head: "'Inter Tight Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.03em', scale: 1, mono: "'JetBrains Mono Variable', ui-monospace, monospace" },
  plex: { sans: "'IBM Plex Sans Variable', ui-sans-serif, system-ui, sans-serif", head: "'IBM Plex Sans Variable', ui-sans-serif, system-ui, sans-serif", weight: 600, tracking: '-0.025em', scale: 1, mono: "'IBM Plex Mono', ui-monospace, monospace" },
  editorial: { sans: "'Geist Variable', ui-sans-serif, system-ui, sans-serif", head: "'Instrument Serif', ui-serif, Georgia, serif", weight: 400, tracking: '-0.01em', scale: 1.16, mono: "'Geist Mono Variable', ui-monospace, monospace" },
}

const mono: CSSProperties = { fontFamily: 'var(--pg-mono)' }
const tint = (pct: number) => `color-mix(in oklab, var(--pg-acc-fill) ${pct}%, transparent)`

// ---- 小零件 ----

function KiteMark() {
  return (
    <svg viewBox="0 0 20 20" className="size-[18px]" fill="none" aria-hidden>
      <path d="M10 1.8 16.2 8 10 14.2 3.8 8z" fill="var(--pg-acc-fill)" />
      <path d="M10 1.8V14.2M3.8 8h12.4" stroke="var(--pg-acc-ink)" strokeOpacity=".45" strokeWidth="1.1" />
      <path d="M10 14.2c-.6 1.4.9 1.9.3 3.1-.3.6-.9.9-1.4 1.1" stroke="var(--pg-acc-fill)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function Method({ method }: { method: 'GET' | 'POST' }) {
  const color = method === 'GET' ? 'var(--pg-ok)' : 'var(--pg-warn)'
  return (
    <span className="inline-flex h-[18px] w-[38px] shrink-0 items-center justify-center rounded text-[10px] font-semibold tracking-wide" style={{ ...mono, color, background: `color-mix(in oklab, ${color} 13%, transparent)` }}>
      {method}
    </span>
  )
}

function Spinner() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5 motion-safe:animate-spin" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity=".25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn('size-3.5', className)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  )
}

function FieldShell({ focused, children, className }: { focused: boolean; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'relative flex h-9 items-center rounded-[var(--pg-r-sm)] border bg-muted transition-[border-color,box-shadow] duration-200 focus-within:border-[color:var(--pg-acc-text)] focus-within:shadow-[0_0_0_3px_var(--pg-acc-ring)]',
        className,
      )}
      style={focused ? { borderColor: 'var(--pg-acc-text)', boxShadow: '0 0 0 3px var(--pg-acc-ring)' } : undefined}
    >
      {children}
    </span>
  )
}

function FieldLabel({ field, htmlFor, id }: { field: Field; htmlFor?: string; id?: string }) {
  const content = (
    <>
      <span className="text-[12px] text-foreground" style={mono}>
        {field.key}
      </span>
      <span className="text-[10.5px] text-muted-foreground">{field.type}</span>
    </>
  )
  return htmlFor ? (
    <label htmlFor={htmlFor} id={id} className="flex items-baseline justify-between gap-2">
      {content}
    </label>
  ) : (
    <span id={id} className="flex items-baseline justify-between gap-2">
      {content}
    </span>
  )
}

function FieldControl({ field, value, focused, onChange, uid, options = [] }: { field: Field; value: FieldValue; focused: boolean; onChange: (value: FieldValue) => void; uid: string; options?: Option[] }) {
  const inputId = `${uid}-${field.key}`
  const labelId = `${inputId}-label`
  // 窄的构建区里字段放开拉伸、一行排满；宽的（上下版式、左文右窗）里各自封顶，读起来像一条请求栏。
  const wrap = (children: ReactNode, labelled = true) => (
    <div className="flex min-w-0 flex-col gap-1.5 @xl:max-w-(--field-max)" style={{ flex: `1 1 ${field.basis}`, '--field-max': field.max } as CSSProperties}>
      <FieldLabel field={field} htmlFor={labelled ? inputId : undefined} id={labelId} />
      {children}
    </div>
  )

  if (field.kind === 'text') {
    return wrap(
      <FieldShell focused={focused}>
        <input
          id={inputId}
          value={String(value)}
          maxLength={field.maxLength}
          inputMode={field.numeric ? 'decimal' : 'text'}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          className="h-full w-full min-w-0 bg-transparent px-2.5 text-[13px] text-foreground outline-none"
          style={mono}
        />
        {focused && <span aria-hidden className="pointer-events-none absolute top-1/2 h-4 w-px -translate-y-1/2 text-[13px] motion-safe:animate-pulse" style={{ left: `calc(0.625rem + ${String(value).length}ch)`, background: 'var(--pg-acc-text)', ...mono }} />}
        {field.unit && <span className="pr-2.5 text-[12px] text-muted-foreground">{field.unit}</span>}
      </FieldShell>,
    )
  }
  if (field.kind === 'switch') {
    const on = value === true
    return wrap(
      <FieldShell focused={focused}>
        <button
          id={inputId}
          type="button"
          role="switch"
          aria-checked={on}
          aria-labelledby={labelId}
          onClick={() => onChange(!on)}
          className="flex h-full w-full items-center gap-2.5 rounded-[var(--pg-r-sm)] px-2.5 text-left outline-none"
        >
          <span className="relative h-[18px] w-8 shrink-0 rounded-full transition-[background-color] duration-200" style={{ background: on ? 'var(--pg-acc-fill)' : 'var(--pg-line-strong)' }}>
            <span className={cn('absolute top-[2px] left-[2px] size-[14px] rounded-full shadow-sm transition-transform duration-200 motion-reduce:transition-none', on && 'translate-x-[14px]')} style={{ background: on ? 'var(--pg-acc-ink)' : 'var(--pg-fg)' }} />
          </span>
          <span className="text-[12.5px] text-foreground" style={mono}>
            {on ? field.text : 'none'}
          </span>
        </button>
      </FieldShell>,
      false,
    )
  }
  if (field.kind === 'choice') {
    return wrap(
      <FieldShell focused={focused} className="p-[3px]">
        <span role="radiogroup" aria-labelledby={labelId} className="flex h-full w-full gap-[3px]">
          {field.options.map((option) => {
            const on = value === option
            return (
              <label
                key={option}
                className="relative grid flex-1 cursor-pointer place-items-center rounded-[calc(var(--pg-r-sm)-3px)] text-[12px] transition-[background-color,color] duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[color:var(--pg-acc-text)]"
                style={{ ...mono, background: on ? 'var(--pg-surface)' : undefined, color: on ? 'var(--pg-fg)' : 'var(--pg-muted)', boxShadow: on ? '0 1px 2px rgba(0,0,0,.18), inset 0 0 0 1px var(--pg-line)' : undefined }}
              >
                <input type="radio" name={inputId} value={option} checked={on} onChange={() => onChange(option)} className="sr-only" />
                {option}
              </label>
            )
          })}
        </span>
      </FieldShell>,
      false,
    )
  }
  return wrap(
    <FieldShell focused={focused}>
      <select id={inputId} value={String(value)} onChange={(e) => onChange(e.target.value)} className="h-full w-full min-w-0 appearance-none bg-transparent pr-8 pl-2.5 text-[12.5px] text-foreground outline-none" style={{ fontFamily: 'var(--pg-sans)' }}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg viewBox="0 0 16 16" className="pointer-events-none absolute right-2.5 size-3.5 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m4.5 6.5 3.5 3.5 3.5-3.5" />
      </svg>
    </FieldShell>,
  )
}

/** announce：这次请求是不是用户自己发的；演示自动播放发的请求不进读屏的 live region，免得每 12 秒念四遍。 */
type Shown = { endpoint: EndpointId; sig: string; request: string; response: ApiResponse; n: number; announce: boolean }
type Pending = Omit<Shown, 'n'> & { startedAt: number; wait: number }

function snapshot(endpoint: Endpoint, values: Record<string, FieldValue>, quotes: Quote[], announce: boolean): Omit<Shown, 'n'> {
  return { endpoint: endpoint.id, sig: endpoint.id + JSON.stringify(values), request: `${endpoint.method} ${pathOf(endpoint, values)}`, response: respond(endpoint.id, values, quotes), announce }
}

const endpointOf = (id: EndpointId | undefined) => ENDPOINTS.find((e) => e.id === id) ?? ENDPOINTS[0]
const isLanguage = (value: unknown): value is Language => LANGUAGES.some((l) => l.id === value)

/** API 试玩区：左边选接口填参数，中间是 cURL / JavaScript / Python 三种写法，右边是带语法色和耗时的模拟响应。 */
export function FeaturesApiPlayground({
  className,
  style,
  endpoint: endpointProp,
  onEndpointChange,
  values: valuesProp,
  onValuesChange,
  language: languageProp,
  onLanguageChange,
  runKey,
  focusField = null,
  ...props
}: FeaturesApiPlaygroundProps) {
  const o = { ...defaults, ...props }
  const reduced = usePrefersReducedMotion()
  const uid = useId()
  const theme = o.theme === 'light' ? THEMES.light : THEMES.dark
  const face = TYPEFACES[o.typeface] ?? TYPEFACES.geist
  const layout = o.layout === 'stacked' || o.layout === 'split' ? o.layout : 'columns'
  const radius = Math.max(0, Math.min(24, o.radius))

  const [endpointInner, setEndpointInner] = useState<EndpointId>('rates')
  const endpoint = endpointOf(endpointProp ?? endpointInner)
  const [valuesInner, setValuesInner] = useState<RequestValues>(DEFAULT_VALUES)
  const values = valuesProp ?? valuesInner
  const quotes = quotesFor(values.rates ?? DEFAULT_VALUES.rates)
  const raw = values[endpoint.id] ?? DEFAULT_VALUES[endpoint.id]
  const current = endpoint.id === 'labels' ? withRate(raw, quotes) : raw
  const [languageInner, setLanguageInner] = useState<Language | null>(null)
  const language: Language = languageProp ?? languageInner ?? (isLanguage(o.defaultLanguage) ? o.defaultLanguage : 'curl')

  const [shown, setShown] = useState<Shown>(() => ({ ...snapshot(endpoint, current, quotes, false), n: 0 }))
  const [pending, setPendingState] = useState<Pending | null>(null)
  const pendingRef = useRef<Pending | null>(null)
  const setPending = (next: Pending | null) => {
    pendingRef.current = next
    setPendingState(next)
  }

  const host = useRef<HTMLElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const clock = useRef(0)

  useFrameLoop(
    host,
    ({ time }) => {
      clock.current = time
      const p = pendingRef.current
      if (!p) return
      const k = Math.min(1, Math.max(0, time - p.startedAt) / p.wait)
      bar.current?.style.setProperty('transform', `scaleX(${(0.06 + 0.94 * (1 - (1 - k) ** 2)).toFixed(3)})`)
      if (k >= 1) {
        const done = { endpoint: p.endpoint, sig: p.sig, request: p.request, response: p.response, announce: p.announce }
        setPending(null)
        setShown((prev) => ({ ...done, n: prev.n + 1 }))
      }
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const run = (byUser: boolean) => {
    if (pendingRef.current) return
    const next = snapshot(endpoint, current, quotes, byUser)
    if (reduced) {
      setShown((prev) => ({ ...next, n: prev.n + 1 }))
      return
    }
    setPending({ ...next, startedAt: clock.current, wait: Math.max(0.42, next.response.latency / 1000 + 0.22) })
  }
  const runRef = useRef(run)
  useEffect(() => {
    runRef.current = run
  })
  const seenRunKey = useRef(runKey)
  useEffect(() => {
    if (runKey === undefined || runKey === seenRunKey.current) return
    seenRunKey.current = runKey
    runRef.current(false)
  }, [runKey])

  const selectEndpoint = (id: EndpointId) => {
    if (endpointProp === undefined) setEndpointInner(id)
    onEndpointChange?.(id)
  }
  const setField = (key: string, value: FieldValue) => {
    const next = { ...values, [endpoint.id]: { ...current, [key]: value } }
    if (valuesProp === undefined) setValuesInner(next)
    onValuesChange?.(next)
  }
  const selectLanguage = (id: Language) => {
    if (languageProp === undefined) setLanguageInner(id)
    onLanguageChange?.(id)
  }

  // 代码
  const code = language === 'curl' ? curlLines(endpoint, current) : language === 'javascript' ? jsLines(endpoint, current) : pyLines(endpoint, current)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = LANGUAGES.length - 1
    const next = event.key === 'ArrowRight' ? (index + 1) % LANGUAGES.length : event.key === 'ArrowLeft' ? (index + last) % LANGUAGES.length : event.key === 'Home' ? 0 : event.key === 'End' ? last : -1
    if (next < 0) return
    event.preventDefault()
    selectLanguage(LANGUAGES[next].id)
    tabRefs.current[next]?.focus()
  }
  const pre = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState<{ label: string; n: number } | null>(null)
  const copy = async () => {
    const n = (copied?.n ?? 0) + 1
    try {
      await navigator.clipboard.writeText(plain(code))
      setCopied({ label: 'Copied', n })
    } catch {
      // 剪贴板被沙箱拦下时退而求其次：选中代码，让用户自己按复制。
      const selection = window.getSelection()
      if (pre.current && selection) selection.selectAllChildren(pre.current)
      setCopied({ label: 'Selected', n })
    }
  }

  // 响应
  const response = shown.response
  const json = jsonLines(response.body)
  const stale = !pending && shown.sig !== endpoint.id + JSON.stringify(current)
  const statusColor = response.status < 300 ? 'var(--pg-ok)' : response.status < 500 ? 'var(--pg-bad)' : 'var(--pg-warn)'
  const latencyColor = response.latency < 150 ? 'var(--pg-ok)' : response.latency < 300 ? 'var(--pg-warn)' : 'var(--pg-bad)'
  const bytes = JSON.stringify(response.body).length
  const animateIn = !reduced && shown.n > 0
  const ease = [0.22, 1, 0.36, 1] as const

  const accent = rgbOf(o.accent)
  // 文字色对页面上所有底色都要够 4.5；填充色对它会落上去的几块底色够 3，按钮上的字再按填充色的亮度选黑或白。
  const accentText = hexOf(lift(accent, [theme.bg, theme.surface, theme.panel, theme.raised].map(rgbOf), 4.5))
  const fill = lift(accent, [theme.surface, theme.panel, theme.raised].map(rgbOf), 3)
  const vars = cssVars(
    {
      '--background': theme.bg,
      '--foreground': theme.fg,
      '--card': theme.surface,
      '--muted': theme.raised,
      '--muted-foreground': theme.muted,
      '--border': theme.line,
      '--color-border': theme.line,
      '--input': theme.lineStrong,
      '--ring': accentText,
      '--pg-surface': theme.surface,
      '--pg-panel': theme.panel,
      '--pg-fg': theme.fg,
      '--pg-muted': theme.muted,
      '--pg-faint': theme.faint,
      '--pg-line': theme.line,
      '--pg-line-strong': theme.lineStrong,
      '--pg-acc-fill': hexOf(fill),
      '--pg-acc-text': accentText,
      '--pg-acc-ink': contrast(fill, [255, 255, 255]) >= contrast(fill, rgbOf(theme.ink)) ? '#ffffff' : theme.ink,
      '--pg-acc-ring': tint(28),
      '--pg-ok': theme.ok,
      '--pg-warn': theme.warn,
      '--pg-bad': theme.bad,
      '--pg-r': `${radius}px`,
      '--pg-r-sm': `${Math.max(4, Math.round(radius * 0.55))}px`,
      '--pg-sans': face.sans,
      '--pg-mono': face.mono,
      '--syn-kw': theme.syn.kw,
      '--syn-fn': theme.syn.fn,
      '--syn-str': theme.syn.str,
      '--syn-num': theme.syn.num,
      '--syn-bool': theme.syn.bool,
      '--syn-punc': theme.syn.punc,
      '--syn-cmt': theme.syn.cmt,
      '--syn-key': accentText,
    },
    { background: 'var(--background)', color: 'var(--foreground)', fontFamily: face.sans, colorScheme: o.theme === 'light' ? 'light' : 'dark', ...style },
  )

  const split = layout === 'split'
  const header = (
    <header className={cn('grid gap-5 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-14', split && 'xl:grid-cols-1 xl:items-start xl:gap-5')}>
      <div>
        <p className="inline-flex items-center gap-2 text-[12.5px] font-medium" style={{ color: 'var(--pg-acc-text)' }}>
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5.5 4 2 8l3.5 4M10.5 4 14 8l-3.5 4" />
          </svg>
          Developer API
        </p>
        <h2
          id={`${uid}-title`}
          className="mt-3 text-balance text-foreground"
          style={{ fontFamily: face.head, fontWeight: face.weight, letterSpacing: face.tracking, fontSize: `calc(clamp(1.9rem, 1.2rem + 2.2vw, 2.7rem) * ${face.scale})`, lineHeight: 1.06 }}
        >
          {o.heading}
        </h2>
      </div>
      <div>
        <p className="max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground">{o.subheading}</p>
        <ul className={cn('mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-foreground/85', split && 'xl:mt-6 xl:flex-col xl:gap-2.5')}>
          {FACTS.map((fact) => (
            <li key={fact} className="flex items-center gap-2">
              <span className="grid size-4 shrink-0 place-items-center rounded-full" style={{ background: tint(18), color: 'var(--pg-acc-text)' }}>
                <Check className="size-2.5" />
              </span>
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </header>
  )

  const builder = (
    <form
      aria-label="Request builder"
      onSubmit={(e) => {
        e.preventDefault()
        run(true)
      }}
      className={cn('@container flex min-w-0 flex-col gap-5 p-4 sm:p-5 md:col-span-2', layout === 'columns' && 'xl:col-span-1 xl:overflow-y-auto')}
    >
      <fieldset className="min-w-0">
        <legend className="mb-2.5 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">Endpoint</legend>
        <div className="grid gap-1.5 @xl:grid-cols-3">
          {ENDPOINTS.map((ep) => {
            const on = ep.id === endpoint.id
            return (
              <label
                key={ep.id}
                className={cn(
                  'flex min-w-0 cursor-pointer flex-col gap-1 rounded-[var(--pg-r-sm)] border px-3 py-2.5 transition-[background-color,border-color] duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[color:var(--pg-acc-text)]',
                  !on && 'border-transparent hover:bg-muted',
                )}
                style={on ? { background: tint(12), borderColor: tint(55) } : undefined}
              >
                <input type="radio" name={`${uid}-endpoint`} value={ep.id} checked={on} onChange={() => selectEndpoint(ep.id)} className="sr-only" />
                <span className="flex min-w-0 items-center gap-2">
                  <Method method={ep.method} />
                  <span className="truncate text-[12.5px] text-foreground" style={mono}>
                    {ep.path}
                  </span>
                </span>
                <span className="truncate pl-[46px] text-[12px] text-muted-foreground">{ep.title}</span>
              </label>
            )
          })}
        </div>
      </fieldset>
      <fieldset className="min-w-0">
        <legend className="mb-2.5 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">{endpoint.method === 'GET' ? 'Query' : 'Body'}</legend>
        <div className="flex flex-wrap items-end gap-3">
          {endpoint.fields.map((field) => (
            <FieldControl
              key={`${endpoint.id}-${field.key}`}
              field={field}
              value={current[field.key] ?? ''}
              focused={focusField === field.key}
              onChange={(v) => setField(field.key, v)}
              uid={`${uid}-${endpoint.id}`}
              options={field.kind === 'select' ? rateOptions(quotes) : undefined}
            />
          ))}
          <button
            type="submit"
            aria-busy={pending !== null}
            className={cn(
              'inline-flex h-9 w-full shrink-0 items-center justify-center gap-2 rounded-[var(--pg-r-sm)] px-4 text-[13px] font-semibold outline-none transition-[filter,transform] duration-150 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--pg-acc-text)] active:scale-[0.98] @xl:w-auto',
              focusField === 'run' && 'scale-[0.98] brightness-110',
            )}
            style={{ background: 'var(--pg-acc-fill)', color: 'var(--pg-acc-ink)' }}
          >
            {pending ? (
              <>
                <Spinner /> Sending
              </>
            ) : (
              <>
                <svg viewBox="0 0 16 16" className="size-3" fill="currentColor" aria-hidden>
                  <path d="M4.5 2.8v10.4c0 .5.6.8 1 .5l7.6-5.2a.6.6 0 0 0 0-1L5.5 2.3c-.4-.3-1 0-1 .5z" />
                </svg>
                Run request
                <kbd aria-hidden className="ml-1 rounded px-1 text-[10.5px] font-medium" style={{ ...mono, background: 'color-mix(in oklab, var(--pg-acc-ink) 14%, transparent)' }}>
                  ↵
                </kbd>
              </>
            )}
          </button>
        </div>
      </fieldset>
    </form>
  )

  // 中屏起代码和响应并排；三栏版式到 xl 才把构建区也并进来，再窄构建区就挤得放不下两个邮编框和 Run。
  const paneHeight = layout === 'columns' ? 'h-[22rem] md:h-[25rem] xl:h-auto' : 'h-[22rem] md:h-[25rem]'
  const active = LANGUAGES.find((l) => l.id === language) ?? LANGUAGES[0]
  const scrollFocus = 'outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color:var(--pg-acc-text)]'

  const codePane = (
    <div className={cn('flex min-w-0 flex-col border-t', layout === 'columns' && 'xl:border-t-0 xl:border-l', paneHeight)} style={{ background: 'var(--pg-panel)' }}>
      <div className="flex h-11 shrink-0 items-stretch gap-1 border-b pr-2 pl-2">
        <div role="tablist" aria-label="Request language" className="flex min-w-0 items-stretch">
          {LANGUAGES.map((lang, index) => {
            const on = lang.id === language
            return (
              <button
                key={lang.id}
                ref={(el) => {
                  tabRefs.current[index] = el
                }}
                id={`${uid}-tab-${lang.id}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={`${uid}-code`}
                tabIndex={on ? 0 : -1}
                onClick={() => selectLanguage(lang.id)}
                onKeyDown={(e) => onTabKey(e, index)}
                className={cn(
                  'relative rounded-[var(--pg-r-sm)] px-2.5 text-[12.5px] font-medium outline-none transition-colors duration-200 focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-[color:var(--pg-acc-text)] sm:px-3',
                  on ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {lang.label}
                <span className={cn('absolute inset-x-2 -bottom-px h-[2px] rounded-full transition-[opacity,transform] duration-300 motion-reduce:transition-none', on ? 'scale-x-100 opacity-100' : 'scale-x-50 opacity-0')} style={{ background: 'var(--pg-acc-fill)' }} />
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => void copy()}
          aria-label="Copy code"
          className="my-auto ml-auto inline-flex h-7 shrink-0 items-center gap-1.5 rounded-[var(--pg-r-sm)] px-2 text-[11.5px] text-muted-foreground outline-none transition-colors duration-200 hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-[color:var(--pg-acc-text)]"
        >
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
              <rect x="5.5" y="5.5" width="8" height="8" rx="1.6" />
              <path d="M10.5 3.5v-.4c0-.9-.7-1.6-1.6-1.6H4.1c-.9 0-1.6.7-1.6 1.6v4.8c0 .9.7 1.6 1.6 1.6h.4" />
            </svg>
          )}
          {copied ? (
            <motion.span key={copied.n} initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 1.8, times: [0, 0.08, 0.8, 1] }} onAnimationComplete={() => setCopied(null)}>
              {copied.label}
            </motion.span>
          ) : (
            <span className="hidden sm:inline">Copy</span>
          )}
        </button>
        <span role="status" className="sr-only">
          {copied ? (copied.label === 'Copied' ? 'Code copied to clipboard' : 'Code selected') : ''}
        </span>
      </div>
      <div id={`${uid}-code`} role="tabpanel" tabIndex={0} aria-labelledby={`${uid}-tab-${language}`} className={cn('min-h-0 flex-1 overflow-auto', scrollFocus)}>
        <pre ref={pre} className="min-w-max py-4 text-[12px] leading-[1.7]" style={{ ...mono, color: theme.fg }}>
          {code.map((line, i) => (
            <div key={i} className="flex pr-5">
              <span aria-hidden className="w-10 shrink-0 pr-4 text-right select-none" style={{ color: 'var(--pg-faint)' }}>
                {i + 1}
              </span>
              <code>
                <Tokens line={line} />
              </code>
            </div>
          ))}
        </pre>
      </div>
      <div className="flex h-9 shrink-0 items-center gap-2 border-t px-4 text-[11.5px] text-muted-foreground">
        {active.install ? (
          <>
            <span style={{ color: 'var(--pg-faint)' }}>$</span>
            <span className="truncate" style={mono}>
              {active.install}
            </span>
          </>
        ) : (
          <span className="truncate">No SDK needed. Works from any shell.</span>
        )}
        <span className="ml-auto shrink-0" style={mono}>
          {code.length} lines
        </span>
      </div>
    </div>
  )

  const responsePane = (
    <div
      role="region"
      aria-label="Response"
      className={cn('flex min-w-0 flex-col border-t md:border-l', layout === 'columns' && 'xl:border-t-0', paneHeight)}
      style={{ background: 'var(--pg-panel)' }}
    >
      <div className="flex h-11 shrink-0 items-center gap-2 border-b px-4">
        <span className="text-[12.5px] font-medium text-foreground">Response</span>
        {pending ? (
          <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground" style={mono}>
            <Spinner /> <span className="truncate">{pending.request}</span>
          </span>
        ) : (
          <>
            <span className="rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ ...mono, color: statusColor, background: `color-mix(in oklab, ${statusColor} 13%, transparent)` }}>
              {response.status} {response.text}
            </span>
            {o.showLatency && (
              <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground" style={mono}>
                <span className="size-1.5 rounded-full" style={{ background: latencyColor }} />
                {response.latency} ms
              </span>
            )}
          </>
        )}
        <span className="ml-auto hidden truncate text-[11px] text-muted-foreground sm:inline" style={mono}>
          {stale ? 'edited · run again' : bytes < 1000 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} kB`}
        </span>
      </div>
      <div className="relative min-h-0 flex-1">
        {pending && <div ref={bar} className="absolute inset-x-0 top-0 z-10 h-[2px] origin-left" style={{ background: 'var(--pg-acc-fill)', transform: 'scaleX(0.06)' }} />}
        <div tabIndex={0} role="group" aria-label="Response body" className={cn('absolute inset-0 overflow-auto', scrollFocus)}>
          <pre className="min-w-max p-4 text-[12px] leading-[1.7] transition-opacity duration-300" style={{ ...mono, color: theme.fg, opacity: pending ? 0.32 : stale ? 0.55 : 1 }}>
            <motion.code key={shown.n} className="block" initial={animateIn ? 'hidden' : false} animate="show" variants={{ show: { transition: { staggerChildren: 0.014 } } }}>
              {json.map((line, i) => (
                <motion.span key={i} className="block" variants={{ hidden: { opacity: 0, x: -6 }, show: { opacity: 1, x: 0, transition: { duration: 0.28, ease } } }}>
                  <Tokens line={line} />
                </motion.span>
              ))}
            </motion.code>
          </pre>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {pending ? (pending.announce ? `Sending ${pending.request}` : '') : shown.announce ? `${shown.request}: ${response.status} ${response.text}${o.showLatency ? ` in ${response.latency} milliseconds` : ''}` : ''}
      </p>
    </div>
  )

  const windowEl = (
    <div className="min-w-0 overflow-hidden rounded-[var(--pg-r)] border bg-card" style={{ borderColor: 'var(--pg-line-strong)', boxShadow: o.theme === 'light' ? '0 1px 2px rgba(16,18,24,.06), 0 24px 60px -24px rgba(16,18,24,.22)' : '0 30px 80px -30px rgba(0,0,0,.7)' }}>
      <div className="flex h-11 items-center gap-2.5 border-b px-4">
        <KiteMark />
        <span className="text-[13px] font-semibold tracking-tight text-foreground">Kitepost</span>
        <span className="rounded-full px-2 py-0.5 text-[10.5px] font-medium" style={{ color: 'var(--pg-warn)', background: 'color-mix(in oklab, var(--pg-warn) 13%, transparent)' }}>
          Test mode
        </span>
        <span className="ml-auto hidden items-center gap-3 text-[11px] text-muted-foreground sm:flex" style={mono}>
          <span>{HOST}</span>
          <span className="inline-flex items-center gap-1.5 rounded-[var(--pg-r-sm)] border px-2 py-1">
            <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
              <circle cx="5.5" cy="10.5" r="3" />
              <path d="m7.7 8.3 5.8-5.8M11.5 4.5l1.8 1.8" />
            </svg>
            kp_test_••••4f2a
          </span>
        </span>
      </div>
      <div className={cn('grid md:grid-cols-2', layout === 'columns' && 'xl:h-[31rem] xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.09fr)_minmax(0,1.09fr)]')}>
        {builder}
        {codePane}
        {responsePane}
      </div>
    </div>
  )

  return (
    <section ref={host} aria-labelledby={`${uid}-title`} className={cn('w-full', className)} style={vars}>
      <div className={cn('mx-auto w-full px-4 py-12 sm:px-6 sm:py-16', split ? 'max-w-7xl xl:grid xl:grid-cols-[minmax(0,0.58fr)_minmax(0,1.42fr)] xl:items-center xl:gap-14' : 'max-w-6xl')}>
        {header}
        <div className={cn('relative mt-10 min-w-0', split && 'xl:mt-0')}>
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-6 -top-10 h-56 rounded-full blur-3xl"
            style={{ background: `radial-gradient(50% 55% at 50% 50%, ${tint(o.theme === 'light' ? 16 : 22)}, transparent)` }}
          />
          <div className="relative">{windowEl}</div>
        </div>
      </div>
    </section>
  )
}
