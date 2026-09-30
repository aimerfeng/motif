import { ShowcaseIntegrations, type ShowcaseIntegrationsProps } from './showcase-integrations'

export function Demo(props: ShowcaseIntegrationsProps) {
  return (
    <div className="h-full w-full overflow-y-auto bg-background">
      <div className="flex min-h-full flex-col justify-center">
        <ShowcaseIntegrations {...props} />
      </div>
    </div>
  )
}
