import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Save, Image as ImageIcon } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ClubProfileEditor = () => {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [clubData, setClubData] = useState({
    name: "",
    description: "",
    primary_color: "#DFFF00",
    secondary_color: "#000000",
    contact_email: "",
    contact_phone: ""
  });
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    if (selectedClub) {
      const club = clubs.find(c => c.id === selectedClub);
      if (club) {
        setClubData({
          name: club.name || "",
          description: club.description || "",
          primary_color: club.primary_color || "#DFFF00",
          secondary_color: club.secondary_color || "#000000",
          contact_email: club.contact_email || "",
          contact_phone: club.contact_phone || ""
        });
      }
    }
  }, [selectedClub, clubs]);

  const fetchClubs = async () => {
    const response = await axios.get(`${BACKEND_URL}/api/clubs`);
    setClubs(response.data);
  };

  const handleUploadLogo = async () => {
    if (!logoFile || !selectedClub) {
      toast.error('Selecciona un club y archivo');
      return;
    }
    const formData = new FormData();
    formData.append('file', logoFile);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/upload/club-logo/${selectedClub}`, formData);
      toast.success('Logo subido');
      fetchClubs();
    } catch (error) {
      toast.error('Error al subir logo');
    }
  };

  const handleSaveProfile = async () => {
    if (!selectedClub) {
      toast.error('Selecciona un club');
      return;
    }
    try {
      await axios.put(`${BACKEND_URL}/api/clubs/${selectedClub}/profile`, clubData);
      toast.success('Perfil actualizado');
      fetchClubs();
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const selectedClubData = clubs.find(c => c.id === selectedClub);

  return (
    <Card className="bg-[#121212] border-white/10">
      <CardHeader>
        <CardTitle className="text-2xl">Editor de Perfil de Club</CardTitle>
        <CardDescription className="text-zinc-400">Personaliza completamente cada club</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        {selectedClub && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="p-6 bg-[#1E1E1E] rounded-lg border border-white/10">
                <h3 className="font-bold mb-4 text-[#DFFF00] flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Logo del Club
                </h3>
                {selectedClubData?.crest_url && (
                  <div className="mb-4">
                    <img src={selectedClubData.crest_url} alt="Logo" className="w-32 h-32 object-contain bg-white/5 rounded p-2" />
                  </div>
                )}
                <div className="space-y-3">
                  <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="w-full bg-[#0A0A0A] border border-white/10 text-white p-2 rounded text-sm" />
                  <Button onClick={handleUploadLogo} className="w-full bg-[#DFFF00] text-black hover:bg-white">
                    <Upload className="mr-2 h-4 w-4" />Subir Logo
                  </Button>
                </div>
              </div>

              <div className="p-6 bg-[#1E1E1E] rounded-lg border border-white/10">
                <h3 className="font-bold mb-4 text-[#DFFF00]">Colores del Club</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Color Primario</Label>
                    <div className="flex gap-2 mt-2">
                      <input type="color" value={clubData.primary_color} onChange={(e) => setClubData({...clubData, primary_color: e.target.value})} className="w-16 h-10 rounded cursor-pointer" />
                      <Input value={clubData.primary_color} onChange={(e) => setClubData({...clubData, primary_color: e.target.value})} className="bg-[#0A0A0A] border-white/10 text-white flex-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Color Secundario</Label>
                    <div className="flex gap-2 mt-2">
                      <input type="color" value={clubData.secondary_color} onChange={(e) => setClubData({...clubData, secondary_color: e.target.value})} className="w-16 h-10 rounded cursor-pointer" />
                      <Input value={clubData.secondary_color} onChange={(e) => setClubData({...clubData, secondary_color: e.target.value})} className="bg-[#0A0A0A] border-white/10 text-white flex-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-[#1E1E1E] rounded-lg border border-white/10">
                <h3 className="font-bold mb-4 text-[#DFFF00]">Información del Club</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input value={clubData.name} onChange={(e) => setClubData({...clubData, name: e.target.value})} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Textarea value={clubData.description} onChange={(e) => setClubData({...clubData, description: e.target.value})} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
                  </div>
                  <div>
                    <Label>Email de Contacto</Label>
                    <Input value={clubData.contact_email} onChange={(e) => setClubData({...clubData, contact_email: e.target.value})} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input value={clubData.contact_phone} onChange={(e) => setClubData({...clubData, contact_phone: e.target.value})} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveProfile} className="w-full bg-[#DFFF00] text-black hover:bg-white py-6">
                <Save className="mr-2 h-5 w-5" />Guardar Cambios del Perfil
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClubProfileEditor;