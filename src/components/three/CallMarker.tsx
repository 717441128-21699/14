import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Call120 } from '../../../shared/types';

interface CallMarkerProps {
  call: Call120;
  selected: boolean;
  onClick: () => void;
}

const severityColors: Record<number, string> = {
  1: '#e53935',
  2: '#fdd835',
  3: '#1e88e5',
  4: '#43a047',
};

const severityLabels: Record<number, string> = {
  1: '红',
  2: '黄',
  3: '蓝',
  4: '绿',
};

export function CallMarker({ call, selected, onClick }: CallMarkerProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const color = severityColors[call.severity];

  useFrame((state) => {
    if (ringRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      ringRef.current.scale.set(s, s, s);
    }
    if (pulseRef.current) {
      const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
      const t = (state.clock.elapsedTime % 2) / 2;
      pulseRef.current.scale.setScalar(1 + t * 3);
      mat.opacity = 1 - t;
    }
  });

  const x = call.position.x ?? 0;
  const z = call.position.z ?? 0;

  return (
    <group
      position={[x, 0, z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <mesh ref={pulseRef} rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.8, 2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ringRef} rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.2, 1.5, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.2, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
      {selected && (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0]}>
          <ringGeometry args={[2.2, 2.5, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}
      <Billboard position={[0, 2.5, 0]}>
        <Text fontSize={0.6} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#000000" fontWeight="bold">
          {severityLabels[call.severity]}
        </Text>
      </Billboard>
      <Billboard position={[0, 3.3, 0]}>
        <Text fontSize={0.35} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="#000000" maxWidth={8}>
          {call.patientName}
        </Text>
      </Billboard>
    </group>
  );
}
