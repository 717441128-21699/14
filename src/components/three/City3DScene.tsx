import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import { CityBuildings } from './CityBuildings';
import { CityGround } from './CityGround';
import { AmbulanceModel } from './AmbulanceModel';
import { HospitalModel } from './HospitalModel';
import { CallMarker } from './CallMarker';
import { RouteLine } from './RouteLine';
import { EmergencyCenter } from './EmergencyCenter';
import { useEffect } from 'react';

export function City3DScene() {
  const ambulances = useEmergencyStore((s) => s.ambulances);
  const calls = useEmergencyStore((s) => s.calls);
  const hospitals = useEmergencyStore((s) => s.hospitals);
  const selectedAmbulanceId = useEmergencyStore((s) => s.selectedAmbulanceId);
  const selectedCallId = useEmergencyStore((s) => s.selectedCallId);
  const setSelectedAmbulance = useEmergencyStore((s) => s.setSelectedAmbulance);
  const setSelectedCall = useEmergencyStore((s) => s.setSelectedCall);
  const moveAmbulances = useEmergencyStore((s) => s.moveAmbulances);

  useEffect(() => {
    const interval = setInterval(() => {
      moveAmbulances();
    }, 50);
    return () => clearInterval(interval);
  }, [moveAmbulances]);

  const pendingCalls = calls.filter((c) => c.status === 'pending' || c.status === 'assigned' || c.status === 'enroute');

  return (
    <Canvas
      shadows
      camera={{ position: [0, 60, 60], fov: 45 }}
      className="three-canvas"
      onPointerMissed={() => {
        setSelectedAmbulance(null);
        setSelectedCall(null);
      }}
    >
      <color attach="background" args={['#050d1a']} />
      <fog attach="fog" args={['#050d1a', 60, 180]} />

      <ambientLight intensity={0.25} />
      <directionalLight position={[30, 50, 30]} intensity={0.4} color="#88aaff" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[-12, 10, 0]} color="#ff5577" intensity={0.8} distance={30} />
      <pointLight position={[0, 10, 0]} color="#33aaff" intensity={0.6} distance={40} />

      <Stars radius={200} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

      <CityGround />
      <CityBuildings count={150} />
      <EmergencyCenter />

      {hospitals.map((h) => (
        <HospitalModel key={h.id} hospital={h} />
      ))}

      {pendingCalls.map((c) => (
        <CallMarker
          key={c.id}
          call={c}
          selected={selectedCallId === c.id}
          onClick={() => {
            setSelectedCall(c.id);
            setSelectedAmbulance(null);
          }}
        />
      ))}

      {ambulances.map((a) => (
        <AmbulanceModel
          key={a.id}
          ambulance={a}
          selected={selectedAmbulanceId === a.id}
          onClick={() => {
            setSelectedAmbulance(a.id);
            setSelectedCall(null);
          }}
        />
      ))}

      {ambulances.map(
        (a) =>
          a.route &&
          a.route.length > 1 && (
            <RouteLine
              key={`route-${a.id}`}
              points={a.route}
              color={a.status === 'dispatch' ? '#00e5ff' : a.status === 'return' ? '#fdd835' : '#43a047'}
            />
          )
      )}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={20}
        maxDistance={150}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0, 0]}
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={0.8} />
      </EffectComposer>
    </Canvas>
  );
}
