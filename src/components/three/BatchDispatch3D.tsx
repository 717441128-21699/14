import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Billboard } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

export interface DispatchVehicle {
  id: string;
  number: string;
  startX: number;
  startZ: number;
  targetX: number;
  targetZ: number;
  progress: number;
  speed: number;
  phase: 'waiting' | 'moving' | 'arrived';
  offsetY: number;
}

interface BatchDispatch3DProps {
  vehicles: DispatchVehicle[];
  targetPosition: { x: number; z: number };
  eventActive: boolean;
}

function DispatchAmbulance({ vehicle, color = '#ffffff' }: { vehicle: DispatchVehicle; color?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;

      const wobble = vehicle.phase === 'moving' ? Math.sin(t * 20) * 0.05 : 0;
      groupRef.current.position.y = vehicle.offsetY + 0.5 + wobble;

      if (vehicle.phase === 'moving' && lightRef.current) {
        lightRef.current.intensity = 1.5 + Math.sin(t * 10) * 1;
        lightRef.current.color.setHex(Math.sin(t * 8) > 0 ? 0xff0000 : 0x0044ff);
      } else if (vehicle.phase === 'arrived' && lightRef.current) {
        lightRef.current.intensity = 2;
        lightRef.current.color.setHex(0x44ff44);
      }
    }
  });

  const angle = Math.atan2(vehicle.targetZ - vehicle.startZ, vehicle.targetX - vehicle.startX);
  const currentX = vehicle.startX + (vehicle.targetX - vehicle.startX) * vehicle.progress;
  const currentZ = vehicle.startZ + (vehicle.targetZ - vehicle.startZ) * vehicle.progress;

  const colorActual = vehicle.phase === 'arrived' ? '#4caf50' : vehicle.phase === 'waiting' ? '#78909c' : color;

  return (
    <group ref={groupRef} position={[currentX, vehicle.offsetY + 0.5, currentZ]} rotation-y={-angle}>
      <pointLight ref={lightRef} color={vehicle.phase === 'waiting' ? '#78909c' : '#ff3344'} intensity={vehicle.phase === 'waiting' ? 0.3 : 1.5} distance={8} />

      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1.8, 0.4, 3]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.75, 0.1]}>
        <boxGeometry args={[1.6, 0.9, 2.2]} />
        <meshStandardMaterial color={colorActual} metalness={0.6} roughness={0.3} />
      </mesh>

      <mesh position={[0, 1.25, 0.2]}>
        <boxGeometry args={[1.4, 0.1, 1.8]} />
        <meshStandardMaterial color={colorActual} metalness={0.5} roughness={0.4} />
      </mesh>

      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[0.5, 0.15, 0.8]} />
        <meshStandardMaterial
          color={vehicle.phase === 'arrived' ? '#4caf50' : '#ff3344'}
          emissive={vehicle.phase === 'arrived' ? '#4caf50' : '#ff3344'}
          emissiveIntensity={vehicle.phase === 'waiting' ? 0.1 : 0.8}
        />
      </mesh>

      <mesh position={[0, 1.35, -0.4]}>
        <boxGeometry args={[0.5, 0.15, 0.5]} />
        <meshStandardMaterial
          color={vehicle.phase === 'arrived' ? '#4caf50' : '#0044ff'}
          emissive={vehicle.phase === 'arrived' ? '#4caf50' : '#0044ff'}
          emissiveIntensity={vehicle.phase === 'waiting' ? 0.1 : 0.8}
        />
      </mesh>

      <mesh position={[0, 0.7, -0.8]}>
        <boxGeometry args={[1.6, 0.7, 0.4]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.5} roughness={0.3} transparent opacity={0.7} />
      </mesh>

      {[[-0.7, 0, 0.9], [0.7, 0, 0.9], [-0.7, 0, -0.9], [0.7, 0, -0.9]].map((p, i) => (
        <mesh key={i} position={[p[0], 0.1, p[2]]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.22, 0.22, 0.18, 16]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
      ))}

      <Billboard position={[0, 2.8, 0]}>
        <group>
          <mesh>
            <planeGeometry args={[2, 1.1]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.8} />
          </mesh>
          <Text position={[0, 0.3, 0.01]} fontSize={0.35} color="#00e5ff" anchorX="center" anchorY="middle" fontWeight="bold">
            {vehicle.number}
          </Text>
          <Text
            position={[0, -0.2, 0.01]}
            fontSize={0.22}
            color={vehicle.phase === 'arrived' ? '#4caf50' : vehicle.phase === 'moving' ? '#fdd835' : '#78909c'}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {vehicle.phase === 'waiting' ? '待命' : vehicle.phase === 'moving' ? `调度中 ${Math.round(vehicle.progress * 100)}%` : '已到达 ✓'}
          </Text>
        </group>
      </Billboard>
    </group>
  );
}

function RouteLine({ startX, startZ, endX, endZ, active, color, seed = 0 }: { startX: number; startZ: number; endX: number; endZ: number; active: boolean; color: string; seed?: number }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const rand1 = Math.sin(seed * 12.9898) * 43758.5453;
    const rand2 = Math.sin((seed + 1) * 78.233) * 43758.5453;
    const midX = (startX + endX) / 2 + ((rand1 - Math.floor(rand1)) - 0.5) * 14;
    const midZ = (startZ + endZ) / 2 + ((rand2 - Math.floor(rand2)) - 0.5) * 14;
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
      const z = (1 - t) * (1 - t) * startZ + 2 * (1 - t) * t * midZ + t * t * endZ;
      pts.push(new THREE.Vector3(x, 0.08, z));
    }
    return pts;
  }, [startX, startZ, endX, endZ, seed]);

  const lineRef = useRef<THREE.Line>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (lineRef.current && active) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 3 + seed) * 0.3;
    }
    if (glowRef.current && active) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 2 + seed) * 0.15;
    }
  });

  const tubeGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 40, 0.15, 8, false);
  }, [points]);

  return (
    <group>
      <mesh ref={glowRef} geometry={tubeGeo}>
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      <primitive object={new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9, linewidth: 2 }))} />
    </group>
  );
}

function IncidentSite({ x, z, active }: { x: number; z: number; active: boolean }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current && active) {
      ringRef.current.scale.setScalar(1 + Math.sin(t * 4) * 0.3);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(t * 4) * 0.3;
    }
    if (ring2Ref.current && active) {
      ring2Ref.current.scale.setScalar(1.5 + Math.sin(t * 4 + 1) * 0.4);
      (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.3 + Math.sin(t * 4 + 1) * 0.2);
    }
  });

  return (
    <group position={[x, 0, z]}>
      <mesh ref={ringRef} rotation-x={-Math.PI / 2} position-y={0.1}>
        <ringGeometry args={[2, 3, 32]} />
        <meshBasicMaterial color="#ff3344" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ring2Ref} rotation-x={-Math.PI / 2} position-y={0.05}>
        <ringGeometry args={[3, 4, 32]} />
        <meshBasicMaterial color="#ff3344" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <mesh position-y={0.2}>
        <cylinderGeometry args={[1.5, 1.8, 0.3, 16]} />
        <meshStandardMaterial color="#ff3344" emissive="#b71c1c" emissiveIntensity={active ? 0.8 : 0.1} />
      </mesh>
      <Billboard position={[0, 4, 0]}>
        <group>
          <mesh>
            <planeGeometry args={[6, 1.8]} />
            <meshBasicMaterial color="#b71c1c" transparent opacity={0.9} />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.7} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
            ⚠ 事件现场 · 大规模伤亡
          </Text>
        </group>
      </Billboard>
    </group>
  );
}

function CollisionAvoidanceIndicator() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={ref} position={[0, 0.5, 0]}>
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[18, 0.1, 8, 128]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function SceneUpdater({ setVehicles, running }: { setVehicles: (fn: (v: DispatchVehicle[]) => DispatchVehicle[]) => void; running: boolean }) {
  useFrame((_, delta) => {
    if (!running) return;

    setVehicles((prev) =>
      prev.map((v) => {
        if (v.phase !== 'moving') return v;

        let newProgress = v.progress + v.speed;

        let minDist = Infinity;
        for (const other of prev) {
          if (other.id === v.id || other.phase === 'waiting') continue;
          const p1 = newProgress;
          const p2 = other.progress;
          const x1 = v.startX + (v.targetX - v.startX) * p1;
          const z1 = v.startZ + (v.targetZ - v.startZ) * p1;
          const x2 = other.startX + (other.targetX - other.startX) * p2;
          const z2 = other.startZ + (other.targetZ - other.startZ) * p2;
          const dist = Math.sqrt((x1 - x2) ** 2 + (z1 - z2) ** 2);
          minDist = Math.min(minDist, dist);
        }

        if (minDist < 4) {
          newProgress = v.progress + v.speed * 0.25;
        }

        if (newProgress >= 1) {
          return { ...v, progress: 1, phase: 'arrived' as const };
        }

        return { ...v, progress: newProgress };
      })
    );
  });

  return null;
}

export function BatchDispatch3D({ vehicles: externalVehicles, targetPosition, eventActive }: BatchDispatch3DProps) {
  const [localVehicles, setLocalVehicles] = useState<DispatchVehicle[]>(externalVehicles);

  useEffect(() => {
    setLocalVehicles(externalVehicles);
  }, [externalVehicles]);

  const colors = ['#00bcd4', '#ff9800', '#8bc34a', '#e91e63', '#9c27b0', '#ffeb3b'];

  return (
    <Canvas shadows camera={{ position: [0, 30, 40], fov: 45 }} className="three-canvas">
      <color attach="background" args={['#050a15']} />
      <fog attach="fog" args={['#050a15', 40, 100]} />

      <ambientLight intensity={0.25} />
      <directionalLight position={[15, 30, 15]} intensity={0.5} color="#aaccff" />

      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 90]} />
        <meshStandardMaterial color="#0a1424" roughness={0.95} />
      </mesh>

      <group>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={`h-${i}`} position={[-40 + i * 8, 0.05, -35]} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[0.3, 90]} />
            <meshStandardMaterial color="#1a2744" />
          </mesh>
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh key={`v-${i}`} position={[-40, 0.05, -40 + i * 10]} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[80, 0.3]} />
            <meshStandardMaterial color="#1a2744" />
          </mesh>
        ))}
      </group>

      {localVehicles.map((v, i) => (
        <RouteLine
          key={`route-${v.id}`}
          startX={v.startX}
          startZ={v.startZ}
          endX={v.targetX}
          endZ={v.targetZ}
          active={v.phase === 'moving'}
          color={colors[i % colors.length]}
          seed={i}
        />
      ))}

      {eventActive && <IncidentSite x={targetPosition.x} z={targetPosition.z} active={eventActive} />}

      {localVehicles.map((v, i) => (
        <DispatchAmbulance key={v.id} vehicle={v} color={colors[i % colors.length]} />
      ))}

      {eventActive && localVehicles.some((v) => v.phase === 'moving') && <CollisionAvoidanceIndicator />}

      <SceneUpdater setVehicles={setLocalVehicles} running={eventActive} />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={15}
        maxDistance={80}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.8} height={300} intensity={0.8} />
      </EffectComposer>
    </Canvas>
  );
}
