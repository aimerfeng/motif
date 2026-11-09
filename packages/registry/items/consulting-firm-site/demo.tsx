import { ConsultingFirmSite, type ConsultingFirmSiteProps } from './consulting-firm-site'

export function Demo(props: ConsultingFirmSiteProps) {
  return (
    <div className="h-full w-full overflow-y-auto">
      <ConsultingFirmSite {...props} />
    </div>
  )
}
