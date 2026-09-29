import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeSpin({ color = '#7c6cff' }: { color?: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const colorRef = useRef(color)
  colorRef.current = color

  useEffect(() => {
    const host = hostRef.current!
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
    host.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0b0b10')
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.z = 5
    const material = new THREE.MeshStandardMaterial({ color: colorRef.current, roughness: 0.3, metalness: 0.4 })
    const mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.32, 160, 24), material)
    scene.add(mesh, new THREE.AmbientLight('#ffffff', 0.6))
    const light = new THREE.DirectionalLight('#ffffff', 2)
    light.position.set(3, 4, 5)
    scene.add(light)

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host
      renderer.setSize(w, h)
      camera.aspect = w / Math.max(h, 1)
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()

    let frame = 0
    const tick = (now: number) => {
      material.color.set(colorRef.current)
      mesh.rotation.set(now * 0.0004, now * 0.0006, 0)
      renderer.render(scene, camera)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      mesh.geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={hostRef} data-testid="three-host" style={{ width: '100%', height: '100%' }} />
}
