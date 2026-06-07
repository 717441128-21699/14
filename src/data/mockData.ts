import type {
  Ambulance,
  Call120,
  Hospital,
  Doctor,
  Patient,
  Position,
  DailyStats,
  MassCasualtyEvent,
  VitalHistory,
} from '../../shared/types';

function generateVitalHistory(baseHR = 75, baseSpO2 = 98): VitalHistory[] {
  const history: VitalHistory[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 1000);
    const hrVariation = Math.sin(i * 0.3) * 8 + (Math.random() - 0.5) * 6;
    const spo2Variation = Math.sin(i * 0.2) * 1.5 + (Math.random() - 0.5) * 1;
    history.push({
      time: `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`,
      heartRate: Math.max(50, Math.min(140, Math.round(baseHR + hrVariation))),
      spo2: Math.max(90, Math.min(100, Math.round(baseSpO2 + spo2Variation))),
    });
  }
  return history;
}

const cityCenter = { lat: 39.9042, lng: 116.4074, x: 0, z: 0 };

const makePos = (dx: number, dz: number): Position => ({
  lat: cityCenter.lat + dz * 0.003,
  lng: cityCenter.lng + dx * 0.004,
  x: dx * 10,
  z: dz * 10,
});

export const mockAmbulances: Ambulance[] = [
  {
    id: 'amb-001',
    number: '京A·12001',
    status: 'standby',
    position: makePos(-8, -5),
    driver: '张伟',
    crew: ['李医生', '王护士'],
  },
  {
    id: 'amb-002',
    number: '京A·12002',
    status: 'dispatch',
    position: makePos(3, 2),
    targetPosition: makePos(10, 6),
    driver: '李强',
    crew: ['赵医生', '刘护士'],
    routeProgress: 0.35,
    patient: {
      id: 'pat-001',
      name: '王建国',
      age: 65,
      gender: '男',
      severity: 1,
      heartRate: 118,
      spo2: 89,
      history: generateVitalHistory(110, 90),
      condition: '急性心肌梗死，胸痛伴大汗',
      position: makePos(10, 6),
    },
    route: [makePos(3, 2), makePos(5, 3), makePos(8, 5), makePos(10, 6)],
    alertActive: true,
  },
  {
    id: 'amb-003',
    number: '京A·12003',
    status: 'dispatch',
    position: makePos(-4, 5),
    targetPosition: makePos(-10, -3),
    driver: '王刚',
    crew: ['陈医生', '孙护士'],
    routeProgress: 0.6,
    patient: {
      id: 'pat-002',
      name: '刘芳',
      age: 42,
      gender: '女',
      severity: 2,
      heartRate: 88,
      spo2: 96,
      history: generateVitalHistory(85, 97),
      condition: '交通事故，右腿骨折',
      position: makePos(-10, -3),
    },
    route: [makePos(-4, 5), makePos(-6, 2), makePos(-8, 0), makePos(-10, -3)],
  },
  {
    id: 'amb-004',
    number: '京A·12004',
    status: 'return',
    position: makePos(6, -4),
    targetPosition: makePos(0, 0),
    driver: '赵明',
    crew: ['周医生', '吴护士'],
    routeProgress: 0.75,
    route: [makePos(6, -4), makePos(3, -2), makePos(0, 0)],
  },
  {
    id: 'amb-005',
    number: '京A·12005',
    status: 'standby',
    position: makePos(9, 8),
    driver: '孙磊',
    crew: ['郑医生', '钱护士'],
  },
  {
    id: 'amb-006',
    number: '京A·12006',
    status: 'standby',
    position: makePos(-9, 7),
    driver: '周涛',
    crew: ['冯医生', '韩护士'],
  },
];

export const mockCalls: Call120[] = [
  {
    id: 'call-001',
    patientName: '王建国',
    callTime: '08:42:15',
    position: makePos(10, 6),
    severity: 1,
    address: '朝阳区建国路88号SOHO现代城',
    description: '突发胸痛，持续20分钟，伴呼吸困难',
    status: 'enroute',
    assignedAmbulanceId: 'amb-002',
    responseTime: 3,
  },
  {
    id: 'call-002',
    patientName: '刘芳',
    callTime: '08:38:52',
    position: makePos(-10, -3),
    severity: 2,
    address: '海淀区中关村大街1号',
    description: '交通事故，腿部受伤，意识清醒',
    status: 'enroute',
    assignedAmbulanceId: 'amb-003',
    responseTime: 5,
  },
  {
    id: 'call-003',
    patientName: '陈大爷',
    callTime: '08:51:03',
    position: makePos(-5, -8),
    severity: 3,
    address: '西城区金融街15号',
    description: '头晕，血压偏高，有高血压病史',
    status: 'pending',
  },
  {
    id: 'call-004',
    patientName: '小李',
    callTime: '08:55:20',
    position: makePos(7, -7),
    severity: 4,
    address: '东城区王府井大街201号',
    description: '轻微感冒发热，体温37.8度',
    status: 'pending',
  },
];

function createBeds() {
  const beds = [];
  const zones: Array<'red' | 'yellow' | 'green'> = ['red', 'yellow', 'green'];
  const counts = [4, 6, 8];
  let idx = 0;
  for (let z = 0; z < 3; z++) {
    for (let i = 0; i < counts[z]; i++) {
      beds.push({
        id: `bed-${idx}`,
        zone: zones[z],
        number: `${zones[z].toUpperCase()}-${String(i + 1).padStart(2, '0')}`,
        occupied: z === 0 ? i < 3 : z === 1 ? i < 4 : i < 3,
        confirmLevel: 0 as const,
        confirmedBy: {},
        confirmTime: {},
      });
      idx++;
    }
  }
  beds[0].patientName = '王建国';
  beds[0].confirmLevel = 1;
  beds[0].confirmedBy = { doctor: '张主任' };
  beds[0].confirmTime = { doctor: '09:12:30' };
  return beds;
}

export const mockHospitals: Hospital[] = [
  {
    id: 'hosp-001',
    name: '北京急救中心附属医院',
    position: makePos(0, 0),
    beds: createBeds(),
  },
];

export const mockDoctors: Doctor[] = [
  { id: 'doc-001', name: '张建华', role: '主任', department: '急诊科', onDuty: true, avatar: 'Z', phone: '138****1234' },
  { id: 'doc-002', name: '李明远', role: '医生', department: '急诊科', onDuty: true, avatar: 'L', phone: '139****5678' },
  { id: 'doc-003', name: '王晓燕', role: '医生', department: '心内科', onDuty: true, avatar: 'W', phone: '137****9012' },
  { id: 'doc-004', name: '赵晓峰', role: '医生', department: '骨科', onDuty: false, avatar: 'Z', phone: '136****3456' },
  { id: 'doc-005', name: '陈美玲', role: '护士', department: '急诊科', onDuty: true, avatar: 'C', phone: '135****7890' },
  { id: 'doc-006', name: '刘淑芬', role: '护士', department: '急诊科', onDuty: true, avatar: 'L', phone: '134****2345' },
  { id: 'doc-007', name: '孙文杰', role: '医生', department: '神经外科', onDuty: true, avatar: 'S', phone: '133****6789' },
  { id: 'doc-008', name: '周丽华', role: '护士', department: 'ICU', onDuty: false, avatar: 'Z', phone: '132****0123' },
];

export const mockDailyStats: DailyStats = {
  date: new Date().toISOString().split('T')[0],
  totalCalls: 47,
  totalDispatches: 38,
  avgResponseTime: 4.2,
  avgTransportTime: 12.8,
  severityBreakdown: { red: 6, yellow: 14, blue: 12, green: 6 },
  outcomeStats: {
    recovered: 18,
    transferred: 8,
    admitted: 10,
    deceased: 2,
  },
  ambulanceUtilization: mockAmbulances.map((a, i) => ({
    ambulanceId: a.id,
    number: a.number,
    dispatches: 8 - i + Math.floor(Math.random() * 3),
    runtimeHours: 6 + Math.random() * 4,
  })),
};

export const mockMassCasualtyEvents: MassCasualtyEvent[] = [];
