import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/App";
import ClubLayout from "@/components/ClubLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Users, MapPin, Building, Palette, Plus, Trash2, Edit, Upload, User, Calendar, Clock, Shirt, Crown, Award, Shield } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const POSITIONS = ["Portero", "Defensa", "Centrocampista", "Delantero"];
const JERSEY_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const TEAM_TYPES = ["Senior", "Juvenil A", "Juvenil B", "Infantil", "Cadete", "Femenino", "Veteranos"];

const DIRECTIVA_ROLES = [
  { key: "owner", label: "Propietario", icon: Crown },
  { key: "founder", label: "Fundador", icon: Award },
  { key: "historical_partner", label: "Socio Historico", icon: Shield },
  { key: "president", label: "Presidente", icon: Crown },
  { key: "vice_president", label: "Vicepresidente", icon: Shield },
  { key: "secretary", label: "Secretario", icon: User },
  { key: "technical_director", label: "Director Tecnico (DT)", icon: User }
];

const ClubProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    num_players: 0,
    teams: [],
    official_colors: [],
    city: "",
    stadium: "",
    directiva: {
      owner: null,
      founder: null,
      historical_partner: null,
      president: null,
      vice_president: null,
      secretary: null,
      technical_director: null,
      assistant_coaches: []
    }
  });
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [playerDialogOpen, setPlayerDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [newColor, setNewColor] = useState("#DFFF00");
  const [newTeam, setNewTeam] = useState({ name: "", type: "Senior" });
  const [newAssistant, setNewAssistant] = useState("");
  
  const [playerForm, setPlayerForm] = useState({
    name: "",
    number: "",
    age: "",
    position: "Delantero",
    jersey_size: "M",
    nationality: "",
    contract_end_date: ""
  });

  const fetchData = useCallback(async () => {
    if (!user?.club_id) return;
    try {
      const [profileRes, playersRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/club/profile/${user.club_id}`),
        axios.get(`${BACKEND_URL}/api/club/players/${user.club_id}`)
      ]);
      setProfile(profileRes.data);
      setPlayers(playersRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.club_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await axios.put(`${BACKEND_URL}/api/club/profile/${user.club_id}`, {
        ...profile,
        num_players: players.length
      });
      toast.success("Perfil actualizado");
    } catch (error) {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const addColor = () => {
    if (!profile.official_colors.includes(newColor)) {
      setProfile(prev => ({
        ...prev,
        official_colors: [...prev.official_colors, newColor]
      }));
    }
  };

  const removeColor = (color) => {
    setProfile(prev => ({
      ...prev,
      official_colors: prev.official_colors.filter(c => c !== color)
    }));
  };

  const addTeam = () => {
    if (newTeam.name) {
      setProfile(prev => ({
        ...prev,
        teams: [...prev.teams, { ...newTeam, id: Date.now().toString() }]
      }));
      setNewTeam({ name: "", type: "Senior" });
    }
  };

  const removeTeam = (teamId) => {
    setProfile(prev => ({
      ...prev,
      teams: prev.teams.filter(t => t.id !== teamId)
    }));
  };

  const updateDirectiva = (key, value) => {
    setProfile(prev => ({
      ...prev,
      directiva: {
        ...prev.directiva,
        [key]: value || null
      }
    }));
  };

  const addAssistantCoach = () => {
    if (newAssistant.trim()) {
      setProfile(prev => ({
        ...prev,
        directiva: {
          ...prev.directiva,
          assistant_coaches: [...(prev.directiva?.assistant_coaches || []), newAssistant.trim()]
        }
      }));
      setNewAssistant("");
    }
  };

  const removeAssistantCoach = (index) => {
    setProfile(prev => ({
      ...prev,
      directiva: {
        ...prev.directiva,
        assistant_coaches: prev.directiva.assistant_coaches.filter((_, i) => i !== index)
      }
    }));
  };

  const handlePlayerSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlayer) {
        await axios.put(`${BACKEND_URL}/api/club/players/${editingPlayer.id}`, {
          ...playerForm,
          number: parseInt(playerForm.number),
          age: parseInt(playerForm.age)
        });
        toast.success("Jugador actualizado");
      } else {
        await axios.post(`${BACKEND_URL}/api/club/players/${user.club_id}`, {
          ...playerForm,
          number: parseInt(playerForm.number),
          age: parseInt(playerForm.age)
        });
        toast.success("Jugador registrado");
      }
      setPlayerDialogOpen(false);
      setEditingPlayer(null);
      setPlayerForm({
        name: "",
        number: "",
        age: "",
        position: "Delantero",
        jersey_size: "M",
        nationality: "",
        contract_end_date: ""
      });
      fetchData();
    } catch (error) {
      toast.error("Error al guardar jugador");
    }
  };

  const deletePlayer = async (playerId) => {
    if (window.confirm("¿Eliminar este jugador?")) {
      try {
        await axios.delete(`${BACKEND_URL}/api/club/players/${playerId}`);
        toast.success("Jugador eliminado");
        fetchData();
      } catch (error) {
        toast.error("Error al eliminar");
      }
    }
  };

  const openEditPlayer = (player) => {
    setEditingPlayer(player);
    setPlayerForm({
      name: player.name,
      number: player.number.toString(),
      age: player.age.toString(),
      position: player.position,
      jersey_size: player.jersey_size,
      nationality: player.nationality,
      contract_end_date: player.contract_end_date
    });
    setPlayerDialogOpen(true);
  };

  const uploadPlayerPhoto = async (playerId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post(`${BACKEND_URL}/api/upload/player-photo/${playerId}`, formData);
      toast.success("Foto actualizada");
      fetchData();
    } catch (error) {
      toast.error("Error al subir foto");
    }
  };

  const getContractCountdown = (days) => {
    if (days <= 0) return "Expirado";
    if (days <= 30) return `${days} dias`;
    if (days <= 365) return `${Math.floor(days / 30)} meses`;
    return `${(days / 365).toFixed(1)} años`;
  };

  if (loading) {
    return (
      <ClubLayout title="Perfil del Club">
        <div className="text-center py-20">
          <p className="text-zinc-400">Cargando perfil...</p>
        </div>
      </ClubLayout>
    );
  }

  return (
    <ClubLayout title="Perfil del Club">
      <div className="space-y-8">
        {/* Directiva Section - NUEVO */}
        <Card className="bg-[#121212] border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-[#DFFF00]" />
              Directiva del Club
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Define la estructura de gobierno y cuerpo tecnico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Historical/Honorary Positions */}
            <div className="p-4 bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-lg">
              <h4 className="text-sm font-semibold text-amber-400 mb-4 uppercase tracking-wide">Posiciones Honorarias</h4>
              <div className="grid md:grid-cols-3 gap-4">
                {DIRECTIVA_ROLES.slice(0, 3).map(({ key, label, icon: Icon }) => (
                  <div key={key}>
                    <Label className="flex items-center gap-2 text-zinc-400 mb-2">
                      <Icon className="h-4 w-4 text-amber-400" />
                      {label}
                    </Label>
                    <Input
                      value={profile.directiva?.[key] || ""}
                      onChange={(e) => updateDirectiva(key, e.target.value)}
                      placeholder={`Nombre del ${label.toLowerCase()}`}
                      className="bg-[#0A0A0A] border-white/10"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Current Government */}
            <div className="p-4 bg-gradient-to-r from-[#DFFF00]/10 to-transparent border border-[#DFFF00]/20 rounded-lg">
              <h4 className="text-sm font-semibold text-[#DFFF00] mb-4 uppercase tracking-wide">Gobierno Actual</h4>
              <div className="grid md:grid-cols-3 gap-4">
                {DIRECTIVA_ROLES.slice(3, 6).map(({ key, label, icon: Icon }) => (
                  <div key={key}>
                    <Label className="flex items-center gap-2 text-zinc-400 mb-2">
                      <Icon className="h-4 w-4 text-[#DFFF00]" />
                      {label}
                    </Label>
                    <Input
                      value={profile.directiva?.[key] || ""}
                      onChange={(e) => updateDirectiva(key, e.target.value)}
                      placeholder={`Nombre del ${label.toLowerCase()}`}
                      className="bg-[#0A0A0A] border-white/10"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Staff */}
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-400 mb-4 uppercase tracking-wide">Cuerpo Tecnico</h4>
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 text-zinc-400 mb-2">
                    <User className="h-4 w-4 text-blue-400" />
                    Director Tecnico (DT)
                  </Label>
                  <Input
                    value={profile.directiva?.technical_director || ""}
                    onChange={(e) => updateDirectiva("technical_director", e.target.value)}
                    placeholder="Nombre del DT"
                    className="bg-[#0A0A0A] border-white/10"
                  />
                </div>
                
                <div>
                  <Label className="flex items-center gap-2 text-zinc-400 mb-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    Asistentes Tecnicos
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(profile.directiva?.assistant_coaches || []).map((coach, index) => (
                      <Badge key={index} className="bg-blue-500/20 text-blue-400 flex items-center gap-1">
                        {coach}
                        <button onClick={() => removeAssistantCoach(index)} className="ml-1 hover:text-red-400">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newAssistant}
                      onChange={(e) => setNewAssistant(e.target.value)}
                      placeholder="Nombre del asistente"
                      className="bg-[#0A0A0A] border-white/10"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAssistantCoach())}
                    />
                    <Button onClick={addAssistantCoach} variant="outline" className="border-blue-500/30 text-blue-400">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Club Info Section */}
        <Card className="bg-[#121212] border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-[#DFFF00]" />
              Informacion del Club
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Gestiona la informacion basica de tu club
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label>Ciudad</Label>
                <Input
                  value={profile.city}
                  onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Ej: Madrid"
                  className="mt-2 bg-[#0A0A0A] border-white/10"
                />
              </div>
              <div>
                <Label>Estadio / Campo</Label>
                <Input
                  value={profile.stadium}
                  onChange={(e) => setProfile(prev => ({ ...prev, stadium: e.target.value }))}
                  placeholder="Ej: Estadio Municipal"
                  className="mt-2 bg-[#0A0A0A] border-white/10"
                />
              </div>
            </div>

            {/* Official Colors */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Palette className="h-4 w-4" />
                Colores Oficiales
              </Label>
              <div className="flex flex-wrap gap-2 mb-3">
                {profile.official_colors.map((color) => (
                  <div 
                    key={color} 
                    className="flex items-center gap-2 px-3 py-2 bg-[#1E1E1E] rounded-lg"
                  >
                    <div 
                      className="w-6 h-6 rounded-full border border-white/20" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm">{color}</span>
                    <button 
                      onClick={() => removeColor(color)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Button onClick={addColor} variant="outline" className="border-white/20">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Color
                </Button>
              </div>
            </div>

            {/* Teams */}
            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4" />
                Equipos ({profile.teams.length})
              </Label>
              <div className="space-y-2 mb-3">
                {profile.teams.map((team) => (
                  <div 
                    key={team.id} 
                    className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg"
                  >
                    <div>
                      <span className="font-medium">{team.name}</span>
                      <Badge className="ml-2 bg-[#DFFF00]/20 text-[#DFFF00]">{team.type}</Badge>
                    </div>
                    <button 
                      onClick={() => removeTeam(team.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTeam.name}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre del equipo"
                  className="bg-[#0A0A0A] border-white/10"
                />
                <Select value={newTeam.type} onValueChange={(v) => setNewTeam(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger className="w-40 bg-[#0A0A0A] border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    {TEAM_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addTeam} variant="outline" className="border-white/20">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button onClick={saveProfile} disabled={saving} className="bg-[#DFFF00] text-black hover:bg-white">
              {saving ? "Guardando..." : "Guardar Perfil"}
            </Button>
          </CardContent>
        </Card>

        {/* Players Section */}
        <Card className="bg-[#121212] border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#DFFF00]" />
                  Plantilla de Jugadores ({players.length})
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Registra y gestiona los jugadores de tu club
                </CardDescription>
              </div>
              <Dialog open={playerDialogOpen} onOpenChange={setPlayerDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    data-testid="add-player-button"
                    onClick={() => {
                      setEditingPlayer(null);
                      setPlayerForm({
                        name: "",
                        number: "",
                        age: "",
                        position: "Delantero",
                        jersey_size: "M",
                        nationality: "",
                        contract_end_date: ""
                      });
                    }}
                    className="bg-[#DFFF00] text-black hover:bg-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Jugador
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#121212] border-white/10 max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{editingPlayer ? "Editar Jugador" : "Nuevo Jugador"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePlayerSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nombre Completo</Label>
                        <Input
                          required
                          value={playerForm.name}
                          onChange={(e) => setPlayerForm(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-1 bg-[#0A0A0A] border-white/10"
                        />
                      </div>
                      <div>
                        <Label>Numero</Label>
                        <Input
                          required
                          type="number"
                          min="1"
                          max="99"
                          value={playerForm.number}
                          onChange={(e) => setPlayerForm(prev => ({ ...prev, number: e.target.value }))}
                          className="mt-1 bg-[#0A0A0A] border-white/10"
                        />
                      </div>
                      <div>
                        <Label>Edad</Label>
                        <Input
                          required
                          type="number"
                          min="15"
                          max="50"
                          value={playerForm.age}
                          onChange={(e) => setPlayerForm(prev => ({ ...prev, age: e.target.value }))}
                          className="mt-1 bg-[#0A0A0A] border-white/10"
                        />
                      </div>
                      <div>
                        <Label>Posicion</Label>
                        <Select 
                          value={playerForm.position} 
                          onValueChange={(v) => setPlayerForm(prev => ({ ...prev, position: v }))}
                        >
                          <SelectTrigger className="mt-1 bg-[#0A0A0A] border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#121212] border-white/10">
                            {POSITIONS.map(pos => (
                              <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Talla de Camiseta</Label>
                        <Select 
                          value={playerForm.jersey_size} 
                          onValueChange={(v) => setPlayerForm(prev => ({ ...prev, jersey_size: v }))}
                        >
                          <SelectTrigger className="mt-1 bg-[#0A0A0A] border-white/10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#121212] border-white/10">
                            {JERSEY_SIZES.map(size => (
                              <SelectItem key={size} value={size}>{size}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Nacionalidad</Label>
                        <Input
                          required
                          value={playerForm.nationality}
                          onChange={(e) => setPlayerForm(prev => ({ ...prev, nationality: e.target.value }))}
                          placeholder="Ej: Espanola"
                          className="mt-1 bg-[#0A0A0A] border-white/10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Fecha Fin de Contrato</Label>
                      <Input
                        required
                        type="date"
                        value={playerForm.contract_end_date}
                        onChange={(e) => setPlayerForm(prev => ({ ...prev, contract_end_date: e.target.value }))}
                        className="mt-1 bg-[#0A0A0A] border-white/10"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white">
                      {editingPlayer ? "Actualizar" : "Registrar"} Jugador
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {players.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <User className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>No hay jugadores registrados</p>
                <p className="text-sm">Agrega jugadores para ver la plantilla</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {players.map((player) => (
                  <Card 
                    key={player.id} 
                    className="bg-[#1E1E1E] border-white/5 hover:border-[#DFFF00]/30 transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          {player.photo_url ? (
                            <img 
                              src={`${BACKEND_URL}${player.photo_url}`}
                              alt={player.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-[#0A0A0A] flex items-center justify-center border-2 border-white/10">
                              <User className="h-8 w-8 text-zinc-600" />
                            </div>
                          )}
                          <div 
                            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#DFFF00] flex items-center justify-center text-black font-bold text-sm"
                          >
                            {player.number}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{player.name}</h4>
                          <p className="text-sm text-zinc-400">{player.position}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-zinc-700/50 text-xs">{player.nationality}</Badge>
                            <Badge className="bg-zinc-700/50 text-xs">{player.age} años</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Shirt className="h-4 w-4 text-zinc-500" />
                            <span className="text-zinc-400">Talla: {player.jersey_size}</span>
                          </div>
                        </div>
                        
                        {/* Contract Status */}
                        <div 
                          className="flex items-center justify-between p-2 rounded-lg"
                          style={{ backgroundColor: `${player.contract_color}15` }}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" style={{ color: player.contract_color }} />
                            <span className="text-xs" style={{ color: player.contract_color }}>
                              Contrato: {getContractCountdown(player.days_remaining)}
                            </span>
                          </div>
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: player.contract_color }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <label className="flex-1">
                          <input 
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                uploadPlayerPhoto(player.id, e.target.files[0]);
                              }
                            }}
                          />
                          <Button 
                            type="button"
                            variant="outline" 
                            className="w-full border-white/10 text-xs"
                            onClick={(e) => e.currentTarget.parentElement.querySelector('input').click()}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Foto
                          </Button>
                        </label>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-white/10"
                          onClick={() => openEditPlayer(player)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                          onClick={() => deletePlayer(player.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ClubLayout>
  );
};

export default ClubProfile;
