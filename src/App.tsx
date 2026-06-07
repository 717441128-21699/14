import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { Emergency } from "@/pages/Emergency";
import { BatchDispatch } from "@/pages/BatchDispatch";
import { Reports } from "@/pages/Reports";
import { useEmergencyStore } from "@/store/useEmergencyStore";
import type { ReactNode } from "react";

function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) {
  const isLoggedIn = useEmergencyStore((s) => s.isLoggedIn);
  const userRole = useEmergencyStore((s) => s.userRole);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["dispatcher", "doctor", "director", "commission"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/emergency"
          element={
            <ProtectedRoute allowedRoles={["doctor", "director", "commission"]}>
              <Emergency />
            </ProtectedRoute>
          }
        />
        <Route
          path="/batch"
          element={
            <ProtectedRoute allowedRoles={["director", "commission"]}>
              <BatchDispatch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["dispatcher", "director", "commission"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
