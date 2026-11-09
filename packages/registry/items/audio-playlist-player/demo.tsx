import { AudioPlaylistPlayer, type AudioPlaylistPlayerProps, type Track } from './audio-playlist-player'

const TRACKS: Track[] = [
  { id: 'a', name: 'Low Tide Sessions — Intro', duration: 94 },
  { id: 'b', name: 'Field Notes 12: Night Trains', duration: 1284 },
  { id: 'c', name: 'Granular Rain (Ambient Loop)', duration: 212 },
  { id: 'd', name: 'Studio Tour with Mara Okafor', duration: 1876 },
  { id: 'e', name: 'Paper Lanterns', duration: 187 },
  { id: 'f', name: 'Outro — Thanks for Listening', duration: 61 },
]

export function Demo(props: AudioPlaylistPlayerProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-4 sm:p-8">
      <AudioPlaylistPlayer {...props} tracks={TRACKS} defaultTrackId="b" autoPlay className="max-w-[760px]" />
    </div>
  )
}
