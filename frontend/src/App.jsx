import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Fleet from "./pages/Fleet";
import Drivers from "./pages/Drivers";
import Trips from "./pages/Trips";
import Maintenance from "./pages/Maintenance";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Users from "./pages/Users";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/fleet" element={<Fleet />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/users" element={<Users />} />
      </Route>
    </Routes>
  );
}
