import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

/* ── Golden dust particles ── */
const GoldenParticles = () => {
  const ref = useRef<THREE.Points>(null);
  const count = 300;

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      vel[i * 3] = (Math.random() - 0.5) * 0.002;
      vel[i * 3 + 1] = Math.random() * 0.003 + 0.001;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.002;
    }
    return [pos, vel];
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const posAttr = ref.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += velocities[i * 3];
      arr[i * 3 + 1] += velocities[i * 3 + 1];
      arr[i * 3 + 2] += velocities[i * 3 + 2];
      if (arr[i * 3 + 1] > 7) arr[i * 3 + 1] = -7;
    }
    posAttr.needsUpdate = true;
    ref.current.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#C9942A"
        size={0.035}
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

/* ── Falling rose petals ── */
const FallingPetals = () => {
  const ref = useRef<THREE.Group>(null);
  const petalCount = 20;

  const petals = useMemo(() =>
    Array.from({ length: petalCount }).map(() => ({
      x: (Math.random() - 0.5) * 14,
      y: Math.random() * 10 + 5,
      z: (Math.random() - 0.5) * 6,
      speed: Math.random() * 0.008 + 0.004,
      rotSpeed: Math.random() * 0.02 + 0.01,
      swayAmp: Math.random() * 0.5 + 0.3,
      swayFreq: Math.random() * 0.5 + 0.5,
      phase: Math.random() * Math.PI * 2,
      scale: Math.random() * 0.08 + 0.04,
    })),
    []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, i) => {
      const p = petals[i];
      p.y -= p.speed;
      if (p.y < -7) p.y = 8;
      child.position.set(
        p.x + Math.sin(state.clock.elapsedTime * p.swayFreq + p.phase) * p.swayAmp,
        p.y,
        p.z
      );
      child.rotation.x = state.clock.elapsedTime * p.rotSpeed;
      child.rotation.z = state.clock.elapsedTime * p.rotSpeed * 0.7;
    });
  });

  return (
    <group ref={ref}>
      {petals.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]} scale={p.scale}>
          <sphereGeometry args={[1, 4, 3]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#C0392B" : i % 3 === 1 ? "#E74C3C" : "#D4A0A0"}
            metalness={0.2}
            roughness={0.7}
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

/* ── Vel (Spear of Murugan) ── */
const VelSpear = () => {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.1;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
  });

  return (
    <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={ref} position={[0, 3.5, -3]} scale={0.6}>
        {/* Spear tip - cone */}
        <mesh position={[0, 1.8, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.15, 0.6, 6]} />
          <meshStandardMaterial
            color="#FFD700"
            metalness={0.95}
            roughness={0.1}
            emissive="#C9942A"
            emissiveIntensity={0.4}
          />
        </mesh>
        {/* Shaft */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 3.2, 8]} />
          <meshStandardMaterial color="#C9942A" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Glow */}
        <pointLight position={[0, 2, 0]} color="#FFD700" intensity={2} distance={4} />
      </group>
    </Float>
  );
};

/* ── Floating Diya (oil lamp) ── */
const FloatingDiya = ({ position, speed }: { position: [number, number, number]; speed: number }) => {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * speed * 0.5;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3;
  });

  return (
    <Float speed={speed} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={ref} position={position}>
        {/* Lamp bowl */}
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.18, 0.1, 16, 1, true]} />
          <meshStandardMaterial color="#C9942A" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.18, 0.025, 8, 16]} />
          <meshStandardMaterial color="#B8860B" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Flame */}
        <pointLight position={[0, 0.2, 0]} color="#FFB347" intensity={2} distance={3} />
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#FFDD57" transparent opacity={0.95} />
        </mesh>
        <mesh position={[0, 0.22, 0]} scale={[0.6, 1, 0.6]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshBasicMaterial color="#FFF8DC" transparent opacity={0.8} />
        </mesh>
      </group>
    </Float>
  );
};

/* ── Floating Lotus ── */
const FloatingLotus = ({ position, speed }: { position: [number, number, number]; speed: number }) => {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * speed * 0.3;
  });

  return (
    <Float speed={speed * 0.5} rotationIntensity={0.2} floatIntensity={0.8}>
      <group ref={ref} position={position} scale={0.35}>
        {/* Outer petals */}
        {Array.from({ length: 10 }).map((_, i) => {
          const angle = (i / 10) * Math.PI * 2;
          return (
            <mesh
              key={`outer-${i}`}
              position={[Math.cos(angle) * 0.25, -0.02, Math.sin(angle) * 0.25]}
              rotation={[0.5, angle, 0]}
              scale={[1, 0.25, 0.45]}
            >
              <sphereGeometry args={[0.16, 8, 6]} />
              <meshStandardMaterial color="#C9942A" metalness={0.6} roughness={0.4} transparent opacity={0.5} />
            </mesh>
          );
        })}
        {/* Inner petals */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2 + 0.2;
          return (
            <mesh
              key={`inner-${i}`}
              position={[Math.cos(angle) * 0.15, 0.03, Math.sin(angle) * 0.15]}
              rotation={[0.2, angle, 0]}
              scale={[1, 0.3, 0.5]}
            >
              <sphereGeometry args={[0.12, 8, 6]} />
              <meshStandardMaterial color="#FFD700" metalness={0.7} roughness={0.3} transparent opacity={0.7} />
            </mesh>
          );
        })}
        {/* Center */}
        <mesh position={[0, 0.06, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.2} emissive="#C9942A" emissiveIntensity={0.5} />
        </mesh>
        <pointLight position={[0, 0.1, 0]} color="#FFD700" intensity={0.5} distance={2} />
      </group>
    </Float>
  );
};

/* ── Rotating Mandala Rings ── */
const RotatingMandalaRing = () => {
  const ref = useRef<THREE.Group>(null);
  const ref2 = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.04;
    if (ref2.current) ref2.current.rotation.z = -state.clock.elapsedTime * 0.025;
  });

  return (
    <>
      <group ref={ref} position={[0, 0, -6]}>
        <mesh>
          <torusGeometry args={[4.5, 0.012, 4, 80]} />
          <meshBasicMaterial color="#C9942A" transparent opacity={0.12} />
        </mesh>
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 4.5, Math.sin(angle) * 4.5, 0]}>
              <sphereGeometry args={[0.025, 6, 6]} />
              <meshBasicMaterial color="#C9942A" transparent opacity={0.25} />
            </mesh>
          );
        })}
      </group>
      <group ref={ref2} position={[0, 0, -5]}>
        <mesh>
          <torusGeometry args={[3.2, 0.008, 4, 64]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.08} />
        </mesh>
        <mesh>
          <torusGeometry args={[2.5, 0.006, 4, 64]} />
          <meshBasicMaterial color="#C9942A" transparent opacity={0.06} />
        </mesh>
      </group>
    </>
  );
};

/* ── Peacock Feather Eye (orbiting) ── */
const PeacockEye = ({ orbitRadius, speed, yOffset }: { orbitRadius: number; speed: number; yOffset: number }) => {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    ref.current.position.x = Math.cos(t) * orbitRadius;
    ref.current.position.z = Math.sin(t) * orbitRadius;
    ref.current.position.y = yOffset + Math.sin(t * 2) * 0.3;
    ref.current.rotation.y = -t;
  });

  return (
    <group ref={ref}>
      {/* Eye shape */}
      <mesh scale={[1, 1.4, 0.3]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#1a6b3c" metalness={0.7} roughness={0.3} transparent opacity={0.7} />
      </mesh>
      <mesh scale={[0.6, 0.8, 0.35]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#2196F3" metalness={0.8} roughness={0.2} transparent opacity={0.8} />
      </mesh>
      <mesh scale={[0.3, 0.4, 0.4]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.9} />
      </mesh>
      <pointLight color="#2196F3" intensity={0.5} distance={2} />
    </group>
  );
};

/* ── Main Scene ── */
const HeroScene = () => {
  return (
    <div className="absolute inset-0 z-[2]" style={{ pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        style={{ pointerEvents: "none" }}
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[5, 5, 5]} intensity={0.4} color="#C9942A" />
        <directionalLight position={[-3, 3, 2]} intensity={0.2} color="#FFD700" />

        {/* Sparkles */}
        <Sparkles count={100} scale={14} size={2.5} speed={0.2} color="#C9942A" opacity={0.35} />
        <Sparkles count={40} scale={10} size={4} speed={0.15} color="#FFD700" opacity={0.2} />

        {/* Rising golden dust */}
        <GoldenParticles />

        {/* Falling rose petals */}
        <FallingPetals />

        {/* Vel (Murugan's spear) */}
        <VelSpear />

        {/* Mandala rings */}
        <RotatingMandalaRing />

        {/* Diyas */}
        <FloatingDiya position={[-3.5, 1.5, 0]} speed={1.2} />
        <FloatingDiya position={[3.8, -0.5, 1]} speed={0.8} />
        <FloatingDiya position={[-2.5, -2.5, -1]} speed={1.0} />
        <FloatingDiya position={[2.8, 2.5, -2]} speed={0.6} />
        <FloatingDiya position={[0.5, -3, 0.5]} speed={0.9} />
        <FloatingDiya position={[-4, -1, -1.5]} speed={0.7} />

        {/* Lotus flowers */}
        <FloatingLotus position={[0, -3, 0]} speed={0.7} />
        <FloatingLotus position={[-4.5, 0.5, -2]} speed={0.5} />
        <FloatingLotus position={[4.5, 1.5, -1]} speed={0.9} />
        <FloatingLotus position={[-2, 3, -3]} speed={0.4} />

        {/* Peacock feather eyes orbiting */}
        <PeacockEye orbitRadius={5} speed={0.15} yOffset={0} />
        <PeacockEye orbitRadius={4} speed={-0.1} yOffset={2} />
        <PeacockEye orbitRadius={5.5} speed={0.08} yOffset={-2} />
      </Canvas>
    </div>
  );
};

export default HeroScene;
