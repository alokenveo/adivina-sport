import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/App";
import ClubLayout from "@/components/ClubLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, AlertTriangle, CheckCircle, Clock, Calendar } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ClubInvoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    if (!user?.club_id) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/member/invoices/${user.club_id}`);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.club_id]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'paid':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'PAGADO' };
      case 'pending':
        return { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'PENDIENTE' };
      case 'grace_period':
        return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'PERIODO DE GRACIA' };
      case 'overdue':
        return { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'VENCIDO' };
      default:
        return { icon: Clock, color: 'text-zinc-400', bg: 'bg-zinc-500/20', label: status };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES').format(amount) + ' XAF';
  };

  return (
    <ClubLayout title="Facturas">
      {loading ? (
        <div className="text-center py-20">
          <p className="text-zinc-400">Cargando facturas...</p>
        </div>
      ) : invoices.length === 0 ? (
        <Card className="bg-[#121212] border-white/10 p-12 text-center">
          <FileText className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No hay facturas registradas</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-[#121212] border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">Total Pendiente</p>
                    <p className="text-2xl font-bold text-[#DFFF00]">
                      {formatCurrency(invoices.filter(i => !i.paid).reduce((sum, i) => sum + i.total_due, 0))}
                    </p>
                  </div>
                  <Clock className="h-10 w-10 text-[#DFFF00]/30" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#121212] border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">Facturas Vencidas</p>
                    <p className="text-2xl font-bold text-red-400">
                      {invoices.filter(i => i.status === 'overdue').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-red-400/30" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#121212] border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">Facturas Pagadas</p>
                    <p className="text-2xl font-bold text-green-400">
                      {invoices.filter(i => i.paid).length}
                    </p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-green-400/30" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice List */}
          {invoices.map((invoice) => {
            const statusConfig = getStatusConfig(invoice.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <Card 
                key={invoice.id} 
                className={`bg-[#121212] border-white/10 hover:border-[#DFFF00]/30 transition-all ${
                  invoice.status === 'overdue' ? 'border-red-500/30' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{invoice.title}</CardTitle>
                        <Badge className={`${statusConfig.bg} ${statusConfig.color} border-transparent`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-500">ID: {invoice.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-zinc-500">Monto Original</p>
                      <p className="text-2xl font-bold">{formatCurrency(invoice.amount)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 p-3 bg-[#1E1E1E] rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-xs text-zinc-500">Fecha de Vencimiento</p>
                        <p className="text-sm font-medium">{new Date(invoice.due_date).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-[#1E1E1E] rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-400" />
                      <div>
                        <p className="text-xs text-zinc-500">Periodo de Gracia</p>
                        <p className="text-sm font-medium">{invoice.grace_period_days} dias</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-[#1E1E1E] rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-400" />
                      <div>
                        <p className="text-xs text-zinc-500">Tasa de Interes</p>
                        <p className="text-sm font-medium">{invoice.interest_rate}% mensual</p>
                      </div>
                    </div>

                    {invoice.status === 'overdue' && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <div>
                          <p className="text-xs text-red-400">Interes Acumulado</p>
                          <p className="text-sm font-bold text-red-400">+{formatCurrency(invoice.interest_amount)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Total Due Section */}
                  {!invoice.paid && (
                    <div className="p-4 bg-gradient-to-r from-[#DFFF00]/10 to-transparent border border-[#DFFF00]/20 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-zinc-400">Total a Pagar</p>
                          <p className="text-3xl font-bold text-[#DFFF00]">{formatCurrency(invoice.total_due)}</p>
                          {invoice.days_overdue > 0 && (
                            <p className="text-xs text-red-400 mt-1">{invoice.days_overdue} dias de retraso</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PDF Download */}
                  {invoice.file_url && (
                    <div className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-lg border border-white/5">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-[#DFFF00]" />
                        <div>
                          <p className="font-medium">Documento de Factura</p>
                          <p className="text-xs text-zinc-500">PDF disponible para descarga</p>
                        </div>
                      </div>
                      <Button
                        data-testid={`download-invoice-${invoice.id}`}
                        onClick={() => window.open(`${BACKEND_URL}${invoice.file_url}`, '_blank')}
                        className="bg-[#DFFF00] text-black hover:bg-white"
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

export default ClubInvoices;
