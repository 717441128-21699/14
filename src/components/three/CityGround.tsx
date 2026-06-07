import { useMemo } from 'react';
import * as THREE from 'three';

export function CityGround() {
  const gridTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 512; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 10);
    return tex;
  }, []);

  const roads = useMemo(() => {
    const roadGeoms = [];
    for (let i = -40; i <= 40; i += 20) {
      roadGeoms.push({ pos: [i, 0.02, 0], scale: [3, 1, 100] });
      roadGeoms.push({ pos: [0, 0.02, i], scale: [100, 1, 3] });
    }
    return roadGeoms;
  }, []);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial map={gridTexture} roughness={0.9} />
      </mesh>
      {roads.map((r, i) => (
        <mesh key={i} position={r.pos as [number, number, number]} scale={r.scale as [number, number, number]}>
          <boxGeometry args={[1, 0.05, 1]} />
          <meshStandardMaterial color="#1a2738" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}
