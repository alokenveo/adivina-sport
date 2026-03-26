import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, FileText, Download, Trash2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DocumentLibrary = () => {
  const [clubs, setClubs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedClub, setSelectedClub] = useState("all");
  const [file, setFile] = useState(null);
  const [docTitle, setDocTitle] = useState("");
  const [category, setCategory] = useState("general");

  useEffect(() => {
    fetchClubs();
    fetchDocuments();
  }, []);

  const fetchClubs = async () => {
    const response = await axios.get(`${BACKEND_URL}/api/clubs`);
    setClubs(response.data);
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/documents`);
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Error loading documents');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !docTitle) {
      toast.error('Completa todos los campos');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', docTitle);
    formData.append('category', category);
    formData.append('club_id', selectedClub);
    try {
      await axios.post(`${BACKEND_URL}/api/upload/document`, formData);
      toast.success('Documento subido');
      setFile(null);
      setDocTitle("");
      fetchDocuments();
    } catch (error) {
      toast.error('Error al subir');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/documents/${id}`);
      toast.success('Eliminado');
      fetchDocuments();
    } catch (error) {
      toast.error('Error');
    }
  };

  return (
    <Card className="bg-[#121212] border-white/10">
      <CardHeader>
        <CardTitle className="text-2xl">Biblioteca de Documentos</CardTitle>
        <CardDescription className="text-zinc-400">Gestiona documentos para todos los clubes o específicos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-gradient-to-br from-blue-500/5 to-transparent rounded-lg border border-blue-500/20">
          <h3 className="font-bold mb-4 text-blue-400 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Nuevo Documento
          </h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Título del Documento</Label>
                <Input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="Ej: Política de Calidad" className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
              </div>
              <div>
                <Label>Categoría</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    <SelectItem value="general" className="text-white">General</SelectItem>
                    <SelectItem value="policy" className="text-white">Políticas</SelectItem>
                    <SelectItem value="guide" className="text-white">Guías</SelectItem>
                    <SelectItem value="catalog" className="text-white">Catálogos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Visible para</Label>
              <Select value={selectedClub} onValueChange={setSelectedClub}>
                <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10">
                  <SelectItem value="all" className="text-white">Todos los Clubes</SelectItem>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id} className="text-white">{club.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Archivo PDF</Label>
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="w-full mt-2 bg-[#0A0A0A] border border-white/10 text-white p-2 rounded" />
            </div>
            <Button type="submit" className="bg-[#DFFF00] text-black hover:bg-white">
              <Upload className="mr-2 h-4 w-4" />Subir Documento
            </Button>
          </form>
        </div>

        <div>
          <h3 className="font-bold mb-4 text-lg">Documentos Subidos</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 bg-[#1E1E1E] border border-white/10 rounded-lg flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="h-8 w-8 text-blue-400 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{doc.title}</h4>
                    <p className="text-xs text-zinc-500 mt-1">
                      <span className="px-2 py-0.5 bg-zinc-800 rounded">{doc.category}</span>
                      {' '}•{' '}
                      <span>{doc.club_id === 'all' ? 'Todos' : clubs.find(c => c.id === doc.club_id)?.name}</span>
                    </p>
                    <p className="text-xs text-zinc-600 mt-1">{new Date(doc.created_at).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => window.open(`${BACKEND_URL}${doc.file_url}`, '_blank')} className="text-blue-400">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(doc.id)} className="text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentLibrary;