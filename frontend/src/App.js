import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import Landing from "@/pages/Landing";
import MemberLogin from "@/pages/MemberLogin";
import ClubDashboard from "@/pages/ClubDashboard";
import ClubContracts from "@/pages/ClubContracts";
import ClubPoints from "@/pages/ClubPoints";
import KitDesign from "@/pages/KitDesign";
import ClubRequests from "@/pages/ClubRequests";
import ClubInvoices from "@/pages/ClubInvoices";
import ClubProfile from "@/pages/ClubProfile";
import ClubOrders from "@/pages/ClubOrders";
import ClubLeague from "@/pages/ClubLeague";           // ← NUEVO
import AdminDashboard from "@/pages/AdminDashboard";
import LeaguePublic from "@/pages/LeaguePublic";       // ← NUEVO
import FederationDashboard from "@/pages/FederationDashboard"; // ← NUEVO
import { Toaster } from "@/components/ui/sonner";
import "@/App.css";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, admin, authLoaded } = useAuth();
  if (!authLoaded) return null;
  if (requireAdmin) return admin ? children : <Navigate to="/member-club" replace />;
  return user ? children : <Navigate to="/member-club" replace />;
};

// Protege el panel de federación: debe tener federation_user en localStorage
const FederationRoute = ({ children }) => {
  const stored = localStorage.getItem("federation_user");
  return stored ? children : <Navigate to="/liga" replace />;
};

function App() {
  const [user, setUser]           = useState(null);
  const [admin, setAdmin]         = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    const storedUser  = localStorage.getItem("club_user");
    const storedAdmin = localStorage.getItem("admin_user");
    if (storedUser)  try { setUser(JSON.parse(storedUser));  } catch {}
    if (storedAdmin) try { setAdmin(JSON.parse(storedAdmin)); } catch {}
    setAuthLoaded(true);
  }, []);

  const login      = (d) => { setUser(d);  localStorage.setItem("club_user",   JSON.stringify(d)); };
  const adminLogin = (d) => { setAdmin(d); localStorage.setItem("admin_user",  JSON.stringify(d)); };
  const logout     = ()  => { setUser(null);  localStorage.removeItem("club_user");  };
  const adminLogout= ()  => { setAdmin(null); localStorage.removeItem("admin_user"); };

  return (
    <AuthContext.Provider value={{ user, admin, login, logout, adminLogin, adminLogout, authLoaded }}>
      <div className="App min-h-screen bg-[#050505]">
        <BrowserRouter>
          <Routes>
            {/* ── Públicas ── */}
            <Route path="/"     element={<Landing />} />
            <Route path="/liga" element={<LeaguePublic />} />   {/* ← vista pública liga */}

            {/* ── Auth ── */}
            <Route path="/member-club"  element={<MemberLogin />} />
            <Route path="/admin/login"  element={<Navigate to="/member-club" replace />} />

            {/* ── Admin ── */}
            <Route
              path="/admin/dashboard"
              element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>}
            />

            {/* ── Panel federación ── */}
            <Route
              path="/federation/dashboard"
              element={<FederationRoute><FederationDashboard /></FederationRoute>}
            />

            {/* ── Club (miembros) ── */}
            <Route path="/club/dashboard" element={<ProtectedRoute><ClubDashboard /></ProtectedRoute>} />
            <Route path="/club/contracts" element={<ProtectedRoute><ClubContracts /></ProtectedRoute>} />
            <Route path="/club/points"    element={<ProtectedRoute><ClubPoints /></ProtectedRoute>} />
            <Route path="/club/kit-design"element={<ProtectedRoute><KitDesign /></ProtectedRoute>} />
            <Route path="/club/requests"  element={<ProtectedRoute><ClubRequests /></ProtectedRoute>} />
            <Route path="/club/invoices"  element={<ProtectedRoute><ClubInvoices /></ProtectedRoute>} />
            <Route path="/club/profile"   element={<ProtectedRoute><ClubProfile /></ProtectedRoute>} />
            <Route path="/club/orders"    element={<ProtectedRoute><ClubOrders /></ProtectedRoute>} />
            <Route path="/club/liga"      element={<ProtectedRoute><ClubLeague /></ProtectedRoute>} />  {/* ← NUEVO */}
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </AuthContext.Provider>
  );
}

export default App;