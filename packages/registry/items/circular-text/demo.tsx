import { CircularText, type CircularTextProps } from './circular-text'

export function Demo(props: CircularTextProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-[#f1ede4]">
      <CircularText {...props} />
    </div>
  )
}
