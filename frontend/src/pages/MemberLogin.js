import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Lock } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MemberLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/clubs/names`);
      setClubs(response.data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast.error('Error al cargar clubes');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!selectedClub || !password) {
      toast.error('Por favor selecciona un club e ingresa la contraseña');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        club_name: selectedClub,
        password: password
      });
      
      login(response.data);
      toast.success(`¡Bienvenido, ${response.data.club_name}!`);
      navigate('/club/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.detail || 'Error de inicio de sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] noise-bg flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1634152557768-b5bb22302a56?w=1200)',
          filter: 'blur(8px)'
        }}
      />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#121212] border border-white/10 rounded-lg p-8 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <img 
              src="https://customer-assets.emergentagent.com/job_adivina-portal/artifacts/rexq8hh7_A56B5578-48F3-41C0-A247-75CAB5930CA5.png" 
              alt="ADIVINA" 
              className="h-16 mx-auto mb-6"
            />
            <h1 className="text-3xl font-bold uppercase mb-2">CLUB MIEMBRO</h1>
            <p className="text-zinc-400">Accede a tu portal privado</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="club" className="text-zinc-300 mb-2 block">SELECCIONA TU CLUB</Label>
              <Select value={selectedClub} onValueChange={setSelectedClub}>
                <SelectTrigger 
                  id="club"
                  data-testid="club-select"
                  className="bg-[#0A0A0A] border-white/10 text-white h-12"
                >
                  <SelectValue placeholder="Elige un club..." />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10">
                  {clubs.map((club) => (
                    <SelectItem 
                      key={club} 
                      value={club}
                      className="text-white hover:bg-white/5 focus:bg-white/5"
                    >
                      {club}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="password" className="text-zinc-300 mb-2 block">CONTRASEÑA</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  id="password"
                  data-testid="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="bg-[#0A0A0A] border-white/10 text-white pl-10 h-12 focus:border-[#DFFF00] focus:ring-1 focus:ring-[#DFFF00]"
                />
              </div>
            </div>

            <Button 
              data-testid="login-submit-button"
              type="submit" 
              disabled={loading}
              className="w-full bg-[#DFFF00] text-black hover:bg-white hover:text-black font-bold uppercase tracking-wider h-12 rounded-sm transition-all duration-300"
            >
              {loading ? 'INGRESANDO...' : 'INGRESAR'}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Button 
              data-testid="back-button"
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-zinc-400 hover:text-white p-0"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
            <Button 
              onClick={() => navigate('/admin/login')}
              variant="ghost"
              className="text-zinc-400 hover:text-[#DFFF00] p-0 text-xs"
            >
              Acceso Admin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberLogin;
