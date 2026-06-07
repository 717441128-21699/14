import { useEffect, useState } from 'react';
import { Ambulance, Phone, Clock, Activity, TrendingUp, Calendar } from 'lucide-react';
import { useEmergencyStore } from '../../store/useEmergencyStore';

export function BottomStatsBar() {
  const [now, setNow] = useState(new Date());
  const ambulances = useEmergencyStore((s) => s.ambulances);
  const calls = useEmergencyStore((s) => s.calls);
  const dailyStats = useEmergencyStore((s) => s.dailyStats);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeDispatches = ambulances.filter((a) => a.status !== 'standby').length;
  const pendingCalls = calls.filter((c) => c.status === 'pending').length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 glass-panel border-t border-med-border">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 data-card py-2 px-4">
            <div className="w-8 h-8 rounded bg-severity-green/20 flex items-center justify-center">
              <Ambulance className="w-4 h-4 text-severity-green" />
            </div>
            <div>
              <div className="text-xs text-med-muted">在线救护车</div>
              <div className="font-bold font-mono text-med-text">
                {ambulances.length} <span className="text-sm text-med-muted">辆</span>
                <span className="text-severity-red ml-2 text-sm">出车 {activeDispatches}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 data-card py-2 px-4">
            <div className="w-8 h-8 rounded bg-severity-red/20 flex items-center justify-center">
              <Phone className="w-4 h-4 text-severity-red" />
            </div>
            <div>
              <div className="text-xs text-med-muted">今日呼叫</div>
              <div className="font-bold font-mono text-med-text">
                {dailyStats.totalCalls} <span className="text-sm text-med-muted">起</span>
                {pendingCalls > 0 && (
                  <span className="text-severity-red ml-2 text-sm animate-pulse">待派 {pendingCalls}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 data-card py-2 px-4">
            <div className="w-8 h-8 rounded bg-tech-cyan/20 flex items-center justify-center">
              <Clock className="w-4 h-4 text-tech-cyan" />
            </div>
            <div>
              <div className="text-xs text-med-muted">平均响应时间</div>
              <div className="font-bold font-mono text-med-text">
                {dailyStats.avgResponseTime} <span className="text-sm text-med-muted">分钟</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 data-card py-2 px-4">
            <div className="w-8 h-8 rounded bg-severity-yellow/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-severity-yellow" />
            </div>
            <div>
              <div className="text-xs text-med-muted">今日出车</div>
              <div className="font-bold font-mono text-med-text">
                {dailyStats.totalDispatches} <span className="text-sm text-med-muted">次</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-med-muted">
            <Activity className="w-4 h-4 text-severity-green animate-pulse" />
            <span className="text-sm">系统运行正常</span>
          </div>
          <div className="h-6 w-px bg-med-border" />
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-med-muted" />
            <span className="font-mono text-med-text text-sm">
              {now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })}
            </span>
            <span className="font-mono text-tech-cyan text-sm font-bold">
              {now.toLocaleTimeString('zh-CN', { hour12: false })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
