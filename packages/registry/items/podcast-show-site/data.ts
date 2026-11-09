/* 节目内容：全部虚构（人名、机构、单集都是编的），换成自己的节目时只改这个文件。 */

export type Topic = 'Biology' | 'Earth' | 'Engineering' | 'Space'
export const TOPICS: readonly Topic[] = ['Biology', 'Earth', 'Engineering', 'Space']

export interface Chapter {
  /** 章节开始的秒数。第一章必须从 0 开始。 */
  at: number
  title: string
}

/** 节目页「本期提到」里的一条：论文、数据、录音……（虚构，只有文字，不带外链）。 */
export interface Note {
  kind: 'Paper' | 'Dataset' | 'Protocol' | 'Recording' | 'Report' | 'Talk' | 'Retraction' | 'Correction'
  title: string
  source: string
}

export interface Episode {
  number: number
  title: string
  guest: string
  affiliation: string
  /** ISO 日期。 */
  date: string
  /** 秒。 */
  duration: number
  topic: Topic
  blurb: string
  chapters: Chapter[]
  notes: Note[]
}

export const SEASON = 9
export const EPISODE_COUNT = 148
export const GUEST_COUNT = 86

export const EPISODES: readonly Episode[] = [
  {
    number: 148,
    title: 'The yeast that refused to die',
    guest: 'Dr. Ines Varga',
    affiliation: 'Halden Institute',
    date: '2026-11-03',
    duration: 3138,
    topic: 'Biology',
    blurb: 'A freezer failed over a long weekend and every culture should have died. One strain didn’t, and it changed how Ines’s lab stores vaccine starter cultures.',
    chapters: [
      { at: 0, title: 'Cold open' },
      { at: 130, title: 'The long weekend' },
      { at: 695, title: 'Counting survivors' },
      { at: 1085, title: 'The control that wasn’t' },
      { at: 1900, title: 'What the strain had' },
      { at: 2660, title: 'Listener mail' },
    ],
    notes: [
      { kind: 'Paper', title: 'Survival of a −80 °C storage strain after an unplanned thaw', source: 'Varga, Lund & Achterberg · preprint, 2026' },
      { kind: 'Dataset', title: 'Forty plates, one survivor: counts and plate photos', source: 'Halden open notebook · entries 412–437' },
      { kind: 'Protocol', title: 'Freezer-failure triage: what to re-streak first', source: 'Halden Institute biobank · 2 pages' },
    ],
  },
  {
    number: 147,
    title: 'Weighing a cloud',
    guest: 'Prof. Tomasz Reyes',
    affiliation: 'Northfold University',
    date: '2026-10-27',
    duration: 2825,
    topic: 'Earth',
    blurb: 'How much does a cumulus weigh? A grad-student estimate, a drone that fell out of the sky and the number they finally published.',
    chapters: [
      { at: 0, title: 'Cold open' },
      { at: 240, title: 'A napkin estimate' },
      { at: 980, title: 'The drone' },
      { at: 1710, title: 'Error bars' },
      { at: 2400, title: 'Listener mail' },
    ],
    notes: [
      { kind: 'Paper', title: 'A drone-borne estimate of liquid water in a fair-weather cumulus', source: 'Reyes & Abara · 2025' },
      { kind: 'Dataset', title: 'Flight log 7, the one that came down', source: 'Northfold Atmospheric Group' },
      { kind: 'Talk', title: 'Napkin maths for clouds', source: 'Northfold public lecture series · 38 min' },
    ],
  },
  {
    number: 146,
    title: 'Why the footbridge hummed',
    guest: 'Dr. Amara Lindgren',
    affiliation: 'Calder Structural Lab',
    date: '2026-10-20',
    duration: 3520,
    topic: 'Engineering',
    blurb: 'A new pedestrian bridge started singing in crosswinds. Tracing the tone to one bolt pattern took eleven months and a borrowed violin tuner.',
    chapters: [
      { at: 0, title: 'Cold open' },
      { at: 310, title: 'First complaints' },
      { at: 1180, title: 'Wind tunnel, take two' },
      { at: 2050, title: 'The bolt pattern' },
      { at: 2930, title: 'What changed in the code' },
    ],
    notes: [
      { kind: 'Report', title: 'Aeolian tones in a cable-stayed footbridge: source and retrofit', source: 'Calder Structural Lab · TR 23-04' },
      { kind: 'Recording', title: 'Crosswind hum at 412 Hz', source: 'Site microphone 3 · 40 s' },
      { kind: 'Paper', title: 'Vortex shedding from perforated handrail panels', source: 'Lindgren & Osei · 2026' },
    ],
  },
  {
    number: 145,
    title: 'The maze had a draft',
    guest: 'Dr. Kofi Adjei',
    affiliation: 'Halden Institute',
    date: '2026-10-13',
    duration: 2652,
    topic: 'Biology',
    blurb: 'Mice kept learning a maze faster than they should. The answer was air from a ventilation duct, not memory, and two years of data had to be rerun.',
    chapters: [
      { at: 0, title: 'Cold open' },
      { at: 205, title: 'Too-smart mice' },
      { at: 890, title: 'Following the air' },
      { at: 1620, title: 'Rerunning two years' },
      { at: 2210, title: 'Listener mail' },
    ],
    notes: [
      { kind: 'Paper', title: 'Airflow cues confound spatial learning in a radial maze', source: 'Adjei et al. · 2026' },
      { kind: 'Correction', title: 'Reanalysis notice for two earlier maze studies', source: 'Halden Institute' },
      { kind: 'Protocol', title: 'Smoke-pencil check for testing-room airflow', source: '1 page' },
    ],
  },
  {
    number: 144,
    title: 'A telescope that saw itself',
    guest: 'Dr. Hana Sato',
    affiliation: 'Calder Observatory',
    date: '2026-10-06',
    duration: 3687,
    topic: 'Space',
    blurb: 'A faint galaxy in three years of survey data turned out to be the telescope’s own reflection. How the team found it, and what retracting it cost.',
    chapters: [
      { at: 0, title: 'Cold open' },
      { at: 280, title: 'A galaxy too faint' },
      { at: 1240, title: 'Ghosts in the optics' },
      { at: 2300, title: 'Writing the retraction' },
      { at: 3180, title: 'Listener mail' },
    ],
    notes: [
      { kind: 'Retraction', title: 'A low-surface-brightness galaxy at z ≈ 0.04', source: 'Sato et al. · retracted 2026' },
      { kind: 'Paper', title: 'Internal reflections in wide-field survey optics', source: 'Calder Observatory · 2026' },
      { kind: 'Dataset', title: 'Survey field 1182, stacked, ghost included', source: 'Calder sky survey · DR4' },
    ],
  },
  {
    number: 143,
    title: 'Counting whales by ear',
    guest: 'Dr. Luis Ferreira',
    affiliation: 'Kestrel Bay Marine Lab',
    date: '2026-09-29',
    duration: 2390,
    topic: 'Earth',
    blurb: 'Hydrophones heard twice as many whales as the survey boats saw. Which count was wrong, and why the answer was both.',
    chapters: [
      { at: 0, title: 'Cold open' },
      { at: 190, title: 'Two counts' },
      { at: 840, title: 'Songs that carry' },
      { at: 1560, title: 'Reconciling the census' },
    ],
    notes: [
      { kind: 'Paper', title: 'Reconciling acoustic and visual counts of humpback whales', source: 'Ferreira & Mbeki · 2026' },
      { kind: 'Recording', title: 'Two males singing 30 km apart', source: 'Kestrel Bay hydrophone array · 2 min' },
      { kind: 'Dataset', title: 'Census 2019–2025, both methods', source: 'Kestrel Bay Marine Lab' },
    ],
  },
]

export const LATEST = EPISODES[0]!

/** 打开页面时从哪里继续听（最新一集的第 4 章里）。 */
export const RESUME_AT = 1116

export function episodeBy(number: number): Episode {
  return EPISODES.find((episode) => episode.number === number) ?? LATEST
}

export function chapterIndexAt(episode: Episode, time: number): number {
  let index = 0
  for (let i = 0; i < episode.chapters.length; i++) if (time >= episode.chapters[i]!.at) index = i
  return index
}

export function chapterEnd(episode: Episode, index: number): number {
  return episode.chapters[index + 1]?.at ?? episode.duration
}

/* ---------- 文字稿节选（第 148 集） ---------- */

export interface Speaker {
  name: string
  role: 'host' | 'guest'
}

export const SPEAKERS = {
  maren: { name: 'Maren Okafor', role: 'host' },
  jonah: { name: 'Jonah Pell', role: 'host' },
  ines: { name: 'Ines Varga', role: 'guest' },
} satisfies Record<string, Speaker>

export interface TranscriptLine {
  at: number
  speaker: keyof typeof SPEAKERS
  text: string
}

export const TRANSCRIPT: { episode: number; lines: TranscriptLine[] } = {
  episode: 148,
  lines: [
    { at: 1109, speaker: 'maren', text: 'So the frozen stock was your control. The one box nobody is allowed to touch.' },
    { at: 1116, speaker: 'ines', text: 'Right. The minus-eighty is the reference. Every other plate gets compared against it.' },
    { at: 1123, speaker: 'ines', text: 'Except that weekend the minus-eighty became the experiment. It warmed to minus twelve on Saturday night, and nobody knew until Tuesday.' },
    { at: 1135, speaker: 'jonah', text: 'There wasn’t an alarm?' },
    { at: 1137, speaker: 'ines', text: 'There was. It emailed a postdoc who left in March.' },
    { at: 1142, speaker: 'maren', text: 'That is every lab I have ever worked in.' },
    { at: 1146, speaker: 'ines', text: 'So we plated everything, expecting nothing. Forty plates. One of them grew.' },
  ],
}

export interface TimedWord {
  text: string
  start: number
  line: number
}

/** 把每行的时长按字数分给每个词（真实项目里用对齐工具给的逐词时间）。 */
export function transcriptWords(): TimedWord[] {
  const words: TimedWord[] = []
  const { lines } = TRANSCRIPT
  lines.forEach((line, index) => {
    const parts = line.text.split(' ')
    const end = lines[index + 1]?.at ?? line.at + parts.length * 0.36
    const weights = parts.map((part) => part.length + 2)
    const total = weights.reduce((sum, w) => sum + w, 0)
    let cursor = line.at
    parts.forEach((part, i) => {
      words.push({ text: part, start: cursor, line: index })
      cursor += ((end - line.at) * weights[i]!) / total
    })
  })
  return words
}

/* ---------- 主持人与嘉宾 ---------- */

export interface Host {
  name: string
  role: string
  bio: string
  pick: { number: number; title: string }
  hue: number
}

export const HOSTS: readonly Host[] = [
  {
    name: 'Maren Okafor',
    role: 'Co-host · Microbiologist',
    bio: 'Nine years at the bench before she moved to the mic. Will always ask how many replicates you ran, and whether you would bet your own money on the result.',
    pick: { number: 131, title: 'The quake that wasn’t' },
    hue: 0,
  },
  {
    name: 'Jonah Pell',
    role: 'Co-host · Science reporter',
    bio: 'Covered research for a regional paper for a decade. Keeps a spreadsheet of every correction he has had to print, and reads one out at the end of each season.',
    pick: { number: 139, title: 'Glass that heals itself' },
    hue: 40,
  },
]

export interface Guest {
  name: string
  field: string
  affiliation: string
  episode: number
}

export const GUESTS: readonly Guest[] = [
  { name: 'Dr. Ines Varga', field: 'Microbiology', affiliation: 'Halden Institute', episode: 148 },
  { name: 'Prof. Tomasz Reyes', field: 'Atmospheric physics', affiliation: 'Northfold University', episode: 147 },
  { name: 'Dr. Amara Lindgren', field: 'Structural engineering', affiliation: 'Calder Structural Lab', episode: 146 },
  { name: 'Dr. Kofi Adjei', field: 'Behavioral neuroscience', affiliation: 'Halden Institute', episode: 145 },
  { name: 'Dr. Hana Sato', field: 'Optics', affiliation: 'Calder Observatory', episode: 144 },
  { name: 'Dr. Luis Ferreira', field: 'Marine bioacoustics', affiliation: 'Kestrel Bay Marine Lab', episode: 143 },
  { name: 'Dr. Priya Raman', field: 'Glaciology', affiliation: 'Ardmore Polar Station', episode: 141 },
  { name: 'Dr. Elias Brandt', field: 'Materials science', affiliation: 'Northfold University', episode: 139 },
  { name: 'Dr. Yewande Cole', field: 'Epidemiology', affiliation: 'Wexley School of Health', episode: 137 },
  { name: 'Dr. Noor Haddad', field: 'Plant genetics', affiliation: 'Halden Institute', episode: 134 },
  { name: 'Dr. Felix Moreau', field: 'Seismology', affiliation: 'Ardmore Geophysics Unit', episode: 131 },
  { name: 'Dr. Sun-hee Park', field: 'Exoplanet astronomy', affiliation: 'Calder Observatory', episode: 128 },
]

/** 姓名 → 头像缩写，去掉头衔。 */
export function initials(name: string): string {
  const parts = name.replace(/^(Dr\.|Prof\.)\s+/, '').split(/[\s-]+/).filter(Boolean)
  return `${parts[0]?.[0] ?? ''}${parts[parts.length - 1]?.[0] ?? ''}`.toUpperCase()
}

/* ---------- 波形 ---------- */

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SAMPLES = 720
const cache = new Map<number, Float32Array>()

/**
 * 一集的响度包络（0–1，SAMPLES 个采样点）。没有真实音频，所以按「对话节目」的样子生成：
 * 片头音乐饱满平稳，对话起伏，章节之间先静一下再来一段过场音乐，结尾有片尾曲。按集数做种子，每次都一样。
 */
export function levelsFor(episode: Episode): Float32Array {
  const hit = cache.get(episode.number)
  if (hit) return hit
  const rand = mulberry32(episode.number * 7919 + 13)
  const knots = (count: number) => Float32Array.from({ length: count + 2 }, () => rand())
  const slow = knots(SAMPLES / 24)
  const mid = knots(SAMPLES / 6)
  const fine = knots(SAMPLES)
  const sample = (k: Float32Array, i: number, period: number) => {
    const x = i / period
    const i0 = Math.floor(x)
    const f = x - i0
    const s = f * f * (3 - 2 * f)
    return k[i0]! * (1 - s) + k[i0 + 1]! * s
  }
  const out = new Float32Array(SAMPLES)
  const boundaries = episode.chapters.slice(1).map((chapter) => chapter.at)
  for (let i = 0; i < SAMPLES; i++) {
    const t = (i / SAMPLES) * episode.duration
    let v = 0.3 + 0.34 * sample(slow, i, 24) + 0.24 * sample(mid, i, 6) + 0.26 * (fine[i]! - 0.5)
    if (fine[i]! > 0.95) v *= 0.4
    if (t < 26) v = 0.74 + 0.14 * sample(mid, i, 6)
    if (t > episode.duration - 34) v = 0.66 + 0.16 * sample(mid, i, 6)
    for (const b of boundaries) {
      const d = t - b
      if (d > -9 && d < 0) v *= 0.32
      else if (d >= 0 && d < 16) v = Math.max(v, 0.78 - d * 0.018)
    }
    out[i] = Math.min(1, Math.max(0.06, v))
  }
  cache.set(episode.number, out)
  return out
}

/** 在 0–1 的位置上取包络值（线性插值）。 */
export function levelAt(levels: Float32Array, fraction: number): number {
  const x = Math.min(1, Math.max(0, fraction)) * (levels.length - 1)
  const i = Math.floor(x)
  const f = x - i
  return levels[i]! * (1 - f) + (levels[Math.min(levels.length - 1, i + 1)] ?? 0) * f
}
