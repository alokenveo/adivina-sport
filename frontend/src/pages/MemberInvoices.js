import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/App";
import ClubLayout from "@/components/ClubLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, AlertTriangle, Calendar, DollarSign } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MemberInvoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    if (!user?.club_id) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/invoices/${user.club_id}`);
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Error loading invoices');
    } finally {
      setLoading(false);
    }
  }, [user?.club_id]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const calculateInterest = (invoice) => {
    if (invoice.paid) return { daysLate: 0, interest: 0, total: invoice.amount };
    
    const now = new Date();
    const dueDate = new Date(invoice.due_date);
    const daysLate = Math.max(0, Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24)));
    
    if (daysLate === 0) {
      return { daysLate: 0, interest: 0, total: invoice.amount };
    }
    
    const cappedDays = Math.min(daysLate, invoice.max_days_late || 30);
    const dailyRate = invoice.interest_rate / 100;
    const interest = invoice.amount * dailyRate * cappedDays;
    const total = parseFloat(invoice.amount) + interest;
    
    return { daysLate, interest, total, cappedDays };
  };

  const getDaysRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const days = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return days;
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
          <p className="text-zinc-400">No hay facturas disponibles</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {invoices.map((invoice) => {
            const { daysLate, interest, total, cappedDays } = calculateInterest(invoice);
            const daysRemaining = getDaysRemaining(invoice.due_date);
            const isOverdue = daysLate > 0;
            const isPaid = invoice.paid;
            
            return (
              <Card 
                key={invoice.id} 
                className={`bg-[#121212] border-2 transition-all ${
                  isPaid ? 'border-green-500/30' : isOverdue ? 'border-red-500/50' : 'border-yellow-500/30'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">Factura #{invoice.invoice_number}</CardTitle>
                        {isPaid ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">PAGADO</Badge>
                        ) : isOverdue ? (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/50">VENCIDO</Badge>
                        ) : (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">PENDIENTE</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-[#1E1E1E] rounded-lg border border-white/10">
                      <p className="text-xs text-zinc-500 mb-1">Monto Original</p>
                      <p className="text-2xl font-bold text-white">{parseInt(invoice.amount).toLocaleString()} <span className="text-sm text-zinc-400">XAF</span></p>
                    </div>
                    
                    {isOverdue && !isPaid && (
                      <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                        <p className="text-xs text-red-400 mb-1">Interés Acumulado</p>
                        <p className="text-2xl font-bold text-red-400">+{Math.round(interest).toLocaleString()} <span className="text-sm">XAF</span></p>
                        <p className="text-xs text-zinc-500 mt-1">{cappedDays} días × {invoice.interest_rate}%</p>
                      </div>
                    )}
                    
                    {!isPaid && (
                      <div className={`p-4 rounded-lg border ${
                        isOverdue ? 'bg-red-500/10 border-red-500/20' : 'bg-[#1E1E1E] border-white/10'
                      }`}>
                        <p className="text-xs text-zinc-500 mb-1">Total a Pagar</p>
                        <p className={`text-2xl font-bold ${
                          isOverdue ? 'text-red-400' : 'text-[#DFFF00]'
                        }`}>{Math.round(total).toLocaleString()} <span className="text-sm">XAF</span></p>
                      </div>
                    )}
                    
                    <div className="p-4 bg-[#1E1E1E] rounded-lg border border-white/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <p className="text-xs text-zinc-500">Fecha Límite</p>
                      </div>
                      <p className="text-lg font-bold">{new Date(invoice.due_date).toLocaleDateString('es-ES')}</p>
                      {!isPaid && (
                        <p className={`text-xs mt-1 ${
                          daysRemaining > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {daysRemaining > 0 ? `${daysRemaining} días restantes` : `${daysLate} días de retraso`}
                        </p>
                      )}
                    </div>
                  </div>

                  {isOverdue && !isPaid && (
                    <div className="p-4 bg-red-500/10 border-l-4 border-red-500 rounded mb-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold text-red-400 mb-2">Cálculo de Intereses por Retraso</p>
                          <div className="text-sm text-zinc-300 space-y-1">
                            <p>• Monto base: {parseInt(invoice.amount).toLocaleString()} XAF</p>
                            <p>• Días de retraso: {daysLate} días (aplicados: {cappedDays} días máx.)</p>
                            <p>• Tasa de interés: {invoice.interest_rate}% diario</p>
                            <p>• Cálculo: {parseInt(invoice.amount).toLocaleString()} × {invoice.interest_rate}% × {cappedDays} = {Math.round(interest).toLocaleString()} XAF</p>
                            <p className="font-bold text-red-400 mt-2">• Total actual: {Math.round(total).toLocaleString()} XAF</p>
                          </div>
                          <p className="text-xs text-zinc-500 mt-2">Los intereses se actualizan automáticamente cada día</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {invoice.file_url && (
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-400" />
                        <div>
                          <p className="font-medium">Documento de Factura</p>
                          <p className="text-xs text-zinc-500">Archivo PDF disponible</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => window.open(`${BACKEND_URL}${invoice.file_url}`, '_blank')}
                        className="bg-blue-500 text-white hover:bg-blue-600"
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

export default MemberInvoices;