import { MeshGradient } from '@paper-design/shaders-react'

export default function PaperGradient({ speed = 0.6 }: { speed?: number }) {
  return (
    <MeshGradient
      style={{ width: '100%', height: '100%' }}
      colors={['#0b0b10', '#6a5cff', '#ff5ca8', '#ffd36a']}
      distortion={0.8}
      swirl={0.4}
      speed={speed}
    />
  )
}
