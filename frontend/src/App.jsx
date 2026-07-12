import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { can } from "./config/permissions";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Fleet from "./pages/Fleet";
import Drivers from "./pages/Drivers";
import Trips from "./pages/Trips";
import Maintenance from "./pages/Maintenance";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Profile from "./pages/Profile";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function RoleGuard({ module, children }) {
  const { user } = useAuth();
  if (!user) return null;
  return can(user.role, module) ? children : <Navigate to="/dashboard" replace />;
}

const guarded = (module, element) => <RoleGuard module={module}>{element}</RoleGuard>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/fleet" element={guarded("fleet", <Fleet />)} />
        <Route path="/drivers" element={guarded("drivers", <Drivers />)} />
        <Route path="/trips" element={guarded("trips", <Trips />)} />
        <Route path="/maintenance" element={guarded("maintenance", <Maintenance />)} />
        <Route path="/expenses" element={guarded("expenses", <Expenses />)} />
        <Route path="/analytics" element={guarded("analytics", <Analytics />)} />
        <Route path="/users" element={guarded("users", <Users />)} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}
