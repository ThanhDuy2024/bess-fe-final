import React, { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./components/contexts/AuthContext";
import MainLayout from "./components/Layout/MainLayout";
import LoginPage from "./components/Screen/Login/Login";
import DashboardPage from "./components/Screen/Dashboard/Dashboard";
import BatteryPage from "./components/Screen/Battery/Battery";
import PCSPage from "./components/Screen/PCS/PCS";
import AlarmPage from "./components/Screen/Alarm/Alarm";
import EnergyReportPage from "./components/Screen/EnergyReport/EnergyReport";
import UserManagementPage from "./components/Screen/UserManagement/UserManagement";
import SystemSettingsPage from "./components/Screen/SystemSettings/SystemSettings";
import RolePage from "./components/Screen/Role/Role";
import UserInfoPage from "./components/Screen/UserInfo/UserInfo";
import { io } from "socket.io-client";
import { signal } from "@preact/signals-react";
import { callApi } from "./components/Api/Api";
export const socket = signal(io.connect(process.env.REACT_APP_API));

export function toInt16(raw) {
  const value = Number(raw) & 0xffff;
  return value >= 0x8000 ? value - 0x10000 : value;
}

export const convertToDoublewordAndFloat = (cal, type, scale) => {
  let word = ["0", "0"];

  word[0] = cal[0];
  word[1] = cal[1];

  var doubleword = (word[1] << 16) | word[0];
  var buffer = new ArrayBuffer(4);
  var intView = new Int32Array(buffer);
  var floatView = new Float32Array(buffer);
  intView[0] = doubleword;
  var float_value = floatView[0];

  return type === "float"
    ? parseFloat(float_value * (scale || 1)).toFixed(1) || 0
    : parseFloat(doubleword * (scale || 1)).toFixed(1);
};

function ProtectedRoute({ permission }) {
  const { isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  useEffect(() => {
    (async () => {
      let data = await callApi(
        "post",
        process.env.REACT_APP_APIDEV + "/data/getAllUser",{}
      );
      console.log("API Response:"); 

      if (data.status === true) {
        console.log(data);
      } else {
        console.log("Failed to get data");
      }
    })();
  }, []);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/battery" element={<BatteryPage />} />
          <Route path="/pcs" element={<PCSPage />} />
          <Route path="/alarms" element={<AlarmPage />} />
          <Route path="/energy-report" element={<EnergyReportPage />} />
          <Route path="/roles" element={<RolePage />} />
          <Route path="/user-info" element={<UserInfoPage />} />

          <Route element={<ProtectedRoute permission="manage_users" />}>
            <Route path="/users" element={<UserManagementPage />} />
          </Route>

          <Route element={<ProtectedRoute permission="system_settings" />}>
            <Route path="/settings" element={<SystemSettingsPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
