import { DuneField, type DuneFieldProps } from './dune-field'

export function Demo(props: DuneFieldProps) {
  return <DuneField {...props} className="h-full w-full" />
}
