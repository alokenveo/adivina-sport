import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertTriangle, Trash2, RefreshCw, FileText, Receipt, Trophy, Palette, MessageSquare, Newspaper, LayoutDashboard } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const RESET_OPTIONS = [
  { 
    key: "contracts", 
    label: "Contratos", 
    icon: FileText, 
    description: "Elimina todos los contratos del club seleccionado",
    color: "text-blue-400",
    requiresClub: true
  },
  { 
    key: "invoices", 
    label: "Facturas", 
    icon: Receipt, 
    description: "Elimina todas las facturas del club seleccionado",
    color: "text-green-400",
    requiresClub: true
  },
  { 
    key: "points", 
    label: "Puntos", 
    icon: Trophy, 
    description: "Resetea los puntos a 0 y borra el historial",
    color: "text-yellow-400",
    requiresClub: true
  },
  { 
    key: "designs", 
    label: "Disenos de Kit", 
    icon: Palette, 
    description: "Elimina todos los diseños de equipamiento",
    color: "text-purple-400",
    requiresClub: true
  },
  { 
    key: "requests", 
    label: "Solicitudes", 
    icon: MessageSquare, 
    description: "Elimina todas las solicitudes del club",
    color: "text-orange-400",
    requiresClub: true
  },
  { 
    key: "news", 
    label: "Noticias", 
    icon: Newspaper, 
    description: "Elimina todas las noticias (global)",
    color: "text-pink-400",
    requiresClub: false
  },
  { 
    key: "dashboard-content", 
    label: "Contenido Dashboard", 
    icon: LayoutDashboard, 
    description: "Elimina todo el contenido del dashboard (global)",
    color: "text-cyan-400",
    requiresClub: false
  }
];

const ResetManagement = () => {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({ open: false, option: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/clubs`);
      setClubs(response.data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const handleReset = async () => {
    const option = confirmDialog.option;
    if (!option) return;
    
    if (option.requiresClub && !selectedClub) {
      toast.error("Selecciona un club primero");
      return;
    }

    setLoading(true);
    try {
      let endpoint;
      if (option.requiresClub) {
        endpoint = `${BACKEND_URL}/api/admin/reset/${option.key}/${selectedClub}`;
      } else {
        endpoint = `${BACKEND_URL}/api/admin/reset/${option.key}`;
      }
      
      await axios.delete(endpoint);
      toast.success(`${option.label} reseteado correctamente`);
      setConfirmDialog({ open: false, option: null });
    } catch (error) {
      toast.error("Error al resetear");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-[#121212] border-red-500/20">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-6 w-6" />
          Reset de Datos
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Elimina datos de forma permanente. Esta accion NO se puede deshacer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Club Selector */}
        <div className="p-4 bg-[#1E1E1E] rounded-lg border border-white/10">
          <p className="text-sm text-zinc-400 mb-3">Selecciona el club para las opciones que lo requieren:</p>
          <Select value={selectedClub} onValueChange={setSelectedClub}>
            <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white">
              <SelectValue placeholder="Selecciona un club" />
            </SelectTrigger>
            <SelectContent className="bg-[#121212] border-white/10">
              {clubs.map((club) => (
                <SelectItem key={club.id} value={club.id} className="text-white">
                  {club.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Reset Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {RESET_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isDisabled = option.requiresClub && !selectedClub;
            
            return (
              <div 
                key={option.key}
                className={`p-4 bg-[#1E1E1E] rounded-lg border border-white/10 ${
                  isDisabled ? 'opacity-50' : 'hover:border-red-500/30'
                } transition-all`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${option.color}`} />
                    <span className="font-semibold">{option.label}</span>
                  </div>
                  {!option.requiresClub && (
                    <span className="text-xs bg-zinc-700 px-2 py-0.5 rounded">GLOBAL</span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mb-4">{option.description}</p>
                <Button
                  onClick={() => setConfirmDialog({ open: true, option })}
                  disabled={isDisabled}
                  variant="outline"
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Resetear {option.label}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, option: confirmDialog.option })}>
          <DialogContent className="bg-[#121212] border-red-500/30">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Confirmar Reset
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                {confirmDialog.option?.requiresClub ? (
                  <>Estas a punto de eliminar todos los <strong>{confirmDialog.option?.label}</strong> del club <strong>{clubs.find(c => c.id === selectedClub)?.name}</strong>.</>
                ) : (
                  <>Estas a punto de eliminar todos los <strong>{confirmDialog.option?.label}</strong> del sistema.</>
                )}
                <br /><br />
                <span className="text-red-400 font-semibold">Esta accion es IRREVERSIBLE y no se guardara historial.</span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDialog({ open: false, option: null })}
                className="border-white/20"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReset}
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Confirmar Reset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ResetManagement;
