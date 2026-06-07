import { useMemo, useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, ArcElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { FileBarChart, Download, Calendar, TrendingUp, Ambulance, Clock, Users, Activity, FileSpreadsheet } from 'lucide-react';
import { TopNavbar } from '../components/ui/TopNavbar';
import { BottomStatsBar } from '../components/ui/BottomStatsBar';
import { useEmergencyStore } from '../store/useEmergencyStore';
import * as XLSX from 'xlsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, ArcElement, PointElement, Title, Tooltip, Legend, Filler);

export function Reports() {
  const dailyStats = useEmergencyStore((s) => s.dailyStats);
  const ambulances = useEmergencyStore((s) => s.ambulances);
  const exportBtnRef = useRef<HTMLButtonElement>(null);

  const callsBySeverityData = useMemo(() => ({
    labels: ['极危(红)', '危重(黄)', '急症(蓝)', '轻症(绿)'],
    datasets: [
      {
        label: '呼叫数量',
        data: [dailyStats.severityBreakdown.red, dailyStats.severityBreakdown.yellow, dailyStats.severityBreakdown.blue, dailyStats.severityBreakdown.green],
        backgroundColor: ['rgba(229, 57, 53, 0.8)', 'rgba(253, 216, 53, 0.8)', 'rgba(30, 136, 229, 0.8)', 'rgba(67, 160, 71, 0.8)'],
        borderColor: ['#e53935', '#fdd835', '#1e88e5', '#43a047'],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }), [dailyStats]);

  const outcomeData = useMemo(() => ({
    labels: ['康复出院', '转院', '收住院', '死亡'],
    datasets: [
      {
        data: [dailyStats.outcomeStats.recovered, dailyStats.outcomeStats.transferred, dailyStats.outcomeStats.admitted, dailyStats.outcomeStats.deceased],
        backgroundColor: ['rgba(67, 160, 71, 0.8)', 'rgba(30, 136, 229, 0.8)', 'rgba(253, 216, 53, 0.8)', 'rgba(229, 57, 53, 0.8)'],
        borderColor: ['#43a047', '#1e88e5', '#fdd835', '#e53935'],
        borderWidth: 2,
      },
    ],
  }), [dailyStats]);

  const responseTimeData = useMemo(() => {
    const hours = ['06', '08', '10', '12', '14', '16', '18', '20'];
    return {
      labels: hours.map((h) => `${h}:00`),
      datasets: [
        {
          label: '平均响应时间 (分钟)',
          data: [3.8, 4.2, 5.1, 4.5, 3.9, 4.8, 5.5, 4.2],
          borderColor: '#00e5ff',
          backgroundColor: 'rgba(0, 229, 255, 0.15)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: '#00e5ff',
          pointBorderColor: '#0a1628',
          pointBorderWidth: 2,
        },
      ],
    };
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#e0e8f0', usePointStyle: true, padding: 15 } },
    },
    scales: {
      x: { grid: { color: 'rgba(30, 58, 95, 0.3)' }, ticks: { color: '#78909c' } },
      y: { grid: { color: 'rgba(30, 58, 95, 0.3)' }, ticks: { color: '#78909c' } },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const, labels: { color: '#e0e8f0', usePointStyle: true, padding: 15 } },
    },
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const summaryData = [
      ['3D智慧急救调度平台 - 日统计报表'],
      ['统计日期', dailyStats.date],
      [],
      ['一、总体指标'],
      ['指标', '数值'],
      ['总呼叫量', dailyStats.totalCalls],
      ['总出车量', dailyStats.totalDispatches],
      ['平均响应时间(分钟)', dailyStats.avgResponseTime],
      ['平均转运时间(分钟)', dailyStats.avgTransportTime],
      [],
      ['二、病情分级统计'],
      ['分级', '数量', '占比(%)'],
      ['极危(红)', dailyStats.severityBreakdown.red, ((dailyStats.severityBreakdown.red / dailyStats.totalCalls) * 100).toFixed(1)],
      ['危重(黄)', dailyStats.severityBreakdown.yellow, ((dailyStats.severityBreakdown.yellow / dailyStats.totalCalls) * 100).toFixed(1)],
      ['急症(蓝)', dailyStats.severityBreakdown.blue, ((dailyStats.severityBreakdown.blue / dailyStats.totalCalls) * 100).toFixed(1)],
      ['轻症(绿)', dailyStats.severityBreakdown.green, ((dailyStats.severityBreakdown.green / dailyStats.totalCalls) * 100).toFixed(1)],
      [],
      ['三、转归统计'],
      ['转归', '数量', '占比(%)'],
      ['康复出院', dailyStats.outcomeStats.recovered, ((dailyStats.outcomeStats.recovered / dailyStats.totalDispatches) * 100).toFixed(1)],
      ['转院', dailyStats.outcomeStats.transferred, ((dailyStats.outcomeStats.transferred / dailyStats.totalDispatches) * 100).toFixed(1)],
      ['收住院', dailyStats.outcomeStats.admitted, ((dailyStats.outcomeStats.admitted / dailyStats.totalDispatches) * 100).toFixed(1)],
      ['死亡', dailyStats.outcomeStats.deceased, ((dailyStats.outcomeStats.deceased / dailyStats.totalDispatches) * 100).toFixed(1)],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
    ws1['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws1, '总体统计');

    const ambData = [
      ['救护车编号', '出车次数', '运行时长(小时)'],
      ...dailyStats.ambulanceUtilization.map((a) => [a.number, a.dispatches, a.runtimeHours.toFixed(1)]),
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(ambData);
    ws2['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws2, '车辆统计');

    XLSX.writeFile(wb, `急救调度日报_${dailyStats.date}.xlsx`);
  };

  return (
    <div className="w-full h-full bg-med-bg relative">
      <TopNavbar />

      <div className="absolute inset-0 pt-16 pb-20 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-2xl text-med-text flex items-center gap-2">
                <FileBarChart className="w-7 h-7 text-tech-cyan" />
                统计报表
              </h1>
              <p className="text-med-muted text-sm mt-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                统计日期: {dailyStats.date}
              </p>
            </div>
            <button
              ref={exportBtnRef}
              onClick={handleExportExcel}
              className="btn-primary flex items-center gap-2 text-base px-5 py-2.5"
            >
              <Download className="w-5 h-5" />
              导出 Excel 报表
            </button>
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div className="data-card">
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="w-4 h-4 text-tech-cyan" />
                <span className="text-sm text-med-muted">总呼叫量</span>
              </div>
              <div className="font-bold text-3xl font-mono text-med-text">{dailyStats.totalCalls}</div>
              <div className="text-xs text-med-muted mt-1">起</div>
            </div>
            <div className="data-card border-l-4 border-tech-cyan">
              <div className="flex items-center gap-2 mb-2">
                <Ambulance className="w-4 h-4 text-tech-cyan" />
                <span className="text-sm text-med-muted">总出车量</span>
              </div>
              <div className="font-bold text-3xl font-mono text-tech-cyan">{dailyStats.totalDispatches}</div>
              <div className="text-xs text-med-muted mt-1">次</div>
            </div>
            <div className="data-card border-l-4 border-severity-green">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-severity-green" />
                <span className="text-sm text-med-muted">平均响应时间</span>
              </div>
              <div className="font-bold text-3xl font-mono text-severity-green">{dailyStats.avgResponseTime}</div>
              <div className="text-xs text-med-muted mt-1">分钟</div>
            </div>
            <div className="data-card border-l-4 border-severity-yellow">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-severity-yellow" />
                <span className="text-sm text-med-muted">平均转运时间</span>
              </div>
              <div className="font-bold text-3xl font-mono text-severity-yellow">{dailyStats.avgTransportTime}</div>
              <div className="text-xs text-med-muted mt-1">分钟</div>
            </div>
            <div className="data-card border-l-4 border-severity-blue">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-severity-blue" />
                <span className="text-sm text-med-muted">急救车在线</span>
              </div>
              <div className="font-bold text-3xl font-mono text-severity-blue">{ambulances.length}</div>
              <div className="text-xs text-med-muted mt-1">辆</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="glass-panel p-5">
              <h3 className="font-display font-bold text-med-text mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-tech-cyan" />
                病情分级呼叫量统计
              </h3>
              <div className="h-64">
                <Bar data={callsBySeverityData} options={chartOptions} />
              </div>
            </div>

            <div className="glass-panel p-5">
              <h3 className="font-display font-bold text-med-text mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-tech-cyan" />
                各时段平均响应时间
              </h3>
              <div className="h-64">
                <Line data={responseTimeData} options={chartOptions} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="glass-panel p-5">
              <h3 className="font-display font-bold text-med-text mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-tech-cyan" />
                患者转归统计
              </h3>
              <div className="h-64 flex items-center justify-center">
                <Pie data={outcomeData} options={pieOptions} />
              </div>
            </div>

            <div className="glass-panel p-5">
              <h3 className="font-display font-bold text-med-text mb-4 flex items-center gap-2">
                <Ambulance className="w-4 h-4 text-tech-cyan" />
                救护车使用情况
              </h3>
              <div className="overflow-auto max-h-64">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-med-border text-med-muted text-xs">
                      <th className="text-left py-2 px-2 font-medium">救护车编号</th>
                      <th className="text-center py-2 px-2 font-medium">出车次数</th>
                      <th className="text-center py-2 px-2 font-medium">运行时长</th>
                      <th className="text-center py-2 px-2 font-medium">利用率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyStats.ambulanceUtilization.map((a) => {
                      const utilRate = Math.min(100, (a.runtimeHours / 12) * 100);
                      return (
                        <tr key={a.ambulanceId} className="border-b border-med-border/30 hover:bg-white/5">
                          <td className="py-2 px-2 font-mono text-med-text">{a.number}</td>
                          <td className="py-2 px-2 text-center font-mono text-tech-cyan">{a.dispatches}</td>
                          <td className="py-2 px-2 text-center font-mono text-med-text">{a.runtimeHours.toFixed(1)}h</td>
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${utilRate > 80 ? 'bg-severity-red' : utilRate > 60 ? 'bg-severity-yellow' : 'bg-severity-green'}`}
                                  style={{ width: `${utilRate}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono text-med-muted w-10 text-right">{utilRate.toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomStatsBar />
    </div>
  );
}
