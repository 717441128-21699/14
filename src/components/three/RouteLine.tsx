import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Position } from '../../../shared/types';

interface RouteLineProps {
  points: Position[];
  color?: string;
}

export function RouteLine({ points, color = '#00e5ff' }: RouteLineProps) {
  const lineRef = useRef<THREE.Line>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const lineObject = useMemo(() => {
    const pts = points.map((p) => new THREE.Vector3(p.x ?? 0, 0.3, p.z ?? 0));
    const curve = new THREE.CatmullRomCurve3(pts);
    const samplePts = curve.getPoints(100);
    const geo = new THREE.BufferGeometry().setFromPoints(samplePts);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 });
    return new THREE.Line(geo, mat);
  }, [points, color]);

  const tubeGeometry = useMemo(() => {
    const pts = points.map((p) => new THREE.Vector3(p.x ?? 0, 0.3, p.z ?? 0));
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 100, 0.12, 8, false);
  }, [points]);

  useFrame((state) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <group>
      <mesh ref={glowRef} geometry={tubeGeometry}>
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      <primitive object={lineObject} ref={lineRef} />
    </group>
  );
}
