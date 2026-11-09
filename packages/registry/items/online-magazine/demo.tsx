import { OnlineMagazine, type OnlineMagazineProps } from './online-magazine'

export function Demo(props: OnlineMagazineProps) {
  return (
    <div className="h-full w-full overflow-x-hidden overflow-y-auto" style={{ background: props.dark === false ? '#ffffff' : '#171c28' }}>
      <OnlineMagazine {...props} />
    </div>
  )
}
