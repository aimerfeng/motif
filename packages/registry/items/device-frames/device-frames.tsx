// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/iphone.tsx
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/android.tsx
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/safari.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useId, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  device: 'phone',
  tone: 'dark',
  url: 'tidepool.app',
  mode: 'default',
  tilt: 0,
  shadow: true,
}
/* @motif:end */

export type DeviceFrameProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 屏幕里的内容：放真正的 React 界面，而不是截图。 */
  children?: ReactNode
}

type Tone = 'light' | 'dark'

// 上游用 Tailwind 的 dark: 变体切换这几种灰，这里由 tone 决定。
const TONES = {
  light: { frame: '#E5E5E5', body: '#FFFFFF', island: '#F5F5F5', ink: '#737373' },
  dark: { frame: '#404040', body: '#262626', island: '#262626', ink: '#A3A3A3' },
} as const

export function DeviceFrame({ className, style, children, ...props }: DeviceFrameProps) {
  const options = { ...defaults, ...props }
  const tilt = Math.max(0, Math.min(24, options.tilt))
  const Frame = options.device === 'browser' ? BrowserFrame : options.device === 'android' ? AndroidFrame : PhoneFrame
  const aspect = options.device === 'browser' ? `${SAFARI_WIDTH}/${SAFARI_HEIGHT}` : options.device === 'android' ? '380/830' : `${PHONE_WIDTH}/${PHONE_HEIGHT}`

  return (
    <div className={cn('relative inline-block w-full align-middle leading-none', className)} style={{ aspectRatio: aspect, perspective: 1600, ...style }}>
      {options.shadow && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-[8%] right-[8%] top-full h-[7%] rounded-[50%] bg-black/45 blur-xl"
          style={{ transform: `translateY(-50%) translateX(${tilt * 0.6}%) scaleX(${1 - tilt * 0.01})` }}
        />
      )}
      <div
        className="relative size-full"
        style={{ transform: tilt ? `rotateX(${tilt * 0.45}deg) rotateY(${-tilt}deg) rotateZ(${tilt * 0.12}deg)` : undefined, transformStyle: 'preserve-3d' }}
      >
        <Frame tone={options.tone === 'light' ? 'light' : 'dark'} url={options.url} mode={options.mode}>
          {children}
        </Frame>
      </div>
    </div>
  )
}

interface FrameProps {
  tone: Tone
  url: string
  mode: string
  children?: ReactNode
}

/* ---------- Phone（上游 Iphone） ---------- */

const PHONE_WIDTH = 433
const PHONE_HEIGHT = 882
const SCREEN_X = 21.25
const SCREEN_Y = 19.25
const SCREEN_WIDTH = 389.5
const SCREEN_HEIGHT = 843.5
const SCREEN_RADIUS = 55.75

const LEFT_PCT = (SCREEN_X / PHONE_WIDTH) * 100
const TOP_PCT = (SCREEN_Y / PHONE_HEIGHT) * 100
const WIDTH_PCT = (SCREEN_WIDTH / PHONE_WIDTH) * 100
const HEIGHT_PCT = (SCREEN_HEIGHT / PHONE_HEIGHT) * 100
const RADIUS_H = (SCREEN_RADIUS / SCREEN_WIDTH) * 100
const RADIUS_V = (SCREEN_RADIUS / SCREEN_HEIGHT) * 100

export function PhoneFrame({ tone, children }: FrameProps) {
  const c = TONES[tone]
  const id = useSafeId()
  const hasMedia = children != null
  const mask = hasMedia ? `url(#${id}punch)` : undefined

  return (
    <div className="absolute inset-0">
      {hasMedia && (
        <div
          className="absolute z-0 overflow-hidden"
          style={{
            left: `${LEFT_PCT}%`,
            top: `${TOP_PCT}%`,
            width: `${WIDTH_PCT}%`,
            height: `${HEIGHT_PCT}%`,
            borderRadius: `${RADIUS_H}% / ${RADIUS_V}%`,
          }}
        >
          {children}
        </div>
      )}

      <svg viewBox={`0 0 ${PHONE_WIDTH} ${PHONE_HEIGHT}`} fill="none" aria-hidden className="pointer-events-none absolute inset-0 size-full" style={{ transform: 'translateZ(0)' }}>
        <g mask={mask}>
          <path d="M2 73C2 32.6832 34.6832 0 75 0H357C397.317 0 430 32.6832 430 73V809C430 849.317 397.317 882 357 882H75C34.6832 882 2 849.317 2 809V73Z" fill={c.frame} />
          <path d="M0 171C0 170.448 0.447715 170 1 170H3V204H1C0.447715 204 0 203.552 0 203V171Z" fill={c.frame} />
          <path d="M1 234C1 233.448 1.44772 233 2 233H3.5V300H2C1.44772 300 1 299.552 1 299V234Z" fill={c.frame} />
          <path d="M1 319C1 318.448 1.44772 318 2 318H3.5V385H2C1.44772 385 1 384.552 1 384V319Z" fill={c.frame} />
          <path d="M430 279H432C432.552 279 433 279.448 433 280V384C433 384.552 432.552 385 432 385H430V279Z" fill={c.frame} />
          <path d="M6 74C6 35.3401 37.3401 4 76 4H356C394.66 4 426 35.3401 426 74V808C426 846.66 394.66 878 356 878H76C37.3401 878 6 846.66 6 808V74Z" fill={c.body} />
        </g>

        <path opacity="0.5" d="M174 5H258V5.5C258 6.60457 257.105 7.5 256 7.5H176C174.895 7.5 174 6.60457 174 5.5V5Z" fill={c.frame} />

        <path
          d={`M${SCREEN_X} 75C${SCREEN_X} 44.2101 46.2101 ${SCREEN_Y} 77 ${SCREEN_Y}H355C385.79 ${SCREEN_Y} 410.75 44.2101 410.75 75V807C410.75 837.79 385.79 862.75 355 862.75H77C46.2101 862.75 ${SCREEN_X} 837.79 ${SCREEN_X} 807V75Z`}
          fill={c.frame}
          stroke={c.frame}
          strokeWidth={0.5}
          mask={mask}
        />

        <path d="M154 48.5C154 38.2827 162.283 30 172.5 30H259.5C269.717 30 278 38.2827 278 48.5C278 58.7173 269.717 67 259.5 67H172.5C162.283 67 154 58.7173 154 48.5Z" fill={c.island} />
        <path d="M249 48.5C249 42.701 253.701 38 259.5 38C265.299 38 270 42.701 270 48.5C270 54.299 265.299 59 259.5 59C253.701 59 249 54.299 249 48.5Z" fill={c.island} />
        <path d="M254 48.5C254 45.4624 256.462 43 259.5 43C262.538 43 265 45.4624 265 48.5C265 51.5376 262.538 54 259.5 54C256.462 54 254 51.5376 254 48.5Z" fill={c.frame} />

        <defs>
          <mask id={`${id}punch`} maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width={PHONE_WIDTH} height={PHONE_HEIGHT} fill="white" />
            <rect x={SCREEN_X} y={SCREEN_Y} width={SCREEN_WIDTH} height={SCREEN_HEIGHT} rx={SCREEN_RADIUS} ry={SCREEN_RADIUS} fill="black" />
          </mask>
        </defs>
      </svg>
    </div>
  )
}

/* ---------- Android ---------- */

// 上游的 SVG 是 433×882，但外框只画到 380×830；这里用紧贴外框的 viewBox。
const A_W = 380
const A_H = 830

export function AndroidFrame({ tone, children }: FrameProps) {
  const c = TONES[tone]
  const id = useSafeId()
  const clip = `url(#${id}clip)`

  return (
    <div className="absolute inset-0">
      <svg viewBox={`0 0 ${A_W} ${A_H}`} fill="none" aria-hidden className="pointer-events-none absolute inset-0 size-full">
        <path d="M376 153H378C379.105 153 380 153.895 380 155V249C380 250.105 379.105 251 378 251H376V153Z" fill={c.frame} />
        <path d="M376 301H378C379.105 301 380 301.895 380 303V351C380 352.105 379.105 353 378 353H376V301Z" fill={c.frame} />
        <path d="M0 42C0 18.8041 18.804 0 42 0H336C359.196 0 378 18.804 378 42V788C378 811.196 359.196 830 336 830H42C18.804 830 0 811.196 0 788V42Z" fill={c.frame} />
        <path d="M2 43C2 22.0132 19.0132 5 40 5H338C358.987 5 376 22.0132 376 43V787C376 807.987 358.987 825 338 825H40C19.0132 825 2 807.987 2 787V43Z" fill={c.body} />
        <g clipPath={clip}>
          <path
            d="M9.25 48C9.25 29.3604 24.3604 14.25 43 14.25H335C353.64 14.25 368.75 29.3604 368.75 48V780C368.75 798.64 353.64 813.75 335 813.75H43C24.3604 813.75 9.25 798.64 9.25 780V48Z"
            fill={c.frame}
            stroke={c.frame}
            strokeWidth={0.5}
          />
        </g>
        <defs>
          <clipPath id={`${id}clip`}>
            <rect width="360" height="800" rx="33" ry="25" transform="translate(9 14)" />
          </clipPath>
        </defs>
      </svg>

      {children != null && (
        <div
          className="absolute overflow-hidden"
          style={{ left: `${(9 / A_W) * 100}%`, top: `${(14 / A_H) * 100}%`, width: `${(360 / A_W) * 100}%`, height: `${(800 / A_H) * 100}%`, borderRadius: `${(33 / 360) * 100}% / ${(25 / 800) * 100}%` }}
        >
          {children}
        </div>
      )}

      {/* 打孔摄像头叠在屏幕内容之上 */}
      <svg viewBox={`0 0 ${A_W} ${A_H}`} fill="none" aria-hidden className="pointer-events-none absolute inset-0 size-full">
        <circle cx="189" cy="28" r="9" fill={c.body} />
        <circle cx="189" cy="28" r="4" fill={c.frame} />
      </svg>
    </div>
  )
}

/* ---------- Browser（上游 Safari） ---------- */

const SAFARI_WIDTH = 1203
const SAFARI_HEIGHT = 753
const B_X = 1
const B_Y = 52
const B_W = 1200
const B_H = 700

export function BrowserFrame({ tone, url, mode, children }: FrameProps) {
  const c = TONES[tone]
  const id = useSafeId()
  const hasMedia = children != null
  const ink = c.ink

  return (
    <div className="absolute inset-0">
      {hasMedia && (
        <div
          className="absolute z-0 overflow-hidden"
          style={{
            left: `${(B_X / SAFARI_WIDTH) * 100}%`,
            top: `${(B_Y / SAFARI_HEIGHT) * 100}%`,
            width: `${(B_W / SAFARI_WIDTH) * 100}%`,
            height: `${(B_H / SAFARI_HEIGHT) * 100}%`,
            borderRadius: '0 0 11px 11px',
          }}
        >
          {children}
        </div>
      )}

      <svg viewBox={`0 0 ${SAFARI_WIDTH} ${SAFARI_HEIGHT}`} fill="none" aria-hidden className="pointer-events-none absolute inset-0 z-10 size-full" style={{ transform: 'translateZ(0)' }}>
        <defs>
          <mask id={`${id}punch`} maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width={SAFARI_WIDTH} height={SAFARI_HEIGHT} fill="white" />
            <path d="M1 52H1201V741C1201 747.075 1196.08 752 1190 752H12C5.92486 752 1 747.075 1 741V52Z" fill="black" />
          </mask>
          <clipPath id={`${id}path0`}>
            <rect width={SAFARI_WIDTH} height={SAFARI_HEIGHT} fill="white" />
          </clipPath>
        </defs>

        <g clipPath={`url(#${id}path0)`} mask={hasMedia ? `url(#${id}punch)` : undefined}>
          <path d="M0 52H1202V741C1202 747.627 1196.63 753 1190 753H12C5.37258 753 0 747.627 0 741V52Z" fill={c.frame} />
          <path fillRule="evenodd" clipRule="evenodd" d="M0 12C0 5.37258 5.37258 0 12 0H1190C1196.63 0 1202 5.37258 1202 12V52H0L0 12Z" fill={c.frame} />
          <path fillRule="evenodd" clipRule="evenodd" d="M1.06738 12C1.06738 5.92487 5.99225 1 12.0674 1H1189.93C1196.01 1 1200.93 5.92487 1200.93 12V51H1.06738V12Z" fill={c.body} />
          <circle cx="27" cy="25" r="6" fill={c.frame} />
          <circle cx="47" cy="25" r="6" fill={c.frame} />
          <circle cx="67" cy="25" r="6" fill={c.frame} />
          <path d="M286 17C286 13.6863 288.686 11 292 11H946C949.314 11 952 13.6863 952 17V35C952 38.3137 949.314 41 946 41H292C288.686 41 286 38.3137 286 35V17Z" fill={c.frame} />
          <path
            d="M566.269 32.0852H572.426C573.277 32.0852 573.696 31.6663 573.696 30.7395V25.9851C573.696 25.1472 573.353 24.7219 572.642 24.6521V23.0842C572.642 20.6721 571.036 19.5105 569.348 19.5105C567.659 19.5105 566.053 20.6721 566.053 23.0842V24.6711C565.393 24.7727 565 25.1917 565 25.9851V30.7395C565 31.6663 565.418 32.0852 566.269 32.0852ZM567.272 22.97C567.272 21.491 568.211 20.6785 569.348 20.6785C570.478 20.6785 571.423 21.491 571.423 22.97V24.6394L567.272 24.6458V22.97Z"
            fill={ink}
          />
          <text x="580" y="30" fill={ink} fontSize="12" fontFamily="ui-sans-serif, system-ui, sans-serif">
            {url}
          </text>

          {mode === 'default' ? (
            <>
              <path
                d="M265.5 33.8984C265.641 33.8984 265.852 33.8516 266.047 33.7422C270.547 31.2969 272.109 30.1641 272.109 27.3203V21.4219C272.109 20.4844 271.742 20.1484 270.961 19.8125C270.094 19.4453 267.18 18.4297 266.328 18.1406C266.07 18.0547 265.766 18 265.5 18C265.234 18 264.93 18.0703 264.672 18.1406C263.82 18.3828 260.906 19.4531 260.039 19.8125C259.258 20.1406 258.891 20.4844 258.891 21.4219V27.3203C258.891 30.1641 260.461 31.2812 264.945 33.7422C265.148 33.8516 265.359 33.8984 265.5 33.8984ZM265.922 19.5781C266.945 19.9766 269.172 20.7656 270.344 21.1875C270.562 21.2656 270.617 21.3828 270.617 21.6641V27.0234C270.617 29.3125 269.469 29.9375 265.945 32.0625C265.727 32.1875 265.617 32.2344 265.508 32.2344V19.4844C265.617 19.4844 265.734 19.5156 265.922 19.5781Z"
                fill={ink}
              />
              <path
                d="M936.273 24.9766C936.5 24.9766 936.68 24.9062 936.82 24.7578L940.023 21.5312C940.195 21.3594 940.273 21.1719 940.273 20.9531C940.273 20.7422 940.188 20.5391 940.023 20.3828L936.82 17.125C936.68 16.9688 936.5 16.8906 936.273 16.8906C935.852 16.8906 935.516 17.2422 935.516 17.6719C935.516 17.8828 935.594 18.0547 935.727 18.2031L937.594 20.0312C937.227 19.9766 936.852 19.9453 936.477 19.9453C932.609 19.9453 929.516 23.0391 929.516 26.9141C929.516 30.7891 932.633 33.9062 936.5 33.9062C940.375 33.9062 943.484 30.7891 943.484 26.9141C943.484 26.4453 943.156 26.1094 942.688 26.1094C942.234 26.1094 941.93 26.4453 941.93 26.9141C941.93 29.9297 939.516 32.3516 936.5 32.3516C933.492 32.3516 931.07 29.9297 931.07 26.9141C931.07 23.875 933.469 21.4688 936.477 21.4688C936.984 21.4688 937.453 21.5078 937.867 21.5781L935.734 23.6875C935.594 23.8281 935.516 24 935.516 24.2109C935.516 24.6406 935.852 24.9766 936.273 24.9766Z"
                fill={ink}
              />
              <path
                d="M1134 33.0156C1134.49 33.0156 1134.89 32.6094 1134.89 32.1484V27.2578H1139.66C1140.13 27.2578 1140.54 26.8594 1140.54 26.3672C1140.54 25.8828 1140.13 25.4766 1139.66 25.4766H1134.89V20.5859C1134.89 20.1172 1134.49 19.7188 1134 19.7188C1133.52 19.7188 1133.11 20.1172 1133.11 20.5859V25.4766H1128.34C1127.88 25.4766 1127.46 25.8828 1127.46 26.3672C1127.46 26.8594 1127.88 27.2578 1128.34 27.2578H1133.11V32.1484C1133.11 32.6094 1133.52 33.0156 1134 33.0156Z"
                fill={ink}
              />
              <path
                d="M1161.8 31.0703H1163.23V32.375C1163.23 34.0547 1164.12 34.9219 1165.81 34.9219H1174.2C1175.89 34.9219 1176.77 34.0547 1176.77 32.3828V24.0469C1176.77 22.375 1175.89 21.5 1174.2 21.5H1172.77V20.2578C1172.77 18.5859 1171.88 17.7109 1170.19 17.7109H1161.8C1160.1 17.7109 1159.23 18.5781 1159.23 20.2578V28.5234C1159.23 30.1953 1160.1 31.0703 1161.8 31.0703ZM1161.9 29.5078C1161.18 29.5078 1160.78 29.1328 1160.78 28.3828V20.3984C1160.78 19.6406 1161.18 19.2656 1161.9 19.2656H1170.09C1170.8 19.2656 1171.2 19.6406 1171.2 20.3984V21.5H1165.81C1164.12 21.5 1163.23 22.375 1163.23 24.0469V29.5078H1161.9ZM1165.91 33.3672C1165.19 33.3672 1164.8 32.9922 1164.8 32.2422V24.1875C1164.8 23.4297 1165.19 23.0625 1165.91 23.0625H1174.1C1174.81 23.0625 1175.21 23.4297 1175.21 24.1875V32.2422C1175.21 32.9922 1174.81 33.3672 1174.1 33.3672H1165.91Z"
                fill={ink}
              />
              <path
                d="M1099.51 28.4141C1099.91 28.4141 1100.24 28.0859 1100.24 27.6953V19.8359L1100.18 18.6797L1100.66 19.25L1101.75 20.4141C1101.88 20.5547 1102.06 20.625 1102.24 20.625C1102.6 20.625 1102.9 20.3672 1102.9 20C1102.9 19.8047 1102.82 19.6641 1102.69 19.5312L1100.06 17.0078C1099.88 16.8203 1099.7 16.7578 1099.51 16.7578C1099.32 16.7578 1099.14 16.8203 1098.95 17.0078L1096.33 19.5312C1096.2 19.6641 1096.12 19.8047 1096.12 20C1096.12 20.3672 1096.41 20.625 1096.77 20.625C1096.95 20.625 1097.14 20.5547 1097.27 20.4141L1098.35 19.25L1098.84 18.6719L1098.78 19.8359V27.6953C1098.78 28.0859 1099.11 28.4141 1099.51 28.4141ZM1095 34.6562H1104C1105.7 34.6562 1106.57 33.7812 1106.57 32.1094V24.4297C1106.57 22.7578 1105.7 21.8828 1104 21.8828H1101.89V23.4375H1103.9C1104.61 23.4375 1105.02 23.8125 1105.02 24.5625V31.9688C1105.02 32.7188 1104.61 33.0938 1103.9 33.0938H1095.1C1094.38 33.0938 1093.98 32.7188 1093.98 31.9688V24.5625C1093.98 23.8125 1094.38 23.4375 1095.1 23.4375H1097.13V21.8828H1095C1093.31 21.8828 1092.43 22.75 1092.43 24.4297V32.1094C1092.43 33.7812 1093.31 34.6562 1095 34.6562Z"
                fill={ink}
              />
              <path
                d="M99.5703 33.6016H112.938C114.633 33.6016 115.516 32.7266 115.516 31.0547V21.5469C115.516 19.875 114.633 19 112.938 19H99.5703C97.8828 19 97 19.8672 97 21.5469V31.0547C97 32.7266 97.8828 33.6016 99.5703 33.6016ZM99.6719 32.0469C98.9531 32.0469 98.5547 31.6719 98.5547 30.9141V21.6875C98.5547 20.9297 98.9531 20.5547 99.6719 20.5547H103.234V32.0469H99.6719ZM112.836 20.5547C113.555 20.5547 113.953 20.9297 113.953 21.6875V30.9141C113.953 31.6719 113.555 32.0469 112.836 32.0469H104.711V20.5547H112.836ZM101.703 23.4141C101.984 23.4141 102.219 23.1719 102.219 22.9062C102.219 22.6406 101.984 22.4062 101.703 22.4062H100.102C99.8203 22.4062 99.5859 22.6406 99.5859 22.9062C99.5859 23.1719 99.8203 23.4141 100.102 23.4141H101.703ZM101.703 25.5156C101.984 25.5156 102.219 25.2812 102.219 25.0078C102.219 24.7422 101.984 24.5078 101.703 24.5078H100.102C99.8203 24.5078 99.5859 24.7422 99.5859 25.0078C99.5859 25.2812 99.8203 25.5156 100.102 25.5156H101.703ZM101.703 27.6094C101.984 27.6094 102.219 27.3828 102.219 27.1094C102.219 26.8438 101.984 26.6172 101.703 26.6172H100.102C99.8203 26.6172 99.5859 26.8438 99.5859 27.1094C99.5859 27.3828 99.8203 27.6094 100.102 27.6094H101.703Z"
                fill={ink}
              />
              <path
                d="M143.914 32.5938C144.094 32.7656 144.312 32.8594 144.562 32.8594C145.086 32.8594 145.492 32.4531 145.492 31.9375C145.492 31.6797 145.391 31.4453 145.211 31.2656L139.742 25.9219L145.211 20.5938C145.391 20.4141 145.492 20.1719 145.492 19.9219C145.492 19.4062 145.086 19 144.562 19C144.312 19 144.094 19.0938 143.922 19.2656L137.844 25.2031C137.625 25.4062 137.516 25.6562 137.516 25.9297C137.516 26.2031 137.625 26.4375 137.836 26.6484L143.914 32.5938Z"
                fill={ink}
              />
              <path
                d="M168.422 32.8594C168.68 32.8594 168.891 32.7656 169.07 32.5938L175.148 26.6562C175.359 26.4375 175.469 26.2109 175.469 25.9297C175.469 25.6562 175.367 25.4141 175.148 25.2109L169.07 19.2656C168.891 19.0938 168.68 19 168.422 19C167.898 19 167.492 19.4062 167.492 19.9219C167.492 20.1719 167.602 20.4141 167.773 20.5938L173.25 25.9375L167.773 31.2656C167.594 31.4531 167.492 31.6797 167.492 31.9375C167.492 32.4531 167.898 32.8594 168.422 32.8594Z"
                fill={ink}
              />
            </>
          ) : null}
        </g>
      </svg>
    </div>
  )
}

/** useId 的结果带冒号，放进 url(#…) 前去掉，保证多个外框的 mask/clip id 互不冲突。 */
function useSafeId() {
  return `df${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
}
