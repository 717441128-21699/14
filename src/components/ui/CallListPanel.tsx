import { Phone, AlertTriangle, MapPin, Clock, Ambulance } from 'lucide-react';
import type { Call120, Ambulance as AmbulanceType } from '../../../shared/types';
import { useEmergencyStore, findBestAmbulance } from '../../store/useEmergencyStore';

const severityConfig: Record<number, { bg: string; text: string; label: string; border: string }> = {
  1: { bg: 'bg-severity-red/20', text: 'text-severity-red', label: '极危(红)', border: 'border-severity-red' },
  2: { bg: 'bg-severity-yellow/20', text: 'text-severity-yellow', label: '危重(黄)', border: 'border-severity-yellow' },
  3: { bg: 'bg-severity-blue/20', text: 'text-severity-blue', label: '急症(蓝)', border: 'border-severity-blue' },
  4: { bg: 'bg-severity-green/20', text: 'text-severity-green', label: '轻症(绿)', border: 'border-severity-green' },
};

const statusLabels: Record<string, string> = {
  pending: '待派车',
  assigned: '已派车',
  enroute: '赶往现场',
  arrived: '已到达',
  completed: '已完成',
};

interface CallCardProps {
  call: Call120;
  selected: boolean;
}

export function CallCard({ call, selected }: CallCardProps) {
  const assignAmbulance = useEmergencyStore((s) => s.assignAmbulance);
  const setSelectedCall = useEmergencyStore((s) => s.setSelectedCall);
  const ambulances = useEmergencyStore((s) => s.ambulances);
  const userRole = useEmergencyStore((s) => s.userRole);

  const cfg = severityConfig[call.severity];
  const bestAmb = call.status === 'pending' ? findBestAmbulance(ambulances, call.position, call.severity) : null;

  const handleAssign = () => {
    if (bestAmb) {
      assignAmbulance(call.id, bestAmb.id);
    }
  };

  return (
    <div
      className={`glass-panel p-3 cursor-pointer transition-all duration-200 border-l-4 ${cfg.border} ${
        selected ? 'glow-border scale-[1.02]' : 'hover:border-tech-cyan/50'
      }`}
      onClick={() => setSelectedCall(call.id)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Phone className={`w-4 h-4 ${cfg.text}`} />
          <span className="font-bold text-med-text">{call.patientName}</span>
          <span className={`severity-badge ${cfg.bg} ${cfg.text} border ${cfg.border}`}>{cfg.label}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-med-muted">
          <Clock className="w-3 h-3" />
          <span>{call.callTime}</span>
        </div>
      </div>
      <div className="text-sm text-med-muted mb-2 flex items-start gap-1">
        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
        <span className="line-clamp-2">{call.address}</span>
      </div>
      <div className="text-xs text-med-text/80 mb-3 bg-black/20 rounded px-2 py-1.5">{call.description}</div>
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded ${cfg.bg} ${cfg.text}`}>{statusLabels[call.status]}</span>
        {call.status === 'pending' && bestAmb && (userRole === 'dispatcher' || userRole === 'director') && (
          <button
            className="btn-primary text-xs py-1 px-3 flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              handleAssign();
            }}
          >
            <Ambulance className="w-3 h-3" />
            派车 {bestAmb.number}
          </button>
        )}
        {!bestAmb && call.status === 'pending' && (
          <span className="text-xs text-severity-red flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            无可用车辆
          </span>
        )}
      </div>
      {call.assignedAmbulanceId && (
        <div className="mt-2 pt-2 border-t border-med-border/50 text-xs text-tech-cyan flex items-center gap-1">
          <Ambulance className="w-3 h-3" />
          {ambulances.find((a: AmbulanceType) => a.id === call.assignedAmbulanceId)?.number || '已派车'}
          {call.responseTime ? ` · 响应${call.responseTime}分钟` : ''}
        </div>
      )}
    </div>
  );
}

export function CallListPanel() {
  const calls = useEmergencyStore((s) => s.calls);
  const selectedCallId = useEmergencyStore((s) => s.selectedCallId);
  const userRole = useEmergencyStore((s) => s.userRole);

  const canView = userRole === 'dispatcher' || userRole === 'director' || userRole === 'commission';
  if (!canView) return null;

  const sorted = [...calls].sort((a, b) => {
    const order: Record<string, number> = { pending: 0, assigned: 1, enroute: 2, arrived: 3, completed: 4 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return a.severity - b.severity;
  });

  const pending = calls.filter((c) => c.status === 'pending').length;

  return (
    <div className="glass-panel w-80 max-h-[60vh] flex flex-col">
      <div className="px-4 py-3 border-b border-med-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-tech-cyan" />
          <span className="font-display font-bold text-med-text">120 呼叫队列</span>
        </div>
        {pending > 0 && (
          <span className="bg-severity-red text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
            {pending} 待处理
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sorted.length === 0 ? (
          <div className="text-med-muted text-center py-8 text-sm">暂无呼叫</div>
        ) : (
          sorted.map((c) => <CallCard key={c.id} call={c} selected={selectedCallId === c.id} />)
        )}
      </div>
    </div>
  );
}
