import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

interface EmergencyCenterProps {
  position?: [number, number, number];
}

export function EmergencyCenter({ position = [-12, 0, 0] }: EmergencyCenterProps) {
  const rotRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (rotRef.current) {
      rotRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 3, 0]}>
        <boxGeometry args={[6, 6, 5]} />
        <meshStandardMaterial color="#c62828" emissive="#2d0a0a" emissiveIntensity={0.2} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0, 6.5, 0]}>
        <coneGeometry args={[2.5, 2, 4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <group ref={rotRef} position={[0, 9, 0]}>
        <mesh>
          <torusGeometry args={[1.2, 0.1, 16, 32]} />
          <meshBasicMaterial color="#ff1744" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.1, 16, 32]} />
          <meshBasicMaterial color="#ff1744" />
        </mesh>
      </group>
      {Array.from({ length: 3 }).map((_, row) =>
        Array.from({ length: 4 }).map((_, col) => (
          <mesh key={`ec-${row}-${col}`} position={[-2 + col * 1.3, 1.5 + row * 1.8, 2.51]}>
            <planeGeometry args={[0.8, 1]} />
            <meshBasicMaterial color="#ffeb3b" />
          </mesh>
        ))
      )}
      <mesh position={[0, 3.5, 2.55]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 3.5, 2.56]}>
        <planeGeometry args={[0.4, 1.6]} />
        <meshBasicMaterial color="#e53935" />
      </mesh>
      <mesh position={[0, 3.5, 2.56]}>
        <planeGeometry args={[1.6, 0.4]} />
        <meshBasicMaterial color="#e53935" />
      </mesh>
      <Billboard position={[0, 11.5, 0]}>
        <Text fontSize={0.7} color="#ff1744" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#0a1628" fontWeight="bold">
          急救指挥中心
        </Text>
      </Billboard>
      <Billboard position={[0, 10.6, 0]}>
        <Text fontSize={0.4} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          120 Emergency Center
        </Text>
      </Billboard>
    </group>
  );
}
