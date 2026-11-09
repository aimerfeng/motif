import { IconSphere, type IconGlyph, type IconSphereProps } from './icon-sphere'

// 虚构的几何标志（24×24 视框，evenodd 填充），代替上游演示里的真实品牌图标。
const GLYPHS: IconGlyph[] = [
  { d: 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20Zm0 5a5 5 0 1 1 0 10a5 5 0 1 1 0-10Z' },
  { d: 'M12 2 22.5 20.5H1.5Z' },
  { d: 'M12 1.5l9.1 5.25v10.5L12 22.5l-9.1-5.25V6.75Z' },
  { d: 'M12 1 23 12 12 23 1 12Zm0 6.5L7.5 12l4.5 4.5 4.5-4.5Z' },
  { d: 'M3 3h18v4.5H3Zm0 6.75h13.5v4.5H3Zm0 6.75h9v4.5H3Z' },
  { d: 'M7 2.5a4.5 4.5 0 1 1 0 9a4.5 4.5 0 1 1 0-9Zm10 0a4.5 4.5 0 1 1 0 9a4.5 4.5 0 1 1 0-9ZM7 12.5a4.5 4.5 0 1 1 0 9a4.5 4.5 0 1 1 0-9Zm10 0a4.5 4.5 0 1 1 0 9a4.5 4.5 0 1 1 0-9Z' },
  { d: 'M9 2h6v7h7v6h-7v7H9v-7H2V9h7Z' },
  { d: 'M2 2h20v20H2Zm5 5v10h10V7Z' },
  { d: 'M14.5 1 4 13.5h7L9.5 23 20 10.5h-7Z' },
  { d: 'M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20Zm0 3a7 7 0 1 1 0 14a7 7 0 1 1 0-14Zm0 3a4 4 0 1 0 0 8a4 4 0 1 0 0-8Z' },
  { d: 'M2 21V3h4.5L12 10.5 17.5 3H22v18h-4.5V10.5L12 18l-5.5-7.5V21Z' },
  { d: 'M12 1.5 21.5 12H15.5v10.5h-7V12H2.5Z' },
  { d: 'M7 2.5h10a4.25 4.25 0 0 1 0 8.5H7a4.25 4.25 0 0 1 0-8.5Zm0 10.5h10a4.25 4.25 0 0 1 0 8.5H7a4.25 4.25 0 0 1 0-8.5Z' },
  { d: 'M12 1c1 6 5 10 11 11-6 1-10 5-11 11-1-6-5-10-11-11 6-1 10-5 11-11Z' },
  { d: 'M8 3.5h4.5L6.25 12l6.25 8.5H8L1.75 12Zm7.5 0H20l2.25 3-4.75 5.5 4.75 5.5-2.25 3h-4.5L21.75 12Z' },
  { d: 'M3.5 20.5C3.5 9.5 9.5 3.5 21 3c-.5 11.5-6.5 17.5-17.5 17.5Z' },
  { d: 'M12 2a10 10 0 0 1 0 20Zm-2 0v20a10 10 0 0 1 0-20Z' },
  { d: 'M2 12a10 10 0 0 1 20 0Zm0 2h20a10 10 0 0 1-20 0Z' },
  { d: 'M12 2 22 7v10l-10 5L2 17V7Zm0 4.5L6 9.5v5l6 3 6-3v-5Z' },
  { d: 'M3 3h7.5v7.5H3Zm10.5 0H21v7.5h-7.5ZM3 13.5h7.5V21H3Zm10.5 3.75a3.75 3.75 0 1 1 7.5 0a3.75 3.75 0 1 1-7.5 0Z' },
]

export function Demo(props: IconSphereProps) {
  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden bg-background p-4">
      <IconSphere {...props} icons={GLYPHS} />
    </div>
  )
}
