import { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { X, Heart, Activity, User, Clock, AlertTriangle } from 'lucide-react';
import { useEmergencyStore } from '../../store/useEmergencyStore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export function AmbulanceDetailModal() {
  const selectedAmbulanceId = useEmergencyStore((s) => s.selectedAmbulanceId);
  const setSelectedAmbulance = useEmergencyStore((s) => s.setSelectedAmbulance);
  const ambulance = useEmergencyStore((s) => s.ambulances.find((a) => a.id === selectedAmbulanceId));

  const chartData = useMemo(() => {
    if (!ambulance?.patient) return null;
    const history = ambulance.patient.history;
    if (history.length === 0) return null;

    return {
      labels: history.map((h) => h.time),
      datasets: [
        {
          label: '心率 (bpm)',
          data: history.map((h) => h.heartRate),
          borderColor: '#e53935',
          backgroundColor: 'rgba(229, 57, 53, 0.1)',
          yAxisID: 'y',
          tension: 0.4,
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 5,
        },
        {
          label: '血氧 (%)',
          data: history.map((h) => h.spo2),
          borderColor: '#00e5ff',
          backgroundColor: 'rgba(0, 229, 255, 0.1)',
          yAxisID: 'y1',
          tension: 0.4,
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [ambulance]);

  const chartOptions = {
    responsive: true,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: '#e0e8f0', usePointStyle: true, padding: 20 },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 33, 56, 0.95)',
        titleColor: '#e0e8f0',
        bodyColor: '#e0e8f0',
        borderColor: '#1e3a5f',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(30, 58, 95, 0.3)' },
        ticks: { color: '#78909c', maxTicksLimit: 10 },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: '心率 (bpm)', color: '#e53935' },
        grid: { color: 'rgba(30, 58, 95, 0.3)' },
        ticks: { color: '#78909c' },
        min: 40,
        max: 160,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: '血氧 (%)', color: '#00e5ff' },
        grid: { drawOnChartArea: false },
        ticks: { color: '#78909c' },
        min: 80,
        max: 100,
      },
    },
  };

  if (!ambulance) return null;

  const patient = ambulance.patient;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setSelectedAmbulance(null)}>
      <div className="glass-panel glow-border w-[700px] max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-med-border flex items-center justify-between bg-gradient-to-r from-tech-blue/20 to-tech-cyan/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-tech-blue/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-tech-cyan" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-med-text">{ambulance.number} 详细信息</h3>
              <p className="text-xs text-med-muted">司机: {ambulance.driver} | 医护: {ambulance.crew.join('、')}</p>
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" onClick={() => setSelectedAmbulance(null)}>
            <X className="w-5 h-5 text-med-muted" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {patient ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="data-card">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-med-muted" />
                    <span className="text-sm text-med-muted">患者信息</span>
                  </div>
                  <div className="font-bold text-med-text text-lg">{patient.name}</div>
                  <div className="text-xs text-med-muted">{patient.gender} · {patient.age}岁</div>
                </div>
                <div className="data-card border-l-4 border-severity-red">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-severity-red" />
                    <span className="text-sm text-med-muted">实时心率</span>
                  </div>
                  <div className={`font-bold text-2xl font-mono ${patient.heartRate < 60 || patient.heartRate > 100 ? 'text-severity-red animate-pulse' : 'text-severity-green'}`}>
                    {patient.heartRate} <span className="text-sm">bpm</span>
                  </div>
                  <div className="text-xs text-med-muted">正常: 60-100</div>
                </div>
                <div className="data-card border-l-4 border-tech-cyan">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-tech-cyan" />
                    <span className="text-sm text-med-muted">血氧饱和度</span>
                  </div>
                  <div className={`font-bold text-2xl font-mono ${patient.spo2 < 95 ? 'text-severity-red animate-pulse' : 'text-severity-green'}`}>
                    {patient.spo2} <span className="text-sm">%</span>
                  </div>
                  <div className="text-xs text-med-muted">正常: 95-100</div>
                </div>
              </div>

              {ambulance.alertActive && (
                <div className="bg-severity-red/10 border border-severity-red/50 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-severity-red flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-severity-red">生命体征异常预警</div>
                    <div className="text-sm text-severity-red/80">患者心率/血氧超出正常范围，请立即关注并准备急救措施</div>
                  </div>
                </div>
              )}

              <div className="data-card">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-med-muted" />
                  <span className="text-sm font-medium text-med-text">近30分钟生命体征趋势</span>
                </div>
                {chartData ? (
                  <div className="h-64">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-med-muted">暂无历史数据</div>
                )}
              </div>

              <div className="data-card">
                <div className="text-sm text-med-muted mb-2">病情描述</div>
                <div className="text-med-text">{patient.condition}</div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-med-muted">
              <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>当前救护车未搭载患者</p>
              <p className="text-sm mt-1">状态: {ambulance.status === 'standby' ? '待命' : ambulance.status === 'return' ? '返程中' : '出车中'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
