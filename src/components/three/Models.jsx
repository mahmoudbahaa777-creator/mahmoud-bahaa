import { forwardRef, useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

/*
 * Procedural fallback meshes. They are deliberately stylised and carry
 * no team or league marks (brand rule: partners named in text only).
 * Drop a licensed .glb into /public/models and set its path in
 * src/components/three/assets.js to replace any of them.
 */

const tyreMat = new THREE.MeshStandardMaterial({ color: '#0d0f10', roughness: 0.85 })
const rimMat = new THREE.MeshStandardMaterial({ color: '#8c9696', metalness: 1, roughness: 0.3 })
const carbonMat = new THREE.MeshStandardMaterial({ color: '#151a1b', roughness: 0.45, metalness: 0.3 })

function Wheel({ position, r = 0.36, w = 0.36, wheelRef }) {
  return (
    <group position={position}>
      <group ref={wheelRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={tyreMat} castShadow>
          <cylinderGeometry args={[r, r, w, 32]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={rimMat}>
          <cylinderGeometry args={[r * 0.62, r * 0.62, w + 0.01, 6]} />
        </mesh>
      </group>
    </group>
  )
}

/** Open-wheel race car. Nose points to -x (it drives in from the right). */
export const RaceCar = forwardRef(function RaceCar({ wheelRefs, livery = '#1F3B7A', accent = '#F2705A', accent2 = '#E9C46A' }, ref) {
  const paint = useMemo(() => new THREE.MeshPhysicalMaterial({ color: livery, metalness: 0.55, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08 }), [livery])
  const stripe = useMemo(() => new THREE.MeshPhysicalMaterial({ color: accent, metalness: 0.3, roughness: 0.3, clearcoat: 1, emissive: accent, emissiveIntensity: 0.15 }), [accent])
  const gold = useMemo(() => new THREE.MeshPhysicalMaterial({ color: accent2, metalness: 0.6, roughness: 0.3, clearcoat: 1 }), [accent2])
  return (
    <group ref={ref}>
      {/* chassis + nose */}
      <RoundedBox args={[2.6, 0.34, 0.72]} radius={0.12} position={[0.2, 0.36, 0]} material={paint} castShadow />
      <mesh position={[-1.75, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.7]} material={paint} castShadow>
        <cylinderGeometry args={[0.07, 0.24, 1.7, 24]} />
      </mesh>
      {/* front wing */}
      <mesh position={[-2.55, 0.12, 0]} material={carbonMat} castShadow><boxGeometry args={[0.55, 0.05, 2.05]} /></mesh>
      <mesh position={[-2.5, 0.2, 0]} material={stripe}><boxGeometry args={[0.32, 0.04, 1.8]} /></mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[-2.52, 0.2, s * 1.03]} material={paint}><boxGeometry args={[0.6, 0.26, 0.04]} /></mesh>
      ))}
      {/* sidepods */}
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[1.5, 0.32, 0.48]} radius={0.14} position={[0.45, 0.33, s * 0.55]} material={paint} castShadow />
      ))}
      {[-1, 1].map((s) => (
        <mesh key={'st' + s} position={[0.45, 0.42, s * 0.8]} material={stripe}><boxGeometry args={[1.3, 0.05, 0.02]} /></mesh>
      ))}
      {/* engine cover / airbox */}
      <RoundedBox args={[1.9, 0.38, 0.46]} radius={0.16} position={[0.95, 0.62, 0]} material={paint} castShadow />
      <mesh position={[0.2, 0.86, 0]} material={gold} castShadow><boxGeometry args={[0.35, 0.22, 0.3]} /></mesh>
      <mesh position={[1.6, 0.86, 0]} material={stripe}><boxGeometry args={[0.6, 0.18, 0.04]} /></mesh>
      {/* cockpit + halo */}
      <mesh position={[-0.35, 0.56, 0]} material={carbonMat}><boxGeometry args={[0.7, 0.08, 0.42]} /></mesh>
      <mesh position={[-0.35, 0.62, 0]} rotation={[Math.PI / 2, 0, Math.PI]} material={carbonMat}>
        <torusGeometry args={[0.3, 0.035, 12, 32, Math.PI]} />
      </mesh>
      <mesh position={[-0.62, 0.72, 0]} rotation={[0, 0, -0.5]} material={carbonMat}><cylinderGeometry args={[0.03, 0.03, 0.32]} /></mesh>
      {/* rear wing */}
      <mesh position={[2.25, 1.02, 0]} material={paint} castShadow><boxGeometry args={[0.42, 0.06, 1.35]} /></mesh>
      <mesh position={[2.1, 0.9, 0]} material={stripe}><boxGeometry args={[0.24, 0.05, 1.3]} /></mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[2.2, 0.78, s * 0.68]} material={carbonMat}><boxGeometry args={[0.65, 0.62, 0.04]} /></mesh>
      ))}
      <mesh position={[2.15, 0.62, 0]} material={carbonMat}><boxGeometry args={[0.08, 0.4, 0.08]} /></mesh>
      {/* rain light */}
      <mesh position={[2.42, 0.45, 0]}><boxGeometry args={[0.03, 0.08, 0.14]} /><meshBasicMaterial color={accent} toneMapped={false} /></mesh>
      {/* wheels */}
      <Wheel position={[-1.55, 0.35, 0.86]} r={0.35} w={0.34} wheelRef={(el) => (wheelRefs.current[0] = el)} />
      <Wheel position={[-1.55, 0.35, -0.86]} r={0.35} w={0.34} wheelRef={(el) => (wheelRefs.current[1] = el)} />
      <Wheel position={[1.65, 0.39, 0.86]} r={0.39} w={0.44} wheelRef={(el) => (wheelRefs.current[2] = el)} />
      <Wheel position={[1.65, 0.39, -0.86]} r={0.39} w={0.44} wheelRef={(el) => (wheelRefs.current[3] = el)} />
      {/* suspension arms */}
      {[[-1.55, 0.86], [-1.55, -0.86], [1.65, 0.86], [1.65, -0.86]].map(([x, z], i) => (
        <mesh key={i} position={[x * 0.85 + (x > 0 ? 0.25 : -0.2), 0.4, z * 0.6]} rotation={[0, 0, 0]} material={carbonMat}>
          <boxGeometry args={[0.06, 0.03, 0.6]} />
        </mesh>
      ))}
    </group>
  )
})

/** Front-engined GT coupé, extruded from a side profile. Nose points to +x. */
export const GTCar = forwardRef(function GTCar({ wheelRefs, paintColor = '#0B3B3C' }, ref) {
  const { body, glass } = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-2.25, 0.36)
    s.lineTo(2.2, 0.36)
    s.quadraticCurveTo(2.45, 0.38, 2.42, 0.58)
    s.quadraticCurveTo(2.35, 0.78, 1.9, 0.8)
    s.bezierCurveTo(1.2, 0.86, 0.8, 0.9, 0.5, 0.98)
    s.bezierCurveTo(0.15, 1.28, -0.2, 1.36, -0.6, 1.36)
    s.bezierCurveTo(-1.2, 1.34, -1.7, 1.12, -2.15, 0.98)
    s.quadraticCurveTo(-2.42, 0.9, -2.38, 0.62)
    s.quadraticCurveTo(-2.36, 0.38, -2.25, 0.36)
    const body = new THREE.ExtrudeGeometry(s, { depth: 1.5, bevelEnabled: true, bevelThickness: 0.16, bevelSize: 0.12, bevelSegments: 8, curveSegments: 32 })
    body.translate(0, 0, -0.75)

    const g = new THREE.Shape()
    g.moveTo(0.42, 0.98)
    g.bezierCurveTo(0.12, 1.24, -0.2, 1.3, -0.6, 1.3)
    g.bezierCurveTo(-1.1, 1.28, -1.5, 1.12, -1.9, 1.0)
    g.lineTo(0.42, 0.98)
    const glass = new THREE.ExtrudeGeometry(g, { depth: 1.8, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 2, curveSegments: 24 })
    glass.translate(0, 0, -0.9)
    return { body, glass }
  }, [])

  const paint = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: paintColor, metalness: 0.9, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.04,
    sheen: 0.5, sheenColor: new THREE.Color('#3FB5AC'), iridescence: 0.2,
  }), [paintColor])
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#0a1213', metalness: 0.2, roughness: 0.05, clearcoat: 1 }), [])

  return (
    <group ref={ref}>
      <mesh geometry={body} material={paint} castShadow receiveShadow />
      <mesh geometry={glass} material={glassMat} />
      {/* splitter + grille */}
      <mesh position={[2.42, 0.42, 0]} material={carbonMat}><boxGeometry args={[0.12, 0.14, 1.3]} /></mesh>
      <mesh position={[2.5, 0.56, 0]} material={carbonMat}><boxGeometry args={[0.04, 0.16, 0.8]} /></mesh>
      {/* headlights + tail light bar */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[2.32, 0.7, s * 0.66]} rotation={[0, s * 0.3, 0]}>
          <boxGeometry args={[0.18, 0.06, 0.32]} /><meshBasicMaterial color="#EAF2F0" toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[-2.43, 0.82, 0]}><boxGeometry args={[0.03, 0.04, 1.5]} /><meshBasicMaterial color="#F2705A" toneMapped={false} /></mesh>
      {/* side vents */}
      {[-1, 1].map((s) => (
        <mesh key={'v' + s} position={[1.0, 0.62, s * 0.92]} material={carbonMat}><boxGeometry args={[0.4, 0.06, 0.02]} /></mesh>
      ))}
      <Wheel position={[1.48, 0.38, 0.8]} r={0.38} w={0.3} wheelRef={(el) => (wheelRefs.current[0] = el)} />
      <Wheel position={[1.48, 0.38, -0.8]} r={0.38} w={0.3} wheelRef={(el) => (wheelRefs.current[1] = el)} />
      <Wheel position={[-1.45, 0.4, 0.82]} r={0.4} w={0.34} wheelRef={(el) => (wheelRefs.current[2] = el)} />
      <Wheel position={[-1.45, 0.4, -0.82]} r={0.4} w={0.34} wheelRef={(el) => (wheelRefs.current[3] = el)} />
    </group>
  )
})

/** Championship trophy on a pitch pedestal. */
export const Trophy = forwardRef(function Trophy(props, ref) {
  const cup = useMemo(() => {
    const pts = [
      [0, 0], [0.55, 0], [0.55, 0.12], [0.42, 0.18], [0.4, 0.32], [0.2, 0.4], [0.13, 0.62], [0.11, 0.8],
      [0.16, 0.95], [0.32, 1.04], [0.5, 1.22], [0.6, 1.5], [0.63, 1.78], [0.6, 1.82], [0.54, 1.78], [0.0, 1.6],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(pts, 96)
  }, [])
  const gold = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#E2B95B', metalness: 1, roughness: 0.16, clearcoat: 0.6 }), [])
  return (
    <group ref={ref} {...props}>
      <mesh geometry={cup} material={gold} castShadow />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.62, 1.42, 0]} rotation={[0, 0, s * 0.2]} material={gold} castShadow>
          <torusGeometry args={[0.2, 0.04, 16, 40, Math.PI * 1.3]} />
        </mesh>
      ))}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.43, 0.43, 0.06, 64]} />
        <meshStandardMaterial color="#3FB5AC" emissive="#3FB5AC" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
})
