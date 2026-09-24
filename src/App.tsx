import { Navigate, Route, Routes } from "react-router-dom";

import { NupHubProfileRoute } from "./components/NupHubProfileRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthCallback from "./pages/AuthCallback";
import SetupPage from "./pages/SetupPage";
import Dashboard from "./pages/Dashboard";
import OverlaySettingsPage from "./pages/OverlaySettingsPage";
import AccountPage from "./pages/AccountPage";
import ObsOverlayPage from "./pages/ObsOverlayPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import RedirectPage from "./pages/RedirectPage";

function NupHubAppRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <NupHubProfileRoute>{children}</NupHubProfileRoute>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route
        path="/setup"
        element={
          <ProtectedRoute>
            <SetupPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <NupHubAppRoute>
            <Dashboard />
          </NupHubAppRoute>
        }
      />
      <Route
        path="/dashboard/overlay"
        element={
          <NupHubAppRoute>
            <OverlaySettingsPage />
          </NupHubAppRoute>
        }
      />
      <Route
        path="/dashboard/account"
        element={
          <NupHubAppRoute>
            <AccountPage />
          </NupHubAppRoute>
        }
      />

      <Route path="/obs/:handle" element={<ObsOverlayPage />} />
      <Route path="/u/:handle" element={<PublicProfilePage />} />

      <Route path="/404" element={<Navigate to="/" replace />} />
      <Route path="/:slug" element={<RedirectPage />} />
    </Routes>
  );
}
