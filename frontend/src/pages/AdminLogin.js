import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, User, Lock } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Por favor ingresa usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/admin/login`, {
        username,
        password
      });
      
      adminLogin(response.data);
      toast.success('Sesión de administrador iniciada');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error(error.response?.data?.detail || 'Error de inicio de sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] noise-bg flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1634152557768-b5bb22302a56?w=1200)',
          filter: 'blur(8px)'
        }}
      />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#121212] border border-white/10 rounded-lg p-8 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-[#DFFF00] rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-8 w-8 text-black" />
            </div>
            <h1 className="text-3xl font-bold uppercase mb-2">PANEL DE ADMINISTRADOR</h1>
            <p className="text-zinc-400">Acceso restringido</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-zinc-300 mb-2 block">USUARIO</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  id="username"
                  data-testid="admin-username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa usuario"
                  className="bg-[#0A0A0A] border-white/10 text-white pl-10 h-12 focus:border-[#DFFF00] focus:ring-1 focus:ring-[#DFFF00]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-zinc-300 mb-2 block">CONTRASEÑA</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <Input
                  id="password"
                  data-testid="admin-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa contraseña"
                  className="bg-[#0A0A0A] border-white/10 text-white pl-10 h-12 focus:border-[#DFFF00] focus:ring-1 focus:ring-[#DFFF00]"
                />
              </div>
            </div>

            <Button 
              data-testid="admin-login-submit-button"
              type="submit" 
              disabled={loading}
              className="w-full bg-[#DFFF00] text-black hover:bg-white hover:text-black font-bold uppercase tracking-wider h-12 rounded-sm"
            >
              {loading ? 'INGRESANDO...' : 'INGRESAR COMO ADMIN'}
            </Button>
          </form>

          <div className="mt-6">
            <Button 
              data-testid="back-button"
              onClick={() => navigate('/member-club')}
              variant="ghost"
              className="text-zinc-400 hover:text-white p-0"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Login de Miembros
            </Button>
          </div>
        </div>
       
      </div>
    </div>
  );
};

export default AdminLogin;
