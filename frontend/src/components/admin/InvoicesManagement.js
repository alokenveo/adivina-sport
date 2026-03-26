import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, Trash2, Check, FileText, AlertTriangle } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const InvoicesManagement = () => {
  const [clubs, setClubs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    amount: "",
    due_date: "",
    grace_period_days: "15",
    interest_rate: "5"
  });

  const [pdfFile, setPdfFile] = useState(null);

  const fetchClubs = useCallback(async () => {
    const response = await axios.get(`${BACKEND_URL}/api/clubs`);
    setClubs(response.data);
  }, []);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/admin/invoices/${selectedClub}`);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedClub]);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  useEffect(() => {
    if (selectedClub) fetchInvoices();
  }, [selectedClub, fetchInvoices]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClub || !form.title || !form.amount || !form.due_date) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    try {
      // Create invoice
      const response = await axios.post(`${BACKEND_URL}/api/admin/invoices`, {
        club_id: selectedClub,
        title: form.title,
        amount: parseFloat(form.amount),
        due_date: form.due_date,
        grace_period_days: parseInt(form.grace_period_days),
        interest_rate: parseFloat(form.interest_rate)
      });

      // Upload PDF if provided
      if (pdfFile && response.data.id) {
        const formData = new FormData();
        formData.append('file', pdfFile);
        await axios.post(`${BACKEND_URL}/api/upload/invoice/${response.data.id}`, formData);
      }

      toast.success('Factura creada correctamente');
      setForm({
        title: "",
        amount: "",
        due_date: "",
        grace_period_days: "15",
        interest_rate: "5"
      });
      setPdfFile(null);
      fetchInvoices();
    } catch (error) {
      toast.error('Error al crear factura');
    }
  };

  const markAsPaid = async (invoiceId) => {
    try {
      await axios.put(`${BACKEND_URL}/api/admin/invoices/${invoiceId}/paid`);
      toast.success('Factura marcada como pagada');
      fetchInvoices();
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const deleteInvoice = async (invoiceId) => {
    if (!window.confirm('¿Eliminar esta factura?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/invoices/${invoiceId}`);
      toast.success('Factura eliminada');
      fetchInvoices();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const uploadPdf = async (invoiceId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`${BACKEND_URL}/api/upload/invoice/${invoiceId}`, formData);
      toast.success('PDF subido');
      fetchInvoices();
    } catch (error) {
      toast.error('Error al subir PDF');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES').format(amount) + ' XAF';
  };

  const getStatusBadge = (invoice) => {
    if (invoice.paid) {
      return <Badge className="bg-green-500/20 text-green-400">PAGADO</Badge>;
    }
    const today = new Date();
    const dueDate = new Date(invoice.due_date);
    if (today > dueDate) {
      return <Badge className="bg-red-500/20 text-red-400">VENCIDO</Badge>;
    }
    return <Badge className="bg-yellow-500/20 text-yellow-400">PENDIENTE</Badge>;
  };

  return (
    <Card className="bg-[#121212] border-white/10">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <FileText className="h-6 w-6 text-[#DFFF00]" />
          Gestion de Facturas
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Crea y gestiona facturas con interes automatico por mora
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create Invoice Form */}
        <div className="p-6 bg-[#1E1E1E] rounded-lg border border-white/10">
          <h3 className="font-bold mb-4 text-[#DFFF00]">Nueva Factura</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Selecciona Club</Label>
              <Select value={selectedClub} onValueChange={setSelectedClub}>
                <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-2">
                  <SelectValue placeholder="Elige un club" />
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

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Titulo de la Factura</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ej: Cuota Mensual Febrero 2026"
                  className="mt-2 bg-[#0A0A0A] border-white/10"
                />
              </div>
              <div>
                <Label>Monto (XAF)</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="50000"
                  className="mt-2 bg-[#0A0A0A] border-white/10"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Fecha de Vencimiento</Label>
                <Input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm(prev => ({ ...prev, due_date: e.target.value }))}
                  className="mt-2 bg-[#0A0A0A] border-white/10"
                />
              </div>
              <div>
                <Label>Periodo de Gracia (dias)</Label>
                <Input
                  type="number"
                  value={form.grace_period_days}
                  onChange={(e) => setForm(prev => ({ ...prev, grace_period_days: e.target.value }))}
                  className="mt-2 bg-[#0A0A0A] border-white/10"
                />
              </div>
              <div>
                <Label>Interes Mensual (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.interest_rate}
                  onChange={(e) => setForm(prev => ({ ...prev, interest_rate: e.target.value }))}
                  className="mt-2 bg-[#0A0A0A] border-white/10"
                />
              </div>
            </div>

            <div>
              <Label>Archivo PDF (opcional)</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="mt-2 bg-[#0A0A0A] border-white/10"
              />
            </div>

            <Button type="submit" className="bg-[#DFFF00] text-black hover:bg-white">
              <Upload className="mr-2 h-4 w-4" />
              Crear Factura
            </Button>
          </form>
        </div>

        {/* Invoices Table */}
        {selectedClub && (
          <div>
            <h3 className="font-bold mb-4">
              Facturas de {clubs.find(c => c.id === selectedClub)?.name}
            </h3>
            {loading ? (
              <p className="text-zinc-400">Cargando...</p>
            ) : invoices.length === 0 ? (
              <p className="text-zinc-500">No hay facturas para este club</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-zinc-400">TITULO</TableHead>
                    <TableHead className="text-zinc-400">MONTO</TableHead>
                    <TableHead className="text-zinc-400">VENCIMIENTO</TableHead>
                    <TableHead className="text-zinc-400">INTERES</TableHead>
                    <TableHead className="text-zinc-400">ESTADO</TableHead>
                    <TableHead className="text-zinc-400">PDF</TableHead>
                    <TableHead className="text-zinc-400">ACCIONES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-white/10">
                      <TableCell className="font-medium">{invoice.title}</TableCell>
                      <TableCell className="text-[#DFFF00]">{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell className="text-zinc-400">
                        {new Date(invoice.due_date).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell className="text-zinc-400">
                        {invoice.interest_rate}% / {invoice.grace_period_days}d
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice)}</TableCell>
                      <TableCell>
                        {invoice.file_url ? (
                          <span className="text-green-400 text-sm">Con PDF</span>
                        ) : (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files[0]) {
                                  uploadPdf(invoice.id, e.target.files[0]);
                                }
                              }}
                            />
                            <span className="text-blue-400 text-sm hover:underline">Subir</span>
                          </label>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!invoice.paid && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-500/20 text-green-400 hover:bg-green-500/10"
                              onClick={() => markAsPaid(invoice.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                            onClick={() => deleteInvoice(invoice.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoicesManagement;
