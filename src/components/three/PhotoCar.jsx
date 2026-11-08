import { forwardRef, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../../hooks'

/*
 * Real cars as background-removed photos on a plane (public/models/*-car.png, nose to the lower-left). Motion is faked the way film titles do it:
 * ghost copies stretch behind it at speed, blurred discs spin over the two near wheels,
 * and the body pitches and shakes with acceleration.
 * Swap for a true 3D .glb via assets.js when one is available.
 */

// Background-removed photos. Wheels: near-side wheel centre x/y and radius x/y, in image pixels.
// contact: how far down the image (0–1) the tyres touch the ground.
export const CARS = {
  redbull: { src: '/models/redbull-car.png', w: 1320, h: 806, contact: 0.88,
    wheels: [[502, 535, 104, 116], [1172, 362, 78, 88]] },
  aston: { src: '/models/aston-car.png', w: 2000, h: 1125, contact: 0.9,
    wheels: [[722, 842, 142, 140], [1836, 556, 140, 150]] },
}
const PLANE_W = 6.4

function wheelBlurTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')
  g.translate(128, 128)
  const rim = g.createRadialGradient(0, 0, 20, 0, 0, 128)
  rim.addColorStop(0, 'rgba(30,30,30,0.95)')
  rim.addColorStop(0.55, 'rgba(15,15,15,0.95)')
  rim.addColorStop(0.78, 'rgba(10,10,10,0.9)')
  rim.addColorStop(1, 'rgba(10,10,10,0)')
  g.fillStyle = rim
  g.beginPath(); g.arc(0, 0, 128, 0, Math.PI * 2); g.fill()
  // Smeared yellow tyre-wall band + spoke streaks
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2
    g.strokeStyle = i % 5 === 0 ? 'rgba(242,214,74,0.55)' : 'rgba(255,255,255,0.06)'
    g.lineWidth = i % 5 === 0 ? 5 : 2
    g.beginPath(); g.arc(0, 0, i % 5 === 0 ? 96 : 40 + (i % 4) * 12, a, a + 0.5); g.stroke()
  }
  g.fillStyle = 'rgba(190,220,60,0.8)'
  g.beginPath(); g.arc(0, 0, 10, 0, Math.PI * 2); g.fill()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export const PhotoCar = forwardRef(function PhotoCar({ car = 'redbull', speedRef, accelRef }, ref) {
  const { src, w: IMG_W, h: IMG_H, contact, wheels: WHEELS } = CARS[car]
  const PLANE_H = (PLANE_W * IMG_H) / IMG_W
  const LIFT = PLANE_H * (contact - 0.5)
  const px = (x, y) => [(x / IMG_W - 0.5) * PLANE_W, (0.5 - y / IMG_H) * PLANE_H]
  const tex = useTexture(asset(src))
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const blurTex = useMemo(wheelBlurTexture, [])
  const body = useRef(), ghosts = useRef([]), discs = useRef([])

  useFrame((state, dt) => {
    const speed = speedRef.current
    const s = THREE.MathUtils.clamp(speed / 16, 0, 1)
    const t = state.clock.elapsedTime
    // Engine idle shake grows with speed; nose dips under braking, lifts under throttle
    body.current.position.y = LIFT + Math.sin(t * 46) * 0.006 * (1 + s * 3)
    body.current.position.x = Math.sin(t * 37) * 0.004 * (1 + s * 3)
    body.current.rotation.z = THREE.MathUtils.damp(body.current.rotation.z, THREE.MathUtils.clamp(accelRef.current * 0.004, -0.05, 0.05), 5, dt)
    ghosts.current.forEach((g, i) => {
      if (!g) return
      g.position.x = (i + 1) * 0.28 * s * 3
      g.material.opacity = s * (0.32 - i * 0.09)
      g.visible = s > 0.02
    })
    discs.current.forEach((d) => {
      if (!d) return
      d.rotation.z += dt * speed * 2.6
      d.material.opacity = Math.min(1, s * 2.2)
      d.visible = s > 0.02
    })
  })

  return (
    <group ref={ref}>
      <group ref={body} position={[0, LIFT, 0]}>
        {/* motion-blur ghosts, drawn behind the car */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} ref={(el) => (ghosts.current[i] = el)} position={[0, 0, -0.02 - i * 0.01]} renderOrder={1}>
            <planeGeometry args={[PLANE_W, PLANE_H]} />
            <meshBasicMaterial map={tex} transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
        <mesh renderOrder={2}>
          <planeGeometry args={[PLANE_W, PLANE_H]} />
          <meshBasicMaterial map={tex} transparent alphaTest={0.02} toneMapped={false} />
        </mesh>
        {WHEELS.map(([x, y, rx, ry], i) => {
          const [wx, wy] = px(x, y)
          return (
            <group key={i} position={[wx, wy, 0.01]} scale={[(rx / IMG_W) * PLANE_W * 2, (ry / IMG_H) * PLANE_H * 2, 1]}>
              <mesh ref={(el) => (discs.current[i] = el)} renderOrder={3}>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial map={blurTex} transparent opacity={0} depthWrite={false} toneMapped={false} />
              </mesh>
            </group>
          )
        })}
      </group>
    </group>
  )
})

Object.values(CARS).forEach((c) => useTexture.preload(asset(c.src)))
