export type SeverityLevel = 1 | 2 | 3 | 4;

export type AmbulanceStatus = 'standby' | 'dispatch' | 'return';

export type UserRole = 'dispatcher' | 'doctor' | 'director' | 'commission';

export type BedZone = 'red' | 'yellow' | 'green';

export type CallStatus = 'pending' | 'assigned' | 'enroute' | 'arrived' | 'completed';

export type ConfirmLevel = 0 | 1 | 2 | 3;

export interface Position {
  lat: number;
  lng: number;
  x?: number;
  z?: number;
}

export interface VitalHistory {
  time: string;
  heartRate: number;
  spo2: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: '男' | '女';
  severity: SeverityLevel;
  heartRate: number;
  spo2: number;
  history: VitalHistory[];
  condition: string;
  position: Position;
}

export interface Ambulance {
  id: string;
  number: string;
  status: AmbulanceStatus;
  position: Position;
  targetPosition?: Position;
  patient?: Patient;
  driver: string;
  crew: string[];
  route?: Position[];
  routeProgress?: number;
  alertActive?: boolean;
}

export interface Call120 {
  id: string;
  patientName: string;
  callTime: string;
  position: Position;
  severity: SeverityLevel;
  address: string;
  description: string;
  status: CallStatus;
  assignedAmbulanceId?: string;
  responseTime?: number;
}

export interface Bed {
  id: string;
  zone: BedZone;
  number: string;
  occupied: boolean;
  patientId?: string;
  patientName?: string;
  confirmLevel: ConfirmLevel;
  confirmedBy: {
    doctor?: string;
    nurse?: string;
    director?: string;
  };
  confirmTime: {
    doctor?: string;
    nurse?: string;
    director?: string;
  };
}

export interface Hospital {
  id: string;
  name: string;
  position: Position;
  beds: Bed[];
}

export interface Doctor {
  id: string;
  name: string;
  role: '医生' | '护士' | '主任';
  department: string;
  onDuty: boolean;
  avatar: string;
  phone: string;
}

export interface Alert {
  id: string;
  ambulanceId: string;
  ambulanceNumber: string;
  type: 'heartRate' | 'spo2' | 'critical';
  message: string;
  value: number;
  timestamp: string;
  acknowledged: boolean;
}

export interface MassCasualtyEvent {
  id: string;
  name: string;
  location: string;
  position: Position;
  casualtyCount: number;
  severity: SeverityLevel;
  startTime: string;
  status: 'active' | 'resolved';
  assignedAmbulances: string[];
}

export interface DailyStats {
  date: string;
  totalCalls: number;
  totalDispatches: number;
  avgResponseTime: number;
  avgTransportTime: number;
  severityBreakdown: { red: number; yellow: number; blue: number; green: number };
  outcomeStats: {
    recovered: number;
    transferred: number;
    admitted: number;
    deceased: number;
  };
  ambulanceUtilization: { ambulanceId: string; number: string; dispatches: number; runtimeHours: number }[];
}
