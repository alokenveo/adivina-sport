import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const RequestsManagement = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState("pending");
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/requests`);
      setRequests(res.data);
    } catch (error) {
      toast.error('Error al cargar solicitudes');
    }
  };

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!response) {
      toast.error('Escribe una respuesta');
      return;
    }
    const formData = new FormData();
    formData.append('status', status);
    formData.append('response', response);
    try {
      await axios.put(`${BACKEND_URL}/api/admin/requests/${selectedRequest.id}`, formData);
      toast.success('Respuesta enviada');
      setShowDialog(false);
      setResponse("");
      setStatus("pending");
      fetchRequests();
    } catch (error) {
      toast.error('Error');
    }
  };

  const openDialog = (request) => {
    setSelectedRequest(request);
    setResponse(request.admin_response || "");
    setStatus(request.status);
    setShowDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <Card className="bg-[#121212] border-white/10">
      <CardHeader>
        <CardTitle className="text-2xl">Gestión de Solicitudes</CardTitle>
        <CardDescription className="text-zinc-400">Responde a las solicitudes de los clubes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="p-4 bg-[#1E1E1E] border border-white/5 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">{req.title}</h3>
                  <p className="text-xs text-zinc-500">De: {req.club_name} | {new Date(req.created_at).toLocaleDateString('es-ES')}</p>
                </div>
                <Badge className={getStatusColor(req.status)}>
                  {req.status === 'approved' ? 'APROBADA' : req.status === 'rejected' ? 'RECHAZADA' : 'PENDIENTE'}
                </Badge>
              </div>
              <p className="text-zinc-400 mb-3">{req.description}</p>
              {req.admin_response && (
                <div className="p-3 bg-[#DFFF00]/10 border border-[#DFFF00]/20 rounded mb-3">
                  <p className="text-xs text-[#DFFF00] mb-1">Tu respuesta:</p>
                  <p className="text-sm text-zinc-300">{req.admin_response}</p>
                </div>
              )}
              <Button onClick={() => openDialog(req)} size="sm" className="bg-[#DFFF00] text-black hover:bg-white">
                <MessageSquare className="mr-2 h-4 w-4" />
                {req.admin_response ? 'Editar Respuesta' : 'Responder'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#121212] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Responder Solicitud</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <form onSubmit={handleRespond} className="space-y-4">
              <div>
                <p className="font-bold">{selectedRequest.title}</p>
                <p className="text-sm text-zinc-400">{selectedRequest.description}</p>
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    <SelectItem value="pending" className="text-white">Pendiente</SelectItem>
                    <SelectItem value="approved" className="text-white">Aprobada</SelectItem>
                    <SelectItem value="rejected" className="text-white">Rechazada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Respuesta</Label>
                <Textarea value={response} onChange={(e) => setResponse(e.target.value)} className="bg-[#0A0A0A] border-white/10 text-white mt-2 min-h-32" />
              </div>
              <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white">Enviar Respuesta</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default RequestsManagement;