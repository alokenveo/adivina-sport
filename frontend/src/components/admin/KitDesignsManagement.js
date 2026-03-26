import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const KitDesignsManagement = () => {
  const [clubs, setClubs] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [file, setFile] = useState(null);
  const [designName, setDesignName] = useState("");

  const fetchClubs = useCallback(async () => {
    const response = await axios.get(`${BACKEND_URL}/api/clubs`);
    setClubs(response.data);
  }, []);

  const fetchDesigns = useCallback(async () => {
    const response = await axios.get(`${BACKEND_URL}/api/equipment-designs/${selectedClub}`);
    setDesigns(response.data);
  }, [selectedClub]);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  useEffect(() => {
    if (selectedClub) fetchDesigns();
  }, [selectedClub, fetchDesigns]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !designName || !selectedClub) {
      toast.error('Completa todos los campos');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('design_name', designName);
    try {
      await axios.post(`${BACKEND_URL}/api/upload/design/${selectedClub}`, formData);
      toast.success('Diseño subido');
      setFile(null);
      setDesignName("");
      fetchDesigns();
    } catch (error) {
      toast.error('Error al subir');
    }
  };

  return (
    <Card className="bg-[#121212] border-white/10">
      <CardHeader>
        <CardTitle className="text-2xl">Gestión de Diseños de Kit</CardTitle>
        <CardDescription className="text-zinc-400">Sube diseños de equipamiento para cada club</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-[#1E1E1E] rounded-lg border border-white/10">
          <h3 className="font-bold mb-4 text-[#DFFF00]">Subir Nuevo Diseño</h3>
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
            <div>
              <Label>Nombre del Diseño</Label>
              <input type="text" value={designName} onChange={(e) => setDesignName(e.target.value)} className="w-full mt-2 bg-[#0A0A0A] border border-white/10 text-white p-2 rounded" placeholder="Ej: Kit Local 2026" />
            </div>
            <div>
              <Label>Archivo de Imagen</Label>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="w-full mt-2 bg-[#0A0A0A] border border-white/10 text-white p-2 rounded" />
            </div>
            <Button type="submit" className="bg-[#DFFF00] text-black hover:bg-white">
              <Upload className="mr-2 h-4 w-4" />Subir Diseño
            </Button>
          </form>
        </div>

        {selectedClub && (
          <div>
            <h3 className="font-bold mb-4">Diseños de {clubs.find(c => c.id === selectedClub)?.name}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {designs.map((design) => (
                <div key={design.id} className="bg-[#1E1E1E] border border-white/10 rounded-lg overflow-hidden">
                  <div className="aspect-square bg-[#0A0A0A]">
                    {design.file_url && (
                      <img src={`${BACKEND_URL}${design.file_url}`} alt={design.design_name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-sm">{design.design_name}</p>
                    <p className="text-xs text-zinc-500">{new Date(design.created_at).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KitDesignsManagement;