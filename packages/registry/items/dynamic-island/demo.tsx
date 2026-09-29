import { DynamicIsland, type DynamicIslandProps } from './dynamic-island'

export function Demo(props: DynamicIslandProps) {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background:
          'radial-gradient(90% 80% at 15% 100%, #ff8a5c 0%, transparent 60%), radial-gradient(80% 70% at 90% 90%, #7c5cff 0%, transparent 62%), linear-gradient(180deg, #1c1b4b 0%, #3b2a86 55%, #c2416c 100%)',
      }}
    >
      {/* 手机顶部的状态栏，给灵动岛一个真实的位置。 */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-2.5 text-[13px] font-semibold text-white/90">
        <span>9:41</span>
        <span className="flex items-center gap-1.5" aria-hidden>
          <svg viewBox="0 0 18 12" className="h-2.5 w-4" fill="currentColor">
            <rect x="0" y="8" width="3" height="4" rx="1" />
            <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
            <rect x="10" y="3" width="3" height="9" rx="1" />
            <rect x="15" y="0" width="3" height="12" rx="1" />
          </svg>
          <svg viewBox="0 0 26 12" className="h-3 w-6" fill="none">
            <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" opacity="0.5" />
            <rect x="2" y="2" width="15" height="8" rx="2" fill="currentColor" />
            <rect x="23" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.5" />
          </svg>
        </span>
      </div>
      <DynamicIsland {...props} className="absolute inset-x-0 top-2" />
    </div>
  )
}
