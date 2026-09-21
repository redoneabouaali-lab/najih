"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

function usePointer() {
  const p = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const on = (e: PointerEvent) => {
      p.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);
  return p;
}

function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Particles({ count = 1300 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const rand = makeRng(1337);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = ["#818cf8", "#38bdf8", "#c084fc", "#f472b6", "#fbbf24"].map((c) => new THREE.Color(c));
    for (let i = 0; i < count; i++) {
      const r = 2.3 + rand() * 1.7;
      const t = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      positions[i * 3] = r * Math.sin(ph) * Math.cos(t);
      positions[i * 3 + 1] = r * Math.cos(ph) * 0.62;
      positions[i * 3 + 2] = r * Math.sin(ph) * Math.sin(t);
      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    const pts = ref.current;
    if (!pts) return;
    const t = state.clock.elapsedTime;
    pts.rotation.y = t * 0.06;
    pts.rotation.x = Math.sin(t * 0.16) * 0.09;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.042}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.92}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Cap() {
  const group = useRef<THREE.Group>(null);
  const tassel = useRef<THREE.Group>(null);

  useFrame((state) => {
    const g = group.current;
    if (g) {
      const t = state.clock.elapsedTime;
      g.rotation.y = t * 0.34;
      g.position.y = 0.12 + Math.sin(t * 0.85) * 0.14;
    }
    const ts = tassel.current;
    if (ts) ts.rotation.z = Math.sin(state.clock.elapsedTime * 1.6) * 0.28;
  });

  return (
    <group ref={group}>
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.5, 0.57, 0.46, 40]} />
        <meshStandardMaterial color="#312e81" metalness={0.45} roughness={0.35} />
      </mesh>

      <mesh position={[0, 0.02, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[1.5, 0.075, 1.5]} />
        <meshStandardMaterial color="#4f46e5" metalness={0.55} roughness={0.25} />
      </mesh>

      <mesh position={[0, 0.09, 0]}>
        <sphereGeometry args={[0.07, 20, 20]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.6} metalness={0.7} roughness={0.2} />
      </mesh>

      <group ref={tassel} position={[0, 0.09, 0]}>
        <mesh position={[0.42, -0.16, 0.42]}>
          <cylinderGeometry args={[0.014, 0.014, 0.44, 8]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0.42, -0.4, 0.42]}>
          <sphereGeometry args={[0.075, 18, 18]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.7} metalness={0.6} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}

function Rings() {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (a.current) a.current.rotation.z = t * 0.18;
    if (b.current) b.current.rotation.z = -t * 0.24;
  });

  return (
    <>
      <mesh ref={a} rotation={[Math.PI / 2.3, 0.5, 0]}>
        <torusGeometry args={[2.15, 0.012, 16, 140]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
      </mesh>
      <mesh ref={b} rotation={[Math.PI / 1.75, -0.6, 0.4]}>
        <torusGeometry args={[2.55, 0.01, 16, 140]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.42} />
      </mesh>
    </>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const pointer = usePointer();

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const { x, y } = pointer.current;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, x * 0.45, 0.045);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, y * 0.28, 0.045);
  });

  return <group ref={group}>{children}</group>;
}

export default function HeroScene({ onReady }: { onReady?: () => void }) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0.4, 6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      performance={{ min: 0.5 }}
      onCreated={() => onReady?.()}
      style={{ pointerEvents: "none" }}
    >
      <ambientLight intensity={1.3} />
      <directionalLight position={[4, 6, 4]} intensity={2.6} color="#e0e7ff" />
      <directionalLight position={[-5, -2, -3]} intensity={1.3} color="#38bdf8" />
      <fog attach="fog" args={["#050818", 7.5, 13]} />
      <Rig>
        <Cap />
        <Particles />
        <Rings />
      </Rig>
    </Canvas>
  );
}
