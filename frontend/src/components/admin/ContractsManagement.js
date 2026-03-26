import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Upload, Trash2, FileText, ExternalLink } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ContractsManagement = () => {
  const [clubs, setClubs] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    value: ""
  });

  const fetchClubs = useCallback(async () => {
    const response = await axios.get(`${BACKEND_URL}/api/clubs`);
    setClubs(response.data);
  }, []);

  const fetchContracts = useCallback(async () => {
    const response = await axios.get(`${BACKEND_URL}/api/contracts/${selectedClub}`);
    setContracts(response.data);
  }, [selectedClub]);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  useEffect(() => {
    if (selectedClub) fetchContracts();
  }, [selectedClub, fetchContracts]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !form.title || !selectedClub || !form.start_date || !form.end_date) {
      toast.error('Completa todos los campos obligatorios y selecciona un archivo PDF');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('start_date', form.start_date);
    formData.append('end_date', form.end_date);
    formData.append('value', form.value || '0');

    try {
      await axios.post(`${BACKEND_URL}/api/admin/contracts/${selectedClub}`, formData);
      toast.success('Contrato creado correctamente');
      setFile(null);
      setForm({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        value: ""
      });
      fetchContracts();
    } catch (error) {
      toast.error('Error al subir contrato');
    }
  };

  const deleteContract = async (contractId) => {
    if (!window.confirm('¿Eliminar este contrato?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/contracts/${contractId}`);
      toast.success('Contrato eliminado');
      fetchContracts();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  return (
    <Card className="bg-[#121212] border-white/10">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <FileText className="h-6 w-6 text-[#DFFF00]" />
          Gestion de Contratos
        </CardTitle>
        <CardDescription className="text-zinc-400">Sube contratos PDF para cada club</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-[#1E1E1E] rounded-lg border border-white/10">
          <h3 className="font-bold mb-4 text-[#DFFF00]">Subir Nuevo Contrato</h3>
          <form onSubmit={handleUpload} className="space-y-4">
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
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Titulo del Contrato *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-2 bg-[#0A0A0A] border-white/10"
                  placeholder="Ej: Contrato Temporada 2026"
                />
              </div>
              <div>
                <Label>Valor (XAF)</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm(prev => ({ ...prev, value: e.target.value }))}
                  className="mt-2 bg-[#0A0A0A] border-white/10"
                  placeholder="25000"
                />
              </div>
            </div>
            <div>
              <Label>Descripcion</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="mt-2 bg-[#0A0A0A] border-white/10"
                placeholder="Descripcion breve del contrato"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Fecha de Inicio *</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm(prev => ({ ...prev, start_date: e.target.value }))}
                  className="mt-2 bg-[#0A0A0A] border-white/10"
                />
              </div>
              <div>
                <Label>Fecha de Vencimiento *</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm(prev => ({ ...prev, end_date: e.target.value }))}
                  className="mt-2 bg-[#0A0A0A] border-white/10"
                />
              </div>
            </div>
            <div>
              <Label>Archivo PDF *</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="mt-2 bg-[#0A0A0A] border-white/10"
              />
            </div>
            <Button type="submit" className="bg-[#DFFF00] text-black hover:bg-white">
              <Upload className="mr-2 h-4 w-4" />Subir Contrato
            </Button>
          </form>
        </div>

        {selectedClub && (
          <div>
            <h3 className="font-bold mb-4">Contratos de {clubs.find(c => c.id === selectedClub)?.name}</h3>
            {contracts.length === 0 ? (
              <p className="text-zinc-500">No hay contratos para este club</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-zinc-400">TITULO</TableHead>
                    <TableHead className="text-zinc-400">INICIO</TableHead>
                    <TableHead className="text-zinc-400">FIN</TableHead>
                    <TableHead className="text-zinc-400">VALOR</TableHead>
                    <TableHead className="text-zinc-400">PDF</TableHead>
                    <TableHead className="text-zinc-400">ACCIONES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id} className="border-white/10">
                      <TableCell className="font-medium">{contract.title}</TableCell>
                      <TableCell className="text-zinc-400">{contract.start_date}</TableCell>
                      <TableCell className="text-zinc-400">{contract.end_date}</TableCell>
                      <TableCell className="text-[#DFFF00]">
                        {contract.value ? `${new Intl.NumberFormat('es-ES').format(contract.value)} XAF` : '-'}
                      </TableCell>
                      <TableCell>
                        {contract.file_url ? (
                          <a
                            href={`${BACKEND_URL}${contract.file_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-green-400 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Ver PDF
                          </a>
                        ) : (
                          <span className="text-zinc-600">Sin archivo</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                          onClick={() => deleteContract(contract.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

export default ContractsManagement;