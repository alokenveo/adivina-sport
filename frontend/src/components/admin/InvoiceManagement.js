import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Upload, FileText, AlertCircle } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const InvoiceManagement = () => {
  const [clubs, setClubs] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [file, setFile] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxDaysLate, setMaxDaysLate] = useState("30");
  const [interestRate, setInterestRate] = useState("2");

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    if (selectedClub) fetchInvoices();
  }, [selectedClub]);

  const fetchClubs = async () => {
    const response = await axios.get(`${BACKEND_URL}/api/clubs`);
    setClubs(response.data);
  };

  const fetchInvoices = async () => {
    const response = await axios.get(`${BACKEND_URL}/api/invoices/${selectedClub}`);
    setInvoices(response.data || []);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !invoiceNumber || !amount || !dueDate || !selectedClub) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('invoice_number', invoiceNumber);
    formData.append('amount', amount);
    formData.append('due_date', dueDate);
    formData.append('max_days_late', maxDaysLate);
    formData.append('interest_rate', interestRate);
    try {
      await axios.post(`${BACKEND_URL}/api/invoices/${selectedClub}`, formData);
      toast.success('Factura subida exitosamente');
      setFile(null);
      setInvoiceNumber("");
      setAmount("");
      setDueDate("");
      fetchInvoices();
    } catch (error) {
      toast.error('Error al subir factura');
    }
  };

  return (
    <Card className="bg-[#121212] border-white/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 rounded-lg">
            <FileText className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <CardTitle className="text-2xl">Gestión de Facturas</CardTitle>
            <CardDescription className="text-zinc-400">Sube facturas con cálculo automático de intereses por pago tardío</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-gradient-to-br from-red-500/5 to-transparent rounded-lg border border-red-500/20">
          <h3 className="font-bold mb-4 text-red-400 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Nueva Factura
          </h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Selecciona Club</Label>
                <Select value={selectedClub} onValueChange={setSelectedClub}>
                  <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-2">
                    <SelectValue placeholder="Elige un club" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id} className="text-white">{club.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Número de Factura</Label>
                <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="Ej: INV-2026-001" className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
              </div>
              <div>
                <Label>Monto Total (XAF)</Label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ej: 500000" className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
              </div>
              <div>
                <Label>Fecha Límite de Pago</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
              </div>
              <div>
                <Label>Días Máximos de Retraso</Label>
                <Input type="number" value={maxDaysLate} onChange={(e) => setMaxDaysLate(e.target.value)} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
              </div>
              <div>
                <Label>Tasa de Interés Diario (%)</Label>
                <Input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
              </div>
            </div>
            <div>
              <Label>Archivo PDF de Factura</Label>
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="w-full mt-2 bg-[#0A0A0A] border border-white/10 text-white p-2 rounded" />
            </div>
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div className="text-sm text-yellow-200">
                <p className="font-bold mb-1">Cálculo Automático de Intereses:</p>
                <p>Si el pago no se realiza en la fecha límite, el sistema calculará intereses diarios automáticamente: Interés = Monto × (Tasa/100) × Días de retraso</p>
              </div>
            </div>
            <Button type="submit" className="bg-red-500 text-white hover:bg-red-600 w-full py-6">
              <Upload className="mr-2 h-5 w-5" />
              Subir Factura
            </Button>
          </form>
        </div>

        {selectedClub && (
          <div>
            <h3 className="font-bold mb-4">Facturas de {clubs.find(c => c.id === selectedClub)?.name}</h3>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-zinc-400">NÚMERO</TableHead>
                  <TableHead className="text-zinc-400">MONTO (XAF)</TableHead>
                  <TableHead className="text-zinc-400">FECHA LÍMITE</TableHead>
                  <TableHead className="text-zinc-400">ESTADO</TableHead>
                  <TableHead className="text-zinc-400">INTERÉS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const isOverdue = new Date() > new Date(invoice.due_date);
                  return (
                    <TableRow key={invoice.id} className="border-white/10">
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell className="text-[#DFFF00]">{parseInt(invoice.amount).toLocaleString()} XAF</TableCell>
                      <TableCell className="text-zinc-400">{new Date(invoice.due_date).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>
                        {invoice.paid ? (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">PAGADO</span>
                        ) : isOverdue ? (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">VENCIDO</span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">PENDIENTE</span>
                        )}
                      </TableCell>
                      <TableCell className="text-red-400">{invoice.interest_rate}% diario</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceManagement;