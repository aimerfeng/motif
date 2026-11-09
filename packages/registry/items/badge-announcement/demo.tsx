import { BadgeAnnouncement, type BadgeAnnouncementProps } from './badge-announcement'

export function Demo(props: BadgeAnnouncementProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background px-4 py-8">
      <div className="flex max-w-xl flex-col items-center text-center">
        <BadgeAnnouncement {...props} href="#changelog" />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Ship docs your team actually reads</h1>
        <p className="mt-3 text-sm text-muted-foreground">Live previews, versioned pages and search that understands your API.</p>
      </div>
    </div>
  )
}
