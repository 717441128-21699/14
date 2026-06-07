import { useState } from 'react';
import { Building2, BedDouble, User, Clock, Check, AlertTriangle, ChevronRight, Stethoscope, Phone, Heart, Activity, ShieldAlert } from 'lucide-react';
import { TopNavbar } from '../components/ui/TopNavbar';
import { BottomStatsBar } from '../components/ui/BottomStatsBar';
import { EmergencyDepartment3D } from '../components/three/EmergencyDepartment3D';
import { useEmergencyStore } from '../store/useEmergencyStore';
import type { BedZone } from '../../shared/types';

const zoneConfig: Record<BedZone, { name: string; bg: string; border: string; text: string; desc: string }> = {
  red: { name: '抢救区', bg: 'bg-severity-red/10', border: 'border-severity-red', text: 'text-severity-red', desc: '危重患者抢救' },
  yellow: { name: '观察区', bg: 'bg-severity-yellow/10', border: 'border-severity-yellow', text: 'text-severity-yellow', desc: '急症患者观察' },
  green: { name: '诊疗区', bg: 'bg-severity-green/10', border: 'border-severity-green', text: 'text-severity-green', desc: '轻症患者诊疗' },
};

const confirmLevelNames = ['未确认', '医生确认', '护士确认', '主任确认'];

export function Emergency() {
  const hospitals = useEmergencyStore((s) => s.hospitals);
  const doctors = useEmergencyStore((s) => s.doctors);
  const alerts = useEmergencyStore((s) => s.alerts);
  const acknowledgeBed = useEmergencyStore((s) => s.acknowledgeBed);
  const acknowledgeAlert = useEmergencyStore((s) => s.acknowledgeAlert);
  const userName = useEmergencyStore((s) => s.userName) || '当前用户';
  const userRole = useEmergencyStore((s) => s.userRole);
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);

  const hospital = hospitals[0];
  if (!hospital) return null;

  const selectedBed = hospital.beds.find((b) => b.id === selectedBedId);

  const getNextConfirmLevel = (currentLevel: number): 1 | 2 | 3 | null => {
    if (currentLevel >= 3) return null;
    return (currentLevel + 1) as 1 | 2 | 3;
  };

  const canConfirm = (level: number): boolean => {
    if (userRole === 'doctor') return level === 1;
    if (userRole === 'director') return level <= 3;
    if (userRole === 'commission') return true;
    return false;
  };

  const zones: BedZone[] = ['red', 'yellow', 'green'];

  const totalBeds = hospital.beds.length;
  const occupiedBeds = hospital.beds.filter((b) => b.occupied).length;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="w-full h-full bg-med-bg relative flex flex-col">
      <TopNavbar />

      {unacknowledgedAlerts > 0 && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass-panel border-2 border-severity-red glow-border px-6 py-3 flex items-center gap-4 animate-pulse">
          <ShieldAlert className="w-6 h-6 text-severity-red animate-bounce" />
          <div>
            <div className="font-bold text-severity-red">急诊大屏预警推送</div>
            <div className="text-xs text-med-text">{unacknowledgedAlerts} 条生命体征异常 - 车内患者需紧急关注</div>
          </div>
          <button
            onClick={() => alerts.filter((a) => !a.acknowledged).forEach((a) => acknowledgeAlert(a.id))}
            className="btn-danger text-xs py-1.5 px-3 ml-2"
          >
            全部确认
          </button>
        </div>
      )}

      <div className="absolute inset-0 pt-16 pb-20 flex">
        <div className="flex-1 flex flex-col">
          <div className="px-4 pt-3 pb-2">
            <div className="grid grid-cols-4 gap-3">
              <div className="data-card py-2 px-3">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-tech-cyan" />
                  <span className="text-xs text-med-muted">医院</span>
                </div>
                <div className="font-bold text-med-text text-base">{hospital.name}</div>
              </div>
              <div className="data-card py-2 px-3">
                <div className="flex items-center gap-2 mb-1">
                  <BedDouble className="w-3.5 h-3.5 text-med-muted" />
                  <span className="text-xs text-med-muted">总床位</span>
                </div>
                <div className="font-bold text-xl text-med-text font-mono">{totalBeds} <span className="text-xs text-med-muted">张</span></div>
              </div>
              <div className="data-card border-l-4 border-severity-yellow py-2 px-3">
                <div className="flex items-center gap-2 mb-1">
                  <BedDouble className="w-3.5 h-3.5 text-severity-yellow" />
                  <span className="text-xs text-med-muted">已占用</span>
                </div>
                <div className="font-bold text-xl font-mono text-severity-yellow">{occupiedBeds} <span className="text-xs text-med-muted">张</span></div>
              </div>
              <div className={`data-card border-l-4 py-2 px-3 ${occupancyRate > 85 ? 'border-severity-red' : occupancyRate > 70 ? 'border-severity-yellow' : 'border-severity-green'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-3.5 h-3.5 text-tech-cyan" />
                  <span className="text-xs text-med-muted">床位使用率</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <div className={`font-bold text-xl font-mono ${occupancyRate > 85 ? 'text-severity-red' : occupancyRate > 70 ? 'text-severity-yellow' : 'text-severity-green'}`}>
                    {occupancyRate}
                  </div>
                  <span className="text-xs text-med-muted">%</span>
                </div>
                <div className="mt-1 h-1 bg-black/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${occupancyRate > 85 ? 'bg-severity-red' : occupancyRate > 70 ? 'bg-severity-yellow' : 'bg-severity-green'}`}
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 relative mx-3 mb-3 rounded-xl overflow-hidden border border-med-border glow-border">
            <div className="absolute top-3 left-3 z-10 glass-panel px-3 py-1.5 text-xs text-med-muted">
              🏥 急诊科3D床位视图 · 鼠标拖拽旋转 · 滚轮缩放
            </div>
            <EmergencyDepartment3D
              beds={hospital.beds}
              selectedBedId={selectedBedId}
              onSelectBed={setSelectedBedId}
            />
          </div>

          <div className="px-4 pb-2">
            <div className="grid grid-cols-3 gap-3">
              {zones.map((zone) => {
                const cfg = zoneConfig[zone];
                const zoneBeds = hospital.beds.filter((b) => b.zone === zone);
                const occupied = zoneBeds.filter((b) => b.occupied).length;
                const pendingConfirm = zoneBeds.filter((b) => b.occupied && b.confirmLevel < 3).length;

                return (
                  <div key={zone} className={`glass-panel border-2 ${cfg.border} ${cfg.bg} p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${cfg.text.replace('text-', 'bg-')}`} />
                        <span className={`font-bold ${cfg.text}`}>{cfg.name}</span>
                      </div>
                      <div className="text-xs text-med-muted">{cfg.desc}</div>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <div className="font-mono font-bold text-lg text-med-text">
                        {occupied}<span className="text-xs text-med-muted">/{zoneBeds.length}</span>
                      </div>
                      {pendingConfirm > 0 && (
                        <div className="text-xs text-severity-red flex items-center gap-1 bg-severity-red/10 px-2 py-0.5 rounded animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          {pendingConfirm} 待确认
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-80 p-3 pl-0 flex flex-col gap-3 overflow-hidden">
          {selectedBed ? (
            <div className="glass-panel glow-border p-4 flex-shrink-0">
              <h3 className="font-display font-bold text-lg text-med-text mb-4 flex items-center gap-2 pb-2 border-b border-med-border">
                <BedDouble className="w-5 h-5 text-tech-cyan" />
                床位 {selectedBed.number} - 详情
              </h3>

              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${zoneConfig[selectedBed.zone].bg} border ${zoneConfig[selectedBed.zone].border}`}>
                  <div className="text-xs text-med-muted mb-1">所属分区</div>
                  <div className={`font-bold ${zoneConfig[selectedBed.zone].text}`}>
                    {zoneConfig[selectedBed.zone].name}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-black/30">
                  <div className="text-xs text-med-muted mb-1">患者姓名</div>
                  <div className="font-bold text-med-text text-lg">{selectedBed.patientName || '待分配'}</div>
                </div>

                {selectedBed.occupied && (
                  <div className="pt-2 border-t border-med-border/50">
                    <div className="text-xs text-med-muted mb-3 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      三级确认流程
                    </div>
                    <div className="space-y-2">
                      {[
                        { level: 1, name: '急诊医生', who: selectedBed.confirmedBy.doctor, when: selectedBed.confirmTime.doctor },
                        { level: 2, name: '急诊护士', who: selectedBed.confirmedBy.nurse, when: selectedBed.confirmTime.nurse },
                        { level: 3, name: '科主任', who: selectedBed.confirmedBy.director, when: selectedBed.confirmTime.director },
                      ].map((step) => {
                        const done = selectedBed.confirmLevel >= step.level;
                        const isNext = selectedBed.confirmLevel + 1 === step.level;
                        return (
                          <div
                            key={step.level}
                            className={`flex items-center gap-3 p-2.5 rounded-lg ${
                              done
                                ? 'bg-severity-green/10 border border-severity-green/30'
                                : isNext
                                ? 'bg-tech-cyan/10 border border-tech-cyan/40'
                                : 'bg-black/20 border border-med-border/30'
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                done
                                  ? 'bg-severity-green text-white'
                                  : isNext
                                  ? 'bg-tech-cyan text-black animate-pulse'
                                  : 'bg-med-border text-med-muted'
                              }`}
                            >
                              {done ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium text-sm ${done ? 'text-severity-green' : 'text-med-text'}`}>
                                {step.name}接收确认
                              </div>
                              {step.who ? (
                                <div className="text-xs text-med-muted flex items-center gap-1 mt-0.5">
                                  <User className="w-3 h-3" />
                                  {step.who}
                                  <span className="mx-1">·</span>
                                  <Clock className="w-3 h-3" />
                                  {step.when}
                                </div>
                              ) : (
                                <div className="text-xs text-med-muted">等待确认...</div>
                              )}
                            </div>
                            {isNext && canConfirm(step.level) && (
                              <button
                                className="btn-primary text-xs py-1.5 px-3 flex-shrink-0"
                                onClick={() => acknowledgeBed(selectedBed.id, step.level as 1 | 2 | 3, userName)}
                              >
                                确认
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-6 text-center text-med-muted flex-shrink-0">
              <BedDouble className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">点击3D场景中的已占用床位</p>
              <p className="text-xs mt-1">查看患者详情并进行三级确认</p>
            </div>
          )}

          <div className="glass-panel p-4 flex-1 min-h-0 flex flex-col overflow-hidden">
            <h3 className="font-display font-bold text-med-text mb-3 flex items-center gap-2 pb-2 border-b border-med-border">
              <Stethoscope className="w-5 h-5 text-tech-cyan" />
              今日医生排班
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {doctors.map((doc) => (
                <div key={doc.id} className={`flex items-center gap-3 p-2.5 rounded-lg ${doc.onDuty ? 'bg-black/25' : 'opacity-40'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    doc.role === '主任' ? 'bg-severity-yellow/20 text-severity-yellow' :
                    doc.role === '医生' ? 'bg-tech-blue/20 text-tech-cyan' :
                    'bg-severity-green/20 text-severity-green'
                  }`}>
                    {doc.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-med-text text-sm">{doc.name}</span>
                      <span className="text-[10px] bg-med-panel px-1.5 py-0.5 rounded border border-med-border">{doc.role}</span>
                    </div>
                    <div className="text-xs text-med-muted truncate">{doc.department}</div>
                    <div className="text-xs text-med-muted flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      {doc.phone}
                    </div>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${doc.onDuty ? 'bg-severity-green animate-pulse' : 'bg-med-border'}`} />
                </div>
              ))}
            </div>
          </div>

          {unacknowledgedAlerts > 0 && (
            <div className="glass-panel border-2 border-severity-red p-3 flex-shrink-0 max-h-40 overflow-y-auto">
              <div className="text-xs text-severity-red font-bold mb-2 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 animate-pulse" />
                车内患者预警（急诊大屏推送）
              </div>
              <div className="space-y-1.5">
                {alerts.filter((a) => !a.acknowledged).slice(0, 3).map((a) => (
                  <div key={a.id} className="text-xs text-med-text bg-severity-red/10 p-2 rounded">
                    <span className="text-severity-red font-bold">{a.ambulanceNumber}</span>
                    <span className="text-med-muted mx-1">·</span>
                    {a.message}
                    <span className="text-med-muted ml-1">({a.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomStatsBar />
    </div>
  );
}
