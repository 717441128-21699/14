import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Billboard } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { Bed, BedZone } from '../../../shared/types';

const zoneConfig: Record<BedZone, { name: string; color: string; emissive: string; offsetX: number }> = {
  red: { name: '抢救区', color: '#e53935', emissive: '#b71c1c', offsetX: -12 },
  yellow: { name: '观察区', color: '#fdd835', emissive: '#f9a825', offsetX: 0 },
  green: { name: '诊疗区', color: '#43a047', emissive: '#2e7d32', offsetX: 12 },
};

interface Bed3DProps {
  bed: Bed;
  position: [number, number, number];
  zoneColor: string;
  onClick: () => void;
  selected: boolean;
}

function Bed3D({ bed, position, zoneColor, onClick, selected }: Bed3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && selected) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        if (bed.occupied) onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = bed.occupied ? 'pointer' : 'default';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[2.2, 0.4, 4]} />
        <meshStandardMaterial color="#37474f" roughness={0.8} />
      </mesh>

      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 0.1, 3.8]} />
        <meshStandardMaterial
          color={bed.occupied ? zoneColor : '#546e7a'}
          emissive={bed.occupied ? zoneColor : '#000000'}
          emissiveIntensity={bed.occupied ? 0.3 : 0}
          roughness={0.6}
        />
      </mesh>

      <mesh position={[0, 0.55, -1.6]}>
        <boxGeometry args={[1.9, 0.15, 0.5]} />
        <meshStandardMaterial color="#78909c" roughness={0.7} />
      </mesh>

      {[[-0.85, 0, 1.6], [0.85, 0, 1.6], [-0.85, 0, -1.6], [0.85, 0, -1.6]].map((p, i) => (
        <mesh key={i} position={[p[0], 0.1, p[2]]}>
          <cylinderGeometry args={[0.08, 0.08, 0.2, 12]} />
          <meshStandardMaterial color="#263238" />
        </mesh>
      ))}

      {bed.occupied && (
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[1.7, 0.25, 3.2]} />
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </mesh>
      )}

      {selected && (
        <mesh position={[0, 0.05, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[2.5, 2.8, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.8} />
        </mesh>
      )}

      {bed.occupied && bed.confirmLevel < 3 && (
        <mesh position={[0, 0.1, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[2.2, 2.4, 32]} />
          <meshBasicMaterial color="#ff9800" transparent opacity={0.7} />
        </mesh>
      )}

      {bed.occupied && bed.confirmLevel >= 3 && (
        <mesh position={[0, 0.1, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[2.2, 2.4, 32]} />
          <meshBasicMaterial color="#43a047" transparent opacity={0.8} />
        </mesh>
      )}

      <Billboard position={[0, 2, 0]}>
        <group>
          <mesh>
            <planeGeometry args={[2.2, 1.1]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.7} />
          </mesh>
          <Text position={[0, 0.35, 0.01]} fontSize={0.28} color={zoneColor} anchorX="center" anchorY="middle" fontWeight="bold">
            {bed.number}
          </Text>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.2}
            color={bed.occupied ? '#ffffff' : '#78909c'}
            anchorX="center"
            anchorY="middle"
          >
            {bed.occupied ? bed.patientName || '患者' : '空闲'}
          </Text>
          <Text
            position={[0, -0.3, 0.01]}
            fontSize={0.16}
            color={bed.confirmLevel >= 3 ? '#43a047' : bed.confirmLevel > 0 ? '#ff9800' : '#ff5252'}
            anchorX="center"
            anchorY="middle"
          >
            {bed.confirmLevel === 0 && '待确认'}
            {bed.confirmLevel === 1 && '医生已确认'}
            {bed.confirmLevel === 2 && '护士已确认'}
            {bed.confirmLevel >= 3 && '✓ 全部确认'}
          </Text>
        </group>
      </Billboard>
    </group>
  );
}

interface EmergencyDepartment3DProps {
  beds: Bed[];
  selectedBedId: string | null;
  onSelectBed: (id: string | null) => void;
}

export function EmergencyDepartment3D({ beds, selectedBedId, onSelectBed }: EmergencyDepartment3DProps) {
  const zones: BedZone[] = ['red', 'yellow', 'green'];

  const zoneBeds = useMemo(() => {
    const map: Record<BedZone, Bed[]> = { red: [], yellow: [], green: [] };
    beds.forEach((b) => map[b.zone].push(b));
    return map;
  }, [beds]);

  return (
    <Canvas shadows camera={{ position: [0, 22, 28], fov: 45 }} className="three-canvas">
      <color attach="background" args={['#08101e']} />
      <fog attach="fog" args={['#08101e', 30, 80]} />

      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 30, 10]} intensity={0.6} color="#aaccff" castShadow />
      <pointLight position={[-12, 8, 0]} color="#ff3344" intensity={1.2} distance={25} />
      <pointLight position={[0, 8, 0]} color="#ffcc33" intensity={1} distance={25} />
      <pointLight position={[12, 8, 0]} color="#33ff66" intensity={1.2} distance={25} />

      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 45]} />
        <meshStandardMaterial color="#0d1929" roughness={0.9} />
      </mesh>

      {zones.map((zone) => {
        const cfg = zoneConfig[zone];
        return (
          <group key={zone}>
            <mesh position={[cfg.offsetX, 0.02, 0]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[16, 30]} />
              <meshStandardMaterial color={cfg.color} transparent opacity={0.1} />
            </mesh>
            <mesh position={[cfg.offsetX, 0.03, -14.5]}>
              <boxGeometry args={[15, 0.15, 0.8]} />
              <meshStandardMaterial color={cfg.color} emissive={cfg.emissive} emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[cfg.offsetX, 0.03, 14.5]}>
              <boxGeometry args={[15, 0.15, 0.8]} />
              <meshStandardMaterial color={cfg.color} emissive={cfg.emissive} emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[cfg.offsetX - 8, 0.03, 0]}>
              <boxGeometry args={[0.8, 0.15, 30]} />
              <meshStandardMaterial color={cfg.color} emissive={cfg.emissive} emissiveIntensity={0.6} />
            </mesh>
            <mesh position={[cfg.offsetX + 8, 0.03, 0]}>
              <boxGeometry args={[0.8, 0.15, 30]} />
              <meshStandardMaterial color={cfg.color} emissive={cfg.emissive} emissiveIntensity={0.6} />
            </mesh>

            <Billboard position={[cfg.offsetX, 4, -13]}>
              <group>
                <mesh>
                  <planeGeometry args={[6, 1.5]} />
                  <meshBasicMaterial color={cfg.color} transparent opacity={0.85} />
                </mesh>
                <Text position={[0, 0, 0.01]} fontSize={0.7} color="#000000" anchorX="center" anchorY="middle" fontWeight="bold">
                  {cfg.name}
                </Text>
              </group>
            </Billboard>

            {zoneBeds[zone].map((bed, i) => {
              const cols = 2;
              const rows = Math.ceil(zoneBeds[zone].length / cols);
              const col = i % cols;
              const row = Math.floor(i / cols);
              const spacing = 4;
              const startX = cfg.offsetX - ((cols - 1) * spacing) / 2;
              const startZ = -((rows - 1) * spacing) / 2;
              const x = startX + col * spacing;
              const z = startZ + row * spacing;

              return (
                <Bed3D
                  key={bed.id}
                  bed={bed}
                  position={[x, 0, z]}
                  zoneColor={cfg.color}
                  selected={selectedBedId === bed.id}
                  onClick={() => onSelectBed(selectedBedId === bed.id ? null : bed.id)}
                />
              );
            })}
          </group>
        );
      })}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.8} height={300} intensity={0.7} />
      </EffectComposer>
    </Canvas>
  );
}
