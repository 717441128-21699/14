import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, UserCheck, Camera, Activity, Eye, EyeOff, RotateCcw, Check, User } from 'lucide-react';
import { useEmergencyStore } from '../store/useEmergencyStore';
import type { UserRole } from '../../shared/types';

const roles: { id: UserRole; name: string; desc: string; color: string; border: string; bg: string }[] = [
  { id: 'dispatcher', name: '调度员', desc: '急救调度指挥', color: 'text-tech-cyan', border: 'border-tech-cyan', bg: 'bg-tech-cyan/10' },
  { id: 'doctor', name: '医生', desc: '急诊救治管理', color: 'text-severity-green', border: 'border-severity-green', bg: 'bg-severity-green/10' },
  { id: 'director', name: '主任', desc: '科室管理决策', color: 'text-severity-yellow', border: 'border-severity-yellow', bg: 'bg-severity-yellow/10' },
  { id: 'commission', name: '卫健委', desc: '全局监管审计', color: 'text-severity-blue', border: 'border-severity-blue', bg: 'bg-severity-blue/10' },
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
  const [cameraError, setCameraError] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
      if (scanTimerRef.current) window.clearInterval(scanTimerRef.current);
    };
  }, []);

  const startCamera = async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraError(false);
    } catch {
      setCameraError(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const takePhoto = () => {
    if (!cameraError && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        setPhotoUrl(canvas.toDataURL('image/jpeg', 0.9));
      }
    } else {
      setPhotoUrl('simulated');
    }
    setPhotoTaken(true);
    setScanning(true);
    setScanProgress(0);
    if (scanTimerRef.current) window.clearInterval(scanTimerRef.current);
    scanTimerRef.current = window.setInterval(() => {
      setScanProgress((p) => {
        if (p >= 100) {
          if (scanTimerRef.current) window.clearInterval(scanTimerRef.current);
          return 100;
        }
        return p + 2.5;
      });
    }, 50);
  };

  const retakePhoto = () => {
    setPhotoTaken(false);
    setPhotoUrl(null);
    setScanning(false);
    setScanProgress(0);
    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
  };

  const handleLogin = () => {
    if (!selectedRole || !photoTaken || scanProgress < 100) return;
    setLoggingIn(true);
    setTimeout(() => {
      stopCamera();
      login(selectedRole, userNames[selectedRole]);
      navigate('/dashboard');
    }, 500);
  };

  const handleQuickLogin = (role: UserRole) => {
    stopCamera();
    login(role, userNames[role]);
    navigate('/dashboard');
  };

  const handleSelectRole = async (role: UserRole) => {
    setSelectedRole(role);
    setPhotoTaken(false);
    setPhotoUrl(null);
    setScanning(false);
    setScanProgress(0);
    await startCamera();
  };

  const handleBack = () => {
    stopCamera();
    setSelectedRole(null);
    setPhotoTaken(false);
    setPhotoUrl(null);
    setScanning(false);
    setScanProgress(0);
    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
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
              <circle key={i} cx="400" cy="400" r={i * 15} fill="none" stroke="#00e5ff" strokeWidth="0.5" />
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

      <div className="relative z-10 w-full h-full flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-5xl my-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-tech-blue to-tech-cyan flex items-center justify-center shadow-[0_0_40px_rgba(0,229,255,0.3)]">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="font-display font-bold text-4xl text-med-text mb-2 tracking-wider">
              3D智慧急救调度平台
            </h1>
            <p className="text-med-muted text-base">Smart Emergency Medical Command & Visualization System</p>
          </div>

          <div className="glass-panel glow-border p-8">
            {!selectedRole ? (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-tech-cyan" />
                  <h2 className="font-display font-bold text-xl text-med-text">第一步：选择身份权限</h2>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {roles.map((role) => (
                    <button
                      key={role.id}
                      className={`p-5 rounded-xl border-2 bg-black/20 transition-all duration-300 hover:scale-[1.02] ${role.border} hover:${role.bg}`}
                      onClick={() => handleSelectRole(role.id)}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 border ${role.border} ${role.bg}`}>
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
                  <div className="mt-3 pt-4 border-t border-med-border/50 flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-med-muted mr-2">快速登录(跳过人脸识别):</span>
                    {roles.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleQuickLogin(r.id)}
                        className={`text-xs px-3 py-1 rounded border ${r.border} ${r.bg} ${r.color} hover:scale-105 transition-transform`}
                      >
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
                      第二步：人脸识别 & 身份确认
                    </h2>
                  </div>
                  <button
                    onClick={handleBack}
                    className="text-sm text-med-muted hover:text-med-text transition-colors"
                  >
                    ← 返回选择身份
                  </button>
                </div>

                <div className="grid grid-cols-[1fr_320px] gap-8">
                  <div>
                    <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border-2 border-tech-cyan/30 bg-black">
                      {!photoTaken ? (
                        <>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover scale-x-[-1]"
                            style={{ display: cameraError ? 'none' : 'block' }}
                          />
                          {cameraError && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <div className="relative">
                                <div className="w-36 h-44 rounded-full bg-gradient-to-b from-tech-cyan/20 to-tech-blue/10 border-2 border-tech-cyan/30 flex items-center justify-center">
                                  <User className="w-20 h-20 text-tech-cyan/40" />
                                </div>
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-tech-cyan animate-ping" />
                              </div>
                              <p className="text-med-muted text-sm mt-4">摄像头不可用 - 模拟人脸识别模式</p>
                              <p className="text-xs text-med-muted mt-1">点击下方拍照按钮继续</p>
                            </div>
                          )}
                          {!cameraError && !videoRef.current?.srcObject && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <Camera className="w-12 h-12 text-tech-cyan/50 animate-pulse mx-auto mb-2" />
                                <p className="text-med-muted">正在启动摄像头...</p>
                              </div>
                            </div>
                          )}

                          <div className="absolute inset-6 rounded-[40%] border-2 border-dashed border-tech-cyan/40" />
                          <div className="absolute inset-10 rounded-[45%] border border-tech-cyan/20" />

                          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-tech-cyan rounded-tl-sm" />
                          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-tech-cyan rounded-tr-sm" />
                          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-tech-cyan rounded-bl-sm" />
                          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-tech-cyan rounded-br-sm" />

                          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/50 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-severity-red animate-pulse" />
                            <span className="text-xs text-med-text font-mono">LIVE</span>
                          </div>

                          {scanning && (
                            <div
                              className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-tech-cyan to-transparent shadow-[0_0_12px_#00e5ff]"
                              style={{ top: `${scanProgress}%` }}
                            />
                          )}
                        </>
                      ) : (
                        <>
                          {photoUrl && photoUrl !== 'simulated' ? (
                            <img src={photoUrl} className="w-full h-full object-cover" alt="captured" />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-tech-cyan/10 via-tech-blue/5 to-black">
                              <div className="relative mb-4">
                                <div className="w-36 h-44 rounded-full bg-gradient-to-b from-tech-cyan/25 to-tech-blue/15 border-2 border-tech-cyan flex items-center justify-center">
                                  <User className="w-20 h-20 text-tech-cyan/70" />
                                </div>
                                <div className="absolute inset-0 rounded-full border-2 border-tech-cyan/50 animate-ping" />
                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-severity-green flex items-center justify-center shadow-lg">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              </div>
                              <p className="text-tech-cyan font-bold">人脸照片已捕获</p>
                              <p className="text-xs text-med-muted mt-1">模拟模式 · 已生成特征数据</p>
                            </div>
                          )}
                          <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/60 backdrop-blur-sm">
                            <span className="text-xs text-tech-cyan font-mono">CAPTURED</span>
                          </div>
                          {scanProgress >= 100 && (
                            <div className="absolute top-3 left-3 px-2 py-1 rounded bg-severity-green/90 backdrop-blur-sm flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span className="text-xs text-white font-bold">识别通过</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <canvas ref={canvasRef} className="hidden" />

                    <div className="flex gap-3 mt-5">
                      {!photoTaken ? (
                        <button
                          onClick={takePhoto}
                          className="btn-primary flex-1 py-3 text-base flex items-center justify-center gap-2"
                        >
                          <Camera className="w-5 h-5" />
                          {cameraError ? '模拟拍照' : '拍照并识别'}
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={retakePhoto}
                            className="flex-1 py-3 text-base flex items-center justify-center gap-2 rounded-xl border border-med-border text-med-muted hover:text-med-text hover:border-tech-cyan/50 bg-black/20 transition-all"
                          >
                            <RotateCcw className="w-5 h-5" />
                            重新拍照
                          </button>
                          <button
                            onClick={handleLogin}
                            disabled={scanProgress < 100 || loggingIn}
                            className="flex-[1.5] py-3 text-base flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-severity-green to-tech-cyan text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all"
                          >
                            {loggingIn ? (
                              <>
                                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                登录中...
                              </>
                            ) : scanProgress < 100 ? (
                              `识别中 ${Math.round(scanProgress)}%`
                            ) : (
                              <>
                                <Check className="w-5 h-5" />
                                确认身份并登录
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>

                    {photoTaken && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-med-muted">特征匹配进度</span>
                          <span className={`font-mono font-bold ${scanProgress >= 100 ? 'text-severity-green' : 'text-tech-cyan'}`}>
                            {Math.round(scanProgress)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-100 ${scanProgress >= 100 ? 'bg-severity-green' : 'bg-gradient-to-r from-tech-blue to-tech-cyan'}`}
                            style={{ width: `${scanProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-med-muted mt-2 text-center">
                          {scanProgress < 25 && '正在检测人脸关键点...'}
                          {scanProgress >= 25 && scanProgress < 50 && '提取面部特征向量...'}
                          {scanProgress >= 50 && scanProgress < 75 && '与特征库进行比对匹配...'}
                          {scanProgress >= 75 && scanProgress < 100 && '权限校验中...'}
                          {scanProgress >= 100 && `✓ 识别成功：${userNames[selectedRole]}`}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className={`data-card border-l-4 ${roles.find((r) => r.id === selectedRole)?.border}`}>
                      <div className="text-xs text-med-muted mb-2 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        登录身份
                      </div>
                      <div className={`font-bold text-xl ${roles.find((r) => r.id === selectedRole)?.color}`}>
                        {roles.find((r) => r.id === selectedRole)?.name}
                      </div>
                      <div className="text-xs text-med-muted mt-1">
                        {roles.find((r) => r.id === selectedRole)?.desc}
                      </div>
                    </div>

                    <div className="data-card">
                      <div className="text-xs text-med-muted mb-2">默认账号</div>
                      <div className="text-med-text font-mono text-base">{userNames[selectedRole]}</div>
                    </div>

                    <div className="data-card">
                      <div className="text-xs text-med-muted mb-3 flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        权限说明
                      </div>
                      <ul className="text-xs text-med-muted space-y-1.5">
                        {selectedRole === 'dispatcher' && (
                          <>
                            <li>✓ 指挥大屏监控</li>
                            <li>✓ 120呼叫受理与派车</li>
                            <li>✓ 查看统计报表</li>
                            <li className="opacity-40">✗ 急诊科床位管理</li>
                            <li className="opacity-40">✗ 批量调度</li>
                          </>
                        )}
                        {selectedRole === 'doctor' && (
                          <>
                            <li>✓ 指挥大屏监控</li>
                            <li>✓ 急诊科床位管理</li>
                            <li>✓ 患者三级确认</li>
                            <li>✓ 查看统计报表</li>
                            <li className="opacity-40">✗ 批量调度</li>
                          </>
                        )}
                        {selectedRole === 'director' && (
                          <>
                            <li>✓ 全部页面访问权限</li>
                            <li>✓ 批量调度指挥</li>
                            <li>✓ 科室医生排班</li>
                            <li>✓ 三级确认终审</li>
                            <li>✓ 统计报表导出</li>
                          </>
                        )}
                        {selectedRole === 'commission' && (
                          <>
                            <li>✓ 全局监管审计</li>
                            <li>✓ 所有页面只读访问</li>
                            <li>✓ 批量调度决策</li>
                            <li>✓ 报表导出与分析</li>
                            <li>✓ 操作日志审计</li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="data-card border-l-4 border-tech-cyan">
                      <div className="text-xs text-med-muted mb-2">安全提示</div>
                      <ul className="text-xs text-med-muted space-y-1">
                        <li>• 请确保面部正对取景框</li>
                        <li>• 保持光线充足，环境明亮</li>
                        <li>• 请勿佩戴口罩、墨镜遮挡</li>
                        <li>• 所有登录操作均记录审计</li>
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
