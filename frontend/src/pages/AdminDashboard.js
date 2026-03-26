import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, LogOut, Users, FileText, Trophy, Palette, MessageSquare, Newspaper, LayoutDashboard, Award, Settings, AlertTriangle } from "lucide-react";
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, adminLogout } = useAuth();
  const [activeTab, setActiveTab] = useState("clubs");

  const handleLogout = () => {
    adminLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#050505] noise-bg">
      <header className="border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#DFFF00] rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase">Panel de Administrador</h1>
              <p className="text-xs text-zinc-500">Control Total del Sistema ADIVINA</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">Bienvenido, {admin?.username}</span>
            <Button 
              data-testid="admin-logout-button"
              onClick={handleLogout}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 gap-2 bg-[#121212] p-1 h-auto">
            <TabsTrigger 
              value="clubs" 
              className="data-[state=active]:bg-[#DFFF00] data-[state=active]:text-black flex flex-col items-center gap-2 py-3"
            >
              <Users className="h-5 w-5" />
              <span className="text-xs">Clubes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-[#DFFF00] data-[state=active]:text-black flex flex-col items-center gap-2 py-3"
            >
              <Shield className="h-5 w-5" />
              <span className="text-xs">Perfiles</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tiers" 
              className="data-[state=active]:bg-[#DFFF00] data-[state=active]:text-black flex flex-col items-center gap-2 py-3"
            >
              <Award className="h-5 w-5" />
              <span className="text-xs">Niveles</span>
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="data-[state=active]:bg-[#DFFF00] data-[state=active]:text-black flex flex-col items-center gap-2 py-3"
            >
              <Newspaper className="h-5 w-5" />
              <span className="text-xs">Contenido</span>
            </TabsTrigger>
            <TabsTrigger 
              value="operations" 
              className="data-[state=active]:bg-[#DFFF00] data-[state=active]:text-black flex flex-col items-center gap-2 py-3"
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs">Operaciones</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reset" 
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white flex flex-col items-center gap-2 py-3"
            >
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs">Reset</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clubs"><ClubsManagement /></TabsContent>
          <TabsContent value="profile"><ClubProfileEditor /></TabsContent>
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
