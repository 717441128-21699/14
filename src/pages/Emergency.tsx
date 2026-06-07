import { useState } from 'react';
import { Building2, BedDouble, User, Clock, Check, AlertTriangle, ChevronRight, Stethoscope } from 'lucide-react';
import { TopNavbar } from '../components/ui/TopNavbar';
import { BottomStatsBar } from '../components/ui/BottomStatsBar';
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
  const acknowledgeBed = useEmergencyStore((s) => s.acknowledgeBed);
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

  return (
    <div className="w-full h-full bg-med-bg relative">
      <TopNavbar />

      <div className="absolute inset-0 pt-16 pb-20 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="data-card">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-tech-cyan" />
                <span className="text-sm text-med-muted">医院</span>
              </div>
              <div className="font-bold text-xl text-med-text">{hospital.name}</div>
            </div>
            <div className="data-card">
              <div className="flex items-center gap-2 mb-2">
                <BedDouble className="w-4 h-4 text-med-muted" />
                <span className="text-sm text-med-muted">总床位</span>
              </div>
              <div className="font-bold text-xl text-med-text font-mono">{totalBeds} <span className="text-sm text-med-muted">张</span></div>
            </div>
            <div className="data-card border-l-4 border-severity-yellow">
              <div className="flex items-center gap-2 mb-2">
                <BedDouble className="w-4 h-4 text-severity-yellow" />
                <span className="text-sm text-med-muted">已占用</span>
              </div>
              <div className="font-bold text-xl font-mono text-severity-yellow">{occupiedBeds} <span className="text-sm text-med-muted">张</span></div>
            </div>
            <div className="data-card border-l-4 border-tech-cyan">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-tech-cyan" />
                <span className="text-sm text-med-muted">床位使用率</span>
              </div>
              <div className="flex items-end gap-2">
                <div className={`font-bold text-xl font-mono ${occupancyRate > 85 ? 'text-severity-red' : occupancyRate > 70 ? 'text-severity-yellow' : 'text-severity-green'}`}>
                  {occupancyRate}
                </div>
                <span className="text-sm text-med-muted mb-1">%</span>
              </div>
              <div className="mt-2 h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div
                  className={`h-full ${occupancyRate > 85 ? 'bg-severity-red' : occupancyRate > 70 ? 'bg-severity-yellow' : 'bg-severity-green'}`}
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              {zones.map((zone) => {
                const cfg = zoneConfig[zone];
                const zoneBeds = hospital.beds.filter((b) => b.zone === zone);
                const occupied = zoneBeds.filter((b) => b.occupied).length;

                return (
                  <div key={zone} className={`glass-panel ${cfg.bg} border-2 ${cfg.border}`}>
                    <div className="px-5 py-4 border-b border-med-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center`}>
                          <BedDouble className={`w-5 h-5 ${cfg.text}`} />
                        </div>
                        <div>
                          <h3 className={`font-display font-bold text-lg ${cfg.text}`}>{cfg.name}</h3>
                          <p className="text-xs text-med-muted">{cfg.desc}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-med-text">
                          {occupied} <span className="text-med-muted text-sm">/ {zoneBeds.length}</span>
                        </div>
                        <div className="text-xs text-med-muted">占用 / 总床位</div>
                      </div>
                    </div>
                    <div className="p-4 grid grid-cols-4 gap-3">
                      {zoneBeds.map((bed) => (
                        <button
                          key={bed.id}
                          onClick={() => bed.occupied && setSelectedBedId(bed.id)}
                          className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                            bed.occupied
                              ? `${cfg.bg} ${cfg.border} hover:scale-105 cursor-pointer ${selectedBedId === bed.id ? 'ring-2 ring-white/50 scale-105' : ''}`
                              : 'bg-black/20 border-med-border/30 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-bold font-mono ${bed.occupied ? cfg.text : 'text-med-muted'}`}>{bed.number}</span>
                            {bed.occupied && bed.confirmLevel < 3 && (
                              <AlertTriangle className="w-3.5 h-3.5 text-severity-yellow animate-pulse" />
                            )}
                            {bed.occupied && bed.confirmLevel >= 3 && (
                              <Check className="w-3.5 h-3.5 text-severity-green" />
                            )}
                          </div>
                          {bed.occupied ? (
                            <div>
                              <div className="text-sm text-med-text font-medium truncate">{bed.patientName || '患者'}</div>
                              <div className="text-xs text-med-muted mt-0.5">{confirmLevelNames[bed.confirmLevel]}</div>
                              <div className="flex gap-0.5 mt-2">
                                {[1, 2, 3].map((lv) => (
                                  <div
                                    key={lv}
                                    className={`h-1 flex-1 rounded-full ${bed.confirmLevel >= lv ? cfg.bg.replace('/10', '') : 'bg-med-border/30'}`}
                                    style={{ backgroundColor: bed.confirmLevel >= lv ? (zone === 'red' ? '#e53935' : zone === 'yellow' ? '#fdd835' : '#43a047') : undefined }}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-med-muted">空闲</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              {selectedBed ? (
                <div className="glass-panel glow-border p-5">
                  <h3 className="font-display font-bold text-lg text-med-text mb-4 flex items-center gap-2">
                    <BedDouble className="w-5 h-5 text-tech-cyan" />
                    床位 {selectedBed.number} - 患者详情
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-med-muted mb-1">患者姓名</div>
                      <div className="font-bold text-med-text text-lg">{selectedBed.patientName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-med-muted mb-1">分区</div>
                      <div className={`font-medium ${zoneConfig[selectedBed.zone].text}`}>
                        {zoneConfig[selectedBed.zone].name}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-med-border/50">
                      <div className="text-xs text-med-muted mb-3">三级确认流程</div>
                      <div className="space-y-2">
                        {[
                          { level: 1, name: '急救医生', who: selectedBed.confirmedBy.doctor, when: selectedBed.confirmTime.doctor },
                          { level: 2, name: '急诊护士', who: selectedBed.confirmedBy.nurse, when: selectedBed.confirmTime.nurse },
                          { level: 3, name: '科主任', who: selectedBed.confirmedBy.director, when: selectedBed.confirmTime.director },
                        ].map((step) => {
                          const done = selectedBed.confirmLevel >= step.level;
                          const isNext = selectedBed.confirmLevel + 1 === step.level;
                          return (
                            <div
                              key={step.level}
                              className={`flex items-center gap-3 p-3 rounded-lg ${
                                done ? 'bg-severity-green/10 border border-severity-green/30' : isNext ? 'bg-tech-cyan/10 border border-tech-cyan/30 animate-pulse' : 'bg-black/20 border border-med-border/30'
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  done ? 'bg-severity-green text-white' : isNext ? 'bg-tech-cyan text-black' : 'bg-med-border text-med-muted'
                                }`}
                              >
                                {done ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </div>
                              <div className="flex-1">
                                <div className={`font-medium text-sm ${done ? 'text-severity-green' : 'text-med-text'}`}>
                                  {step.name}确认
                                </div>
                                {step.who ? (
                                  <div className="text-xs text-med-muted">
                                    {step.who} · {step.when}
                                  </div>
                                ) : (
                                  <div className="text-xs text-med-muted">待确认</div>
                                )}
                              </div>
                              {isNext && canConfirm(step.level) && (
                                <button
                                  className="btn-primary text-xs py-1.5 px-3"
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
                  </div>
                </div>
              ) : (
                <div className="glass-panel p-8 text-center text-med-muted">
                  <BedDouble className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>点击已占用床位查看详情</p>
                </div>
              )}

              <div className="glass-panel p-5">
                <h3 className="font-display font-bold text-lg text-med-text mb-4 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-tech-cyan" />
                  今日医生排班
                </h3>
                <div className="space-y-2">
                  {doctors.map((doc) => (
                    <div key={doc.id} className={`flex items-center gap-3 p-2.5 rounded-lg ${doc.onDuty ? 'bg-black/20' : 'opacity-40'}`}>
                      <div className={`w-10 h-10 rounded-full bg-tech-blue/30 flex items-center justify-center font-bold text-sm ${doc.onDuty ? 'text-tech-cyan' : 'text-med-muted'}`}>
                        {doc.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-med-text text-sm">{doc.name}</span>
                          <span className="text-xs bg-med-panel px-1.5 py-0.5 rounded border border-med-border">{doc.role}</span>
                        </div>
                        <div className="text-xs text-med-muted truncate">{doc.department} · {doc.phone}</div>
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full ${doc.onDuty ? 'bg-severity-green animate-pulse' : 'bg-med-border'}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomStatsBar />
    </div>
  );
}
