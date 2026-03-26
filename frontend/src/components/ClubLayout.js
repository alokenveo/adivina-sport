import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, Home, FileText, Package, Trophy, Palette, LogOut, Receipt, Users } from "lucide-react";

const ClubLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: "Panel Principal", path: "/club/dashboard" },
    { icon: Users, label: "Perfil del Club", path: "/club/profile" },
    { icon: FileText, label: "Contratos", path: "/club/contracts" },
    { icon: Receipt, label: "Facturas", path: "/club/invoices" },
    { icon: Trophy, label: "Sistema de Puntos", path: "/club/points" },
    { icon: Palette, label: "Diseño de Kit", path: "/club/kit-design" },
    { icon: Package, label: "Solicitudes", path: "/club/requests" }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#050505] noise-bg">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button 
                  data-testid="hamburger-menu-button"
                  variant="ghost" 
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#050505] border-white/10 w-64 p-0">
                <SheetTitle className="sr-only">Menu de navegacion</SheetTitle>
                <div className="p-6 border-b border-white/10">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_adivina-portal/artifacts/rexq8hh7_A56B5578-48F3-41C0-A247-75CAB5930CA5.png" 
                    alt="ADIVINA" 
                    className="h-10"
                  />
                </div>
                <nav className="p-4">
                  {menuItems.map((item) => (
                    <Button
                      key={item.path}
                      data-testid={`menu-${item.label.toLowerCase().replace(/ /g, '-')}`}
                      onClick={() => {
                        navigate(item.path);
                        setOpen(false);
                      }}
                      variant="ghost"
                      className={`w-full justify-start mb-2 text-white hover:bg-white/5 ${
                        location.pathname === item.path
                          ? 'bg-white/5 text-[#DFFF00] border-r-2 border-[#DFFF00]'
                          : ''
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Button>
                  ))}
                  <div className="mt-8 pt-4 border-t border-white/10">
                    <Button
                      data-testid="logout-button"
                      onClick={handleLogout}
                      variant="ghost"
                      className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
            
            <img 
              src="https://customer-assets.emergentagent.com/job_adivina-portal/artifacts/rexq8hh7_A56B5578-48F3-41C0-A247-75CAB5930CA5.png" 
              alt="ADIVINA" 
              className="h-10"
            />
            <div className="border-l border-white/20 pl-4 hidden md:block">
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Private Club Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold">{user?.club_name}</p>
              <p className="text-xs text-zinc-500">Member Club</p>
            </div>
            {user?.crest_url && (
              <img 
                src={user.crest_url} 
                alt="Club Crest" 
                className="h-12 w-12 rounded-full border border-white/20"
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl md:text-5xl font-bold uppercase mb-8">{title}</h1>
        {children}
      </main>
    </div>
  );
};

export default ClubLayout;
