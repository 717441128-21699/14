import { Ambulance, User, Heart, Activity, AlertTriangle } from 'lucide-react';
import { useEmergencyStore } from '../../store/useEmergencyStore';
import type { Ambulance as AmbulanceType } from '../../../shared/types';

const statusConfig: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  standby: { bg: 'bg-severity-green/20', text: 'text-severity-green', label: '待命', dot: 'bg-severity-green' },
  dispatch: { bg: 'bg-severity-red/20', text: 'text-severity-red', label: '出车中', dot: 'bg-severity-red animate-pulse' },
  return: { bg: 'bg-severity-yellow/20', text: 'text-severity-yellow', label: '返程', dot: 'bg-severity-yellow' },
};

interface AmbulanceCardProps {
  ambulance: AmbulanceType;
  selected: boolean;
}

export function AmbulanceCard({ ambulance, selected }: AmbulanceCardProps) {
  const setSelectedAmbulance = useEmergencyStore((s) => s.setSelectedAmbulance);
  const cfg = statusConfig[ambulance.status];

  return (
    <div
      className={`glass-panel p-3 cursor-pointer transition-all duration-200 ${
        selected ? 'glow-border scale-[1.02]' : 'hover:border-tech-cyan/50'
      } ${ambulance.alertActive ? 'border-severity-red animate-pulse' : ''}`}
      onClick={() => setSelectedAmbulance(ambulance.id)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Ambulance className={`w-4 h-4 ${cfg.text}`} />
          <span className="font-bold text-med-text font-mono text-sm">{ambulance.number}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <span className={`text-xs ${cfg.text} font-medium`}>{cfg.label}</span>
        </div>
      </div>

      <div className="text-xs text-med-muted mb-2 flex items-center gap-1">
        <User className="w-3 h-3" />
        <span>司机: {ambulance.driver}</span>
      </div>

      {ambulance.patient && (
        <div className="mt-2 pt-2 border-t border-med-border/50 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-med-muted">患者</span>
            <span className="text-med-text font-medium">{ambulance.patient.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/30 rounded p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Heart className="w-3 h-3 text-severity-red" />
                <span className="text-xs text-med-muted">心率</span>
              </div>
              <div
                className={`font-bold font-mono ${
                  ambulance.patient.heartRate < 60 || ambulance.patient.heartRate > 100
                    ? 'text-severity-red animate-pulse'
                    : 'text-severity-green'
                }`}
              >
                {ambulance.patient.heartRate} <span className="text-xs">bpm</span>
              </div>
            </div>
            <div className="bg-black/30 rounded p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="w-3 h-3 text-tech-cyan" />
                <span className="text-xs text-med-muted">血氧</span>
              </div>
              <div
                className={`font-bold font-mono ${
                  ambulance.patient.spo2 < 95 ? 'text-severity-red animate-pulse' : 'text-severity-green'
                }`}
              >
                {ambulance.patient.spo2} <span className="text-xs">%</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-med-muted bg-black/20 rounded px-2 py-1.5 line-clamp-2">
            {ambulance.patient.condition}
          </div>
          {ambulance.alertActive && (
            <div className="text-xs text-severity-red flex items-center gap-1 bg-severity-red/10 rounded px-2 py-1">
              <AlertTriangle className="w-3 h-3" />
              生命体征异常，请关注
            </div>
          )}
        </div>
      )}
      {ambulance.routeProgress !== undefined && ambulance.status !== 'standby' && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-med-muted mb-1">
            <span>路线进度</span>
            <span>{Math.round(ambulance.routeProgress * 100)}%</span>
          </div>
          <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-tech-blue to-tech-cyan transition-all duration-300"
              style={{ width: `${ambulance.routeProgress * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function AmbulanceListPanel() {
  const ambulances = useEmergencyStore((s) => s.ambulances);
  const selectedAmbulanceId = useEmergencyStore((s) => s.selectedAmbulanceId);

  const standby = ambulances.filter((a) => a.status === 'standby').length;
  const dispatch = ambulances.filter((a) => a.status === 'dispatch').length;
  const returning = ambulances.filter((a) => a.status === 'return').length;

  return (
    <div className="glass-panel w-80 max-h-[60vh] flex flex-col">
      <div className="px-4 py-3 border-b border-med-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Ambulance className="w-5 h-5 text-tech-cyan" />
            <span className="font-display font-bold text-med-text">救护车状态</span>
          </div>
          <span className="text-med-muted text-sm font-mono">{ambulances.length} 辆</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-severity-green/10 rounded px-2 py-1 text-center">
            <div className="text-severity-green font-bold text-base">{standby}</div>
            <div className="text-severity-green/70">待命</div>
          </div>
          <div className="bg-severity-red/10 rounded px-2 py-1 text-center">
            <div className="text-severity-red font-bold text-base">{dispatch}</div>
            <div className="text-severity-red/70">出车</div>
          </div>
          <div className="bg-severity-yellow/10 rounded px-2 py-1 text-center">
            <div className="text-severity-yellow font-bold text-base">{returning}</div>
            <div className="text-severity-yellow/70">返程</div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {ambulances.map((a) => (
          <AmbulanceCard key={a.id} ambulance={a} selected={selectedAmbulanceId === a.id} />
        ))}
      </div>
    </div>
  );
}
