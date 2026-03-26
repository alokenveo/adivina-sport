import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, ChevronRight, Zap, Award, Lock } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Premium animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(223,255,0,0.1),transparent_50%)]" />
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-[#DFFF00]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-[#DFFF00]/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#DFFF00_1px,transparent_1px),linear-gradient(to_bottom,#DFFF00_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-5" />
      </div>
      
      {/* Header */}
      <header className="relative z-10 px-6 py-8 border-b border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_adivina-portal/artifacts/rexq8hh7_A56B5578-48F3-41C0-A247-75CAB5930CA5.png" 
              alt="ADIVINA" 
              className="h-12"
            />
            <div className="h-8 w-px bg-[#DFFF00]/30" />
            <span className="text-[#DFFF00] font-bold tracking-wider text-sm">ELITE SPORTS</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-zinc-600" />
            <span className="text-zinc-600 text-xs uppercase tracking-wide">Acceso Privado</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/20 mb-8 backdrop-blur-sm">
            <Zap className="h-4 w-4 text-[#DFFF00]" />
            <span className="text-[#DFFF00] text-sm font-medium">Portal Exclusivo para Socios</span>
          </div>
          
          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6 leading-none">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">Sistema de</span>
            <br />
            <span className="bg-gradient-to-r from-[#DFFF00] via-[#FFED4E] to-[#DFFF00] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(223,255,0,0.3)]">Gestión</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Plataforma avanzada para clubes deportivos de élite.
            <span className="text-white"> Control total</span> de contratos, facturas y equipamiento.
          </p>
          
          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4">
            <Button 
              data-testid="member-portal-access-button"
              onClick={() => navigate('/member-club')}
              className="group relative bg-[#DFFF00] text-black hover:bg-[#FFED4E] font-bold uppercase tracking-wider px-12 py-8 text-xl rounded-none transition-all duration-300 overflow-hidden shadow-[0_0_50px_rgba(223,255,0,0.3)] hover:shadow-[0_0_80px_rgba(223,255,0,0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <Shield className="mr-3 h-7 w-7 group-hover:rotate-12 transition-transform" />
              Acceder al Portal
              <ChevronRight className="ml-3 h-7 w-7 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-zinc-600 text-sm flex items-center gap-2">
              <Lock className="h-3 w-3" />
              Acceso protegido solo para miembros autorizados
            </p>
          </div>
          
          {/* Features */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { 
                icon: Shield,
                title: 'Máxima Seguridad', 
                description: 'Datos protegidos con cifrado de nivel bancario'
              },
              { 
                icon: Zap,
                title: 'Gestión Instantánea', 
                description: 'Acceso inmediato a contratos y facturas'
              },
              { 
                icon: Award,
                title: 'Sistema de Niveles', 
                description: 'Beneficios exclusivos según rendimiento'
              }
            ].map((item, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-b from-[#DFFF00]/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-8 bg-zinc-950/50 border border-white/5 rounded-lg backdrop-blur-sm hover:border-[#DFFF00]/30 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-[#DFFF00]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className="h-6 w-6 text-[#DFFF00]" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-[#DFFF00] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs">
          <p className="text-zinc-700">© 2026 ADIVINA. Todos los derechos reservados.</p>
          <p className="text-zinc-800 uppercase tracking-wider">Equipamiento Deportivo Premium</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;