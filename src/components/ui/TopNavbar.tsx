import { Activity, LogOut, User as UserIcon, LayoutDashboard, Building2, Users, FileBarChart, Shield } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEmergencyStore } from '../../store/useEmergencyStore';

const roleLabels: Record<string, string> = {
  dispatcher: '调度员',
  doctor: '医生',
  director: '主任',
  commission: '卫健委',
};

const roleColors: Record<string, string> = {
  dispatcher: 'text-tech-cyan',
  doctor: 'text-severity-green',
  director: 'text-severity-yellow',
  commission: 'text-severity-blue',
};

export function TopNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const userName = useEmergencyStore((s) => s.userName);
  const userRole = useEmergencyStore((s) => s.userRole);
  const logout = useEmergencyStore((s) => s.logout);

  const navItems = [
    { path: '/dashboard', label: '指挥大屏', icon: LayoutDashboard, roles: ['dispatcher', 'director', 'commission', 'doctor'] },
    { path: '/emergency', label: '急诊科', icon: Building2, roles: ['doctor', 'director', 'commission'] },
    { path: '/batch', label: '批量调度', icon: Users, roles: ['director', 'commission'] },
    { path: '/reports', label: '统计报表', icon: FileBarChart, roles: ['dispatcher', 'director', 'commission'] },
  ];

  const filteredNav = navItems.filter((item) => !userRole || item.roles.includes(userRole));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 glass-panel border-b border-med-border">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-tech-blue to-tech-cyan flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-med-text tracking-wider">3D智慧急救调度平台</h1>
              <p className="text-xs text-med-muted">Smart Emergency Command System</p>
            </div>
          </div>
          <div className="h-8 w-px bg-med-border mx-2" />
          <nav className="flex items-center gap-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                    active ? 'bg-tech-blue/30 text-tech-cyan border border-tech-cyan/30' : 'text-med-muted hover:text-med-text hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-tech-blue/20 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-tech-cyan" />
            </div>
            <div className="leading-tight">
              <div className="text-sm text-med-text font-medium">{userName || '未登录'}</div>
              <div className={`text-xs flex items-center gap-1 ${roleColors[userRole || ''] || 'text-med-muted'}`}>
                <Shield className="w-3 h-3" />
                {roleLabels[userRole || ''] || '访客'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-med-muted hover:text-severity-red hover:bg-severity-red/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">退出</span>
          </button>
        </div>
      </div>
    </div>
  );
}
