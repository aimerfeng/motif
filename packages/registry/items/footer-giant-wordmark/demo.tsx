import { FooterGiantWordmark, type FooterGiantWordmarkProps } from './footer-giant-wordmark'

export function Demo(props: FooterGiantWordmarkProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto" style={{ background: props.tone === 'light' ? '#f7f6f2' : '#07080b' }}>
      <div className="mt-auto w-full">
        <FooterGiantWordmark {...props} />
      </div>
    </div>
  )
}
