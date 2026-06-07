import { Billboard, Text } from '@react-three/drei';
import type { Hospital } from '../../../shared/types';

interface HospitalModelProps {
  hospital: Hospital;
  onClick?: () => void;
}

export function HospitalModel({ hospital, onClick }: HospitalModelProps) {
  const x = hospital.position.x ?? 0;
  const z = hospital.position.z ?? 0;

  return (
    <group position={[x, 0, z]} onClick={onClick}>
      <mesh castShadow receiveShadow position={[0, 4, 0]}>
        <boxGeometry args={[8, 8, 6]} />
        <meshStandardMaterial color="#f0f0f0" emissive="#1a1a2a" emissiveIntensity={0.2} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 9, 0]}>
        <boxGeometry args={[6, 2, 4]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => (
          <mesh key={`w-${row}-${col}`} position={[-2.5 + col * 1, 1.5 + row * 1.8, 3.01]}>
            <planeGeometry args={[0.6, 0.8]} />
            <meshBasicMaterial color={Math.random() > 0.3 ? '#ffd54f' : '#263238'} />
          </mesh>
        ))
      )}
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => (
          <mesh key={`w2-${row}-${col}`} position={[-2.5 + col * 1, 1.5 + row * 1.8, -3.01]} rotation-y={Math.PI}>
            <planeGeometry args={[0.6, 0.8]} />
            <meshBasicMaterial color={Math.random() > 0.3 ? '#ffd54f' : '#263238'} />
          </mesh>
        ))
      )}
      <mesh position={[0, 6, 3.05]}>
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial color="#e53935" />
      </mesh>
      <mesh position={[0, 6, 3.06]}>
        <planeGeometry args={[0.3, 1.1]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 6, 3.06]}>
        <planeGeometry args={[1.1, 0.3]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[7, 7.5, 32]} />
        <meshBasicMaterial color="#2196f3" transparent opacity={0.6} />
      </mesh>

      <Billboard position={[0, 12, 0]}>
        <Text fontSize={0.8} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#0a1628" fontWeight="bold">
          {hospital.name}
        </Text>
      </Billboard>
      <Billboard position={[0, 10.8, 0]}>
        <Text fontSize={0.4} color="#00e5ff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#000000">
          急诊中心
        </Text>
      </Billboard>
    </group>
  );
}
