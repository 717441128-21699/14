import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CityBuildingsProps {
  count?: number;
}

export function CityBuildings({ count = 120 }: CityBuildingsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const buildings = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      if (Math.abs(x) < 12 && Math.abs(z) < 12) continue;
      const w = 1.5 + Math.random() * 3;
      const d = 1.5 + Math.random() * 3;
      const h = 3 + Math.random() * 18;
      const color = new THREE.Color().setHSL(0.58 + Math.random() * 0.05, 0.3, 0.15 + Math.random() * 0.15);
      arr.push({ x, z, w, d, h, color });
    }
    return arr;
  }, [count]);

  useFrame(() => {
    if (!meshRef.current) return;
    buildings.forEach((b, i) => {
      dummy.position.set(b.x, b.h / 2, b.z);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, b.color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, buildings.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#1a2d4a" emissive="#0d1b2a" emissiveIntensity={0.2} roughness={0.7} />
    </instancedMesh>
  );
}
