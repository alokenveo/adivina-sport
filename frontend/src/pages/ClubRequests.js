import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/App";
import ClubLayout from "@/components/ClubLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Send, MessageSquare } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ClubRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const fetchRequests = useCallback(async () => {
    if (!user?.club_id) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/requests/${user.club_id}`);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.club_id]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/requests/${user.club_id}`, {
        title,
        description
      });
      
      toast.success('Solicitud enviada exitosamente');
      setTitle("");
      setDescription("");
      setShowNewRequest(false);
      fetchRequests();
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error('Error al enviar la solicitud');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return 'APROBADA';
      case 'rejected': return 'RECHAZADA';
      case 'pending': return 'PENDIENTE';
      default: return status.toUpperCase();
    }
  };

  return (
    <ClubLayout title="Mis Solicitudes">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <p className="text-zinc-400">Envía solicitudes y consultas directamente a ADIVINA</p>
          <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
            <DialogTrigger asChild>
              <Button 
                data-testid="new-request-button"
                className="bg-[#DFFF00] text-black hover:bg-white font-bold uppercase tracking-wider rounded-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nueva Solicitud
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#121212] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Nueva Solicitud</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Envía tu consulta o solicitud al equipo de ADIVINA
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-zinc-300">Título</Label>
                  <Input
                    id="title"
                    data-testid="request-title-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Solicitud de nuevos uniformes"
                    className="bg-[#0A0A0A] border-white/10 text-white mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-zinc-300">Descripción</Label>
                  <Textarea
                    id="description"
                    data-testid="request-description-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe tu solicitud en detalle..."
                    className="bg-[#0A0A0A] border-white/10 text-white mt-2 min-h-32"
                  />
                </div>
                <Button 
                  data-testid="submit-request-button"
                  type="submit" 
                  className="w-full bg-[#DFFF00] text-black hover:bg-white font-bold uppercase"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Solicitud
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-zinc-400">Cargando solicitudes...</p>
          </div>
        ) : requests.length === 0 ? (
          <Card className="bg-[#121212] border-white/10 p-12 text-center">
            <MessageSquare className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No tienes solicitudes aún</p>
            <p className="text-zinc-600 text-sm mt-2">Crea tu primera solicitud usando el botón de arriba</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <Card 
                key={request.id} 
                data-testid={`request-card-${request.id}`}
                className="bg-[#121212] border-white/10"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{request.title}</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs">
                        {new Date(request.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {getStatusLabel(request.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-zinc-400 mb-2 font-bold">Tu solicitud:</p>
                      <p className="text-zinc-300">{request.description}</p>
                    </div>
                    {request.admin_response && (
                      <div className="mt-4 p-4 bg-[#1E1E1E] border border-[#DFFF00]/20 rounded-lg">
                        <p className="text-sm text-[#DFFF00] mb-2 font-bold">Respuesta de ADIVINA:</p>
                        <p className="text-zinc-300">{request.admin_response}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ClubLayout>
  );
};

export default ClubRequests;
