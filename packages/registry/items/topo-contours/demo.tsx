import { TopoContours, type TopoContoursProps } from './topo-contours'

export function Demo(props: TopoContoursProps) {
  return <TopoContours {...props} className="h-full w-full" />
}
