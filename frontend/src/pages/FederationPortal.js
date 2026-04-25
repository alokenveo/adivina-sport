import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  Shield, LogOut, Trophy, Users, Calendar, Plus, Edit,
  Trash2, Check, Newspaper, Menu, Home, BarChart3,
  Send, FileText, Star, Link, Image, X, ChevronRight,
  Swords, Clock, TrendingUp, UserCheck, AlertCircle, Search,
  RefreshCw
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// ── Constantes ────────────────────────────────────────────────────────────────
const STATUS_LABELS = {
  scheduled: { label: "Programado", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  live:      { label: "En Juego",   color: "bg-green-500/20 text-green-400 border-green-500/30" },
  finished:  { label: "Finalizado", color: "bg-zinc-700/50 text-zinc-400 border-zinc-600/30" },
  postponed: { label: "Aplazado",   color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

const PRIORITY_CONFIG = {
  normal: { label: "Normal", color: "bg-zinc-700/50 text-zinc-400" },
  high:   { label: "Alta",   color: "bg-orange-500/20 text-orange-400" },
  urgent: { label: "Urgente", color: "bg-red-500/20 text-red-400" },
};

const SPORTS_LABELS = {
  football:   "⚽ Fútbol",
  basketball: "🏀 Baloncesto",
  futsal:     "🥅 Fútbol Sala",
  volleyball: "🏐 Voleibol",
  other:      "🏅 Otro",
};

const formatUTC = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC",
  });
};

// ── Logo sin molde circular ───────────────────────────────────────────────────
const TeamLogo = ({ team, size = "md" }) => {
  const sz = size === "sm" ? "w-7 h-7" : "w-10 h-10";
  const initials = (team?.short_name || team?.name || "?").substring(0, 2).toUpperCase();

  if (team?.logo_url || team?.crest_url) {
    const src = team.logo_url || team.crest_url;
    return (
      <div className={`${sz} flex items-center justify-center flex-shrink-0`}>
        <img
          src={src}
          alt={team?.name || ""}
          className="max-w-full max-h-full w-auto h-auto object-contain"
          style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}
        />
      </div>
    );
  }
  return (
    <div className={`${sz} rounded-md bg-white/5 border border-white/10 flex items-center justify-center font-bold text-zinc-500 flex-shrink-0 text-[9px]`}>
      {initials}
    </div>
  );
};

// ── Forma reciente ────────────────────────────────────────────────────────────
const FormBadge = ({ result }) => {
  const cfg = { W: { bg: "bg-green-500", t: "V" }, D: { bg: "bg-yellow-500", t: "E" }, L: { bg: "bg-red-500", t: "D" } }[result] || { bg: "bg-zinc-600", t: "?" };
  return <span className={`${cfg.bg} text-black font-black rounded text-[9px] px-1 py-0.5 leading-none`}>{cfg.t}</span>;
};

const calcForm = (teamId, matches) =>
  matches
    .filter(m => m.status === "finished" && (m.home_team_id === teamId || m.away_team_id === teamId))
    .sort((a, b) => new Date(b.match_date || b.created_at) - new Date(a.match_date || a.created_at))
    .slice(0, 5)
    .map(m => {
      const isHome = m.home_team_id === teamId;
      const my = isHome ? m.home_score : m.away_score;
      const their = isHome ? m.away_score : m.home_score;
      return my > their ? "W" : my < their ? "L" : "D";
    })
    .reverse();

// ── StatCard ──────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = "text-[#DFFF00]", icon: Icon }) => (
  <Card className="bg-[#121212] border-white/5">
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-zinc-500 mb-1">{label}</p>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
        {sub && <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>}
      </div>
      {Icon && <Icon className={`h-8 w-8 opacity-20 ${color}`} />}
    </CardContent>
  </Card>
);

// ── Portal principal ──────────────────────────────────────────────────────────
const FederationPortal = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data
  const [seasons, setSeasons]         = useState([]);
  const [teams, setTeams]             = useState([]);
  const [allClubs, setAllClubs]       = useState([]);
  const [members, setMembers]         = useState([]);
  const [rounds, setRounds]           = useState([]);
  const [matches, setMatches]         = useState([]);
  const [standings, setStandings]     = useState([]);
  const [leagueNews, setLeagueNews]   = useState([]);
  const [circulars, setCirculars]     = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [filterRound, setFilterRound] = useState("all");

  // Inscripción de jugadores
  const [allPlayers, setAllPlayers]           = useState([]); // jugadores de todos los clubes
  const [registrations, setRegistrations]     = useState([]); // jugadores inscritos en la federación
  const [playerSearch, setPlayerSearch]       = useState("");
  const [regDialog, setRegDialog]             = useState(false);
  const [selectedPlayer, setSelectedPlayer]   = useState(null);
  const [regSeasonId, setRegSeasonId]         = useState("");
  const [regLoading, setRegLoading]           = useState(false);

  // Dialogs
  const [matchDialog, setMatchDialog]         = useState(false);
  const [resultDialog, setResultDialog]       = useState(false);
  const [teamDialog, setTeamDialog]           = useState(false);
  const [roundDialog, setRoundDialog]         = useState(false);
  const [newsDialog, setNewsDialog]           = useState(false);
  const [circularDialog, setCircularDialog]   = useState(false);
  const [affiliateDialog, setAffiliateDialog] = useState(false);
  const [selectedMatch, setSelectedMatch]     = useState(null);
  const [editingTeam, setEditingTeam]         = useState(null);

  // Forms
  const [matchForm, setMatchForm]       = useState({ round_id: "", home_team_id: "", away_team_id: "", match_date: "", venue: "", notes: "" });
  const [resultForm, setResultForm]     = useState({ home_score: "", away_score: "", status: "finished", home_scorers: "", away_scorers: "" });
  const [teamForm, setTeamForm]         = useState({ name: "", short_name: "", city: "", stadium: "", adivina_club_id: "" });
  const [roundForm, setRoundForm]       = useState({ number: "", name: "", date_start: "", date_end: "" });
  const [newsForm, setNewsForm]         = useState({ title: "", content: "", priority: "normal" });
  const [circularForm, setCircularForm] = useState({ title: "", content: "", priority: "normal" });
  const [affiliateForm, setAffiliateForm] = useState({ club_id: "", sport: "football", division: "" });
  const [logoFile, setLogoFile]         = useState(null);

  const federationId = user?.club_id;

  // ── Fetch ──
  const fetchSeasons = useCallback(async () => {
    const res = await axios.get(`${BACKEND_URL}/api/league/seasons`);
    setSeasons(res.data);
    const active = res.data.find(s => s.active);
    if (active) {
      setActiveSeason(active);
      setRegSeasonId(active.id);
      fetchRounds(active.id);
      fetchMatches(active.id);
      fetchStandings(active.id);
      fetchLeagueNews(active.id);
    }
  }, []);

  const fetchRounds      = async (sid) => { const r = await axios.get(`${BACKEND_URL}/api/league/rounds?season_id=${sid}`); setRounds(r.data); };
  const fetchMatches     = async (sid) => { const r = await axios.get(`${BACKEND_URL}/api/league/matches?season_id=${sid}`); setMatches(r.data); };
  const fetchStandings   = async (sid) => { const r = await axios.get(`${BACKEND_URL}/api/league/standings?season_id=${sid}`); setStandings(r.data); };
  const fetchLeagueNews  = async (sid) => { const r = await axios.get(`${BACKEND_URL}/api/league/news?season_id=${sid}`); setLeagueNews(r.data); };

  const fetchTeams = useCallback(async () => {
    const r = await axios.get(`${BACKEND_URL}/api/league/teams`);
    setTeams(r.data);
  }, []);

  const fetchAllClubs = useCallback(async () => {
    const r = await axios.get(`${BACKEND_URL}/api/clubs`);
    setAllClubs(r.data.filter(c => c.institution_type !== 'federation' && c.status === 'active'));
  }, []);

  const fetchMembers = useCallback(async () => {
    if (!federationId) return;
    try { const r = await axios.get(`${BACKEND_URL}/api/federation/members/${federationId}`); setMembers(r.data); }
    catch { setMembers([]); }
  }, [federationId]);

  const fetchCirculars = useCallback(async () => {
    if (!federationId) return;
    try { const r = await axios.get(`${BACKEND_URL}/api/federation/circulars/${federationId}`); setCirculars(r.data); }
    catch { setCirculars([]); }
  }, [federationId]);

  // Carga jugadores de todos los clubes afiliados
  const fetchAllPlayers = useCallback(async () => {
    try {
      const clubIds = members.map(m => m.club_id).filter(Boolean);
      if (clubIds.length === 0) { setAllPlayers([]); return; }
      const results = await Promise.all(
        clubIds.map(id => axios.get(`${BACKEND_URL}/api/club/players/${id}`).catch(() => ({ data: [] })))
      );
      const flat = results.flatMap((r, i) =>
        r.data.map(p => ({ ...p, clubName: members[i]?.club?.name || members[i]?.club_id }))
      );
      setAllPlayers(flat);
    } catch { setAllPlayers([]); }
  }, [members]);

  // Carga inscripciones guardadas en localStorage (simulado hasta tener tabla real)
  const fetchRegistrations = useCallback(() => {
    try {
      const stored = localStorage.getItem(`fed_registrations_${federationId}`);
      setRegistrations(stored ? JSON.parse(stored) : []);
    } catch { setRegistrations([]); }
  }, [federationId]);

  const saveRegistrations = (regs) => {
    localStorage.setItem(`fed_registrations_${federationId}`, JSON.stringify(regs));
    setRegistrations(regs);
  };

  useEffect(() => {
    if (!user || user.institution_type !== 'federation') { navigate('/club/dashboard'); return; }
    fetchSeasons();
    fetchTeams();
    fetchAllClubs();
    fetchMembers();
    fetchCirculars();
    fetchRegistrations();
  }, [user, navigate, fetchSeasons, fetchTeams, fetchAllClubs, fetchMembers, fetchCirculars, fetchRegistrations]);

  useEffect(() => { if (members.length > 0) fetchAllPlayers(); }, [members, fetchAllPlayers]);

  // ── Inscripción de jugadores ──
  const handleRegisterPlayer = (player) => {
    // Verificar si ya está inscrito en otra entidad
    const existing = registrations.find(r => r.playerId === player.id && r.seasonId === regSeasonId);
    if (existing && existing.clubId !== player.club_id) {
      toast.error(`${player.name} ya está inscrito en ${existing.clubName} esta temporada`);
      return;
    }
    setSelectedPlayer(player);
    setRegDialog(true);
  };

  const confirmRegistration = () => {
    if (!selectedPlayer) return;
    setRegLoading(true);
    try {
      const existing = registrations.find(r => r.playerId === selectedPlayer.id && r.seasonId === regSeasonId);
      if (existing) {
        toast.info(`${selectedPlayer.name} ya estaba inscrito en esta temporada`);
        setRegDialog(false);
        return;
      }
      const newReg = {
        id: `${selectedPlayer.id}_${regSeasonId}`,
        playerId: selectedPlayer.id,
        playerName: selectedPlayer.name,
        playerNumber: selectedPlayer.number,
        playerPosition: selectedPlayer.position,
        clubId: selectedPlayer.club_id,
        clubName: selectedPlayer.clubName,
        seasonId: regSeasonId,
        seasonName: seasons.find(s => s.id === regSeasonId)?.name || regSeasonId,
        registeredAt: new Date().toISOString(),
        status: "active",
      };
      saveRegistrations([...registrations, newReg]);
      toast.success(`${selectedPlayer.name} inscrito correctamente`);
      setRegDialog(false);
    } finally {
      setRegLoading(false);
      setSelectedPlayer(null);
    }
  };

  const revokeRegistration = (regId) => {
    if (!window.confirm("¿Revocar esta inscripción?")) return;
    saveRegistrations(registrations.filter(r => r.id !== regId));
    toast.success("Inscripción revocada");
  };

  // ── Acciones: Liga ──
  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (!activeSeason) { toast.error("No hay temporada activa"); return; }
    try {
      await axios.post(`${BACKEND_URL}/api/league/matches`, { ...matchForm, season_id: activeSeason.id });
      toast.success("Partido creado");
      setMatchDialog(false);
      setMatchForm({ round_id: "", home_team_id: "", away_team_id: "", match_date: "", venue: "", notes: "" });
      fetchMatches(activeSeason.id);
    } catch { toast.error("Error al crear partido"); }
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    try {
      const parse = (str) => str ? str.split(",").map(s => ({ name: s.trim(), minute: null })) : [];
      await axios.put(`${BACKEND_URL}/api/league/matches/${selectedMatch.id}`, {
        home_score: parseInt(resultForm.home_score),
        away_score: parseInt(resultForm.away_score),
        status: resultForm.status,
        home_scorers: parse(resultForm.home_scorers),
        away_scorers: parse(resultForm.away_scorers),
      });
      toast.success("Resultado guardado — clasificación actualizada");
      setResultDialog(false);
      fetchMatches(activeSeason.id);
      fetchStandings(activeSeason.id);
    } catch { toast.error("Error al guardar resultado"); }
  };

  const handleDeleteMatch = async (id) => {
    if (!window.confirm("¿Eliminar este partido?")) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/league/matches/${id}`);
      toast.success("Partido eliminado");
      fetchMatches(activeSeason.id);
    } catch { toast.error("Error"); }
  };

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    try {
      const linkedClub = teamForm.adivina_club_id ? allClubs.find(c => c.id === teamForm.adivina_club_id) : null;
      const payload = {
        name: teamForm.name, short_name: teamForm.short_name,
        city: teamForm.city, stadium: teamForm.stadium,
        adivina_club_id: teamForm.adivina_club_id || null,
        ...(linkedClub?.crest_url ? { logo_url: linkedClub.crest_url } : {}),
      };
      let savedId;
      if (editingTeam) {
        await axios.put(`${BACKEND_URL}/api/league/teams/${editingTeam.id}`, payload);
        savedId = editingTeam.id;
        toast.success("Equipo actualizado");
      } else {
        const r = await axios.post(`${BACKEND_URL}/api/league/teams`, payload);
        savedId = r.data.id;
        toast.success("Equipo creado");
      }
      if (logoFile && savedId && !teamForm.adivina_club_id) {
        const fd = new FormData(); fd.append("file", logoFile);
        await axios.post(`${BACKEND_URL}/api/upload/league-team-logo/${savedId}`, fd);
      }
      setTeamDialog(false); setEditingTeam(null); setLogoFile(null);
      setTeamForm({ name: "", short_name: "", city: "", stadium: "", adivina_club_id: "" });
      fetchTeams();
    } catch { toast.error("Error al guardar equipo"); }
  };

  const handleCreateRound = async (e) => {
    e.preventDefault();
    if (!activeSeason) { toast.error("No hay temporada activa"); return; }
    try {
      await axios.post(`${BACKEND_URL}/api/league/rounds`, { ...roundForm, season_id: activeSeason.id, number: parseInt(roundForm.number) });
      toast.success("Jornada creada");
      setRoundDialog(false);
      setRoundForm({ number: "", name: "", date_start: "", date_end: "" });
      fetchRounds(activeSeason.id);
    } catch { toast.error("Error al crear jornada"); }
  };

  const handleCreateNews = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/league/news`, { ...newsForm, season_id: activeSeason?.id || null });
      toast.success("Noticia publicada");
      setNewsDialog(false);
      setNewsForm({ title: "", content: "", priority: "normal" });
      if (activeSeason) fetchLeagueNews(activeSeason.id);
    } catch { toast.error("Error"); }
  };

  const handleDeleteNews = async (id) => {
    try { await axios.delete(`${BACKEND_URL}/api/league/news/${id}`); toast.success("Noticia eliminada"); if (activeSeason) fetchLeagueNews(activeSeason.id); }
    catch { toast.error("Error"); }
  };

  const handleCreateCircular = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/federation/circulars/${federationId}`, circularForm);
      toast.success("Circular enviada");
      setCircularDialog(false);
      setCircularForm({ title: "", content: "", priority: "normal" });
      fetchCirculars();
    } catch { toast.error("Error"); }
  };

  const handleDeleteCircular = async (id) => {
    try { await axios.delete(`${BACKEND_URL}/api/federation/circulars/item/${id}`); toast.success("Circular eliminada"); fetchCirculars(); }
    catch { toast.error("Error"); }
  };

  const handleAffiliate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/federation/members/${federationId}`, affiliateForm);
      toast.success("Club afiliado correctamente");
      setAffiliateDialog(false);
      setAffiliateForm({ club_id: "", sport: "football", division: "" });
      fetchMembers();
    } catch { toast.error("Error al afiliar club"); }
  };

  const handleRemoveMember = async (clubId) => {
    if (!window.confirm("¿Desafiliar este club?")) return;
    try { await axios.delete(`${BACKEND_URL}/api/federation/members/${federationId}?club_id=${clubId}`); toast.success("Club desafiliado"); fetchMembers(); }
    catch { toast.error("Error"); }
  };

  const openResultDialog = (match) => {
    setSelectedMatch(match);
    setResultForm({
      home_score: match.home_score ?? "", away_score: match.away_score ?? "",
      status: "finished",
      home_scorers: (match.home_scorers || []).map(s => s.name).join(", "),
      away_scorers: (match.away_scorers || []).map(s => s.name).join(", "),
    });
    setResultDialog(true);
  };

  const filteredMatches = filterRound === "all" ? matches : matches.filter(m => m.round_id === filterRound);
  const finishedCount = matches.filter(m => m.status === "finished").length;
  const pendingCount  = matches.filter(m => m.status === "scheduled").length;

  // Nav items
  const navItems = [
    { key: "home",             icon: Home,      label: "Inicio" },
    { key: "players",          icon: UserCheck, label: "Jugadores inscritos" },
    { key: "league",           icon: Calendar,  label: "Partidos" },
    { key: "standings",        icon: Trophy,    label: "Clasificación" },
    { key: "teams",            icon: Swords,    label: "Equipos" },
    { key: "rounds",           icon: Clock,     label: "Jornadas" },
    { key: "news",             icon: Newspaper, label: "Noticias" },
    { key: "affiliated-clubs", icon: Users,     label: "Clubes Afiliados" },
    { key: "circulars",        icon: Send,      label: "Circulares" },
    { key: "stats",            icon: BarChart3, label: "Estadísticas" },
  ];

  const handleLogout = () => { logout(); navigate("/"); };

  // ── Secciones ──
  const SectionHome = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase text-white">{user?.club_name}</h2>
        <p className="text-zinc-500 text-sm mt-1">Panel de gestión federativa</p>
      </div>
      {activeSeason && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold text-green-400">{activeSeason.name} — Temporada activa</span>
        </div>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Clubes afiliados"   value={members.length}    icon={Users}     />
        <StatCard label="Jugadores inscritos" value={registrations.filter(r => r.seasonId === (activeSeason?.id || "")).length} icon={UserCheck} color="text-green-400" />
        <StatCard label="Partidos jugados"   value={finishedCount}     icon={Check}     color="text-green-400" />
        <StatCard label="Por jugar"          value={pendingCount}      icon={Calendar}  color="text-blue-400" />
      </div>

      {matches.filter(m => m.status === "finished").length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">Últimos resultados</h3>
          <div className="space-y-2">
            {matches.filter(m => m.status === "finished").slice(-4).reverse().map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-[#121212] rounded-xl border border-white/5">
                <TeamLogo team={m.home_team} size="sm" />
                <span className="text-sm font-semibold flex-1 truncate">{m.home_team?.name}</span>
                <span className="text-lg font-black text-[#DFFF00] shrink-0">{m.home_score} — {m.away_score}</span>
                <span className="text-sm font-semibold flex-1 text-right truncate">{m.away_team?.name}</span>
                <TeamLogo team={m.away_team} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">Acciones rápidas</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Inscribir jugador",  icon: UserCheck, action: () => setActiveSection("players") },
            { label: "Nuevo partido",      icon: Calendar,  action: () => { setActiveSection("league"); setMatchDialog(true); } },
            { label: "Nueva jornada",      icon: Clock,     action: () => { setActiveSection("rounds"); setRoundDialog(true); } },
            { label: "Nuevo equipo",       icon: Swords,    action: () => { setActiveSection("teams");  setTeamDialog(true); } },
            { label: "Publicar noticia",   icon: Newspaper, action: () => { setActiveSection("news");   setNewsDialog(true); } },
            { label: "Enviar circular",    icon: Send,      action: () => { setActiveSection("circulars"); setCircularDialog(true); } },
          ].map(({ label, icon: Icon, action }) => (
            <button key={label} onClick={action}
              className="flex items-center gap-2 p-3 bg-[#121212] border border-white/5 hover:border-[#DFFF00]/20 rounded-xl text-sm text-zinc-400 hover:text-white transition-all text-left">
              <Icon className="h-4 w-4 text-[#DFFF00] shrink-0" />{label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Sección: Jugadores inscritos ──────────────────────────────────────────
  const SectionPlayers = () => {
    const seasonRegs = registrations.filter(r => r.seasonId === (regSeasonId || activeSeason?.id));
    const registeredIds = new Set(seasonRegs.map(r => r.playerId));

    const filteredPlayers = allPlayers.filter(p =>
      !playerSearch ||
      p.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
      p.clubName?.toLowerCase().includes(playerSearch.toLowerCase())
    );

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-black uppercase">Inscripción de Jugadores</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Controla qué jugador pertenece a qué club en cada temporada. Un jugador inscrito no puede jugar en otro equipo.
            </p>
          </div>
          {seasons.length > 0 && (
            <Select value={regSeasonId} onValueChange={setRegSeasonId}>
              <SelectTrigger className="w-48 bg-[#121212] border-white/10 text-sm h-9">
                <SelectValue placeholder="Temporada" />
              </SelectTrigger>
              <SelectContent className="bg-[#121212] border-white/10">
                {seasons.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Jugadores ya inscritos */}
        {seasonRegs.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">
              Inscritos en {seasons.find(s => s.id === regSeasonId)?.name || "esta temporada"} ({seasonRegs.length})
            </h3>
            <div className="space-y-2">
              {seasonRegs.map(reg => (
                <div key={reg.id} className="flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/15 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-[#DFFF00] flex items-center justify-center text-black font-black text-sm shrink-0">
                    {reg.playerNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{reg.playerName}</p>
                    <p className="text-xs text-zinc-500">{reg.playerPosition} · {reg.clubName}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/20 border text-[10px]">
                      <UserCheck className="h-3 w-3 mr-1" />Inscrito
                    </Badge>
                    <Button size="icon" variant="ghost" onClick={() => revokeRegistration(reg.id)}
                      className="text-red-400 hover:bg-red-500/10 h-7 w-7">
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Búsqueda de jugadores de clubes afiliados */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">
            Jugadores de clubes afiliados ({allPlayers.length})
          </h3>

          {members.length === 0 ? (
            <div className="text-center py-10 text-zinc-600">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Primero debes afiliar clubes para ver sus jugadores</p>
              <button onClick={() => setActiveSection("affiliated-clubs")} className="mt-2 text-xs text-[#DFFF00] underline">
                Ir a Clubes Afiliados
              </button>
            </div>
          ) : (
            <>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  value={playerSearch}
                  onChange={e => setPlayerSearch(e.target.value)}
                  placeholder="Buscar por nombre o club..."
                  className="bg-[#121212] border-white/10 pl-9 text-sm"
                />
              </div>

              {filteredPlayers.length === 0 ? (
                <p className="text-center text-zinc-600 py-8 text-sm">No se encontraron jugadores</p>
              ) : (
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                  {filteredPlayers.map(player => {
                    const isRegistered = registeredIds.has(player.id);
                    const otherReg = registrations.find(r => r.playerId === player.id && r.seasonId === regSeasonId && r.clubId !== player.club_id);
                    return (
                      <div key={player.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isRegistered
                          ? "bg-green-500/5 border-green-500/15"
                          : otherReg
                          ? "bg-red-500/5 border-red-500/15"
                          : "bg-[#121212] border-white/5 hover:border-white/10"
                      }`}>
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-black font-black text-sm shrink-0 text-zinc-400">
                          {player.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{player.name}</p>
                          <p className="text-xs text-zinc-500">{player.position} · {player.clubName}</p>
                          {otherReg && (
                            <p className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
                              <AlertCircle className="h-3 w-3" />
                              Ya inscrito en {otherReg.clubName}
                            </p>
                          )}
                        </div>
                        {isRegistered ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/20 border text-[10px] shrink-0">
                            <UserCheck className="h-3 w-3 mr-1" />Inscrito
                          </Badge>
                        ) : otherReg ? (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/20 border text-[10px] shrink-0">
                            <AlertCircle className="h-3 w-3 mr-1" />Otro club
                          </Badge>
                        ) : (
                          <Button size="sm" onClick={() => handleRegisterPlayer(player)}
                            className="bg-[#DFFF00] text-black hover:bg-white text-xs h-7 shrink-0">
                            <UserCheck className="h-3 w-3 mr-1" />Inscribir
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const SectionMatches = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-black uppercase">Partidos</h2>
        <Button onClick={() => setMatchDialog(true)} size="sm" className="bg-[#DFFF00] text-black hover:bg-white">
          <Plus className="h-4 w-4 mr-1" />Nuevo
        </Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Select value={filterRound} onValueChange={setFilterRound}>
          <SelectTrigger className="w-44 bg-[#121212] border-white/10 text-sm h-9">
            <SelectValue placeholder="Todas las jornadas" />
          </SelectTrigger>
          <SelectContent className="bg-[#121212] border-white/10">
            <SelectItem value="all">Todas las jornadas</SelectItem>
            {rounds.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-zinc-600 flex items-center">{filteredMatches.length} partido(s)</span>
      </div>
      {filteredMatches.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No hay partidos en esta jornada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMatches.map(match => {
            const s = STATUS_LABELS[match.status] || STATUS_LABELS.scheduled;
            return (
              <div key={match.id} className="p-3 sm:p-4 bg-[#121212] rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-xs text-zinc-600">{match.round?.name}</span>
                      <span className="text-xs text-zinc-700">· {formatUTC(match.match_date)}</span>
                      {match.venue && <span className="text-xs text-zinc-700">· {match.venue}</span>}
                      <Badge className={`${s.color} border text-[10px] px-1.5`}>{s.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <TeamLogo team={match.home_team} size="sm" />
                      <span className="font-semibold text-sm truncate flex-1">{match.home_team?.name}</span>
                      {match.status === "finished" ? (
                        <span className="text-xl font-black text-[#DFFF00] shrink-0">{match.home_score} — {match.away_score}</span>
                      ) : (
                        <span className="text-zinc-600 font-bold shrink-0 text-xs">VS</span>
                      )}
                      <span className="font-semibold text-sm truncate flex-1 text-right">{match.away_team?.name}</span>
                      <TeamLogo team={match.away_team} size="sm" />
                    </div>
                    {/* Goleadores */}
                    {match.status === "finished" && ((match.home_scorers?.length > 0) || (match.away_scorers?.length > 0)) && (
                      <div className="flex justify-between mt-2 text-xs text-zinc-500 gap-4">
                        <span className="truncate">{match.home_scorers?.map(s => `${s.name}${s.minute ? ` ${s.minute}'` : ""}`).join(", ")}</span>
                        <span className="truncate text-right">{match.away_scorers?.map(s => `${s.name}${s.minute ? ` ${s.minute}'` : ""}`).join(", ")}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={() => openResultDialog(match)}
                      className="bg-green-600 hover:bg-green-500 text-white text-xs h-8">
                      <Check className="h-3 w-3 mr-1" />Resultado
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteMatch(match.id)}
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10 h-8 w-8 p-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const SectionStandings = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-black uppercase">Clasificación</h2>
      {standings.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>Sin datos. Se actualiza automáticamente con los resultados.</p>
        </div>
      ) : (
        <Card className="bg-[#121212] border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["#","Equipo","PJ","G","E","P","GF","GC","DG","Pts","Forma"].map((h, i) => (
                    <th key={h} className={`py-3 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-600 ${i === 1 ? "text-left pl-4" : "text-center"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standings.map(row => {
                  const form = calcForm(row.team_id, matches);
                  return (
                    <tr key={row.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="py-3 pl-4 text-zinc-500 font-mono text-xs">{row.position}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <TeamLogo team={row.team} size="sm" />
                          <span className="font-semibold text-sm whitespace-nowrap">{row.team?.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-2 text-zinc-400 text-xs">{row.played}</td>
                      <td className="text-center py-3 px-2 text-green-400 font-semibold text-xs">{row.won}</td>
                      <td className="text-center py-3 px-2 text-zinc-400 text-xs">{row.drawn}</td>
                      <td className="text-center py-3 px-2 text-red-400 font-semibold text-xs">{row.lost}</td>
                      <td className="text-center py-3 px-2 text-zinc-400 text-xs">{row.goals_for}</td>
                      <td className="text-center py-3 px-2 text-zinc-400 text-xs">{row.goals_against}</td>
                      <td className="text-center py-3 px-2 text-xs text-zinc-400">
                        {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                      </td>
                      <td className="text-center py-3 px-2 pr-4 font-black text-lg text-[#DFFF00]">{row.points}</td>
                      <td className="text-center py-3 px-2">
                        <div className="flex gap-1 justify-center">
                          {form.length === 0
                            ? <span className="text-zinc-700 text-[10px]">—</span>
                            : form.map((r, i) => <FormBadge key={i} result={r} />)
                          }
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );

  const SectionTeams = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-black uppercase">Equipos ({teams.length})</h2>
        <Button onClick={() => { setEditingTeam(null); setLogoFile(null); setTeamForm({ name: "", short_name: "", city: "", stadium: "", adivina_club_id: "" }); setTeamDialog(true); }}
          size="sm" className="bg-[#DFFF00] text-black hover:bg-white">
          <Plus className="h-4 w-4 mr-1" />Nuevo equipo
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {teams.map(team => (
          <div key={team.id} className="flex items-center gap-3 p-3 sm:p-4 bg-[#121212] rounded-xl border border-white/5 hover:border-white/10 transition-all">
            <TeamLogo team={team} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{team.name}</p>
              <p className="text-xs text-zinc-500">{team.city || "—"}</p>
              {team.adivina_club_id && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Link className="h-3 w-3 text-[#DFFF00]" />
                  <p className="text-xs text-[#DFFF00]/70">{allClubs.find(c => c.id === team.adivina_club_id)?.name || team.adivina_club_id}</p>
                </div>
              )}
            </div>
            <Button size="icon" variant="ghost" className="text-zinc-400 hover:text-white h-8 w-8"
              onClick={() => { setEditingTeam(team); setLogoFile(null); setTeamForm({ name: team.name, short_name: team.short_name || "", city: team.city || "", stadium: team.stadium || "", adivina_club_id: team.adivina_club_id || "" }); setTeamDialog(true); }}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {teams.length === 0 && (
          <div className="col-span-full text-center py-16 text-zinc-600">
            <Swords className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No hay equipos creados aún</p>
          </div>
        )}
      </div>
    </div>
  );

  const SectionRounds = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-black uppercase">Jornadas</h2>
        <Button onClick={() => setRoundDialog(true)} size="sm" className="bg-[#DFFF00] text-black hover:bg-white">
          <Plus className="h-4 w-4 mr-1" />Nueva jornada
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rounds.map(round => {
          const roundMatches = matches.filter(m => m.round_id === round.id);
          const done = roundMatches.filter(m => m.status === "finished").length;
          return (
            <div key={round.id} className="p-4 bg-[#121212] rounded-xl border border-white/5">
              <div className="flex items-start justify-between mb-2">
                <span className="font-bold">{round.name}</span>
                <Badge className={round.status === "finished" ? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30 border" : round.status === "ongoing" ? "bg-green-500/20 text-green-400 border-green-500/30 border" : "bg-blue-500/20 text-blue-400 border-blue-500/30 border"}>
                  {round.status === "finished" ? "Finalizada" : round.status === "ongoing" ? "En curso" : "Próxima"}
                </Badge>
              </div>
              {round.date_start && (
                <p className="text-xs text-zinc-500">
                  {new Date(round.date_start).toLocaleDateString("es-ES")}
                  {round.date_end && ` — ${new Date(round.date_end).toLocaleDateString("es-ES")}`}
                </p>
              )}
              <p className="text-xs text-zinc-600 mt-2">{done}/{roundMatches.length} partido(s) jugado(s)</p>
              <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#DFFF00] rounded-full transition-all"
                  style={{ width: roundMatches.length ? `${(done / roundMatches.length) * 100}%` : "0%" }} />
              </div>
            </div>
          );
        })}
        {rounds.length === 0 && (
          <div className="col-span-full text-center py-16 text-zinc-600">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No hay jornadas creadas aún</p>
          </div>
        )}
      </div>
    </div>
  );

  const SectionNews = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-black uppercase">Noticias de Liga</h2>
        <Button onClick={() => setNewsDialog(true)} size="sm" className="bg-[#DFFF00] text-black hover:bg-white">
          <Plus className="h-4 w-4 mr-1" />Nueva noticia
        </Button>
      </div>
      <div className="space-y-3">
        {leagueNews.map(item => {
          const p = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.normal;
          return (
            <div key={item.id} className="p-4 bg-[#121212] rounded-xl border border-white/5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-[#DFFF00]">{item.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${p.color}`}>{p.label}</span>
                  </div>
                  {item.content && <p className="text-zinc-400 text-sm">{item.content}</p>}
                  <p className="text-xs text-zinc-600 mt-2">{new Date(item.created_at).toLocaleDateString("es-ES")}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => handleDeleteNews(item.id)}
                  className="text-red-400 hover:bg-red-500/10 h-8 w-8 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
        {leagueNews.length === 0 && (
          <div className="text-center py-16 text-zinc-600">
            <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No hay noticias publicadas</p>
          </div>
        )}
      </div>
    </div>
  );

  const SectionAffiliatedClubs = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-black uppercase">Clubes Afiliados ({members.length})</h2>
        <Button onClick={() => setAffiliateDialog(true)} size="sm" className="bg-[#DFFF00] text-black hover:bg-white">
          <Plus className="h-4 w-4 mr-1" />Afiliar club
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {members.map(m => (
          <div key={m.id} className="flex items-center gap-3 p-3 sm:p-4 bg-[#121212] rounded-xl border border-white/5 hover:border-white/10">
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              {m.club?.crest_url ? (
                <img src={m.club.crest_url} alt="" className="max-w-full max-h-full w-auto h-auto object-contain"
                  style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }} />
              ) : (
                <div className="w-10 h-10 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 font-bold text-xs">
                  {m.club?.name?.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{m.club?.name}</p>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                <span className="text-xs text-zinc-500">{SPORTS_LABELS[m.sport] || m.sport}</span>
                {m.division && <span className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-zinc-500">{m.division}</span>}
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => handleRemoveMember(m.club_id)}
              className="text-red-400 hover:bg-red-500/10 h-8 w-8 shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {members.length === 0 && (
          <div className="col-span-full text-center py-16 text-zinc-600">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No hay clubes afiliados aún</p>
          </div>
        )}
      </div>
    </div>
  );

  const SectionCirculars = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-black uppercase">Circulares</h2>
        <Button onClick={() => setCircularDialog(true)} size="sm" className="bg-[#DFFF00] text-black hover:bg-white">
          <Plus className="h-4 w-4 mr-1" />Nueva circular
        </Button>
      </div>
      <div className="space-y-3">
        {circulars.map(c => {
          const p = PRIORITY_CONFIG[c.priority] || PRIORITY_CONFIG.normal;
          return (
            <div key={c.id} className="p-4 bg-[#121212] rounded-xl border border-white/5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <FileText className="h-4 w-4 text-[#DFFF00] shrink-0" />
                    <h3 className="font-bold">{c.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${p.color}`}>{p.label}</span>
                  </div>
                  {c.content && <p className="text-zinc-400 text-sm mt-1">{c.content}</p>}
                  <p className="text-xs text-zinc-600 mt-2">{new Date(c.created_at).toLocaleDateString("es-ES")}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => handleDeleteCircular(c.id)}
                  className="text-red-400 hover:bg-red-500/10 h-8 w-8 shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
        {circulars.length === 0 && (
          <div className="text-center py-16 text-zinc-600">
            <Send className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>No hay circulares enviadas</p>
          </div>
        )}
      </div>
    </div>
  );

  const SectionStats = () => {
    const topScorers = [];
    matches.filter(m => m.status === "finished").forEach(m => {
      [...(m.home_scorers || []), ...(m.away_scorers || [])].forEach(s => {
        if (!s.name) return;
        const found = topScorers.find(t => t.name === s.name);
        if (found) found.goals++;
        else topScorers.push({ name: s.name, goals: 1 });
      });
    });
    topScorers.sort((a, b) => b.goals - a.goals);

    const totalGoals = matches.reduce((a, m) => a + (m.home_score || 0) + (m.away_score || 0), 0);
    const avgGoals = finishedCount ? (totalGoals / finishedCount).toFixed(1) : "0.0";

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-black uppercase">Estadísticas</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Partidos jugados" value={finishedCount} icon={Calendar} />
          <StatCard label="Goles totales" value={totalGoals} icon={Trophy} />
          <StatCard label="Media goles/partido" value={avgGoals} icon={TrendingUp} color="text-blue-400" sub="por partido" />
          <StatCard label="Equipos" value={teams.length} icon={Swords} color="text-purple-400" />
        </div>

        {topScorers.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">Máximos goleadores</h3>
            <div className="space-y-2">
              {topScorers.slice(0, 10).map((s, i) => (
                <div key={s.name} className="flex items-center gap-3 p-3 bg-[#121212] rounded-xl border border-white/5">
                  <span className="text-xs font-black text-zinc-600 w-6 text-center">{i + 1}</span>
                  {i === 0 && <Star className="h-3 w-3 text-[#DFFF00] shrink-0" />}
                  <span className="flex-1 font-medium text-sm">{s.name}</span>
                  <span className="text-[#DFFF00] font-black">{s.goals}</span>
                  <span className="text-xs text-zinc-600">gol{s.goals !== 1 ? "es" : ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {standings.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">Rendimiento ofensivo / defensivo</h3>
            <div className="space-y-2">
              {standings.map(row => {
                const form = calcForm(row.team_id, matches);
                const gpg  = row.played ? (row.goals_for / row.played).toFixed(1) : "0.0";
                const gcpg = row.played ? (row.goals_against / row.played).toFixed(1) : "0.0";
                const pct  = row.played ? Math.round((row.won / row.played) * 100) : 0;
                return (
                  <div key={row.id} className="flex items-center gap-3 p-3 bg-[#121212] rounded-xl border border-white/5">
                    <TeamLogo team={row.team} size="sm" />
                    <span className="flex-1 font-medium text-sm truncate">{row.team?.name}</span>
                    <div className="flex gap-2 text-xs text-zinc-500 shrink-0">
                      {form.map((r, i) => <FormBadge key={i} result={r} />)}
                    </div>
                    <div className="flex gap-4 shrink-0 text-xs">
                      <div className="text-center">
                        <p className="font-black text-green-400 text-sm">{gpg}</p>
                        <p className="text-zinc-600">GF/PJ</p>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-red-400 text-sm">{gcpg}</p>
                        <p className="text-zinc-600">GC/PJ</p>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-[#DFFF00] text-sm">{pct}%</p>
                        <p className="text-zinc-600">%V</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSection = () => {
    switch (activeSection) {
      case "home":             return <SectionHome />;
      case "players":          return <SectionPlayers />;
      case "league":           return <SectionMatches />;
      case "standings":        return <SectionStandings />;
      case "teams":            return <SectionTeams />;
      case "rounds":           return <SectionRounds />;
      case "news":             return <SectionNews />;
      case "affiliated-clubs": return <SectionAffiliatedClubs />;
      case "circulars":        return <SectionCirculars />;
      case "stats":            return <SectionStats />;
      default:                 return <SectionHome />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <header className="border-b border-white/10 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#050505] border-white/10 w-64 p-0">
                <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                <div className="p-6 border-b border-white/10">
                  <img src="https://customer-assets.emergentagent.com/job_adivina-portal/artifacts/rexq8hh7_A56B5578-48F3-41C0-A247-75CAB5930CA5.png" alt="ADIVINA" className="h-10" />
                  <span className="mt-3 inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-green-500/10 text-green-400">🛡️ Federación</span>
                </div>
                <nav className="p-4">
                  {navItems.map(({ key, icon: Icon, label }) => (
                    <Button key={key}
                      onClick={() => { setActiveSection(key); setMobileMenuOpen(false); }}
                      variant="ghost"
                      className={`w-full justify-start mb-2 text-white hover:bg-white/5 ${activeSection === key ? "bg-white/5 text-[#DFFF00] border-r-2 border-[#DFFF00]" : ""}`}>
                      <Icon className="mr-3 h-5 w-5" />{label}
                    </Button>
                  ))}
                  <div className="mt-8 pt-4 border-t border-white/10">
                    <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300">
                      <LogOut className="mr-3 h-5 w-5" />Cerrar Sesión
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            <img src="https://customer-assets.emergentagent.com/job_adivina-portal/artifacts/rexq8hh7_A56B5578-48F3-41C0-A247-75CAB5930CA5.png" alt="ADIVINA" className="h-10" />
            <div className="border-l border-white/20 pl-4 hidden md:block">
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Portal Federativo</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold">{user?.club_name}</p>
              <p className="text-xs text-green-400">🛡️ Federación</p>
            </div>
            {user?.crest_url && (
              <div className="h-12 w-12 flex items-center justify-center">
                <img src={user.crest_url} alt="Escudo"
                  className="max-h-12 max-w-12 w-auto h-auto object-contain"
                  style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.15))" }} />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          {renderSection()}
        </div>
      </main>

      {/* ── Dialogs ── */}

      {/* Confirmar inscripción */}
      <Dialog open={regDialog} onOpenChange={setRegDialog}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[#DFFF00]" />
              Confirmar inscripción
            </DialogTitle>
          </DialogHeader>
          {selectedPlayer && (
            <div className="space-y-4">
              <div className="p-4 bg-[#1a1a1a] rounded-lg border border-white/10">
                <p className="font-bold text-lg">{selectedPlayer.name}</p>
                <p className="text-sm text-zinc-400">{selectedPlayer.position} · #{selectedPlayer.number}</p>
                <p className="text-sm text-zinc-400">Club: {selectedPlayer.clubName}</p>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Temporada</Label>
                <Select value={regSeasonId} onValueChange={setRegSeasonId}>
                  <SelectTrigger className="mt-1 bg-[#1a1a1a] border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    {seasons.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-zinc-500 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
                Al inscribir este jugador, quedará vinculado a <strong>{selectedPlayer.clubName}</strong> para esta temporada y no podrá jugar en otro equipo.
              </p>
              <Button onClick={confirmRegistration} disabled={regLoading} className="w-full bg-[#DFFF00] text-black hover:bg-white">
                {regLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <UserCheck className="h-4 w-4 mr-2" />}
                Confirmar inscripción
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Nuevo partido */}
      <Dialog open={matchDialog} onOpenChange={setMatchDialog}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-lg mx-4 max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nuevo Partido</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateMatch} className="space-y-4">
            <div>
              <Label className="text-xs text-zinc-400">Jornada *</Label>
              <Select value={matchForm.round_id} onValueChange={v => setMatchForm(p => ({ ...p, round_id: v }))}>
                <SelectTrigger className="mt-1 bg-[#1a1a1a] border-white/10"><SelectValue placeholder="Selecciona jornada" /></SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10">
                  {rounds.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-zinc-400">Local *</Label>
                <Select value={matchForm.home_team_id} onValueChange={v => setMatchForm(p => ({ ...p, home_team_id: v }))}>
                  <SelectTrigger className="mt-1 bg-[#1a1a1a] border-white/10"><SelectValue placeholder="Local" /></SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Visitante *</Label>
                <Select value={matchForm.away_team_id} onValueChange={v => setMatchForm(p => ({ ...p, away_team_id: v }))}>
                  <SelectTrigger className="mt-1 bg-[#1a1a1a] border-white/10"><SelectValue placeholder="Visitante" /></SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    {teams.filter(t => t.id !== matchForm.home_team_id).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-zinc-400">Fecha y hora</Label>
                <Input type="datetime-local" value={matchForm.match_date} onChange={e => setMatchForm(p => ({ ...p, match_date: e.target.value }))} className="mt-1 bg-[#1a1a1a] border-white/10" />
              </div>
              <div>
                <Label className="text-xs text-zinc-400">Estadio</Label>
                <Input value={matchForm.venue} onChange={e => setMatchForm(p => ({ ...p, venue: e.target.value }))} placeholder="Estadio…" className="mt-1 bg-[#1a1a1a] border-white/10" />
              </div>
            </div>
            <p className="text-xs text-zinc-600">La hora se guarda en UTC.</p>
            <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white">Crear Partido</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resultado */}
      <Dialog open={resultDialog} onOpenChange={setResultDialog}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-sm mx-4 max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resultado</DialogTitle>
            {selectedMatch && <p className="text-xs text-zinc-500 mt-0.5">{selectedMatch.home_team?.name} vs {selectedMatch.away_team?.name}</p>}
          </DialogHeader>
          <form onSubmit={handleSaveResult} className="space-y-4">
            <div className="grid grid-cols-3 gap-2 items-end">
              <div>
                <Label className="text-[10px] text-zinc-500 block mb-1">{selectedMatch?.home_team?.name}</Label>
                <Input type="number" min="0" value={resultForm.home_score} onChange={e => setResultForm(p => ({ ...p, home_score: e.target.value }))} className="bg-[#1a1a1a] border-white/10 text-center text-2xl font-black h-14" />
              </div>
              <div className="text-center text-zinc-600 font-bold pb-3">—</div>
              <div>
                <Label className="text-[10px] text-zinc-500 block mb-1">{selectedMatch?.away_team?.name}</Label>
                <Input type="number" min="0" value={resultForm.away_score} onChange={e => setResultForm(p => ({ ...p, away_score: e.target.value }))} className="bg-[#1a1a1a] border-white/10 text-center text-2xl font-black h-14" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-zinc-400">Estado</Label>
              <Select value={resultForm.status} onValueChange={v => setResultForm(p => ({ ...p, status: v }))}>
                <SelectTrigger className="mt-1 bg-[#1a1a1a] border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10">
                  <SelectItem value="live">En Juego</SelectItem>
                  <SelectItem value="finished">Finalizado</SelectItem>
                  <SelectItem value="postponed">Aplazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-zinc-400">Goleadores locales (nombre, min opcional — separar con coma)</Label>
              <Input value={resultForm.home_scorers} onChange={e => setResultForm(p => ({ ...p, home_scorers: e.target.value }))} placeholder="Nombre 45, Nombre 78" className="mt-1 bg-[#1a1a1a] border-white/10" />
            </div>
            <div>
              <Label className="text-xs text-zinc-400">Goleadores visitantes</Label>
              <Input value={resultForm.away_scorers} onChange={e => setResultForm(p => ({ ...p, away_scorers: e.target.value }))} placeholder="Nombre 12" className="mt-1 bg-[#1a1a1a] border-white/10" />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white">Guardar Resultado</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Equipo */}
      <Dialog open={teamDialog} onOpenChange={setTeamDialog}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-md mx-4 max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingTeam ? "Editar Equipo" : "Nuevo Equipo"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveTeam} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-zinc-400">Nombre *</Label><Input required value={teamForm.name} onChange={e => setTeamForm(p => ({ ...p, name: e.target.value }))} className="mt-1 bg-[#1a1a1a] border-white/10" /></div>
              <div><Label className="text-xs text-zinc-400">Abreviatura</Label><Input maxLength={4} value={teamForm.short_name} onChange={e => setTeamForm(p => ({ ...p, short_name: e.target.value.toUpperCase() }))} className="mt-1 bg-[#1a1a1a] border-white/10" placeholder="RAC" /></div>
              <div><Label className="text-xs text-zinc-400">Ciudad</Label><Input value={teamForm.city} onChange={e => setTeamForm(p => ({ ...p, city: e.target.value }))} className="mt-1 bg-[#1a1a1a] border-white/10" /></div>
              <div><Label className="text-xs text-zinc-400">Estadio</Label><Input value={teamForm.stadium} onChange={e => setTeamForm(p => ({ ...p, stadium: e.target.value }))} className="mt-1 bg-[#1a1a1a] border-white/10" /></div>
            </div>
            <div>
              <Label className="text-xs text-zinc-400 flex items-center gap-1"><Link className="h-3 w-3 text-[#DFFF00]" />Vincular a club Adivina</Label>
              <Select value={teamForm.adivina_club_id || "none"} onValueChange={v => { setTeamForm(p => ({ ...p, adivina_club_id: v === "none" ? "" : v })); setLogoFile(null); }}>
                <SelectTrigger className="mt-1 bg-[#1a1a1a] border-white/10"><SelectValue placeholder="Sin vinculación" /></SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10">
                  <SelectItem value="none"><span className="text-zinc-500">Sin vinculación</span></SelectItem>
                  {allClubs.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        {c.crest_url && <img src={c.crest_url} alt="" className="w-4 h-4 object-contain" />}
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!teamForm.adivina_club_id && (
              <div>
                <Label className="text-xs text-zinc-400 flex items-center gap-1"><Image className="h-3 w-3 text-[#DFFF00]" />Logo personalizado</Label>
                <Input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0] || null)} className="mt-1 bg-[#1a1a1a] border-white/10" />
              </div>
            )}
            <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white">{editingTeam ? "Actualizar" : "Crear"} Equipo</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Jornada */}
      <Dialog open={roundDialog} onOpenChange={setRoundDialog}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-sm mx-4">
          <DialogHeader><DialogTitle>Nueva Jornada</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateRound} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-zinc-400">Número *</Label><Input required type="number" value={roundForm.number} onChange={e => setRoundForm(p => ({ ...p, number: e.target.value }))} className="mt-1 bg-[#1a1a1a] border-white/10" /></div>
              <div><Label className="text-xs text-zinc-400">Nombre</Label><Input value={roundForm.name} onChange={e => setRoundForm(p => ({ ...p, name: e.target.value }))} placeholder="Jornada 1" className="mt-1 bg-[#1a1a1a] border-white/10" /></div>
              <div><Label className="text-xs text-zinc-400">Fecha inicio</Label><Input type="date" value={roundForm.date_start} onChange={e => setRoundForm(p => ({ ...p, date_start: e.target.value }))} className="mt-1 bg-[#1a1a1a] border-white/10" /></div>
              <div><Label className="text-xs text-zinc-400">Fecha fin</Label><Input type="date" value={roundForm.date_end} onChange={e => setRoundForm(p => ({ ...p, date_end: e.target.value }))} className="mt-1 bg-[#1a1a1a] border-white/10" /></div>
            </div>
            <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white">Crear Jornada</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Noticia */}
      <Dialog open={newsDialog} onOpenChange={setNewsDialog}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-sm mx-4">
          <DialogHeader><DialogTitle>Nueva Noticia de Liga</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateNews} className="space-y-3">
            <div><Label className="text-xs text-zinc-400">Título *</Label><Input required value={newsForm.title} onChange={e => setNewsForm(p => ({ ...p, title: e.target.value }))} className="mt-1 bg-[#1a1a1a] border-white/10" /></div>
            <div><Label className="text-xs text-zinc-400">Contenido</Label><Textarea value={newsForm.content} onChange={e => setNewsForm(p => ({ ...p, content: e.target.value }))} className="mt-1 bg-[#1a1a1a] border-white/10 min-h-[80px]" /></div>
            <div>
              <Label className="text-xs text-zinc-400">Prioridad</Label>
              <Select value={newsForm.priority} onValueChange={v => setNewsForm(p => ({ ...p, priority: v }))}>
                <SelectTrigger className="mt-1 bg-[#1a1a1a] border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10"><SelectItem value="normal">Normal</SelectItem><SelectItem value="high">Urgente</SelectItem></SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white">Publicar</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Circular */}
      <Dialog open={circularDialog} onOpenChange={setCircularDialog}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-sm mx-4">
          <DialogHeader><DialogTitle>Nueva Circular</DialogTitle><p className="text-xs text-zinc-500 mt-0.5">Se enviará a todos los clubes afiliados</p></DialogHeader>
          <form onSubmit={handleCreateCircular} className="space-y-3">
            <div><Label className="text-xs text-zinc-400">Título *</Label><Input required value={circularForm.title} onChange={e => setCircularForm(p => ({ ...p, title: e.target.value }))} className="mt-1 bg-[#1a1a1a] border-white/10" /></div>
            <div><Label className="text-xs text-zinc-400">Contenido</Label><Textarea value={circularForm.content} onChange={e => setCircularForm(p => ({ ...p, content: e.target.value }))} className="mt-1 bg-[#1a1a1a] border-white/10 min-h-[100px]" /></div>
            <div>
              <Label className="text-xs text-zinc-400">Prioridad</Label>
              <Select value={circularForm.priority} onValueChange={v => setCircularForm(p => ({ ...p, priority: v }))}>
                <SelectTrigger className="mt-1 bg-[#1a1a1a] border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10">
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-[#DFFF00] text-black hover:bg-white"><Send className="h-4 w-4 mr-2" />Enviar Circular</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Afiliar club */}
      <Dialog open={affiliateDialog} onOpenChange={setAffiliateDialog}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-sm mx-4">
          <DialogHeader><DialogTitle>Afiliar Club</DialogTitle></DialogHeader>
          <form onSubmit={handleAffiliate} className="space-y-3">
            <div>
              <Label className="text-xs text-zinc-400">Club *</Label>
              <Select value={affiliateForm.club_id} onValueChange={v => setAffiliateForm(p => ({ ...p, club_id: v }))}>
                <SelectTrigger className="mt-1 bg-[#1a1a1a] border-white/10"><SelectValue placeholder="Selecciona un club" /></SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10">
                  {allClubs.filter(c => !members.find(m => m.club_id === c.id)).map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        {c.crest_url && <img src={c.crest_url} alt="" className="w-4 h-4 object-contain" />}
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-zinc-400">Deporte</Label>
              <Select value={affiliateForm.sport} onValueChange={v => setAffiliateForm(p => ({ ...p, sport: v }))}>
                <SelectTrigger className="mt-1 bg-[#1a1a1a] border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10">
                  {Object.entries(SPORTS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs text-zinc-400">División / Categoría</Label><Input value={affiliateForm.division} onChange={e => setAffiliateForm(p => ({ ...p, division: e.target.value }))} placeholder="Primera División, etc." className="mt-1 bg-[#1a1a1a] border-white/10" /></div>
            <Button type="submit" disabled={!affiliateForm.club_id} className="w-full bg-[#DFFF00] text-black hover:bg-white disabled:opacity-40">Afiliar Club</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FederationPortal;
