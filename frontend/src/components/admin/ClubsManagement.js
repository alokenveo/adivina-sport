import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Upload, Link2, X } from "lucide-react";

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

// Logo sin molde circular
const ClubLogo = ({ crest_url, name }) => {
  if (crest_url) {
    return (
      <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
        <img
          src={crest_url}
          alt={name || ""}
          className="max-w-full max-h-full w-auto h-auto object-contain"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}
        />
      </div>
    );
  }
  return null;
};

const MAX_CREST_SIZE = 4 * 1024 * 1024; // mismo límite que el backend
const CREST_ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml,image/gif";

// Campo de escudo: permite pegar una URL o elegir una imagen del equipo
const CrestField = ({ url, onUrlChange, file, onFileChange, optional = false }) => {
  const [mode, setMode] = useState(file ? "file" : "url");
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  // Vista previa local del archivo elegido
  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handlePick = (e) => {
    const picked = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!picked) return;
    if (!CREST_ACCEPT.split(",").includes(picked.type)) {
      toast.error("Formato no válido. Usa PNG, JPG, WEBP, SVG o GIF");
      return;
    }
    if (picked.size > MAX_CREST_SIZE) {
      toast.error("La imagen supera los 4 MB");
      return;
    }
    onFileChange(picked);
  };

  const switchMode = (next) => {
    setMode(next);
    if (next === "url") onFileChange(null);
  };

  const shownImage = mode === "file" ? preview : url;

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-sm">
          Escudo {optional && <span className="text-zinc-500">(Opcional)</span>}
        </Label>
        <div className="flex rounded-md border border-white/10 overflow-hidden text-xs">
          <button type="button" onClick={() => switchMode("url")}
            className={`flex items-center gap-1 px-2 py-1 ${mode === "url" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
            <Link2 className="h-3 w-3" />URL
          </button>
          <button type="button" onClick={() => switchMode("file")}
            className={`flex items-center gap-1 px-2 py-1 ${mode === "file" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
            <Upload className="h-3 w-3" />Archivo
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-1.5">
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded bg-[#0A0A0A] border border-white/10">
          {shownImage
            ? <img src={shownImage} alt="Escudo" className="max-w-full max-h-full w-auto h-auto object-contain p-1" />
            : <span className="text-zinc-700 text-xs">—</span>}
        </div>

        {mode === "url" ? (
          <Input value={url} onChange={(e) => onUrlChange(e.target.value)}
            className="bg-[#0A0A0A] border-white/10 text-white" placeholder="https://..." />
        ) : (
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <input ref={inputRef} type="file" accept={CREST_ACCEPT} onChange={handlePick} className="hidden" />
            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}
              className="bg-[#0A0A0A] border-white/10 text-white hover:bg-white/10 shrink-0">
              <Upload className="mr-2 h-4 w-4" />{file ? "Cambiar" : "Elegir imagen"}
            </Button>
            {file && (
              <>
                <span className="text-xs text-zinc-400 truncate" title={file.name}>{file.name}</span>
                <button type="button" onClick={() => onFileChange(null)} className="text-zinc-500 hover:text-red-400 shrink-0" aria-label="Quitar archivo">
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {mode === "file" && (
        <p className="text-xs text-zinc-600 mt-1">PNG, JPG, WEBP, SVG o GIF, hasta 4 MB. Mejor con fondo transparente.</p>
      )}
    </div>
  );
};

// Sube el escudo de una institución y devuelve la URL pública
const uploadCrest = async (clubId, file) => {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await axios.post(`${BACKEND_URL}/api/upload/club-logo/${clubId}`, fd);
  return data.file_url;
};

const apiError = (error, fallback) =>
  error.response?.data?.error || error.response?.data?.detail || fallback;

const ClubsManagement = () => {
  const [clubs, setClubs]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingClub, setEditingClub]   = useState(null);
  const [formData, setFormData]         = useState({ name: "", password: "", crest_url: "", sport: "football", institution_type: "club" });
  const [editFormData, setEditFormData] = useState({ name: "", password: "", crest_url: "", status: "active", sport: "football", institution_type: "club" });
  const [crestFile, setCrestFile]         = useState(null);  // escudo elegido al crear
  const [editCrestFile, setEditCrestFile] = useState(null);  // escudo elegido al editar
  const [saving, setSaving]               = useState(false);

  useEffect(() => { fetchClubs(); }, []);

  const fetchClubs = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/clubs`);
      setClubs(response.data);
    } catch {
      toast.error("Error al cargar clubes");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClub = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.password) { toast.error("Nombre y contraseña son requeridos"); return; }
    setSaving(true);
    try {
      // Si hay archivo, se crea sin URL y el escudo se sube después con el id del club
      const payload = crestFile ? { ...formData, crest_url: "" } : formData;
      const { data: created } = await axios.post(`${BACKEND_URL}/api/clubs`, payload);

      if (crestFile) {
        try {
          await uploadCrest(created.id, crestFile);
        } catch (error) {
          toast.error(`Club creado, pero no se pudo subir el escudo: ${apiError(error, "error desconocido")}`);
        }
      }

      toast.success("Club agregado exitosamente");
      setShowAddDialog(false);
      setFormData({ name: "", password: "", crest_url: "", sport: "football", institution_type: "club" });
      setCrestFile(null);
      fetchClubs();
    } catch (error) {
      toast.error(apiError(error, "Error al agregar club"));
    } finally {
      setSaving(false);
    }
  };

  const handleEditClub = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Con archivo, no tocamos crest_url aquí: lo actualiza la subida
      const payload = { ...editFormData };
      if (editCrestFile) delete payload.crest_url;
      await axios.put(`${BACKEND_URL}/api/clubs/${editingClub.id}`, payload);

      if (editCrestFile) {
        try {
          await uploadCrest(editingClub.id, editCrestFile);
        } catch (error) {
          toast.error(`Datos guardados, pero no se pudo subir el escudo: ${apiError(error, "error desconocido")}`);
        }
      }

      toast.success("Club actualizado exitosamente");
      setShowEditDialog(false);
      setEditingClub(null);
      setEditCrestFile(null);
      fetchClubs();
    } catch (error) {
      toast.error(apiError(error, "Error al actualizar club"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClub = async (clubId, clubName) => {
    if (!window.confirm(`¿Estás seguro de eliminar ${clubName}?`)) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/clubs/${clubId}`);
      toast.success("Club eliminado exitosamente");
      fetchClubs();
    } catch {
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
    setEditCrestFile(null);
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
            <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) setCrestFile(null); }}>
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
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-[#0A0A0A] border-white/10 text-white mt-1.5" placeholder="Nombre del club" />
                  </div>
                  <div>
                    <Label className="text-sm">Contraseña</Label>
                    <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="bg-[#0A0A0A] border-white/10 text-white mt-1.5" placeholder="Contraseña de acceso" />
                  </div>
                  <div>
                    <Label className="text-sm">Tipo de institución</Label>
                    <Select value={formData.institution_type} onValueChange={(v) => setFormData({ ...formData, institution_type: v })}>
                      <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#121212] border-white/10">
                        {INSTITUTION_TYPES.map(t => <SelectItem key={t.value} value={t.value} className="text-white">{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-zinc-600 mt-1">Las federaciones tienen un portal de gestión diferente.</p>
                  </div>
                  <div>
                    <Label className="text-sm">Deporte</Label>
                    <Select value={formData.sport} onValueChange={(v) => setFormData({ ...formData, sport: v })}>
                      <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-[#121212] border-white/10">
                        {SPORTS.map(s => <SelectItem key={s.value} value={s.value} className="text-white">{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <CrestField
                    optional
                    url={formData.crest_url}
                    onUrlChange={(v) => setFormData({ ...formData, crest_url: v })}
                    file={crestFile}
                    onFileChange={setCrestFile}
                  />
                  <Button type="submit" disabled={saving} className="w-full bg-[#DFFF00] text-black hover:bg-white mt-1">
                    {saving ? "Guardando..." : "Crear Club"}
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
                          <ClubLogo crest_url={club.crest_url} name={club.name} />
                          <span className="font-medium">{club.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-400 hidden sm:table-cell text-sm">
                        {club.institution_type === "federation"
                          ? <span className="flex items-center gap-1 text-green-400">🛡️ Federación</span>
                          : <span className="text-zinc-500">🏟️ Club</span>}
                      </TableCell>
                      <TableCell className="text-zinc-400 hidden sm:table-cell text-sm">
                        {SPORT_LABEL(club.sport) || "—"}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          club.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                        }`}>
                          {club.status === "active" ? "ACTIVO" : "INACTIVO"}
                        </span>
                      </TableCell>
                      <TableCell className="text-zinc-400 hidden md:table-cell">
                        {new Date(club.created_at).toLocaleDateString("es-ES")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button onClick={() => openEditDialog(club)} size="icon" variant="ghost" className="text-blue-400 hover:text-blue-300">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleDeleteClub(club.id, club.name)} size="icon" variant="ghost" className="text-red-400 hover:text-red-300">
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

        {/* Dialog edición */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="dialog-mobile-scroll bg-[#121212] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-lg">Editar Club</DialogTitle>
              <DialogDescription className="text-zinc-400 text-sm">Deja la contraseña vacía para mantener la actual.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditClub} className="space-y-3 mt-1">
              <div>
                <Label className="text-sm">Nombre del Club</Label>
                <Input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="bg-[#0A0A0A] border-white/10 text-white mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">Nueva Contraseña <span className="text-zinc-500">(vacío = mantener)</span></Label>
                <Input type="password" value={editFormData.password} onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })} className="bg-[#0A0A0A] border-white/10 text-white mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">Tipo de institución</Label>
                <Select value={editFormData.institution_type} onValueChange={(v) => setEditFormData({ ...editFormData, institution_type: v })}>
                  <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    {INSTITUTION_TYPES.map(t => <SelectItem key={t.value} value={t.value} className="text-white">{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Deporte</Label>
                <Select value={editFormData.sport} onValueChange={(v) => setEditFormData({ ...editFormData, sport: v })}>
                  <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    {SPORTS.map(s => <SelectItem key={s.value} value={s.value} className="text-white">{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <CrestField
                url={editFormData.crest_url}
                onUrlChange={(v) => setEditFormData({ ...editFormData, crest_url: v })}
                file={editCrestFile}
                onFileChange={setEditCrestFile}
              />
              <div>
                <Label className="text-sm">Estado del Club</Label>
                <Select value={editFormData.status} onValueChange={(val) => setEditFormData({ ...editFormData, status: val })}>
                  <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    <SelectItem value="active" className="text-white">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />Activo</span>
                    </SelectItem>
                    <SelectItem value="inactive" className="text-white">
                      <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Inactivo</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-zinc-500 mt-1">Los clubes inactivos no aparecerán en el login.</p>
              </div>
              <Button type="submit" disabled={saving} className="w-full bg-[#DFFF00] text-black hover:bg-white mt-1">
                {saving ? "Guardando..." : "Actualizar Club"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
};

export default ClubsManagement;