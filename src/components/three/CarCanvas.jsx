import { Component, Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Grid, Lightformer, SpotLight, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import GoalScene from './GoalScene'
import { PhotoCar } from './PhotoCar'
import { MODELS } from './assets'
import { asset } from '../../hooks'

const { damp, clamp } = THREE.MathUtils
const TRAVEL = 16 // how far off-screen a car waits / exits

/* ---------- optional GLB loader with procedural fallback ---------- */

class Fallback extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function GLB({ cfg }) {
  const { scene } = useGLTF(asset(cfg.path))
  const obj = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true } })
    return c
  }, [scene])
  return <primitive object={obj} scale={cfg.scale} rotation={cfg.rotation} position={[0, cfg.yOffset, 0]} />
}

function ModelSlot({ id, children }) {
  const cfg = MODELS[id]
  if (!cfg?.path) return children
  return (
    <Fallback fallback={children}>
      <Suspense fallback={children}><GLB cfg={cfg} /></Suspense>
    </Fallback>
  )
}

/* ---------- zone presence: -1 (gone/left) · 0 (on stage) · +1 (waiting) ---------- */

function usePresence(index, activeRef, lambda = 2.2) {
  const p = useRef(1)
  const vel = useRef(0)
  const tick = (dt) => {
    const a = activeRef.current
    const target = a === index ? 0 : index < a ? -1 : 1
    const prev = p.current
    p.current = damp(p.current, target, lambda, dt)
    if (Math.abs(p.current - target) < 0.0005) p.current = target
    vel.current = dt > 0 ? (p.current - prev) / dt : 0
    return p.current
  }
  return { p, vel, tick }
}

/* ---------- energy / speed streaks behind the race car ---------- */

function SpeedTrail({ speedRef, count, palette = ['#F2705A', '#E9C46A', '#3FB5AC'] }) {
  const mesh = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const seeds = useMemo(() => Array.from({ length: count }, () => ({
    x: Math.random() * 12, y: 0.12 + Math.random() * 1.1, z: (Math.random() - 0.5) * 2.4, k: 0.5 + Math.random(),
  })), [count])
  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const cols = palette.map((p) => new THREE.Color(p))
    seeds.forEach((_, i) => { const col = cols[i % cols.length]; arr.set([col.r, col.g, col.b], i * 3) })
    return arr
  }, [count, seeds, palette])

  useFrame((_, dt) => {
    const speed = speedRef.current
    const s = clamp(speed / 18, 0, 1)
    seeds.forEach((sd, i) => {
      sd.x += dt * (0.6 + s * 22) * sd.k
      if (sd.x > 12) sd.x = 0
      const len = 0.08 + s * 1.6 * sd.k
      dummy.position.set(2.4 + sd.x, sd.y + Math.sin(sd.x * 2 + i) * 0.03, sd.z)
      dummy.scale.set(len, 0.02 + (1 - s) * 0.02, 0.02 + (1 - s) * 0.02)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    mesh.current.material.opacity = 0.35 + s * 0.55
  })

  return (
    <instancedMesh ref={mesh} args={[null, null, count]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
      </boxGeometry>
      <meshBasicMaterial vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </instancedMesh>
  )
}

/* ---------- Zone 1: race car drives in from the right ---------- */

function RedBullZone({ activeRef, scrollRef, layout, low }) {
  const g = useRef(), speed = useRef(0), accel = useRef(0), light = useRef(), drift = useRef(0)
  const { tick, vel } = usePresence(0, activeRef, 1.9)
  useFrame((state, dt) => {
    const p = tick(dt)
    // While this zone is on stage, scrolling nudges the car forward so it never sits still
    const local = clamp(scrollRef.current * 3, 0, 1)
    const prevDrift = drift.current
    drift.current = damp(drift.current, (0.35 - local) * 1.6, 3, dt)
    g.current.position.x = layout.carX + p * TRAVEL + drift.current
    g.current.visible = Math.abs(p) < 0.995
    const v = Math.abs(vel.current) * TRAVEL + Math.abs(drift.current - prevDrift) / Math.max(dt, 1e-3)
    const prev = speed.current
    speed.current = damp(speed.current, v, 8, dt)
    accel.current = (speed.current - prev) / Math.max(dt, 1e-3)
    light.current.intensity = (1 - Math.abs(p)) * 60
  })
  return (
    <group ref={g} scale={layout.carScale}>
      <Suspense fallback={null}>
        <PhotoCar car="redbull" speedRef={speed} accelRef={accel} />
      </Suspense>
      <SpeedTrail speedRef={speed} count={low ? 60 : 150} />
      <pointLight ref={light} position={[0, 2.4, 1.5]} color="#F2705A" distance={8} decay={2} />
    </group>
  )
}

/* ---------- Zone 2: the Aston Martin glides across and parks on the left ---------- */

const ASTON_TRAIL = ['#C7F23A', '#3FB5AC', '#EAF2F0']

function AstonZone({ activeRef, scrollRef, layout, low }) {
  const g = useRef(), speed = useRef(0), accel = useRef(0), key = useRef(), drift = useRef(0)
  // Softer damping than the race car: a longer, smoother glide into place
  const { tick, vel } = usePresence(1, activeRef, 1.3)
  useFrame((state, dt) => {
    const p = tick(dt)
    const local = clamp(scrollRef.current * 3 - 1, 0, 1)
    const prevDrift = drift.current
    drift.current = damp(drift.current, (0.35 - local) * 1.2, 2.5, dt)
    g.current.position.x = layout.gtX + p * TRAVEL + drift.current
    g.current.visible = Math.abs(p) < 0.995
    const v = Math.abs(vel.current) * TRAVEL + Math.abs(drift.current - prevDrift) / Math.max(dt, 1e-3)
    const prev = speed.current
    speed.current = damp(speed.current, v, 6, dt)
    accel.current = (speed.current - prev) / Math.max(dt, 1e-3)
    key.current.intensity = (1 - Math.abs(p)) * 50
  })
  return (
    <group ref={g} scale={layout.gtScale}>
      <Suspense fallback={null}>
        <PhotoCar car="aston" speedRef={speed} accelRef={accel} />
      </Suspense>
      <SpeedTrail speedRef={speed} count={low ? 50 : 120} palette={ASTON_TRAIL} />
      <pointLight ref={key} position={[0, 2.6, 1.5]} color="#3FB5AC" distance={8} decay={2} />
    </group>
  )
}

/* ---------- Zone 3: stadium pitch — a player scores ---------- */

const PITCH_R = 4.6

function pitchTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const x = c.getContext('2d')
  for (let i = 0; i < 12; i++) { x.fillStyle = i % 2 ? '#0F3F3A' : '#0B3532'; x.fillRect(0, i * 512 / 12, 512, 512 / 12) }
  // world (x, z) → canvas px. Plane is rotated so canvas top = -z (goal end).
  const px = (wx) => (0.5 + wx / (2 * PITCH_R)) * 512
  const pz = (wz) => (0.5 + wz / (2 * PITCH_R)) * 512
  x.strokeStyle = 'rgba(234,242,240,.6)'; x.lineWidth = 3
  const line = (x1, z1, x2, z2) => { x.beginPath(); x.moveTo(px(x1), pz(z1)); x.lineTo(px(x2), pz(z2)); x.stroke() }
  line(-PITCH_R, -2.2, PITCH_R, -2.2) // goal line
  ;[[2.6, 1.6], [1.4, 0.6]].forEach(([hw, dz]) => { line(-hw, -2.2, -hw, -2.2 + dz); line(hw, -2.2, hw, -2.2 + dz); line(-hw, -2.2 + dz, hw, -2.2 + dz) })
  x.beginPath(); x.arc(px(0), pz(-2.2 + 1.6), 0.9 * 512 / (2 * PITCH_R), 0, Math.PI); x.stroke()
  x.fillStyle = 'rgba(234,242,240,.7)'; x.beginPath(); x.arc(px(0.5), pz(0.85), 4, 0, Math.PI * 2); x.fill()
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4
  return t
}

function StadiumZone({ activeRef, layout, low }) {
  const g = useRef(), rig = useRef(), lights = useRef([]), flash = useRef(0)
  const target = useMemo(() => new THREE.Object3D(), [])
  const tex = useMemo(pitchTexture, [])
  const { tick } = usePresence(2, activeRef, 2)
  useFrame((state, dt) => {
    const p = tick(dt)
    g.current.position.y = -Math.abs(p) * 6
    g.current.visible = Math.abs(p) < 0.995
    // Lights sweep slowly, then whip round and flare when the goal goes in
    rig.current.rotation.y += dt * (0.3 + flash.current * 3)
    lights.current.forEach((l) => l && (l.intensity = 110 + flash.current * 260))
  })
  const beams = low ? [0, 1] : [0, 1, 2]
  return (
    <group ref={g} position={[layout.trophyX, 0, 0]} scale={layout.trophyScale}>
      <primitive object={target} position={[0, 0.4, -1]} />
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[PITCH_R, 72]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
      <GoalScene activeRef={activeRef} flashRef={flash} low={low} />
      <group ref={rig}>
        {beams.map((i) => {
          const a = (i / beams.length) * Math.PI * 2
          return (
            <SpotLight key={i} ref={(el) => (lights.current[i] = el)} position={[Math.cos(a) * 4.5, 7, Math.sin(a) * 4.5]} target={target}
              color={i === 0 ? '#EAF2F0' : '#3FB5AC'} angle={0.42} penumbra={0.6} intensity={110} distance={16}
              attenuation={7} anglePower={4} opacity={0.4} castShadow={!low && i === 0} />
          )
        })}
      </group>
    </group>
  )
}

/* ---------- camera + world ---------- */

function CameraRig({ activeRef, layout }) {
  const look = useRef(new THREE.Vector3(0, 0.8, 0))
  useFrame((state, dt) => {
    const shot = layout.shots[activeRef.current]
    const cam = state.camera
    cam.position.x = damp(cam.position.x, shot.pos[0] + state.pointer.x * 0.35, 1.6, dt)
    cam.position.y = damp(cam.position.y, shot.pos[1] + state.pointer.y * 0.2, 1.6, dt)
    cam.position.z = damp(cam.position.z, shot.pos[2], 1.6, dt)
    look.current.x = damp(look.current.x, shot.look[0], 1.6, dt)
    look.current.y = damp(look.current.y, shot.look[1], 1.6, dt)
    look.current.z = damp(look.current.z, shot.look[2], 1.6, dt)
    cam.lookAt(look.current)
  })
  return null
}

export default function CarCanvas({ activeRef, scrollRef, running, isMobile, low }) {
  const layout = useMemo(() => isMobile
    ? {
        carX: 0, carScale: 0.5, gtX: 0, gtScale: 0.5, trophyX: 0, trophyScale: 0.72,
        shots: [
          { pos: [0, 2.2, 10.5], look: [0, -0.2, 0] },
          { pos: [0.4, 2.2, 10.5], look: [0, -0.2, 0] },
          { pos: [0.6, 3.6, 10.5], look: [0, -0.9, -0.6] },
        ],
      }
    : {
        carX: 2.7, carScale: 0.78, gtX: -2.4, gtScale: 0.78, trophyX: 3.0, trophyScale: 1.0,
        shots: [
          { pos: [0.2, 2.1, 9.2], look: [0.8, 0.6, 0] },
          { pos: [-0.2, 2.1, 9.2], look: [-0.8, 0.6, 0] },
          { pos: [1.4, 3.4, 8.8], look: [1.7, 0.5, -0.6] },
        ],
      }, [isMobile])

  return (
    <Canvas
      frameloop={running ? 'always' : 'never'}
      shadows={!low}
      dpr={low ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0.4, 1.8, 8.4], fov: 40 }}
      gl={{ antialias: !low, powerPreference: 'high-performance' }}>
      <color attach="background" args={['#0E1817']} />
      <fog attach="fog" args={['#0E1817', 12, 28]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 4]} intensity={1.6} castShadow={!low}
        shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={6} shadow-camera-bottom={-4} />

      {/* Studio reflections, built offline from light panels (no HDR download) */}
      <Environment resolution={low ? 64 : 256} frames={1}>
        <Lightformer form="rect" intensity={5} position={[0, 5, -2]} scale={[10, 2, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={2} position={[-6, 1, 1]} scale={[3, 6, 1]} rotation-y={Math.PI / 2} color="#9FC9C4" />
        <Lightformer form="rect" intensity={2} position={[6, 1, 1]} scale={[3, 6, 1]} rotation-y={-Math.PI / 2} />
        <Lightformer form="ring" intensity={1.5} position={[0, 2, 6]} scale={3} color="#3FB5AC" />
      </Environment>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial opacity={0.45} />
      </mesh>
      <Grid position={[0, 0.002, 0]} args={[40, 40]} cellSize={0.5} cellThickness={0.6} sectionSize={2.5}
        sectionThickness={1} cellColor="#1d3532" sectionColor="#27615b" fadeDistance={22} fadeStrength={1.6} infiniteGrid />

      <RedBullZone activeRef={activeRef} scrollRef={scrollRef} layout={layout} low={low} />
      <AstonZone activeRef={activeRef} scrollRef={scrollRef} layout={layout} low={low} />
      <StadiumZone activeRef={activeRef} layout={layout} low={low} />
      <CameraRig activeRef={activeRef} layout={layout} />
    </Canvas>
  )
}
