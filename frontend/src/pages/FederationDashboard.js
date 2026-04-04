import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Shield, LogOut, Trophy, Users, Calendar, Plus, Edit,
  Trash2, Check, Clock, Newspaper, Upload, AlertTriangle
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const STATUS_LABELS = {
  scheduled: { label: "Programado", color: "bg-blue-500/20 text-blue-400" },
  live: { label: "En Juego", color: "bg-green-500/20 text-green-400 animate-pulse" },
  finished: { label: "Finalizado", color: "bg-zinc-500/20 text-zinc-400" },
  postponed: { label: "Aplazado", color: "bg-yellow-500/20 text-yellow-400" },
};

const FederationDashboard = () => {
  const navigate = useNavigate();
  const [fedUser, setFedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("matches");

  // Data
  const [seasons, setSeasons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);

  // Dialogs
  const [matchDialog, setMatchDialog] = useState(false);
  const [resultDialog, setResultDialog] = useState(false);
  const [teamDialog, setTeamDialog] = useState(false);
  const [roundDialog, setRoundDialog] = useState(false);
  const [newsDialog, setNewsDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [editingTeam, setEditingTeam] = useState(null);

  // Forms
  const [matchForm, setMatchForm] = useState({
    round_id: "", home_team_id: "", away_team_id: "", match_date: "", venue: "", notes: ""
  });
  const [resultForm, setResultForm] = useState({
    home_score: "", away_score: "", status: "finished",
    home_scorers: "", away_scorers: ""
  });
  const [teamForm, setTeamForm] = useState({
    name: "", short_name: "", city: "", stadium: ""
  });
  const [roundForm, setRoundForm] = useState({
    number: "", name: "", date_start: "", date_end: ""
  });
  const [newsForm, setNewsForm] = useState({ title: "", content: "", priority: "normal" });

  // Filtros
  const [filterRound, setFilterRound] = useState("all");

  const fetchInitial = useCallback(async () => {
    await Promise.all([fetchSeasons(), fetchTeams()]);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("federation_user");
    if (!stored) { navigate("/liga"); return; }
    setFedUser(JSON.parse(stored));
    fetchInitial();
  }, [navigate, fetchInitial]);

  const fetchSeasons = async () => {
    const res = await axios.get(`${BACKEND_URL}/api/league/seasons`);
    setSeasons(res.data);
    const active = res.data.find(s => s.active);
    if (active) {
      setActiveSeason(active);
      fetchRounds(active.id);
      fetchMatches(active.id);
    }
  };

  const fetchTeams = async () => {
    const res = await axios.get(`${BACKEND_URL}/api/league/teams`);
    setTeams(res.data);
  };

  const fetchRounds = async (seasonId) => {
    const res = await axios.get(`${BACKEND_URL}/api/league/rounds?season_id=${seasonId}`);
    setRounds(res.data);
  };

  const fetchMatches = async (seasonId) => {
    const res = await axios.get(`${BACKEND_URL}/api/league/matches?season_id=${seasonId}`);
    setMatches(res.data);
  };

  // ── Crear partido ──────────────────────────────────────────────
  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (!activeSeason) { toast.error("No hay temporada activa"); return; }
    try {
      await axios.post(`${BACKEND_URL}/api/league/matches`, {
        ...matchForm,
        season_id: activeSeason.id,
      });
      toast.success("Partido creado");
      setMatchDialog(false);
      setMatchForm({ round_id: "", home_team_id: "", away_team_id: "", match_date: "", venue: "", notes: "" });
      fetchMatches(activeSeason.id);
    } catch { toast.error("Error al crear partido"); }
  };

  // ── Guardar resultado ──────────────────────────────────────────
  const handleSaveResult = async (e) => {
    e.preventDefault();
    try {
      const homeScorers = resultForm.home_scorers
        ? resultForm.home_scorers.split(",").map(s => ({ name: s.trim(), minute: null }))
        : [];
      const awayScorers = resultForm.away_scorers
        ? resultForm.away_scorers.split(",").map(s => ({ name: s.trim(), minute: null }))
        : [];

      await axios.put(`${BACKEND_URL}/api/league/matches/${selectedMatch.id}`, {
        home_score: parseInt(resultForm.home_score),
        away_score: parseInt(resultForm.away_score),
        status: resultForm.status,
        home_scorers: homeScorers,
        away_scorers: awayScorers,
      });
      toast.success("Resultado guardado");
      setResultDialog(false);
      fetchMatches(activeSeason.id);
    } catch { toast.error("Error al guardar resultado"); }
  };

  // ── Crear/editar equipo ────────────────────────────────────────
  const handleSaveTeam = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await axios.put(`${BACKEND_URL}/api/league/teams/${editingTeam.id}`, teamForm);
        toast.success("Equipo actualizado");
      } else {
        await axios.post(`${BACKEND_URL}/api/league/teams`, teamForm);
        toast.success("Equipo creado");
      }
      setTeamDialog(false);
      setEditingTeam(null);
      setTeamForm({ name: "", short_name: "", city: "", stadium: "" });
      fetchTeams();
    } catch { toast.error("Error al guardar equipo"); }
  };

  // ── Crear jornada ──────────────────────────────────────────────
  const handleCreateRound = async (e) => {
    e.preventDefault();
    if (!activeSeason) { toast.error("No hay temporada activa"); return; }
    try {
      await axios.post(`${BACKEND_URL}/api/league/rounds`, {
        ...roundForm,
        season_id: activeSeason.id,
        number: parseInt(roundForm.number),
      });
      toast.success("Jornada creada");
      setRoundDialog(false);
      setRoundForm({ number: "", name: "", date_start: "", date_end: "" });
      fetchRounds(activeSeason.id);
    } catch { toast.error("Error al crear jornada"); }
  };

  // ── Crear noticia ──────────────────────────────────────────────
  const handleCreateNews = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/league/news`, {
        ...newsForm,
        season_id: activeSeason?.id || null,
      });
      toast.success("Noticia publicada");
      setNewsDialog(false);
      setNewsForm({ title: "", content: "", priority: "normal" });
    } catch { toast.error("Error al publicar noticia"); }
  };

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm("¿Eliminar este partido?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/league/matches/${matchId}`);
      toast.success("Partido eliminado");
      fetchMatches(activeSeason.id);
    } catch { toast.error("Error al eliminar"); }
  };

  const openResultDialog = (match) => {
    setSelectedMatch(match);
    setResultForm({
      home_score: match.home_score ?? "",
      away_score: match.away_score ?? "",
      status: match.status === "finished" ? "finished" : "finished",
      home_scorers: (match.home_scorers || []).map(s => s.name).join(", "),
      away_scorers: (match.away_scorers || []).map(s => s.name).join(", "),
    });
    setResultDialog(true);
  };

  const teamName = (id) => teams.find(t => t.id === id)?.name || id;

  const filteredMatches = filterRound === "all"
    ? matches
    : matches.filter(m => m.round_id === filterRound);

  const handleLogout = () => {
    localStorage.removeItem("federation_user");
    navigate("/liga");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm uppercase tracking-wide">Panel Federación</h1>
              <p className="text-xs text-zinc-500">{fedUser?.full_name || fedUser?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeSeason && (
              <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                {activeSeason.name}
              </span>
            )}
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-white/20 text-zinc-400">
              <LogOut className="h-4 w-4 mr-1" />Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 bg-[#121212] border border-white/10 p-1 h-auto mb-6">
            {[
              { value: "matches", Icon: Calendar, label: "Partidos" },
              { value: "teams", Icon: Users, label: "Equipos" },
              { value: "rounds", Icon: Trophy, label: "Jornadas" },
              { value: "news", Icon: Newspaper, label: "Noticias" },
            ].map(({ value, Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-1.5 py-2 text-xs data-[state=active]:bg-[#DFFF00] data-[state=active]:text-black"
              >
                <Icon className="h-4 w-4" />{label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── PARTIDOS ── */}
          <TabsContent value="matches" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Select value={filterRound} onValueChange={setFilterRound}>
                  <SelectTrigger className="w-44 bg-[#121212] border-white/10 text-sm">
                    <SelectValue placeholder="Todas las jornadas" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    <SelectItem value="all">Todas las jornadas</SelectItem>
                    {rounds.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => setMatchDialog(true)}
                className="bg-[#DFFF00] text-black hover:bg-white text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />Nuevo Partido
              </Button>
            </div>

            <div className="space-y-3">
              {filteredMatches.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No hay partidos. Crea el primero.</p>
                </div>
              ) : filteredMatches.map((match) => {
                const s = STATUS_LABELS[match.status] || STATUS_LABELS.scheduled;
                return (
                  <div key={match.id} className="p-4 bg-[#121212] rounded-xl border border-white/5 hover:border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {/* Info partido */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs text-zinc-500">
                            {match.round?.name} ·{" "}
                            {match.match_date
                              ? new Date(match.match_date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                              : "Sin fecha"}
                          </span>
                          <Badge className={`${s.color} text-xs border-transparent`}>{s.label}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{match.home_team?.name || teamName(match.home_team_id)}</span>
                          {match.status === "finished" ? (
                            <span className="text-2xl font-black text-[#DFFF00]">
                              {match.home_score} - {match.away_score}
                            </span>
                          ) : (
                            <span className="text-zinc-600 font-bold">vs</span>
                          )}
                          <span className="font-bold">{match.away_team?.name || teamName(match.away_team_id)}</span>
                        </div>
                        {match.venue && <p className="text-xs text-zinc-600 mt-1">{match.venue}</p>}
                      </div>
                      {/* Acciones */}
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => openResultDialog(match)}
                          className="bg-green-600 hover:bg-green-500 text-white text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />Resultado
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteMatch(match.id)}
                          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ── EQUIPOS ── */}
          <TabsContent value="teams" className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => { setEditingTeam(null); setTeamForm({ name: "", short_name: "", city: "", stadium: "" }); setTeamDialog(true); }}
                className="bg-[#DFFF00] text-black hover:bg-white text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />Nuevo Equipo
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map(team => (
                <div key={team.id} className="p-4 bg-[#121212] rounded-xl border border-white/5 flex items-center gap-3">
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#1E1E1E] flex items-center justify-center text-zinc-500 font-bold text-sm">
                      {team.short_name || team.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{team.name}</p>
                    <p className="text-xs text-zinc-500">{team.city || "—"}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingTeam(team);
                      setTeamForm({ name: team.name, short_name: team.short_name || "", city: team.city || "", stadium: team.stadium || "" });
                      setTeamDialog(true);
                    }}
                    className="text-zinc-400 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── JORNADAS ── */}
          <TabsContent value="rounds" className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => setRoundDialog(true)}
                className="bg-[#DFFF00] text-black hover:bg-white text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />Nueva Jornada
              </Button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rounds.map(round => (
                <div key={round.id} className="p-4 bg-[#121212] rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">{round.name}</span>
                    <Badge className={
                      round.status === "finished" ? "bg-zinc-500/20 text-zinc-400" :
                        round.status === "ongoing" ? "bg-green-500/20 text-green-400" :
                          "bg-blue-500/20 text-blue-400"
                    }>
                      {round.status === "finished" ? "Finalizada" : round.status === "ongoing" ? "En curso" : "Próxima"}
                    </Badge>
                  </div>
                  {round.date_start && (
                    <p className="text-xs text-zinc-500">
                      {new Date(round.date_start).toLocaleDateString("es-ES")}
                      {round.date_end && ` — ${new Date(round.date_end).toLocaleDateString("es-ES")}`}
                    </p>
                  )}
                  <p className="text-xs text-zinc-600 mt-1">
                    {matches.filter(m => m.round_id === round.id).length} partido(s)
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── NOTICIAS ── */}
          <TabsContent value="news" className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => setNewsDialog(true)}
                className="bg-[#DFFF00] text-black hover:bg-white text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />Nueva Noticia
              </Button>
            </div>
            <p className="text-zinc-500 text-sm">Las noticias que publiques aparecerán en la sección Liga de todos los clubes.</p>
          </TabsContent>
        </Tabs>
      </main>

      {/* ── Dialog: Nuevo partido ── */}
      <Dialog open={matchDialog} onOpenChange={setMatchDialog}>
        <DialogContent className="bg-[#121212] border-white/10 text-white max-w-lg">
          <DialogHeader><DialogTitle>Nuevo Partido</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateMatch} className="space-y-4">
            <div>
              <Label>Jornada *</Label>
              <Select value={matchForm.round_id} onValueChange={v => setMatchForm(p => ({ ...p, round_id: v }))}>
                <SelectTrigger className="mt-1 bg-[#0A0A0A] border-white/10">
                  <SelectValue placeholder="Selecciona jornada" />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10">
                  {rounds.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Local *</Label>
                <Select value={matchForm.home_team_id} onValueChange={v => setMatchForm(p => ({ ...p, home_team_id: v }))}>
                  <SelectTrigger className="mt-1 bg-[#0A0A0A] border-white/10">
                    <SelectValue placeholder="Equipo local" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Visitante *</Label>
                <Select value={matchForm.away_team_id} onValueChange={v => setMatchForm(p => ({ ...p, away_team_id: v }))}>
                  <SelectTrigger className="mt-1 bg-[#0A0A0A] border-white/10">
                    <SelectValue placeholder="Equipo visitante" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    {teams.filter(t => t.id !== matchForm.home_team_id).map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha y hora</Label>
                <Input type="datetime-local" value={matchForm.match_date}
                  onChange={e => setMatchForm(p => ({ ...p, match_date: e.target.value }))}
                  className="mt-1 bg-[#0A0A0A] border-white/10" />
              </div>
              <div>
                <Label>Estadio</Label>
                <Input value={matchForm.venue}
                  onChange={e => setMatchForm(p => ({ ...p, venue: e.target.value }))}
                  placeholder="Estadio La Paz"
                  className="mt-1 bg-[#0A0A0A] border-white/10" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white">Crear Partido</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Resultado ── */}
      <Dialog open={resultDialog} onOpenChange={setResultDialog}>
        <DialogContent className="bg-[#121212] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Resultado del Partido</DialogTitle>
            {selectedMatch && (
              <p className="text-sm text-zinc-400">
                {selectedMatch.home_team?.name} vs {selectedMatch.away_team?.name}
              </p>
            )}
          </DialogHeader>
          <form onSubmit={handleSaveResult} className="space-y-4">
            <div className="grid grid-cols-3 gap-3 items-end">
              <div>
                <Label className="text-xs">{selectedMatch?.home_team?.name}</Label>
                <Input type="number" min="0" value={resultForm.home_score}
                  onChange={e => setResultForm(p => ({ ...p, home_score: e.target.value }))}
                  className="mt-1 bg-[#0A0A0A] border-white/10 text-center text-3xl font-bold h-16" />
              </div>
              <div className="text-center text-zinc-500 font-bold text-xl pb-4">—</div>
              <div>
                <Label className="text-xs">{selectedMatch?.away_team?.name}</Label>
                <Input type="number" min="0" value={resultForm.away_score}
                  onChange={e => setResultForm(p => ({ ...p, away_score: e.target.value }))}
                  className="mt-1 bg-[#0A0A0A] border-white/10 text-center text-3xl font-bold h-16" />
              </div>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={resultForm.status} onValueChange={v => setResultForm(p => ({ ...p, status: v }))}>
                <SelectTrigger className="mt-1 bg-[#0A0A0A] border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10">
                  <SelectItem value="live">En Juego</SelectItem>
                  <SelectItem value="finished">Finalizado</SelectItem>
                  <SelectItem value="postponed">Aplazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Goleadores locales (separados por coma)</Label>
              <Input value={resultForm.home_scorers}
                onChange={e => setResultForm(p => ({ ...p, home_scorers: e.target.value }))}
                placeholder="Nombre1, Nombre2"
                className="mt-1 bg-[#0A0A0A] border-white/10" />
            </div>
            <div>
              <Label>Goleadores visitantes (separados por coma)</Label>
              <Input value={resultForm.away_scorers}
                onChange={e => setResultForm(p => ({ ...p, away_scorers: e.target.value }))}
                placeholder="Nombre1, Nombre2"
                className="mt-1 bg-[#0A0A0A] border-white/10" />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white">
              Guardar Resultado
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Equipo ── */}
      <Dialog open={teamDialog} onOpenChange={setTeamDialog}>
        <DialogContent className="bg-[#121212] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTeam ? "Editar Equipo" : "Nuevo Equipo"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveTeam} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre *</Label>
                <Input value={teamForm.name}
                  onChange={e => setTeamForm(p => ({ ...p, name: e.target.value }))}
                  required className="mt-1 bg-[#0A0A0A] border-white/10" />
              </div>
              <div>
                <Label>Abreviatura</Label>
                <Input value={teamForm.short_name} maxLength={4}
                  onChange={e => setTeamForm(p => ({ ...p, short_name: e.target.value.toUpperCase() }))}
                  placeholder="RAC" className="mt-1 bg-[#0A0A0A] border-white/10" />
              </div>
              <div>
                <Label>Ciudad</Label>
                <Input value={teamForm.city}
                  onChange={e => setTeamForm(p => ({ ...p, city: e.target.value }))}
                  className="mt-1 bg-[#0A0A0A] border-white/10" />
              </div>
              <div>
                <Label>Estadio</Label>
                <Input value={teamForm.stadium}
                  onChange={e => setTeamForm(p => ({ ...p, stadium: e.target.value }))}
                  className="mt-1 bg-[#0A0A0A] border-white/10" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white">
              {editingTeam ? "Actualizar" : "Crear"} Equipo
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Jornada ── */}
      <Dialog open={roundDialog} onOpenChange={setRoundDialog}>
        <DialogContent className="bg-[#121212] border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle>Nueva Jornada</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateRound} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Número *</Label>
                <Input type="number" value={roundForm.number}
                  onChange={e => setRoundForm(p => ({ ...p, number: e.target.value }))}
                  required className="mt-1 bg-[#0A0A0A] border-white/10" />
              </div>
              <div>
                <Label>Nombre</Label>
                <Input value={roundForm.name}
                  onChange={e => setRoundForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Jornada 1" className="mt-1 bg-[#0A0A0A] border-white/10" />
              </div>
              <div>
                <Label>Fecha inicio</Label>
                <Input type="date" value={roundForm.date_start}
                  onChange={e => setRoundForm(p => ({ ...p, date_start: e.target.value }))}
                  className="mt-1 bg-[#0A0A0A] border-white/10" />
              </div>
              <div>
                <Label>Fecha fin</Label>
                <Input type="date" value={roundForm.date_end}
                  onChange={e => setRoundForm(p => ({ ...p, date_end: e.target.value }))}
                  className="mt-1 bg-[#0A0A0A] border-white/10" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white">Crear Jornada</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Noticia ── */}
      <Dialog open={newsDialog} onOpenChange={setNewsDialog}>
        <DialogContent className="bg-[#121212] border-white/10 text-white max-w-md">
          <DialogHeader><DialogTitle>Nueva Noticia de Liga</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateNews} className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={newsForm.title}
                onChange={e => setNewsForm(p => ({ ...p, title: e.target.value }))}
                required className="mt-1 bg-[#0A0A0A] border-white/10" />
            </div>
            <div>
              <Label>Contenido</Label>
              <Textarea value={newsForm.content}
                onChange={e => setNewsForm(p => ({ ...p, content: e.target.value }))}
                className="mt-1 bg-[#0A0A0A] border-white/10 min-h-28" />
            </div>
            <div>
              <Label>Prioridad</Label>
              <Select value={newsForm.priority} onValueChange={v => setNewsForm(p => ({ ...p, priority: v }))}>
                <SelectTrigger className="mt-1 bg-[#0A0A0A] border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10">
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white">Publicar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FederationDashboard;