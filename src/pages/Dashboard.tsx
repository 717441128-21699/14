import { City3DScene } from '../components/three/City3DScene';
import { CallListPanel } from '../components/ui/CallListPanel';
import { AmbulanceListPanel } from '../components/ui/AmbulanceListPanel';
import { AmbulanceDetailModal } from '../components/ui/AmbulanceDetailModal';
import { AlertPanel, AlertBadge } from '../components/ui/AlertPanel';
import { TopNavbar } from '../components/ui/TopNavbar';
import { BottomStatsBar } from '../components/ui/BottomStatsBar';

export function Dashboard() {
  return (
    <div className="w-full h-full bg-med-bg relative">
      <TopNavbar />
      <AlertBadge />

      <div className="absolute inset-0 pt-16 pb-20">
        <div className="w-full h-full relative">
          <City3DScene />

          <div className="absolute top-4 left-4 z-10 space-y-4">
            <CallListPanel />
          </div>

          <div className="absolute top-4 right-4 z-10 space-y-4">
            <AmbulanceListPanel />
            <AlertPanel />
          </div>
        </div>
      </div>

      <BottomStatsBar />
      <AmbulanceDetailModal />
    </div>
  );
}
