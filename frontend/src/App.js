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
import ClubLeague from "@/pages/ClubLeague";
import AdminDashboard from "@/pages/AdminDashboard";
import LeaguePublic from "@/pages/LeaguePublic";
import FederationPortal from "@/pages/FederationPortal";
import { Toaster } from "@/components/ui/sonner";
import "@/App.css";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Protección básica
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, admin, authLoaded } = useAuth();
  if (!authLoaded) return null;
  if (requireAdmin) return admin ? children : <Navigate to="/member-club" replace />;
  return user ? children : <Navigate to="/member-club" replace />;
};

// Protección por sección: el club debe tener la sección habilitada en nav_sections
const SectionRoute = ({ sectionKey, children }) => {
  const { user, authLoaded } = useAuth();
  if (!authLoaded) return null;
  if (!user) return <Navigate to="/member-club" replace />;
  if (user.institution_type === 'federation') return <Navigate to="/federation/dashboard" replace />;
  if (!user.nav_sections) return children;
  if (sectionKey === "profile") return children;
  if (!user.nav_sections.includes(sectionKey)) return <Navigate to="/club/dashboard" replace />;
  return children;
};

// Redirección inteligente según tipo de institución
const SmartClubRoute = ({ children }) => {
  const { user, authLoaded } = useAuth();
  if (!authLoaded) return null;
  if (!user) return <Navigate to="/member-club" replace />;
  if (user.institution_type === 'federation') return <Navigate to="/federation/dashboard" replace />;
  return children;
};

// Portal de federación — solo para institution_type === 'federation'
const FederationRoute = ({ children }) => {
  const { user, authLoaded } = useAuth();
  if (!authLoaded) return null;
  if (!user) return <Navigate to="/member-club" replace />;
  if (user.institution_type !== 'federation') return <Navigate to="/club/dashboard" replace />;
  return children;
};

function App() {
  const [user, setUser]             = useState(null);
  const [admin, setAdmin]           = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    const storedUser  = localStorage.getItem("club_user");
    const storedAdmin = localStorage.getItem("admin_user");
    if (storedUser)  try { setUser(JSON.parse(storedUser));  } catch {}
    if (storedAdmin) try { setAdmin(JSON.parse(storedAdmin)); } catch {}
    setAuthLoaded(true);
  }, []);

  const login       = (d) => { setUser(d);   localStorage.setItem("club_user",  JSON.stringify(d)); };
  const adminLogin  = (d) => { setAdmin(d);  localStorage.setItem("admin_user", JSON.stringify(d)); };
  const logout      = ()  => { setUser(null);  localStorage.removeItem("club_user");  };
  const adminLogout = ()  => { setAdmin(null); localStorage.removeItem("admin_user"); };

  return (
    <AuthContext.Provider value={{ user, admin, login, logout, adminLogin, adminLogout, authLoaded }}>
      <div className="App min-h-screen bg-[#050505]">
        <BrowserRouter>
          <Routes>
            {/* ── Públicas ── */}
            <Route path="/"     element={<Landing />} />
            <Route path="/liga" element={<LeaguePublic />} />

            {/* ── Auth ── */}
            <Route path="/member-club" element={<MemberLogin />} />
            <Route path="/admin/login" element={<Navigate to="/member-club" replace />} />

            {/* ── Admin ── */}
            <Route path="/admin/dashboard"
              element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />

            {/* ── Federación — portal propio ── */}
            <Route path="/federation/dashboard"
              element={<FederationRoute><FederationPortal /></FederationRoute>} />

            {/* ── Club — siempre accesibles ── */}
            <Route path="/club/dashboard"
              element={<SmartClubRoute><ClubDashboard /></SmartClubRoute>} />
            <Route path="/club/profile"
              element={<SmartClubRoute><ClubProfile /></SmartClubRoute>} />

            {/* ── Club — protegidas por sección ── */}
            <Route path="/club/contracts"
              element={<SectionRoute sectionKey="contracts"><ClubContracts /></SectionRoute>} />
            <Route path="/club/invoices"
              element={<SectionRoute sectionKey="invoices"><ClubInvoices /></SectionRoute>} />
            <Route path="/club/points"
              element={<SectionRoute sectionKey="points"><ClubPoints /></SectionRoute>} />
            <Route path="/club/kit-design"
              element={<SectionRoute sectionKey="kit-design"><KitDesign /></SectionRoute>} />
            <Route path="/club/requests"
              element={<SectionRoute sectionKey="requests"><ClubRequests /></SectionRoute>} />
            <Route path="/club/orders"
              element={<SectionRoute sectionKey="orders"><ClubOrders /></SectionRoute>} />
            <Route path="/club/liga"
              element={<SectionRoute sectionKey="league"><ClubLeague /></SectionRoute>} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </AuthContext.Provider>
  );
}

export default App;