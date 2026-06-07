import { create } from 'zustand';
import type {
  Ambulance,
  Call120,
  Hospital,
  Doctor,
  Alert,
  UserRole,
  DailyStats,
  MassCasualtyEvent,
  Bed,
  Position,
} from '../../shared/types';
import {
  mockAmbulances,
  mockCalls,
  mockHospitals,
  mockDoctors,
  mockDailyStats,
  mockMassCasualtyEvents,
} from '../data/mockData';

interface EmergencyState {
  ambulances: Ambulance[];
  calls: Call120[];
  hospitals: Hospital[];
  doctors: Doctor[];
  alerts: Alert[];
  events: MassCasualtyEvent[];
  dailyStats: DailyStats;
  selectedAmbulanceId: string | null;
  selectedCallId: string | null;
  userRole: UserRole | null;
  userName: string | null;
  isLoggedIn: boolean;
  batchMode: boolean;

  login: (role: UserRole, name: string) => void;
  logout: () => void;
  setSelectedAmbulance: (id: string | null) => void;
  setSelectedCall: (id: string | null) => void;
  assignAmbulance: (callId: string, ambulanceId: string) => void;
  updateAmbulanceVitals: (ambulanceId: string, hr: number, spo2: number) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
  acknowledgeBed: (bedId: string, level: 1 | 2 | 3, userName: string) => void;
  triggerBatchDispatch: (event: Omit<MassCasualtyEvent, 'id' | 'startTime' | 'status' | 'assignedAmbulances'>) => void;
  setBatchMode: (active: boolean) => void;
  moveAmbulances: () => void;
}

export const haversineDistance = (p1: Position, p2: Position): number => {
  const dx = (p1.x ?? 0) - (p2.x ?? 0);
  const dz = (p1.z ?? 0) - (p2.z ?? 0);
  return Math.sqrt(dx * dx + dz * dz);
};

export const findBestAmbulance = (
  ambulances: Ambulance[],
  targetPos: Position,
  severity: number
): Ambulance | null => {
  const available = ambulances.filter((a) => a.status === 'standby');
  if (available.length === 0) return null;

  const maxDist = severity <= 1 ? 30 : severity <= 2 ? 50 : 100;

  let best: Ambulance | null = null;
  let bestScore = Infinity;

  for (const amb of available) {
    const dist = haversineDistance(amb.position, targetPos);
    if (dist > maxDist && best) continue;
    const score = dist * 0.6;
    if (score < bestScore) {
      bestScore = score;
      best = amb;
    }
  }
  return best;
};

export const generateRoute = (from: Position, to: Position): Position[] => {
  const steps = 4;
  const route: Position[] = [from];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = (from.x ?? 0) + ((to.x ?? 0) - (from.x ?? 0)) * t + (Math.random() - 0.5) * 3;
    const z = (from.z ?? 0) + ((to.z ?? 0) - (from.z ?? 0)) * t + (Math.random() - 0.5) * 3;
    route.push({
      lat: from.lat + (to.lat - from.lat) * t,
      lng: from.lng + (to.lng - from.lng) * t,
      x,
      z,
    });
  }
  return route;
};

const interpolatePosition = (route: Position[], progress: number): Position => {
  if (route.length < 2) return route[0];
  const totalSegments = route.length - 1;
  const exactPos = progress * totalSegments;
  const segIndex = Math.min(Math.floor(exactPos), totalSegments - 1);
  const localT = exactPos - segIndex;
  const p1 = route[segIndex];
  const p2 = route[segIndex + 1];
  return {
    lat: p1.lat + (p2.lat - p1.lat) * localT,
    lng: p1.lng + (p2.lng - p1.lng) * localT,
    x: (p1.x ?? 0) + ((p2.x ?? 0) - (p1.x ?? 0)) * localT,
    z: (p1.z ?? 0) + ((p2.z ?? 0) - (p1.z ?? 0)) * localT,
  };
};

export const useEmergencyStore = create<EmergencyState>((set, get) => ({
  ambulances: mockAmbulances,
  calls: mockCalls,
  hospitals: mockHospitals,
  doctors: mockDoctors,
  alerts: [
    {
      id: 'alert-001',
      ambulanceId: 'amb-002',
      ambulanceNumber: '京A·12002',
      type: 'spo2',
      message: '患者血氧饱和度低于90%',
      value: 89,
      timestamp: '08:52:10',
      acknowledged: false,
    },
    {
      id: 'alert-002',
      ambulanceId: 'amb-002',
      ambulanceNumber: '京A·12002',
      type: 'heartRate',
      message: '患者心率异常偏高',
      value: 118,
      timestamp: '08:51:45',
      acknowledged: false,
    },
  ],
  events: mockMassCasualtyEvents,
  dailyStats: mockDailyStats,
  selectedAmbulanceId: null,
  selectedCallId: null,
  userRole: null,
  userName: null,
  isLoggedIn: false,
  batchMode: false,

  login: (role, name) => set({ userRole: role, userName: name, isLoggedIn: true }),
  logout: () => set({ userRole: null, userName: null, isLoggedIn: false }),

  setSelectedAmbulance: (id) => set({ selectedAmbulanceId: id }),
  setSelectedCall: (id) => set({ selectedCallId: id }),

  assignAmbulance: (callId, ambulanceId) => {
    const state = get();
    const call = state.calls.find((c) => c.id === callId);
    const amb = state.ambulances.find((a) => a.id === ambulanceId);
    if (!call || !amb) return;

    const route = generateRoute(amb.position, call.position);

    set({
      calls: state.calls.map((c) =>
        c.id === callId ? { ...c, status: 'assigned', assignedAmbulanceId: ambulanceId, responseTime: Math.ceil(Math.random() * 4 + 2) } : c
      ),
      ambulances: state.ambulances.map((a) =>
        a.id === ambulanceId
          ? {
              ...a,
              status: 'dispatch',
              targetPosition: call.position,
              route,
              routeProgress: 0,
              patient: {
                id: `pat-${Date.now()}`,
                name: call.patientName,
                age: 50,
                gender: Math.random() > 0.5 ? '男' : '女',
                severity: call.severity,
                heartRate: 80 + Math.floor(Math.random() * 20),
                spo2: 95 + Math.floor(Math.random() * 5),
                history: [],
                condition: call.description,
                position: call.position,
              },
            }
          : a
      ),
    });
  },

  updateAmbulanceVitals: (ambulanceId, hr, spo2) => {
    const state = get();
    set({
      ambulances: state.ambulances.map((a) =>
        a.id === ambulanceId && a.patient
          ? {
              ...a,
              patient: {
                ...a.patient,
                heartRate: hr,
                spo2: spo2,
                history: [
                  ...a.patient.history.slice(-29),
                  {
                    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                    heartRate: hr,
                    spo2: spo2,
                  },
                ],
              },
            }
          : a
      ),
    });
  },

  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  acknowledgeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
    })),

  acknowledgeBed: (bedId, level, userName) => {
    const state = get();
    const now = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    const hospitals = state.hospitals.map((h) => ({
      ...h,
      beds: h.beds.map((b: Bed) => {
        if (b.id !== bedId) return b;
        const updated = { ...b, confirmLevel: level as 0 | 1 | 2 | 3, confirmedBy: { ...b.confirmedBy }, confirmTime: { ...b.confirmTime } };
        if (level === 1) {
          updated.confirmedBy.doctor = userName;
          updated.confirmTime.doctor = now;
        } else if (level === 2) {
          updated.confirmedBy.nurse = userName;
          updated.confirmTime.nurse = now;
        } else if (level === 3) {
          updated.confirmedBy.director = userName;
          updated.confirmTime.director = now;
        }
        return updated;
      }),
    }));
    set({ hospitals });
  },

  triggerBatchDispatch: (eventData) => {
    const state = get();
    const standby = state.ambulances.filter((a) => a.status === 'standby');
    const needed = Math.min(Math.ceil(eventData.casualtyCount / 2), standby.length);
    const assigned = standby.slice(0, needed);

    const newEvent: MassCasualtyEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      startTime: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      status: 'active',
      assignedAmbulances: assigned.map((a) => a.id),
    };

    set({
      events: [...state.events, newEvent],
      batchMode: true,
      ambulances: state.ambulances.map((a) => {
        if (!assigned.find((as) => as.id === a.id)) return a;
        const route = generateRoute(a.position, eventData.position);
        return {
          ...a,
          status: 'dispatch',
          targetPosition: eventData.position,
          route,
          routeProgress: 0,
        };
      }),
    });
  },

  setBatchMode: (active) => set({ batchMode: active }),

  moveAmbulances: () => {
    const state = get();
    set({
      ambulances: state.ambulances.map((a) => {
        if (!a.route || a.routeProgress === undefined) return a;
        const newProgress = Math.min(a.routeProgress + 0.005, 1);
        const newPos = interpolatePosition(a.route, newProgress);

        if (newProgress >= 1) {
          if (a.status === 'dispatch') {
            return { ...a, status: 'return', routeProgress: 0, route: generateRoute(newPos, { lat: 39.9042, lng: 116.4074, x: 0, z: 0 }), position: newPos };
          }
          if (a.status === 'return') {
            return { ...a, status: 'standby', routeProgress: undefined, route: undefined, targetPosition: undefined, patient: undefined, position: newPos };
          }
        }

        let newHR = a.patient?.heartRate ?? 75;
        let newSpO2 = a.patient?.spo2 ?? 98;
        if (a.patient && a.status === 'dispatch') {
          newHR = Math.max(55, Math.min(130, newHR + (Math.random() - 0.45) * 4));
          newSpO2 = Math.max(88, Math.min(100, newSpO2 + (Math.random() - 0.5) * 1.5));
        }

        return {
          ...a,
          position: newPos,
          routeProgress: newProgress,
          patient: a.patient
            ? {
                ...a.patient,
                heartRate: Math.round(newHR),
                spo2: Math.round(newSpO2),
              }
            : a.patient,
        };
      }),
      calls: state.calls.map((c) => {
        if (c.status === 'assigned') {
          const amb = state.ambulances.find((a) => a.id === c.assignedAmbulanceId);
          if (amb && amb.routeProgress && amb.routeProgress > 0.05) {
            return { ...c, status: 'enroute' as const };
          }
        }
        return c;
      }),
    });
  },
}));
