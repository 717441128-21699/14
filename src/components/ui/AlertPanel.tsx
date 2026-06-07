import { AlertTriangle, Bell, Check, Heart, Activity, XCircle } from 'lucide-react';
import { useEmergencyStore } from '../../store/useEmergencyStore';

const alertTypeConfig: Record<string, { icon: typeof Heart; bg: string; border: string; text: string }> = {
  heartRate: { icon: Heart, bg: 'bg-severity-red/10', border: 'border-severity-red', text: 'text-severity-red' },
  spo2: { icon: Activity, bg: 'bg-severity-red/10', border: 'border-severity-red', text: 'text-severity-red' },
  critical: { icon: XCircle, bg: 'bg-severity-red/20', border: 'border-severity-red', text: 'text-severity-red' },
};

export function AlertPanel() {
  const alerts = useEmergencyStore((s) => s.alerts);
  const acknowledgeAlert = useEmergencyStore((s) => s.acknowledgeAlert);
  const unacknowledged = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="glass-panel w-80 max-h-[40vh] flex flex-col">
      <div className="px-4 py-3 border-b border-med-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-severity-red" />
          <span className="font-display font-bold text-med-text">预警通知</span>
        </div>
        {unacknowledged > 0 && (
          <span className="bg-severity-red text-white text-xs px-2 py-0.5 rounded-full animate-blink">
            {unacknowledged}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {alerts.length === 0 ? (
          <div className="text-med-muted text-center py-6 text-sm">
            <Check className="w-8 h-8 mx-auto mb-2 text-severity-green opacity-50" />
            暂无预警
          </div>
        ) : (
          alerts.map((alert) => {
            const cfg = alertTypeConfig[alert.type] || alertTypeConfig.critical;
            const Icon = cfg.icon;
            return (
              <div
                key={alert.id}
                className={`${cfg.bg} border ${cfg.border} rounded-lg p-3 ${!alert.acknowledged ? 'animate-pulse-slow' : 'opacity-60'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.text}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold text-sm ${cfg.text}`}>{alert.ambulanceNumber}</span>
                        <span className="text-xs text-med-muted">{alert.timestamp}</span>
                      </div>
                      <div className="text-sm text-med-text">{alert.message}</div>
                      <div className="text-xs text-med-muted mt-1">当前值: <span className={cfg.text}>{alert.value}</span></div>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <button
                      className={`p-1.5 rounded ${cfg.bg} hover:brightness-125 transition-all flex-shrink-0`}
                      onClick={() => acknowledgeAlert(alert.id)}
                      title="确认预警"
                    >
                      <Check className={`w-3.5 h-3.5 ${cfg.text}`} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function AlertBadge() {
  const alerts = useEmergencyStore((s) => s.alerts);
  const unacknowledged = alerts.filter((a) => !a.acknowledged).length;
  if (unacknowledged === 0) return null;

  return (
    <div className="fixed top-20 right-1/2 translate-x-1/2 z-40 glass-panel glow-border px-4 py-2 flex items-center gap-3 animate-bounce">
      <AlertTriangle className="w-5 h-5 text-severity-red animate-pulse" />
      <div>
        <div className="text-sm font-bold text-severity-red">{unacknowledged} 条紧急预警</div>
        <div className="text-xs text-med-muted">请及时处理</div>
      </div>
    </div>
  );
}
