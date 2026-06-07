import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UserCheck, Camera, Activity, Eye, EyeOff } from 'lucide-react';
import { useEmergencyStore } from '../store/useEmergencyStore';
import type { UserRole } from '../../shared/types';

const roles: { id: UserRole; name: string; desc: string; color: string; bg: string }[] = [
  { id: 'dispatcher', name: '调度员', desc: '急救调度指挥', color: 'text-tech-cyan', bg: 'border-tech-cyan hover:bg-tech-cyan/10' },
  { id: 'doctor', name: '医生', desc: '急诊救治管理', color: 'text-severity-green', bg: 'border-severity-green hover:bg-severity-green/10' },
  { id: 'director', name: '主任', desc: '科室管理决策', color: 'text-severity-yellow', bg: 'border-severity-yellow hover:bg-severity-yellow/10' },
  { id: 'commission', name: '卫健委', desc: '全局监管审计', color: 'text-severity-blue', bg: 'border-severity-blue hover:bg-severity-blue/10' },
];

const userNames: Record<UserRole, string> = {
  dispatcher: '调度员_李明',
  doctor: '张建华医生',
  director: '王主任',
  commission: '卫健委管理员',
};

export function Login() {
  const navigate = useNavigate();
  const login = useEmergencyStore((s) => s.login);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (scanning && selectedRole) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setCameraActive(true);
        })
        .catch(() => {
          setCameraActive(false);
        });

      const timer = setInterval(() => {
        setScanProgress((p) => {
          if (p >= 100) {
            clearInterval(timer);
            setTimeout(() => {
              login(selectedRole, userNames[selectedRole]);
              navigate('/dashboard');
            }, 300);
            return 100;
          }
          return p + 2;
        });
      }, 60);

      return () => {
        clearInterval(timer);
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
        }
      };
    }
  }, [scanning, selectedRole, login, navigate]);

  const handleQuickLogin = (role: UserRole) => {
    login(role, userNames[role]);
    navigate('/dashboard');
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-med-bg">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-med-bg via-[#0a1d3a] to-med-bg" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-tech-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-tech-cyan/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03]">
          <svg viewBox="0 0 800 800" className="w-full h-full">
            {Array.from({ length: 30 }).map((_, i) => (
              <g key={i}>
                <circle cx="400" cy="400" r={i * 15} fill="none" stroke="#00e5ff" strokeWidth="0.5" />
              </g>
            ))}
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i / 24) * Math.PI * 2;
              return (
                <line
                  key={`l-${i}`}
                  x1="400"
                  y1="400"
                  x2={400 + Math.cos(angle) * 500}
                  y2={400 + Math.sin(angle) * 500}
                  stroke="#00e5ff"
                  strokeWidth="0.3"
                />
              );
            })}
          </svg>
        </div>
      </div>

      <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-tech-blue to-tech-cyan flex items-center justify-center shadow-[0_0_40px_rgba(0,229,255,0.3)]">
                <Activity className="w-9 h-9 text-white" />
              </div>
            </div>
            <h1 className="font-display font-bold text-5xl text-med-text mb-3 tracking-wider">
              3D智慧急救调度平台
            </h1>
            <p className="text-med-muted text-lg">Smart Emergency Medical Command & Visualization System</p>
          </div>

          <div className="glass-panel glow-border p-8">
            {!selectedRole ? (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-tech-cyan" />
                  <h2 className="font-display font-bold text-xl text-med-text">选择身份登录</h2>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      className={`p-5 rounded-xl border-2 bg-black/20 transition-all duration-300 ${role.bg}`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3 border ${role.bg.split(' ')[0]}`}>
                        <UserCheck className={`w-6 h-6 ${role.color}`} />
                      </div>
                      <div className={`font-bold text-lg mb-1 ${role.color}`}>{role.name}</div>
                      <div className="text-xs text-med-muted">{role.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowDebug(!showDebug)}
                    className="text-xs text-med-muted hover:text-tech-cyan flex items-center gap-1"
                  >
                    {showDebug ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showDebug ? '隐藏' : '显示'}调试快速登录
                  </button>
                </div>
                {showDebug && (
                  <div className="mt-3 pt-4 border-t border-med-border/50 flex flex-wrap gap-2">
                    <span className="text-xs text-med-muted mr-2">快速登录:</span>
                    {roles.map((r) => (
                      <button key={r.id} onClick={() => handleQuickLogin(r.id)} className={`text-xs px-3 py-1 rounded border ${r.bg} ${r.color}`}>
                        {r.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-tech-cyan" />
                    <h2 className="font-display font-bold text-xl text-med-text">
                      人脸识别登录 · {roles.find((r) => r.id === selectedRole)?.name}
                    </h2>
                  </div>
                  <button onClick={() => { setSelectedRole(null); setScanning(false); setScanProgress(0); }} className="text-sm text-med-muted hover:text-med-text">
                    ← 返回选择
                  </button>
                </div>

                <div className="flex gap-8">
                  <div className="flex-1">
                    <div className="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden border-2 border-tech-cyan/30 bg-black">
                      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                      {!cameraActive && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <Camera className="w-16 h-16 text-med-muted mx-auto mb-3" />
                            <p className="text-med-muted">{scanning ? '摄像头启动中...' : '准备人脸识别'}</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-4 border-2 border-dashed border-tech-cyan/50 rounded-full" />
                      <div className="absolute inset-8 border border-tech-cyan/30 rounded-full" />
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" fill="none" stroke="#00e5ff" strokeWidth="0.5" strokeDasharray="5 5" />
                      </svg>
                      {scanning && (
                        <div
                          className="absolute left-0 right-0 h-1 bg-tech-cyan shadow-[0_0_20px_#00e5ff]"
                          style={{ top: `${scanProgress}%` }}
                        />
                      )}
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-tech-cyan" />
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-tech-cyan" />
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-tech-cyan" />
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-tech-cyan" />
                      {scanProgress >= 100 && (
                        <div className="absolute inset-0 bg-severity-green/20 flex items-center justify-center">
                          <UserCheck className="w-20 h-20 text-severity-green" />
                        </div>
                      )}
                    </div>
                    {!scanning && (
                      <button onClick={() => setScanning(true)} className="btn-primary w-full mt-6 py-3 text-base flex items-center justify-center gap-2">
                        <Camera className="w-5 h-5" />
                        开始人脸识别
                      </button>
                    )}
                    {scanning && (
                      <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-med-muted">识别进度</span>
                          <span className="text-tech-cyan font-mono font-bold">{scanProgress}%</span>
                        </div>
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-tech-blue to-tech-cyan transition-all"
                            style={{ width: `${scanProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-med-muted mt-3 text-center">
                          {scanProgress < 30 && '正在检测人脸...'}
                          {scanProgress >= 30 && scanProgress < 60 && '特征提取中...'}
                          {scanProgress >= 60 && scanProgress < 90 && '身份验证中...'}
                          {scanProgress >= 90 && '验证成功！'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="w-80 space-y-4">
                    <div className="data-card">
                      <div className="text-xs text-med-muted mb-2">登录身份</div>
                      <div className={`font-bold text-lg ${roles.find((r) => r.id === selectedRole)?.color}`}>
                        {roles.find((r) => r.id === selectedRole)?.name}
                      </div>
                      <div className="text-xs text-med-muted mt-1">{roles.find((r) => r.id === selectedRole)?.desc}</div>
                    </div>
                    <div className="data-card">
                      <div className="text-xs text-med-muted mb-2">默认测试账号</div>
                      <div className="text-med-text font-mono">{userNames[selectedRole]}</div>
                    </div>
                    <div className="data-card border-l-4 border-tech-cyan">
                      <div className="text-xs text-med-muted mb-2">安全提示</div>
                      <ul className="text-xs text-med-muted space-y-1">
                        <li>• 请确保面部正对摄像头</li>
                        <li>• 保持光线充足</li>
                        <li>• 请勿佩戴口罩、墨镜</li>
                        <li>• 登录操作将被记录审计</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-6 text-xs text-med-muted">
            © 2026 3D智慧急救调度平台 · 医疗应急指挥系统 · 所有操作均已记录
          </div>
        </div>
      </div>
    </div>
  );
}
