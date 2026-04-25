import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  Menu, Home, FileText, Package, Trophy, Palette,
  LogOut, Receipt, Users, ShoppingBag, Swords
} from "lucide-react";

const ALL_MENU_ITEMS = [
  { key: "contracts", icon: FileText, label: "Contratos", path: "/club/contracts" },
  { key: "invoices", icon: Receipt, label: "Facturas", path: "/club/invoices" },
  { key: "points", icon: Trophy, label: "Sistema de Puntos", path: "/club/points" },
  { key: "kit-design", icon: Palette, label: "Diseño de Kit", path: "/club/kit-design" },
  { key: "requests", icon: Package, label: "Solicitudes", path: "/club/requests" },
  { key: "orders", icon: ShoppingBag, label: "Mis Pedidos", path: "/club/orders" },
  { key: "league", icon: Swords, label: "Liga", path: "/club/liga", highlight: true },
];

const ClubLayout = ({ children, title }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const fixedItems = [
    { key: "profile", icon: Users, label: "Perfil del Club", path: "/club/profile" },
  ];

  const enabledSections = user?.nav_sections || ALL_MENU_ITEMS.map(i => i.key);
  const dynamicItems = ALL_MENU_ITEMS.filter(item => enabledSections.includes(item.key));

  const menuItems = [
    { key: "dashboard", icon: Home, label: "Panel Principal", path: "/club/dashboard" },
    ...fixedItems,
    ...dynamicItems,
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#050505] noise-bg">
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
                  {user?.sport && user.sport !== 'football' && (
                    <span className="mt-3 inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-zinc-500">
                      {SPORT_LABELS[user.sport] || user.sport}
                    </span>
                  )}
                </div>
                <nav className="p-4">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Button
                        key={item.path}
                        data-testid={`menu-${item.label.toLowerCase().replace(/ /g, "-")}`}
                        onClick={() => { navigate(item.path); setOpen(false); }}
                        variant="ghost"
                        className={`w-full justify-start mb-2 text-white hover:bg-white/5 ${
                          isActive ? "bg-white/5 text-[#DFFF00] border-r-2 border-[#DFFF00]" : ""
                        } ${
                          item.highlight && !isActive ? "border border-[#DFFF00]/20 hover:border-[#DFFF00]/40" : ""
                        }`}
                      >
                        <item.icon className={`mr-3 h-5 w-5 ${item.highlight ? "text-[#DFFF00]" : ""}`} />
                        {item.label}
                        {item.highlight && !isActive && (
                          <span className="ml-auto text-[9px] font-bold tracking-widest text-[#DFFF00] bg-[#DFFF00]/10 px-1.5 py-0.5 rounded">
                            LIVE
                          </span>
                        )}
                      </Button>
                    );
                  })}
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
              <p className="text-xs text-zinc-500">
                {user?.sport ? SPORT_LABELS[user.sport] || user.sport : "Member Club"}
              </p>
            </div>
            {user?.crest_url && (
              /* Logo sin molde circular — object-contain para respetar la forma del PNG */
              <div className="h-12 w-12 flex items-center justify-center">
                <img
                  src={user.crest_url}
                  alt="Club Crest"
                  className="max-h-12 max-w-12 w-auto h-auto object-contain"
                  style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.15))" }}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl md:text-5xl font-bold uppercase mb-8">{title}</h1>
        {children}
      </main>
    </div>
  );
};

export const SPORT_LABELS = {
  football:   "Fútbol",
  basketball: "Baloncesto",
  volleyball: "Voleibol",
  futsal:     "Fútbol Sala",
  other:      "Deportes",
};

export default ClubLayout;
