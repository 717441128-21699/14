import { useState, useMemo } from 'react';
import { Users, AlertTriangle, MapPin, Ambulance, Play, Clock, Check, Map, X, PlayCircle, Zap, ShieldCheck, Navigation } from 'lucide-react';
import { TopNavbar } from '../components/ui/TopNavbar';
import { BottomStatsBar } from '../components/ui/BottomStatsBar';
import { BatchDispatch3D, type DispatchVehicle } from '../components/three/BatchDispatch3D';
import { useEmergencyStore } from '../store/useEmergencyStore';
import type { SeverityLevel } from '../../shared/types';

const severityOptions: { value: SeverityLevel; label: string; color: string; bg: string }[] = [
  { value: 1, label: '极危(红)', color: 'text-severity-red', bg: 'bg-severity-red/20 border-severity-red' },
  { value: 2, label: '危重(黄)', color: 'text-severity-yellow', bg: 'bg-severity-yellow/20 border-severity-yellow' },
  { value: 3, label: '急症(蓝)', color: 'text-severity-blue', bg: 'bg-severity-blue/20 border-severity-blue' },
  { value: 4, label: '轻症(绿)', color: 'text-severity-green', bg: 'bg-severity-green/20 border-severity-green' },
];

const PRESET_START_POSITIONS = [
  { x: -25, z: -15 },
  { x: -20, z: 20 },
  { x: 25, z: -18 },
  { x: 22, z: 15 },
  { x: -5, z: -25 },
  { x: 10, z: 25 },
];

export function BatchDispatch() {
  const events = useEmergencyStore((s) => s.events);
  const ambulances = useEmergencyStore((s) => s.ambulances);
  const triggerBatchDispatch = useEmergencyStore((s) => s.triggerBatchDispatch);

  const [showForm, setShowForm] = useState(false);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    lat: 39.9042,
    lng: 116.4074,
    x: 8,
    z: 5,
    casualtyCount: 10,
    severity: 1 as SeverityLevel,
    vehicleCount: 4,
  });

  const standbyAmbulances = ambulances.filter((a) => a.status === 'standby').length;
  const activeEvent = events.find((e) => e.id === activeEventId) || events.find((e) => e.status === 'active');

  const dispatchVehicles: DispatchVehicle[] = useMemo(() => {
    if (!activeEvent) {
      return ambulances.slice(0, 4).map((a, i) => ({
        id: a.id,
        number: a.number,
        startX: PRESET_START_POSITIONS[i]?.x || -20 + i * 10,
        startZ: PRESET_START_POSITIONS[i]?.z || (i % 2 === 0 ? -10 : 10),
        targetX: 8,
        targetZ: 5,
        progress: 0,
        speed: 0.006,
        phase: 'waiting' as const,
        offsetY: 0,
      }));
    }

    const assigned = ambulances.filter((a) => activeEvent.assignedAmbulances.includes(a.id));
    return assigned.map((a, i) => {
      const startPos = PRESET_START_POSITIONS[i] || { x: -20 + i * 8, z: (i % 2 === 0 ? -12 : 12) };
      let progress = 0;
      let phase: 'waiting' | 'moving' | 'arrived' = 'waiting';

      if (a.routeProgress !== undefined) {
        progress = a.routeProgress;
        phase = a.routeProgress >= 1 ? 'arrived' : 'moving';
      } else if (a.status === 'dispatch') {
        progress = Math.random() * 0.3;
        phase = 'moving';
      }

      return {
        id: a.id,
        number: a.number,
        startX: startPos.x,
        startZ: startPos.z,
        targetX: activeEvent.position.x,
        targetZ: activeEvent.position.z,
        progress,
        speed: 0.005 + Math.random() * 0.003,
        phase,
        offsetY: 0,
      };
    });
  }, [activeEvent, ambulances]);

  const targetPosition = useMemo(() => {
    if (activeEvent) return { x: activeEvent.position.x, z: activeEvent.position.z };
    return { x: formData.x, z: formData.z };
  }, [activeEvent, formData.x, formData.z]);

  const handleSubmit = () => {
    if (!formData.name || !formData.location) return;
    triggerBatchDispatch({
      name: formData.name,
      location: formData.location,
      position: { lat: formData.lat, lng: formData.lng, x: formData.x, z: formData.z },
      casualtyCount: formData.casualtyCount,
      severity: formData.severity,
    });
    setShowForm(false);
    setTimeout(() => {
      const latest = events[events.length];
      if (latest) setActiveEventId(latest.id);
    }, 100);
    setFormData({
      name: '',
      location: '',
      lat: 39.9042,
      lng: 116.4074,
      x: 8,
      z: 5,
      casualtyCount: 10,
      severity: 1,
      vehicleCount: 4,
    });
  };

  const simulateDispatch = () => {
    setShowForm(true);
    setFormData({
      name: '模拟重大事故演习',
      location: '市中心广场附近',
      lat: 39.9042,
      lng: 116.4074,
      x: 5 + (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 10,
      casualtyCount: 8 + Math.floor(Math.random() * 15),
      severity: Math.random() > 0.5 ? 1 : 2,
      vehicleCount: 4 + Math.floor(Math.random() * 3),
    });
  };

  const arrivedCount = dispatchVehicles.filter((v) => v.phase === 'arrived').length;
  const movingCount = dispatchVehicles.filter((v) => v.phase === 'moving').length;

  return (
    <div className="w-full h-full bg-med-bg relative flex flex-col">
      <TopNavbar />

      <div className="absolute inset-0 pt-16 pb-20 flex">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display font-bold text-xl text-med-text flex items-center gap-2">
                  <Users className="w-6 h-6 text-severity-yellow" />
                  大规模伤亡事件批量调度 · 3D实时协同
                </h1>
                <p className="text-med-muted text-xs mt-0.5">多救护车智能路径规划 · 自动碰撞避让 · 一键响应</p>
              </div>
              <div className="flex gap-2">
                <button onClick={simulateDispatch} className="btn-primary flex items-center gap-1.5 text-sm">
                  <PlayCircle className="w-4 h-4" />
                  模拟事件
                </button>
                <button onClick={() => setShowForm(true)} className="btn-danger flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  启动调度
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 pb-2 grid grid-cols-5 gap-2">
            <div className="data-card py-2 px-3">
              <div className="flex items-center gap-1.5 mb-0.5 text-xs text-med-muted">
                <Ambulance className="w-3.5 h-3.5 text-severity-green" />
                待命车辆
              </div>
              <div className="font-bold text-lg font-mono text-severity-green">{standbyAmbulances}</div>
            </div>
            <div className="data-card py-2 px-3 border-l-2 border-severity-yellow">
              <div className="flex items-center gap-1.5 mb-0.5 text-xs text-med-muted">
                <Navigation className="w-3.5 h-3.5 text-severity-yellow" />
                行驶中
              </div>
              <div className="font-bold text-lg font-mono text-severity-yellow">{movingCount}</div>
            </div>
            <div className="data-card py-2 px-3 border-l-2 border-severity-green">
              <div className="flex items-center gap-1.5 mb-0.5 text-xs text-med-muted">
                <Check className="w-3.5 h-3.5 text-severity-green" />
                已到达
              </div>
              <div className="font-bold text-lg font-mono text-severity-green">{arrivedCount}</div>
            </div>
            <div className="data-card py-2 px-3">
              <div className="flex items-center gap-1.5 mb-0.5 text-xs text-med-muted">
                <Zap className="w-3.5 h-3.5 text-tech-cyan" />
                活跃事件
              </div>
              <div className="font-bold text-lg font-mono text-tech-cyan">{events.filter((e) => e.status === 'active').length}</div>
            </div>
            <div className="data-card py-2 px-3">
              <div className="flex items-center gap-1.5 mb-0.5 text-xs text-med-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-med-muted" />
                累计伤亡
              </div>
              <div className="font-bold text-lg font-mono text-med-text">{events.reduce((s, e) => s + e.casualtyCount, 0)}</div>
            </div>
          </div>

          <div className="flex-1 min-h-0 relative mx-3 mb-3 rounded-xl overflow-hidden border border-med-border glow-border">
            <div className="absolute top-3 left-3 z-10 glass-panel px-3 py-1.5 text-xs text-med-muted flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-tech-cyan animate-pulse" />
              <span>智能避让系统运行中 · 多车协同调度</span>
            </div>
            <div className="absolute top-3 right-3 z-10 glass-panel px-3 py-1.5 text-xs">
              <span className="text-med-muted">目标坐标：</span>
              <span className="font-mono text-tech-cyan">({targetPosition.x.toFixed(1)}, {targetPosition.z.toFixed(1)})</span>
            </div>
            <BatchDispatch3D
              vehicles={dispatchVehicles}
              targetPosition={targetPosition}
              eventActive={!!activeEvent || movingCount > 0}
            />
          </div>
        </div>

        <div className="w-80 p-3 pl-0 flex flex-col gap-3 overflow-hidden">
          <div className="glass-panel glow-border p-4 flex-shrink-0">
            <h3 className="font-display font-bold text-med-text mb-3 flex items-center gap-2 pb-2 border-b border-med-border">
              <Map className="w-4 h-4 text-tech-cyan" />
              调度事件列表
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {events.length === 0 ? (
                <div className="text-center py-6 text-med-muted text-sm">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  暂无事件
                </div>
              ) : (
                events.map((evt) => {
                  const sevCfg = severityOptions.find((s) => s.value === evt.severity)!;
                  const isActive = activeEventId === evt.id;
                  return (
                    <button
                      key={evt.id}
                      onClick={() => setActiveEventId(isActive ? null : evt.id)}
                      className={`w-full text-left rounded-lg p-2.5 border transition-all ${
                        isActive
                          ? `${sevCfg.bg} border-2 scale-[1.02]`
                          : 'bg-black/20 border-med-border/40 hover:border-med-border'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`w-2 h-2 rounded-full ${evt.status === 'active' ? 'bg-severity-red animate-pulse' : 'bg-severity-green'}`} />
                            <span className="font-medium text-med-text text-sm truncate">{evt.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-med-muted">
                            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{evt.location}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span className={`severity-badge ${sevCfg.bg} ${sevCfg.color} border`}>{sevCfg.label}</span>
                            <span className="text-med-muted">{evt.casualtyCount}人</span>
                            <span className="text-tech-cyan font-mono">{evt.assignedAmbulances.length}车</span>
                          </div>
                        </div>
                        {isActive && <Check className="w-4 h-4 text-tech-cyan flex-shrink-0 mt-0.5" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="glass-panel p-4 flex-1 min-h-0 flex flex-col overflow-hidden">
            <h3 className="font-display font-bold text-med-text mb-3 flex items-center gap-2 pb-2 border-b border-med-border">
              <Ambulance className="w-4 h-4 text-tech-cyan" />
              调度车辆实时状态
              <span className="ml-auto text-xs font-mono text-tech-cyan">
                {arrivedCount}/{dispatchVehicles.length}
              </span>
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {dispatchVehicles.map((v, i) => {
                const colors = ['bg-[#00bcd4]', 'bg-[#ff9800]', 'bg-[#8bc34a]', 'bg-[#e91e63]', 'bg-[#9c27b0]', 'bg-[#ffeb3b]'];
                return (
                  <div key={v.id} className="bg-black/25 rounded-lg p-2.5 border border-med-border/30">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${colors[i % colors.length]}`} />
                      <span className="font-mono font-bold text-sm text-med-text">{v.number}</span>
                      <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        v.phase === 'arrived'
                          ? 'bg-severity-green/20 text-severity-green'
                          : v.phase === 'moving'
                          ? 'bg-severity-yellow/20 text-severity-yellow animate-pulse'
                          : 'bg-med-border/50 text-med-muted'
                      }`}>
                        {v.phase === 'arrived' ? '✓ 到达' : v.phase === 'moving' ? '行驶' : '待命'}
                      </span>
                    </div>
                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-200 ${colors[i % colors.length]}`}
                        style={{ width: `${Math.round(v.progress * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-med-muted mt-1 font-mono">
                      <span>起点 ({v.startX.toFixed(0)},{v.startZ.toFixed(0)})</span>
                      <span>{Math.round(v.progress * 100)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {(movingCount > 0 || dispatchVehicles.some((v) => v.phase === 'moving')) && (
              <div className="mt-3 p-2.5 bg-tech-cyan/5 border border-tech-cyan/30 rounded-lg">
                <div className="flex items-center gap-1.5 text-xs text-tech-cyan font-medium">
                  <Zap className="w-3.5 h-3.5 animate-pulse" />
                  自动避让系统运行
                </div>
                <div className="text-[10px] text-med-muted mt-0.5">
                  车辆间距检测：最小距离低于4m时自动减速避让
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="glass-panel glow-border w-[600px] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-severity-red/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-severity-red" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-severity-red">启动批量调度</h3>
                  <p className="text-xs text-med-muted">大规模伤亡事件应急响应 · 多车自动避让</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-med-muted" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-med-muted block mb-1.5">事件名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：朝阳区地铁事故"
                    className="w-full bg-black/30 border border-med-border rounded-lg px-3 py-2 text-med-text focus:border-tech-cyan outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-med-muted block mb-1.5">事件地点 *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="详细地址"
                    className="w-full bg-black/30 border border-med-border rounded-lg px-3 py-2 text-med-text focus:border-tech-cyan outline-none text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-med-muted block mb-1.5">伤亡人数</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.casualtyCount}
                    onChange={(e) => setFormData({ ...formData, casualtyCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-black/30 border border-med-border rounded-lg px-3 py-2 text-med-text focus:border-tech-cyan outline-none font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-med-muted block mb-1.5">调度车辆数</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={formData.vehicleCount}
                    onChange={(e) => setFormData({ ...formData, vehicleCount: Math.min(6, Math.max(1, parseInt(e.target.value) || 1)) })}
                    className="w-full bg-black/30 border border-med-border rounded-lg px-3 py-2 text-med-text focus:border-tech-cyan outline-none font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-med-muted block mb-1.5">目标坐标 (X, Z)</label>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      value={formData.x}
                      step={0.5}
                      onChange={(e) => setFormData({ ...formData, x: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-black/30 border border-med-border rounded-lg px-2 py-2 text-med-text focus:border-tech-cyan outline-none font-mono text-xs"
                    />
                    <input
                      type="number"
                      value={formData.z}
                      step={0.5}
                      onChange={(e) => setFormData({ ...formData, z: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-black/30 border border-med-border rounded-lg px-2 py-2 text-med-text focus:border-tech-cyan outline-none font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm text-med-muted block mb-2">事件严重等级</label>
                <div className="grid grid-cols-4 gap-2">
                  {severityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFormData({ ...formData, severity: opt.value })}
                      className={`px-2 py-2 rounded-lg border-2 text-xs font-medium transition-all ${
                        formData.severity === opt.value
                          ? `${opt.bg} ${opt.color} scale-105`
                          : 'border-med-border/50 text-med-muted hover:border-med-border'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-tech-cyan/5 border border-tech-cyan/30 rounded-lg p-3 text-xs text-tech-cyan/90 flex items-start gap-2">
                <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">智能避让调度说明：</div>
                  <div className="text-med-muted mt-1">
                    系统将自动匹配最近 {formData.vehicleCount} 辆救护车，生成差异化路径并实时检测车辆间距，低于阈值时自动减速避让，确保安全高效到达。
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-med-border text-med-muted hover:text-med-text hover:border-med-text/50 transition-colors text-sm">
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.name || !formData.location}
                  className="flex-1 btn-danger flex items-center justify-center gap-2 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Play className="w-4 h-4" />
                  一键派遣 {formData.vehicleCount} 辆救护车
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomStatsBar />
    </div>
  );
}
