import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Ambulance } from '../../../shared/types';

interface AmbulanceModelProps {
  ambulance: Ambulance;
  selected: boolean;
  onClick: () => void;
}

export function AmbulanceModel({ ambulance, selected, onClick }: AmbulanceModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftSirenRef = useRef<THREE.Mesh>(null);
  const rightSirenRef = useRef<THREE.Mesh>(null);
  const beaconRef = useRef<THREE.Group>(null);
  const selectedRingRef = useRef<THREE.Mesh>(null);
  const alertRingRef = useRef<THREE.Mesh>(null);

  const statusConfig = useMemo(() => {
    switch (ambulance.status) {
      case 'standby':
        return { color: '#43a047', label: '待命', textColor: '#000000' };
      case 'dispatch':
        return { color: '#e53935', label: '出车中', textColor: '#ffffff' };
      case 'return':
        return { color: '#fdd835', label: '返程', textColor: '#000000' };
      default:
        return { color: '#78909c', label: '未知', textColor: '#ffffff' };
    }
  }, [ambulance.status]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (selectedRingRef.current) {
      selectedRingRef.current.rotation.y = t * 1.5;
      const scale = 1 + Math.sin(t * 3) * 0.1;
      selectedRingRef.current.scale.setScalar(scale);
      selectedRingRef.current.visible = selected;
    }

    if (alertRingRef.current) {
      alertRingRef.current.rotation.y = -t * 2;
      const pulse = ambulance.alertActive ? 1 + Math.sin(t * 6) * 0.2 : 0;
      alertRingRef.current.scale.setScalar(pulse);
      alertRingRef.current.visible = !!ambulance.alertActive;
      (alertRingRef.current.material as THREE.MeshBasicMaterial).opacity = ambulance.alertActive ? 0.6 + Math.sin(t * 6) * 0.3 : 0;
    }

    if (ambulance.status !== 'standby') {
      if (leftSirenRef.current) {
        const mat = leftSirenRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.3 + Math.max(0, Math.sin(t * 8)) * 1.2;
      }
      if (rightSirenRef.current) {
        const mat = rightSirenRef.current.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.3 + Math.max(0, Math.sin(t * 8 + Math.PI)) * 1.2;
      }
      if (beaconRef.current) {
        beaconRef.current.rotation.y = t * 4;
      }
    }

    if (groupRef.current) {
      if (selected) {
        groupRef.current.position.y = 0.02 + Math.sin(t * 2.5) * 0.08;
      } else {
        groupRef.current.position.y = 0.02;
      }
    }
  });

  const x = ambulance.position.x ?? 0;
  const z = ambulance.position.z ?? 0;

  return (
    <group
      ref={groupRef}
      position={[x, 0.02, z]}
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
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 0.15, 4.5]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
      </mesh>

      <mesh castShadow position={[0, 0.85, 0.1]}>
        <boxGeometry args={[2, 1.2, 2.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.1} />
      </mesh>

      <mesh castShadow position={[0, 1.55, -0.7]}>
        <boxGeometry args={[1.9, 0.3, 1.4]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.5} />
      </mesh>

      <mesh position={[0, 0.85, 1.41]}>
        <boxGeometry args={[1.9, 1.15, 0.02]} />
        <meshStandardMaterial color="#1e88e5" transparent opacity={0.3} metalness={0.9} roughness={0.1} />
      </mesh>

      <mesh position={[0.96, 0.85, -0.2]}>
        <boxGeometry args={[0.02, 0.9, 1.6]} />
        <meshStandardMaterial color="#1e88e5" transparent opacity={0.3} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-0.96, 0.85, -0.2]}>
        <boxGeometry args={[0.02, 0.9, 1.6]} />
        <meshStandardMaterial color="#1e88e5" transparent opacity={0.3} metalness={0.9} roughness={0.1} />
      </mesh>

      <mesh position={[0, 0.9, -0.2]}>
        <boxGeometry args={[1.95, 0.08, 0.2]} />
        <meshStandardMaterial color="#e53935" emissive="#e53935" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.7, -0.2]}>
        <boxGeometry args={[0.2, 0.45, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[0, 0.9, 1]}>
        <boxGeometry args={[1.95, 0.08, 0.2]} />
        <meshStandardMaterial color="#e53935" emissive="#e53935" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.7, 1]}>
        <boxGeometry args={[0.2, 0.45, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[0.91, 1.0, -0.3]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[1.5, 0.5]} />
        <meshStandardMaterial color="#e53935" emissive="#e53935" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0.91, 1.0, -0.3]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[0.1, 0.4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[-0.91, 1.0, -0.3]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[1.5, 0.5]} />
        <meshStandardMaterial color="#e53935" emissive="#e53935" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[-0.91, 1.0, -0.3]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[0.1, 0.4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[0, 0.95, -1.71]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshStandardMaterial color="#e53935" emissive="#e53935" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.95, -1.72]}>
        <planeGeometry args={[0.1, 0.65]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.95, -1.72]}>
        <planeGeometry args={[0.65, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh castShadow position={[-0.45, 1.85, 0.2]}>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh ref={leftSirenRef} castShadow position={[-0.45, 1.98, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.15, 16]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
      <mesh ref={rightSirenRef} castShadow position={[-0.45, 1.98, 0.4]}>
        <cylinderGeometry args={[0.15, 0.15, 0.15, 16]} />
        <meshStandardMaterial color="#0066ff" emissive="#0066ff" emissiveIntensity={0.5} />
      </mesh>

      <group ref={beaconRef} position={[0.4, 1.95, 0.2]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.25, 0.2, 8]} />
          <meshStandardMaterial color="#ffaa00" emissive="#ff6600" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.25, 0.1, 0]}>
          <boxGeometry args={[0.5, 0.05, 0.05]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={1.5} />
        </mesh>
      </group>

      {[[-0.85, 0.4, 1.5], [0.85, 0.4, 1.5], [-0.85, 0.4, -1.5], [0.85, 0.4, -1.5]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh castShadow rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.35, 0.35, 0.18, 24]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} position={[0, 0.09, 0]}>
            <torusGeometry args={[0.12, 0.02, 8, 24]} />
            <meshStandardMaterial color="#555555" />
          </mesh>
        </group>
      ))}

      <mesh ref={selectedRingRef} position={[0, 0.05, 0]} rotation-x={-Math.PI / 2}>
        <torusGeometry args={[2.5, 0.08, 16, 64]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.9} />
      </mesh>

      <mesh ref={alertRingRef} position={[0, 0.08, 0]} rotation-x={-Math.PI / 2}>
        <torusGeometry args={[3, 0.12, 16, 64]} />
        <meshBasicMaterial color="#ff1744" transparent opacity={0.8} />
      </mesh>

      <Billboard position={[0, 3.2, 0]}>
        <group>
          <mesh position={[0, 0.25, 0]}>
            <planeGeometry args={[2.5, 0.45]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.7} />
          </mesh>
          <Text
            position={[0, 0.25, 0.01]}
            fontSize={0.28}
            color="#00e5ff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {ambulance.number}
          </Text>

          <mesh position={[0, -0.15, 0]}>
            <planeGeometry args={[2.2, 0.4]} />
            <meshBasicMaterial color={statusConfig.color} transparent opacity={0.95} />
          </mesh>
          <Text
            position={[0, -0.15, 0.01]}
            fontSize={0.24}
            color={statusConfig.textColor}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {statusConfig.label}
          </Text>
        </group>
      </Billboard>

      {ambulance.patient && (
        <Billboard position={[0, 2.4, 0]}>
          <group>
            <mesh position={[0, 0.15, 0]}>
              <planeGeometry args={[2.4, 0.7]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.75} />
            </mesh>
            <Text position={[-0.75, 0.28, 0.01]} fontSize={0.14} color="#ff6b6b" anchorX="center" anchorY="middle" fontWeight="bold">
              ♥ HR
            </Text>
            <Text
              position={[-0.75, 0.02, 0.01]}
              fontSize={0.18}
              color={ambulance.patient.heartRate < 60 || ambulance.patient.heartRate > 100 ? '#ff1744' : '#43a047'}
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {ambulance.patient.heartRate}
            </Text>
            <Text position={[0.75, 0.28, 0.01]} fontSize={0.14} color="#00e5ff" anchorX="center" anchorY="middle" fontWeight="bold">
              SpO₂
            </Text>
            <Text
              position={[0.75, 0.02, 0.01]}
              fontSize={0.18}
              color={ambulance.patient.spo2 < 95 ? '#ff1744' : '#43a047'}
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {ambulance.patient.spo2}%
            </Text>
          </group>
        </Billboard>
      )}
    </group>
  );
}
