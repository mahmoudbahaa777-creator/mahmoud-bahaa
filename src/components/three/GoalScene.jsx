import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/*
 * UAE Pro League zone: a stylised player runs up, strikes the ball into the top
 * corner, the net bulges, confetti bursts and the player celebrates, then jogs
 * back and it plays again. Kit is brand teal — no club colours or crests.
 * The loop restarts from the run-up every time the zone comes on stage.
 */

const { lerp, clamp, damp } = THREE.MathUtils
const KIT = '#138A84', SHORTS = '#F7F4EE', SKIN = '#B9825C', HAIR = '#1a1210', BOOT = '#F2705A'
const GOAL = { w: 3.6, h: 1.25, d: 0.9, z: -2.2 }
const START = new THREE.Vector3(2.7, 0, 2.5)
const SPOT = new THREE.Vector3(0.5, 0.11, 0.85)
const TARGET = new THREE.Vector3(1.15, 1.0, GOAL.z - GOAL.d + 0.12)
// Timeline (seconds)
const T = { run: 1.5, kick: 1.9, launch: 1.74, impact: 2.4, settle: 3.0, celebrate: 4.6, back: 6.0 }

const toKick = SPOT.clone().sub(START).setY(0).normalize()
const KICK_POS = SPOT.clone().setY(0).addScaledVector(toKick, -0.42).add(new THREE.Vector3(0.12, 0, 0))
const KICK_END = KICK_POS.clone().addScaledVector(toKick, 0.3)
const ease = (x) => x * x * (3 - 2 * x)

function Limb({ limbRef, position, len, r, color, children }) {
  return (
    <group ref={limbRef} position={position}>
      <mesh position={[0, -len / 2, 0]} castShadow>
        <capsuleGeometry args={[r, Math.max(0.01, len - 2 * r), 4, 10]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <group position={[0, -len, 0]}>{children}</group>
    </group>
  )
}

function Player({ rig }) {
  return (
    <group ref={rig.root}>
      <group position={[0, 0.74, 0]}>
        <mesh position={[0, 0.02, 0]} castShadow>
          <boxGeometry args={[0.3, 0.16, 0.18]} />
          <meshStandardMaterial color={SHORTS} roughness={0.7} />
        </mesh>
        {[['L', -0.08], ['R', 0.08]].map(([s, x]) => (
          <Limb key={s} limbRef={rig['hip' + s]} position={[x, 0, 0]} len={0.36} r={0.055} color={SKIN}>
            <Limb limbRef={rig['knee' + s]} position={[0, 0, 0]} len={0.34} r={0.047} color={KIT}>
              <mesh position={[0, -0.02, 0.05]} castShadow>
                <boxGeometry args={[0.08, 0.06, 0.2]} />
                <meshStandardMaterial color={BOOT} roughness={0.4} />
              </mesh>
            </Limb>
          </Limb>
        ))}
        <group ref={rig.torso}>
          <mesh position={[0, 0.27, 0]} castShadow>
            <capsuleGeometry args={[0.13, 0.22, 4, 12]} />
            <meshStandardMaterial color={KIT} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.04, 0.05, 0.08]} /><meshStandardMaterial color={SKIN} /></mesh>
          <mesh position={[0, 0.63, 0]} castShadow><sphereGeometry args={[0.1, 20, 16]} /><meshStandardMaterial color={SKIN} roughness={0.6} /></mesh>
          <mesh position={[0, 0.67, -0.01]} scale={[1.05, 0.75, 1.08]}><sphereGeometry args={[0.1, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={HAIR} /></mesh>
          {[['L', -0.19], ['R', 0.19]].map(([s, x]) => (
            <Limb key={s} limbRef={rig['sh' + s]} position={[x, 0.44, 0]} len={0.27} r={0.042} color={KIT}>
              <Limb limbRef={rig['el' + s]} position={[0, 0, 0]} len={0.25} r={0.034} color={SKIN} />
            </Limb>
          ))}
        </group>
      </group>
    </group>
  )
}

function ballTexture() {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 128
  const g = c.getContext('2d')
  g.fillStyle = '#F7F4EE'; g.fillRect(0, 0, 256, 128)
  g.fillStyle = '#10221F'
  for (let row = 0; row < 4; row++) for (let i = 0; i < 6; i++) {
    const x = i * 44 + (row % 2) * 22 + 10, y = row * 34 + 14
    g.beginPath()
    for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 - Math.PI / 2; g.lineTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10) }
    g.fill()
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return t
}

function Goal({ netRef }) {
  const { w, h, d, z } = GOAL
  const post = <meshStandardMaterial color="#F7F4EE" roughness={0.3} />
  const net = <meshBasicMaterial color="#EAF2F0" wireframe transparent opacity={0.32} />
  return (
    <group position={[0, 0, z]}>
      {[-w / 2, w / 2].map((x) => (
        <mesh key={x} position={[x, h / 2, 0]} castShadow><cylinderGeometry args={[0.04, 0.04, h, 12]} />{post}</mesh>
      ))}
      <mesh position={[0, h, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.04, 0.04, w + 0.08, 12]} />{post}</mesh>
      {/* back net — vertices pushed out where the ball lands */}
      <mesh ref={netRef} position={[0, h / 2, -d]}>
        <planeGeometry args={[w, h, 28, 10]} />{net}
      </mesh>
      <mesh position={[0, h, -d / 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[w, d, 28, 6]} />{net}</mesh>
      {[-w / 2, w / 2].map((x) => (
        <mesh key={'n' + x} position={[x, h / 2, -d / 2]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[d, h, 6, 10]} />{net}</mesh>
      ))}
    </group>
  )
}

function Confetti({ count, stateRef }) {
  const mesh = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const parts = useMemo(() => Array.from({ length: count }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), r: new THREE.Euler(), s: Math.random() * 6 + 2 })), [count])
  const colors = useMemo(() => {
    const pal = ['#3FB5AC', '#F7F4EE', '#F2705A', '#C7F23A', '#9FC9C4'].map((c) => new THREE.Color(c))
    const a = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) { const c = pal[i % pal.length]; a.set([c.r, c.g, c.b], i * 3) }
    return a
  }, [count])
  useFrame((_, dt) => {
    const st = stateRef.current
    if (st.burst) {
      st.burst = false
      parts.forEach((q) => {
        q.p.set(TARGET.x + (Math.random() - 0.5) * 1.5, GOAL.h + 0.2, GOAL.z + (Math.random() - 0.5) * 0.6)
        q.v.set((Math.random() - 0.5) * 3.2, 2.2 + Math.random() * 3, 0.6 + Math.random() * 2.4)
      })
    }
    const on = st.confetti
    parts.forEach((q, i) => {
      if (on) {
        q.v.y -= 3.2 * dt; q.v.multiplyScalar(1 - 0.9 * dt)
        q.p.addScaledVector(q.v, dt)
        if (q.p.y < 0.01) { q.p.y = 0.01; q.v.set(0, 0, 0) }
        q.r.x += q.s * dt; q.r.y += q.s * 0.7 * dt
      }
      dummy.position.copy(q.p); dummy.rotation.copy(q.r)
      dummy.scale.setScalar(on ? 1 : 0)
      dummy.updateMatrix(); mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={mesh} args={[null, null, count]} frustumCulled={false}>
      <planeGeometry args={[0.06, 0.035]}>
        <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
      </planeGeometry>
      <meshBasicMaterial vertexColors side={THREE.DoubleSide} toneMapped={false} />
    </instancedMesh>
  )
}

export default function GoalScene({ activeRef, flashRef, low }) {
  const rig = {
    root: useRef(), torso: useRef(), hipL: useRef(), hipR: useRef(), kneeL: useRef(), kneeR: useRef(),
    shL: useRef(), shR: useRef(), elL: useRef(), elR: useRef(),
  }
  const ball = useRef(), net = useRef(), glow = useRef()
  const clock = useRef(0), wasActive = useRef(false)
  const fx = useRef({ burst: false, confetti: false, burstDone: false })
  const ballTex = useMemo(ballTexture, [])
  const netBase = useRef(null)
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    const active = activeRef.current === 2
    if (active && !wasActive.current) { clock.current = 0; fx.current.burstDone = false; fx.current.confetti = false }
    wasActive.current = active
    if (!active) return
    clock.current += Math.min(dt, 1 / 20)
    if (clock.current > T.back) { clock.current = 0; fx.current.burstDone = false; fx.current.confetti = false }
    const t = clock.current

    const R = Object.fromEntries(Object.entries(rig).map(([k, v]) => [k, v.current]))
    if (!R.root) return
    const pose = (o) => {
      for (const k of ['hipL', 'hipR', 'kneeL', 'kneeR', 'shL', 'shR', 'elL', 'elR']) {
        R[k].rotation.x = damp(R[k].rotation.x, o[k + 'x'] ?? 0, 18, dt)
        R[k].rotation.z = damp(R[k].rotation.z, o[k + 'z'] ?? 0, 18, dt)
      }
      R.torso.rotation.x = damp(R.torso.rotation.x, o.lean ?? 0, 10, dt)
    }
    const runCycle = (ph, amp = 1) => ({
      hipLx: -Math.sin(ph) * 0.9 * amp, hipRx: Math.sin(ph) * 0.9 * amp,
      kneeLx: (0.3 + 0.9 * Math.max(0, Math.sin(ph + 1.2))) * amp, kneeRx: (0.3 + 0.9 * Math.max(0, -Math.sin(ph + 1.2))) * amp,
      shLx: Math.sin(ph) * 0.8 * amp, shRx: -Math.sin(ph) * 0.8 * amp, elLx: -1.3, elRx: -1.3, lean: 0.22 * amp,
    })
    const face = (dir) => { R.root.rotation.y = damp(R.root.rotation.y, Math.atan2(dir.x, dir.z), 10, dt) }

    // ---- player
    if (t < T.run) {
      const u = ease(t / T.run)
      R.root.position.lerpVectors(START, KICK_POS, u)
      const ph = t * 13
      R.root.position.y = Math.abs(Math.sin(ph)) * 0.06
      face(toKick)
      pose(runCycle(ph))
    } else if (t < T.kick) {
      const k = (t - T.run) / (T.kick - T.run)
      R.root.position.lerpVectors(KICK_POS, KICK_END, ease(k)); R.root.position.y = 0
      face(tmp.copy(TARGET).sub(SPOT).setY(0).normalize())
      const back = k < 0.5
      pose({
        hipLx: -0.25, kneeLx: 0.35,
        hipRx: back ? lerp(0.2, 1.1, k / 0.5) : lerp(1.1, -1.6, (k - 0.5) / 0.5),
        kneeRx: back ? lerp(0.4, 1.7, k / 0.5) : lerp(1.7, 0.05, (k - 0.5) / 0.5),
        shLz: -1.1, shRz: 0.9, shLx: -0.5, elLx: -0.4, lean: -0.12,
      })
    } else if (t < T.impact + 0.15) {
      pose({ hipRx: -1.2, kneeRx: 0.1, hipLx: -0.2, kneeLx: 0.3, shLz: -0.9, shRz: 0.7, lean: -0.05 })
    } else if (t < T.celebrate) {
      const c = t - (T.impact + 0.15)
      const hop = Math.max(0, Math.sin(c * 6.5))
      R.root.position.y = hop * 0.38
      R.root.rotation.y = damp(R.root.rotation.y, -0.3, 4, dt) // turn to the crowd (camera)
      pose({ shLz: -2.7, shRz: 2.7, elLz: -0.2, elRz: 0.2, hipLx: -0.4 * hop, hipRx: -0.4 * hop, kneeLx: 0.9 * hop, kneeRx: 0.9 * hop, lean: -0.1 })
    } else {
      const u = ease((t - T.celebrate) / (T.back - T.celebrate))
      R.root.position.lerpVectors(KICK_END, START, u)
      const ph = t * 10
      R.root.position.y = Math.abs(Math.sin(ph)) * 0.04
      face(tmp.copy(START).sub(KICK_END).setY(0).normalize())
      pose(runCycle(ph, 0.6))
    }

    // ---- ball
    const b = ball.current
    if (t < T.launch) {
      b.position.copy(SPOT); b.scale.setScalar(1)
    } else if (t < T.impact) {
      const s = (t - T.launch) / (T.impact - T.launch)
      b.position.lerpVectors(SPOT, TARGET, s)
      b.position.y += Math.sin(Math.PI * s) * 0.75
      b.rotation.x -= dt * 28; b.rotation.y += dt * 9
    } else if (t < T.settle) {
      const s = (t - T.impact) / (T.settle - T.impact)
      b.position.set(TARGET.x - s * 0.15, lerp(TARGET.y, 0.11, s * s) + Math.abs(Math.sin(s * Math.PI * 2)) * 0.18 * (1 - s), TARGET.z + 0.25 * s)
      b.rotation.x -= dt * 6
    } else if (t > T.celebrate + 0.6) {
      // a fresh ball pops onto the spot for the next take
      const s = clamp((t - T.celebrate - 0.6) / 0.35, 0, 1)
      b.position.copy(SPOT); b.scale.setScalar(s < 1 ? 1.15 * Math.sin(s * Math.PI * 0.6) / Math.sin(Math.PI * 0.6) : 1)
    } else if (t > T.celebrate + 0.3) {
      b.scale.setScalar(damp(b.scale.x, 0, 12, dt))
    }

    // ---- net bulge
    const geo = net.current.geometry, pos = geo.attributes.position
    if (!netBase.current) netBase.current = Float32Array.from(pos.array)
    const amp = t > T.impact ? 0.5 * Math.exp(-(t - T.impact) * 2.6) * (0.75 + 0.25 * Math.cos((t - T.impact) * 14)) : 0
    const ix = TARGET.x, iy = TARGET.y - GOAL.h / 2
    for (let i = 0; i < pos.count; i++) {
      const x = netBase.current[i * 3], y = netBase.current[i * 3 + 1]
      const d2 = (x - ix) ** 2 + (y - iy) ** 2
      pos.array[i * 3 + 2] = -amp * Math.exp(-d2 / 0.35)
    }
    pos.needsUpdate = true

    // ---- goal moment: confetti, light flash, pitch glow
    if (t > T.impact && !fx.current.burstDone) { fx.current.burst = true; fx.current.burstDone = true; fx.current.confetti = true }
    if (t > T.celebrate + 0.8) fx.current.confetti = false
    const flash = t > T.impact ? Math.exp(-(t - T.impact) * 1.8) : 0
    if (flashRef) flashRef.current = flash
    glow.current.material.opacity = 0.05 + flash * 0.45
  })

  return (
    <group>
      <Goal netRef={net} />
      <Player rig={rig} />
      <mesh ref={ball} position={SPOT.toArray()} castShadow>
        <sphereGeometry args={[0.11, 24, 16]} />
        <meshStandardMaterial map={ballTex} roughness={0.45} />
      </mesh>
      <mesh ref={glow} position={[0, 0.006, GOAL.z - GOAL.d / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[GOAL.w + 1.2, GOAL.d + 1.4]} />
        <meshBasicMaterial color="#3FB5AC" transparent opacity={0.05} toneMapped={false} depthWrite={false} />
      </mesh>
      <Confetti count={low ? 70 : 160} stateRef={fx} />
    </group>
  )
}
