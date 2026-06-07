import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Ambulance } from '../../../shared/types';

interface AmbulanceModelProps {
  ambulance: Ambulance;
  selected: boolean;
  onClick: () => void;
}

export function AmbulanceModel({ ambulance, selected, onClick }: AmbulanceModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const sirenRef = useRef<THREE.Mesh>(null);

  const statusColor = ambulance.status === 'standby' ? '#43a047' : ambulance.status === 'dispatch' ? '#e53935' : '#fdd835';

  useFrame((state) => {
    if (groupRef.current) {
      if (selected) {
        groupRef.current.position.y = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      } else {
        groupRef.current.position.y = 0.3;
      }
    }
    if (sirenRef.current && ambulance.status !== 'standby') {
      const mat = sirenRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 10) * 0.5;
    }
    if (lightRef.current && ambulance.status !== 'standby') {
      lightRef.current.intensity = 0.8 + Math.sin(state.clock.elapsedTime * 10) * 0.6;
    }
  });

  const x = ambulance.position.x ?? 0;
  const z = ambulance.position.z ?? 0;

  return (
    <group
      ref={groupRef}
      position={[x, 0.3, z]}
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
      <mesh castShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[1.6, 0.8, 3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh castShadow position={[0, 1.1, -0.3]}>
        <boxGeometry args={[1.4, 0.6, 1.8]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh castShadow position={[0, 0.8, 0.5]}>
        <boxGeometry args={[1.5, 0.05, 0.05]} />
        <meshStandardMaterial color="#e53935" emissive="#e53935" emissiveIntensity={0.5} />
      </mesh>
      <mesh castShadow position={[0, 0.8, 0.8]}>
        <boxGeometry args={[0.05, 0.05, 0.6]} />
        <meshStandardMaterial color="#e53935" emissive="#e53935" emissiveIntensity={0.5} />
      </mesh>
      <mesh ref={sirenRef} castShadow position={[0, 1.6, 0.4]}>
        <cylinderGeometry args={[0.2, 0.2, 0.15, 16]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.6} />
      </mesh>
      <mesh castShadow position={[-0.6, 0.15, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh castShadow position={[0.6, 0.15, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh castShadow position={[-0.6, 0.15, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh castShadow position={[0.6, 0.15, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

      <pointLight ref={lightRef} color="#ff0000" intensity={1} distance={8} position={[0, 2.5, 0]} />

      {selected && (
        <mesh position={[0, -0.1, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[1.8, 2.2, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {ambulance.alertActive && (
        <mesh position={[0, -0.08, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[2.4, 2.8, 32]} />
          <meshBasicMaterial color="#e53935" transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}

      <Billboard position={[0, 2.8, 0]}>
        <Text fontSize={0.4} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          {ambulance.number}
        </Text>
      </Billboard>
      <Billboard position={[0, 2.3, 0]}>
        <mesh>
          <planeGeometry args={[1.5, 0.4]} />
          <meshBasicMaterial color={statusColor} transparent opacity={0.9} />
        </mesh>
        <Text fontSize={0.25} color="#000000" anchorX="center" anchorY="middle" fontWeight="bold">
          {ambulance.status === 'standby' ? '待命' : ambulance.status === 'dispatch' ? '出车' : '返程'}
        </Text>
      </Billboard>
    </group>
  );
}
