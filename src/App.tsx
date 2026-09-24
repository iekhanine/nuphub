import { Navigate, Route, Routes } from "react-router-dom";

import { NupHubProfileRoute } from "./components/NupHubProfileRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthCallback from "./pages/AuthCallback";
import SetupPage from "./pages/SetupPage";
import Dashboard from "./pages/Dashboard";
import LinksPage from "./pages/LinksPage";
import OverlaySettingsPage from "./pages/OverlaySettingsPage";
import ObsHowToPage from "./pages/ObsHowToPage";
import BillingPage from "./pages/BillingPage";
import AccountPage from "./pages/AccountPage";
import ObsOverlayPage from "./pages/ObsOverlayPage";
import ObsAllLinksPage from "./pages/ObsAllLinksPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import RedirectPage from "./pages/RedirectPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import FeaturesPage from "./pages/FeaturesPage";
import ObsPage from "./pages/ObsPage";
import TwitchPage from "./pages/TwitchPage";
import PricingPage from "./pages/PricingPage";
import AdminUsersPage from "./pages/AdminUsersPage";

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
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/obs" element={<ObsPage />} />
      <Route path="/twitch" element={<TwitchPage />} />
      <Route path="/pricing" element={<PricingPage />} />
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
        path="/dashboard/links"
        element={
          <NupHubAppRoute>
            <LinksPage />
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
        path="/dashboard/obs-how-to"
        element={
          <NupHubAppRoute>
            <ObsHowToPage />
          </NupHubAppRoute>
        }
      />

      <Route
        path="/dashboard/billing"
        element={
          <NupHubAppRoute>
            <BillingPage />
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

      <Route
        path="/dashboard/admin"
        element={<Navigate to="/dashboard/admin/users" replace />}
      />

      <Route
        path="/dashboard/admin/users"
        element={
          <NupHubAppRoute>
            <AdminUsersPage />
          </NupHubAppRoute>
        }
      />

      <Route
        path="/obs/:handle/all"
        element={<ObsAllLinksPage />}
      />
      <Route path="/obs/:handle" element={<ObsOverlayPage />} />
      <Route path="/u/:handle" element={<PublicProfilePage />} />

      <Route path="/404" element={<Navigate to="/" replace />} />
      <Route path="/:slug" element={<RedirectPage />} />
    </Routes>
  );
}
