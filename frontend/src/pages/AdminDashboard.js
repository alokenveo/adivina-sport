import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, LogOut, Users, FileText, Trophy, Palette,
  MessageSquare, Newspaper, LayoutDashboard, Award,
  Settings, AlertTriangle
} from "lucide-react";
import ClubsManagement from "@/components/admin/ClubsManagement";
import NewsManagement from "@/components/admin/NewsManagement";
import DashboardContentManagement from "@/components/admin/DashboardContentManagement";
import ContractsManagement from "@/components/admin/ContractsManagement";
import InvoicesManagement from "@/components/admin/InvoicesManagement";
import PointsManagement from "@/components/admin/PointsManagement";
import KitDesignsManagement from "@/components/admin/KitDesignsManagement";
import RequestsManagement from "@/components/admin/RequestsManagement";
import ClubProfileEditor from "@/components/admin/ClubProfileEditor";
import MemberTierSystem from "@/components/admin/MemberTierSystem";
import PointsRulesEngine from "@/components/admin/PointsRulesEngine";
import ResetManagement from "@/components/admin/ResetManagement";
import OrdersManagement from "@/components/admin/OrdersManagement";
import ClubNavConfig from "@/components/admin/ClubNavConfig";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, adminLogout } = useAuth();
  const [activeTab, setActiveTab] = useState("clubs");

  const handleLogout = () => {
    adminLogout();
    navigate("/member-club");
  };

  return (
    <div className="min-h-screen bg-[#050505] noise-bg">
      {/* ── Header ── */}
      <header className="border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[#DFFF00] rounded-full flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold uppercase leading-tight">Panel de Administrador</h1>
              <p className="text-xs text-zinc-500 hidden sm:block">Control Total del Sistema ADIVINA</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <span className="text-xs sm:text-sm text-zinc-400 hidden sm:block">
              Bienvenido, {admin?.username}
            </span>
            <Button
              data-testid="admin-logout-button"
              onClick={handleLogout}
              variant="outline"
              size="icon"
              className="border-white/20 text-white hover:bg-white/5 sm:hidden"
              title="Cerrar Sesión"
            >
              <LogOut className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5 hidden sm:flex"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 gap-1 bg-[#121212] p-1 h-auto w-full">
            {[
              { value: "clubs",      Icon: Users,         label: "Clubes"      },
              { value: "profile",    Icon: Shield,        label: "Perfiles"    },
              { value: "tiers",      Icon: Award,         label: "Niveles"     },
              { value: "content",    Icon: Newspaper,     label: "Contenido"   },
              { value: "operations", Icon: Settings,      label: "Operaciones" },
              { value: "reset",      Icon: AlertTriangle, label: "Reset", danger: true },
            ].map(({ value, Icon, label, danger }) => (
              <TabsTrigger
                key={value}
                value={value}
                className={`flex flex-col items-center gap-1 py-2 px-1 text-[10px] sm:text-xs
                  ${danger
                    ? "data-[state=active]:bg-red-500 data-[state=active]:text-white"
                    : "data-[state=active]:bg-[#DFFF00] data-[state=active]:text-black"
                  }`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                <span className="hidden xs:inline sm:inline leading-none">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="clubs"><ClubsManagement /></TabsContent>

          {/* Pestaña Perfiles: editor de perfil + configuración de nav */}
          <TabsContent value="profile" className="space-y-6">
            {/* Nav config primero: es la herramienta de personalización principal */}
            <ClubNavConfig />
            <ClubProfileEditor />
          </TabsContent>

          <TabsContent value="tiers"><MemberTierSystem /></TabsContent>

          <TabsContent value="content" className="space-y-6">
            <NewsManagement />
            <DashboardContentManagement />
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <ContractsManagement />
            <InvoicesManagement />
            <PointsManagement />
            <PointsRulesEngine />
            <KitDesignsManagement />
            <RequestsManagement />
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="reset">
            <ResetManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;