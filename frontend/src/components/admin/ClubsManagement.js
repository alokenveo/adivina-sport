import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SPORTS = [
  { value: "football",   label: "⚽ Fútbol" },
  { value: "basketball", label: "🏀 Baloncesto" },
  { value: "futsal",     label: "🥅 Fútbol Sala" },
  { value: "volleyball", label: "🏐 Voleibol" },
  { value: "other",      label: "🏅 Otro deporte" },
];

const INSTITUTION_TYPES = [
  { value: "club",       label: "🏟️ Club deportivo" },
  { value: "federation", label: "🛡️ Federación" },
];

const SPORT_LABEL = (value) => SPORTS.find(s => s.value === value)?.label || value;

const ClubsManagement = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [formData, setFormData] = useState({ name: "", password: "", crest_url: "", sport: "football", institution_type: "club" });
  const [editFormData, setEditFormData] = useState({ name: "", password: "", crest_url: "", status: "active", sport: "football", institution_type: "club" });

  useEffect(() => { fetchClubs(); }, []);

  const fetchClubs = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/clubs`);
      setClubs(response.data);
    } catch (error) {
      toast.error("Error al cargar clubes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClub = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.password) {
      toast.error("Nombre y contraseña son requeridos");
      return;
    }
    try {
      await axios.post(`${BACKEND_URL}/api/clubs`, formData);
      toast.success("Club agregado exitosamente");
      setShowAddDialog(false);
      setFormData({ name: "", password: "", crest_url: "", sport: "football", institution_type: "club" });
      fetchClubs();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error al agregar club");
    }
  };

  const handleEditClub = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BACKEND_URL}/api/clubs/${editingClub.id}`, editFormData);
      toast.success("Club actualizado exitosamente");
      setShowEditDialog(false);
      setEditingClub(null);
      fetchClubs();
    } catch (error) {
      toast.error("Error al actualizar club");
    }
  };

  const handleDeleteClub = async (clubId, clubName) => {
    if (!window.confirm(`¿Estás seguro de eliminar ${clubName}?`)) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/clubs/${clubId}`);
      toast.success("Club eliminado exitosamente");
      fetchClubs();
    } catch (error) {
      toast.error("Error al eliminar club");
    }
  };

  const openEditDialog = (club) => {
    setEditingClub(club);
    setEditFormData({
      name:             club.name,
      password:         "",
      crest_url:        club.crest_url || "",
      status:           club.status || "active",
      sport:            club.sport || "football",
      institution_type: club.institution_type || "club",
    });
    setShowEditDialog(true);
  };

  return (
    <>
      <style>{`
        .dialog-mobile-scroll {
          max-height: 90dvh !important;
          overflow-y: auto !important;
          padding: 16px !important;
          width: calc(100vw - 32px) !important;
          max-width: 480px !important;
        }
        @media (min-width: 640px) {
          .dialog-mobile-scroll { padding: 24px !important; }
        }
      `}</style>

      <Card className="bg-[#121212] border-white/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-2xl">Gestión de Clubes</CardTitle>
              <CardDescription className="text-zinc-400">Administra clubes e instituciones deportivas</CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-[#DFFF00] text-black hover:bg-white w-full sm:w-auto shrink-0">
                  <Plus className="mr-2 h-4 w-4" />Agregar Club
                </Button>
              </DialogTrigger>
              <DialogContent className="dialog-mobile-scroll bg-[#121212] border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle className="text-lg">Nuevo Club</DialogTitle>
                  <DialogDescription className="text-zinc-400 text-sm">Crea un nuevo club deportivo</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddClub} className="space-y-3 mt-1">
                  <div>
                    <Label className="text-sm">Nombre del Club</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-[#0A0A0A] border-white/10 text-white mt-1.5"
                      placeholder="Nombre del club"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Contraseña</Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="bg-[#0A0A0A] border-white/10 text-white mt-1.5"
                      placeholder="Contraseña de acceso"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Tipo de institución</Label>
                    <Select value={formData.institution_type} onValueChange={(v) => setFormData({ ...formData, institution_type: v })}>
                      <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#121212] border-white/10">
                        {INSTITUTION_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value} className="text-white">{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-zinc-600 mt-1">
                      Las federaciones tienen un portal de gestión diferente al de los clubes.
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm">Deporte</Label>
                    <Select value={formData.sport} onValueChange={(v) => setFormData({ ...formData, sport: v })}>
                      <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#121212] border-white/10">
                        {SPORTS.map(s => (
                          <SelectItem key={s.value} value={s.value} className="text-white">{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-zinc-600 mt-1">
                      Define las secciones habilitadas por defecto en el portal del club.
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm">URL del Escudo <span className="text-zinc-500">(Opcional)</span></Label>
                    <Input
                      value={formData.crest_url}
                      onChange={(e) => setFormData({ ...formData, crest_url: e.target.value })}
                      className="bg-[#0A0A0A] border-white/10 text-white mt-1.5"
                      placeholder="https://..."
                    />
                  </div>
                  <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white mt-1">
                    Crear Club
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-zinc-400">Cargando...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-zinc-400">NOMBRE</TableHead>
                    <TableHead className="text-zinc-400 hidden sm:table-cell">TIPO</TableHead>
                    <TableHead className="text-zinc-400 hidden sm:table-cell">DEPORTE</TableHead>
                    <TableHead className="text-zinc-400">ESTADO</TableHead>
                    <TableHead className="text-zinc-400 hidden md:table-cell">FECHA</TableHead>
                    <TableHead className="text-zinc-400 text-right">ACCIONES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clubs.map((club) => (
                    <TableRow key={club.id} className="border-white/10">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {club.crest_url && (
                            <img src={club.crest_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                          )}
                          <span className="font-medium">{club.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-400 hidden sm:table-cell text-sm">
                        {club.institution_type === 'federation' ? (
                          <span className="flex items-center gap-1 text-green-400">🛡️ Federación</span>
                        ) : (
                          <span className="text-zinc-500">🏟️ Club</span>
                        )}
                      </TableCell>
                      <TableCell className="text-zinc-400 hidden sm:table-cell text-sm">
                        {SPORT_LABEL(club.sport) || "—"}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          club.status === "active"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {club.status === "active" ? "ACTIVO" : "INACTIVO"}
                        </span>
                      </TableCell>
                      <TableCell className="text-zinc-400 hidden md:table-cell">
                        {new Date(club.created_at).toLocaleDateString("es-ES")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => openEditDialog(club)}
                          size="icon"
                          variant="ghost"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteClub(club.id, club.name)}
                          size="icon"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        {/* Diálogo de edición */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="dialog-mobile-scroll bg-[#121212] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-lg">Editar Club</DialogTitle>
              <DialogDescription className="text-zinc-400 text-sm">
                Deja la contraseña vacía para mantener la actual.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditClub} className="space-y-3 mt-1">
              <div>
                <Label className="text-sm">Nombre del Club</Label>
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="bg-[#0A0A0A] border-white/10 text-white mt-1.5"
                />
              </div>
              <div>
                <Label className="text-sm">Nueva Contraseña <span className="text-zinc-500">(vacío = mantener actual)</span></Label>
                <Input
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  className="bg-[#0A0A0A] border-white/10 text-white mt-1.5"
                />
              </div>
              <div>
                <Label className="text-sm">Tipo de institución</Label>
                <Select value={editFormData.institution_type} onValueChange={(v) => setEditFormData({ ...editFormData, institution_type: v })}>
                  <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    {INSTITUTION_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value} className="text-white">{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Deporte</Label>
                <Select value={editFormData.sport} onValueChange={(v) => setEditFormData({ ...editFormData, sport: v })}>
                  <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    {SPORTS.map(s => (
                      <SelectItem key={s.value} value={s.value} className="text-white">{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">URL del Escudo</Label>
                <Input
                  value={editFormData.crest_url}
                  onChange={(e) => setEditFormData({ ...editFormData, crest_url: e.target.value })}
                  className="bg-[#0A0A0A] border-white/10 text-white mt-1.5"
                />
              </div>
              <div>
                <Label className="text-sm">Estado del Club</Label>
                <Select
                  value={editFormData.status}
                  onValueChange={(val) => setEditFormData({ ...editFormData, status: val })}
                >
                  <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    <SelectItem value="active" className="text-white">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                        Activo
                      </span>
                    </SelectItem>
                    <SelectItem value="inactive" className="text-white">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                        Inactivo
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-zinc-500 mt-1">
                  Los clubes inactivos no aparecerán en el login de miembros.
                </p>
              </div>
              <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white mt-1">
                Actualizar Club
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
};

export default ClubsManagement;
