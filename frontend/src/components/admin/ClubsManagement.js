import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ClubsManagement = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [formData, setFormData] = useState({ name: "", password: "", crest_url: "" });

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/clubs`);
      setClubs(response.data);
    } catch (error) {
      toast.error('Error al cargar clubes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClub = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.password) {
      toast.error('Nombre y contraseña son requeridos');
      return;
    }
    try {
      await axios.post(`${BACKEND_URL}/api/clubs`, formData);
      toast.success('Club agregado exitosamente');
      setShowAddDialog(false);
      setFormData({ name: "", password: "", crest_url: "" });
      fetchClubs();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al agregar club');
    }
  };

  const handleEditClub = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BACKEND_URL}/api/clubs/${editingClub.id}`, formData);
      toast.success('Club actualizado exitosamente');
      setShowEditDialog(false);
      setEditingClub(null);
      setFormData({ name: "", password: "", crest_url: "" });
      fetchClubs();
    } catch (error) {
      toast.error('Error al actualizar club');
    }
  };

  const handleDeleteClub = async (clubId, clubName) => {
    if (!window.confirm(`¿Estas seguro de eliminar ${clubName}?`)) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/clubs/${clubId}`);
      toast.success('Club eliminado exitosamente');
      fetchClubs();
    } catch (error) {
      toast.error('Error al eliminar club');
    }
  };

  const openEditDialog = (club) => {
    setEditingClub(club);
    setFormData({ name: club.name, password: "", crest_url: club.crest_url || "" });
    setShowEditDialog(true);
  };

  return (
    <Card className="bg-[#121212] border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Gestión de Clubes</CardTitle>
            <CardDescription className="text-zinc-400">Administra clubes e instituciones</CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#DFFF00] text-black hover:bg-white">
                <Plus className="mr-2 h-4 w-4" />Agregar Club
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#121212] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Nuevo Club</DialogTitle>
                <DialogDescription className="text-zinc-400">Crea un nuevo club</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddClub} className="space-y-4">
                <div>
                  <Label>Nombre del Club</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
                </div>
                <div>
                  <Label>Contraseña</Label>
                  <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
                </div>
                <div>
                  <Label>URL del Escudo (Opcional)</Label>
                  <Input value={formData.crest_url} onChange={(e) => setFormData({...formData, crest_url: e.target.value})} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
                </div>
                <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white">Crear Club</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-8 text-zinc-400">Cargando...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-zinc-400">NOMBRE</TableHead>
                <TableHead className="text-zinc-400">ID</TableHead>
                <TableHead className="text-zinc-400">ESTADO</TableHead>
                <TableHead className="text-zinc-400">FECHA</TableHead>
                <TableHead className="text-zinc-400 text-right">ACCIONES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubs.map((club) => (
                <TableRow key={club.id} className="border-white/10">
                  <TableCell className="font-medium">{club.name}</TableCell>
                  <TableCell className="text-zinc-400">{club.id}</TableCell>
                  <TableCell><span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">{club.status.toUpperCase()}</span></TableCell>
                  <TableCell className="text-zinc-400">{new Date(club.created_at).toLocaleDateString('es-ES')}</TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => openEditDialog(club)} size="icon" variant="ghost" className="text-blue-400 hover:text-blue-300"><Edit className="h-4 w-4" /></Button>
                    <Button onClick={() => handleDeleteClub(club.id, club.name)} size="icon" variant="ghost" className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#121212] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Editar Club</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditClub} className="space-y-4">
            <div>
              <Label>Nombre del Club</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
            </div>
            <div>
              <Label>Nueva Contraseña (dejar vacío para mantener actual)</Label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
            </div>
            <div>
              <Label>URL del Escudo</Label>
              <Input value={formData.crest_url} onChange={(e) => setFormData({...formData, crest_url: e.target.value})} className="bg-[#0A0A0A] border-white/10 text-white mt-2" />
            </div>
            <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white">Actualizar Club</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ClubsManagement;