import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/App";
import ClubLayout from "@/components/ClubLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, Clock } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ClubContracts = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = useCallback(async () => {
    if (!user?.club_id) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/contracts/${user.club_id}`);
      const contractsWithPdf = response.data.filter(c => c.file_url);
      setContracts(contractsWithPdf);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.club_id]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const getContractStatus = (contract) => {
    if (!contract.start_date || !contract.end_date) return 'active';
    const now = new Date();
    const start = new Date(contract.start_date);
    const end = new Date(contract.end_date);
    if (now < start) return 'upcoming';
    if (now > end) return 'expired';
    return 'active';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':   return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'expired':  return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:         return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':   return 'ACTIVO';
      case 'expired':  return 'EXPIRADO';
      case 'upcoming': return 'PRÓXIMO';
      default:         return status.toUpperCase();
    }
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const now = new Date();
    const end = new Date(endDate);
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  return (
    <ClubLayout title="Contratos">
      {loading ? (
        <div className="text-center py-20">
          <p className="text-zinc-400">Cargando contratos...</p>
        </div>
      ) : contracts.length === 0 ? (
        <Card className="bg-[#121212] border-white/10 p-12 text-center">
          <FileText className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No hay contratos disponibles</p>
          <p className="text-zinc-600 text-sm mt-2">Los contratos apareceran aqui cuando el administrador los suba</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {contracts.map((contract) => {
            const status = getContractStatus(contract);
            const daysRemaining = getDaysRemaining(contract.end_date);

            return (
              <Card key={contract.id} className="bg-[#121212] border-white/10 hover:border-[#DFFF00]/30 transition-all">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{contract.title}</CardTitle>
                        <Badge className={getStatusColor(status)}>
                          {getStatusLabel(status)}
                        </Badge>
                      </div>
                      <p className="text-zinc-400 text-sm">{contract.description}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-3xl font-bold text-[#DFFF00]">${contract.value.toLocaleString('es-ES')}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {contract.start_date && (
                      <div className="flex items-center gap-2 p-3 bg-[#1E1E1E] rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-zinc-500">Fecha de Inicio</p>
                          <p className="text-sm font-medium">{new Date(contract.start_date).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                    )}
                    {contract.end_date && (
                      <div className="flex items-center gap-2 p-3 bg-[#1E1E1E] rounded-lg">
                        <Calendar className="h-5 w-5 text-red-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-zinc-500">Fecha de Vencimiento</p>
                          <p className="text-sm font-medium">{new Date(contract.end_date).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                    )}
                    {daysRemaining !== null && status === 'active' && (
                      <div className="flex items-center gap-2 p-3 bg-[#1E1E1E] rounded-lg">
                        <Clock className="h-5 w-5 text-[#DFFF00] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-zinc-500">Días Restantes</p>
                          <p className="text-sm font-medium">{daysRemaining} días</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {contract.file_url && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gradient-to-r from-[#DFFF00]/10 to-transparent border border-[#DFFF00]/20 rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-8 w-8 text-[#DFFF00] shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium">Documento del Contrato</p>
                          <p className="text-xs text-zinc-500">Archivo PDF disponible para descarga</p>
                        </div>
                      </div>
                      {/* ✅ FIX: contract.file_url ya es la URL firmada completa de Supabase */}
                      <Button
                        onClick={() => window.open(contract.file_url, '_blank')}
                        className="bg-[#DFFF00] text-black hover:bg-white w-full sm:w-auto shrink-0"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Descargar PDF
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </ClubLayout>
  );
};

export default ClubContracts;
