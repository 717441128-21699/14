import { useState } from 'react';
import { Users, AlertTriangle, MapPin, Ambulance, Play, Clock, Check, Map, X } from 'lucide-react';
import { TopNavbar } from '../components/ui/TopNavbar';
import { BottomStatsBar } from '../components/ui/BottomStatsBar';
import { useEmergencyStore } from '../store/useEmergencyStore';
import type { SeverityLevel } from '../../shared/types';

const severityOptions: { value: SeverityLevel; label: string; color: string; bg: string }[] = [
  { value: 1, label: '极危(红)', color: 'text-severity-red', bg: 'bg-severity-red/20 border-severity-red' },
  { value: 2, label: '危重(黄)', color: 'text-severity-yellow', bg: 'bg-severity-yellow/20 border-severity-yellow' },
  { value: 3, label: '急症(蓝)', color: 'text-severity-blue', bg: 'bg-severity-blue/20 border-severity-blue' },
  { value: 4, label: '轻症(绿)', color: 'text-severity-green', bg: 'bg-severity-green/20 border-severity-green' },
];

export function BatchDispatch() {
  const events = useEmergencyStore((s) => s.events);
  const ambulances = useEmergencyStore((s) => s.ambulances);
  const triggerBatchDispatch = useEmergencyStore((s) => s.triggerBatchDispatch);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    lat: 39.9042,
    lng: 116.4074,
    x: 15,
    z: 8,
    casualtyCount: 10,
    severity: 1 as SeverityLevel,
  });

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
    setFormData({
      name: '',
      location: '',
      lat: 39.9042,
      lng: 116.4074,
      x: 15,
      z: 8,
      casualtyCount: 10,
      severity: 1,
    });
  };

  const standbyAmbulances = ambulances.filter((a) => a.status === 'standby').length;

  return (
    <div className="w-full h-full bg-med-bg relative">
      <TopNavbar />

      <div className="absolute inset-0 pt-16 pb-20 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-2xl text-med-text flex items-center gap-2">
                <Users className="w-7 h-7 text-severity-yellow" />
                大规模伤亡事件批量调度
              </h1>
              <p className="text-med-muted text-sm mt-1">一键启动多救护车协同调度，应对重大突发公共事件</p>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-danger flex items-center gap-2 text-base px-5 py-2.5">
              <AlertTriangle className="w-5 h-5" />
              启动批量调度
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="data-card">
              <div className="flex items-center gap-2 mb-2">
                <Ambulance className="w-4 h-4 text-severity-green" />
                <span className="text-sm text-med-muted">可用救护车</span>
              </div>
              <div className="font-bold text-2xl font-mono text-severity-green">{standbyAmbulances}</div>
            </div>
            <div className="data-card border-l-4 border-severity-yellow">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-severity-yellow" />
                <span className="text-sm text-med-muted">进行中事件</span>
              </div>
              <div className="font-bold text-2xl font-mono text-severity-yellow">
                {events.filter((e) => e.status === 'active').length}
              </div>
            </div>
            <div className="data-card">
              <div className="flex items-center gap-2 mb-2">
                <Ambulance className="w-4 h-4 text-tech-cyan" />
                <span className="text-sm text-med-muted">出动救护车</span>
              </div>
              <div className="font-bold text-2xl font-mono text-tech-cyan">
                {events.reduce((sum, e) => sum + e.assignedAmbulances.length, 0)}
              </div>
            </div>
            <div className="data-card">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-med-muted" />
                <span className="text-sm text-med-muted">累计伤亡人数</span>
              </div>
              <div className="font-bold text-2xl font-mono text-med-text">
                {events.reduce((sum, e) => sum + e.casualtyCount, 0)}
              </div>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h2 className="font-display font-bold text-lg text-med-text mb-4 flex items-center gap-2">
              <Map className="w-5 h-5 text-tech-cyan" />
              事件列表
            </h2>

            {events.length === 0 ? (
              <div className="text-center py-16 text-med-muted">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">暂无进行中的批量调度事件</p>
                <p className="text-sm mt-1">点击右上角"启动批量调度"创建新事件</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((evt) => {
                  const sevCfg = severityOptions.find((s) => s.value === evt.severity)!;
                  const assignedAmbs = ambulances.filter((a) => evt.assignedAmbulances.includes(a.id));
                  return (
                    <div key={evt.id} className={`rounded-xl border-2 p-5 ${sevCfg.bg}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-black/30 flex items-center justify-center`}>
                            <AlertTriangle className={`w-6 h-6 ${sevCfg.color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-xl text-med-text">{evt.name}</h3>
                              <span className={`severity-badge border ${sevCfg.bg} ${sevCfg.color}`}>{sevCfg.label}</span>
                              <span className="text-xs bg-severity-red/20 text-severity-red px-2 py-0.5 rounded border border-severity-red/50 animate-pulse">
                                进行中
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-med-muted">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {evt.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                伤亡 {evt.casualtyCount} 人
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {evt.startTime} 启动
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-med-muted mb-1">已派遣救护车</div>
                          <div className="font-bold text-3xl font-mono text-tech-cyan">{evt.assignedAmbulances.length}</div>
                        </div>
                      </div>

                      <div className="bg-black/30 rounded-lg p-4">
                        <div className="text-xs text-med-muted mb-2">调度车辆状态</div>
                        <div className="flex flex-wrap gap-2">
                          {assignedAmbs.length === 0 ? (
                            <div className="text-sm text-med-muted">车辆派遣中...</div>
                          ) : (
                            assignedAmbs.map((a) => (
                              <div key={a.id} className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-2">
                                <Ambulance className="w-4 h-4 text-tech-cyan" />
                                <span className="font-mono text-sm text-med-text">{a.number}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  a.status === 'dispatch' ? 'bg-severity-red/30 text-severity-red' : 'bg-severity-yellow/30 text-severity-yellow'
                                }`}>
                                  {a.status === 'dispatch' ? '赶赴现场' : '返程'}
                                </span>
                                {a.routeProgress !== undefined && (
                                  <span className="text-xs font-mono text-tech-cyan">
                                    {Math.round(a.routeProgress * 100)}%
                                  </span>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="glass-panel glow-border w-[560px] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-severity-red/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-severity-red" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-severity-red">启动批量调度</h3>
                  <p className="text-xs text-med-muted">大规模伤亡事件应急响应</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5 text-med-muted" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-med-muted block mb-1.5">事件名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：朝阳区地铁事故"
                  className="w-full bg-black/30 border border-med-border rounded-lg px-3 py-2 text-med-text focus:border-tech-cyan outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-med-muted block mb-1.5">事件地点 *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="详细地址"
                  className="w-full bg-black/30 border border-med-border rounded-lg px-3 py-2 text-med-text focus:border-tech-cyan outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-med-muted block mb-1.5">伤亡人数</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.casualtyCount}
                    onChange={(e) => setFormData({ ...formData, casualtyCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-black/30 border border-med-border rounded-lg px-3 py-2 text-med-text focus:border-tech-cyan outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-sm text-med-muted block mb-1.5">事件坐标 X / Z</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.x}
                      onChange={(e) => setFormData({ ...formData, x: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-black/30 border border-med-border rounded-lg px-2 py-2 text-med-text focus:border-tech-cyan outline-none font-mono text-sm"
                      placeholder="X"
                    />
                    <input
                      type="number"
                      value={formData.z}
                      onChange={(e) => setFormData({ ...formData, z: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-black/30 border border-med-border rounded-lg px-2 py-2 text-med-text focus:border-tech-cyan outline-none font-mono text-sm"
                      placeholder="Z"
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
                      className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
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

              <div className="bg-severity-red/10 border border-severity-red/30 rounded-lg p-3 text-xs text-severity-red/80 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>批量调度将自动匹配最近可用的多辆救护车，同时规划多车路径并自动避让，确认后将立即执行。</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-med-border text-med-muted hover:text-med-text hover:border-med-text/50 transition-colors">
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.name || !formData.location}
                  className="flex-1 btn-danger flex items-center justify-center gap-2 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  一键启动调度
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
