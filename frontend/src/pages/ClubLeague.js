import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/App";
import ClubLayout from "@/components/ClubLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Calendar, Newspaper, Clock, Star, TrendingUp, AlertTriangle, Layers } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const STATUS_CONFIG = {
  scheduled: { label: "Programado", color: "bg-blue-500/20 text-blue-400" },
  live: { label: "En Juego", color: "bg-green-500/20 text-green-400" },
  finished: { label: "Finalizado", color: "bg-zinc-700/50 text-zinc-400" },
  postponed: { label: "Aplazado", color: "bg-yellow-500/20 text-yellow-400" },
  overdue: { label: "No jugado", color: "bg-red-500/20 text-red-400" },
};

// Detectar partido cuya fecha pasó sin resultado
const isMatchOverdue = (match) => {
  if (!match.match_date || match.status === "finished" || match.status === "postponed") return false;
  return new Date(match.match_date) < new Date();
};
const getEffectiveStatus = (match) => isMatchOverdue(match) ? "overdue" : match.status;

// ── Logo ───────────────────────────────────────────────────────────────────
const TeamLogo = ({ team, size = "md" }) => {
  const sz = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const initials = (team?.short_name || team?.name || "?").substring(0, 2).toUpperCase();
  if (team?.logo_url) {
    return (
      <div className={`${sz} flex items-center justify-center flex-shrink-0`}>
        <img src={team.logo_url} alt={team?.name || ""}
          className="max-w-full max-h-full w-auto h-auto object-contain"
          style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }} />
      </div>
    );
  }
  return (
    <div className={`${sz} rounded-md bg-white/5 border border-white/10 flex items-center justify-center font-bold text-zinc-400 flex-shrink-0 text-[10px]`}>
      {initials}
    </div>
  );
};

// ── Forma ──────────────────────────────────────────────────────────────────
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

// ── Tarjeta de partido ─────────────────────────────────────────────────────
const MatchCard = ({ match, myTeamId, grupos = [], rounds = [] }) => {
  const effectiveStatus = getEffectiveStatus(match);
  const isMyMatch = match.home_team_id === myTeamId || match.away_team_id === myTeamId;
  const s = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.scheduled;
  const isFinished = match.status === "finished";
  const overdue = effectiveStatus === "overdue";
  const [expanded, setExpanded] = useState(false);

  const hasScorers = isFinished && ((match.home_scorers?.length > 0) || (match.away_scorers?.length > 0));

  // Info de grupo/liguilla desde la jornada
  const round = rounds.find(r => r.id === match.round_id);
  const grupo = round?.grupo_id ? grupos.find(g => g.id === round.grupo_id) : null;
  const esLiguilla = round?.es_liguilla || false;

  const formatMatchDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC",
    });
  };

  return (
    <div
      className={`p-3 sm:p-4 rounded-xl border transition-all ${overdue
          ? "bg-red-500/5 border-red-500/20"
          : isMyMatch
            ? "bg-[#DFFF00]/5 border-[#DFFF00]/20 hover:border-[#DFFF00]/40"
            : "bg-[#121212] border-white/5 hover:border-white/10"
        } ${hasScorers ? "cursor-pointer" : ""}`}
      onClick={() => hasScorers && setExpanded(e => !e)}
    >
      {/* Cabecera */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {isMyMatch && !overdue && (
          <span className="flex items-center gap-1 text-xs text-[#DFFF00] font-medium">
            <Star className="h-3 w-3 fill-[#DFFF00]" />Tu partido
          </span>
        )}
        <span className="text-xs text-zinc-500">{match.round?.name}</span>
        {esLiguilla && (
          <span className="text-[10px] bg-[#DFFF00]/15 text-[#DFFF00] font-bold px-1.5 py-0.5 rounded">🏆 Liguilla</span>
        )}
        {grupo && !esLiguilla && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${grupo.region === "insular" ? "bg-blue-500/15 text-blue-400" : "bg-amber-500/15 text-amber-400"
            }`}>{grupo.nombre}</span>
        )}
        {match.match_date && (
          <span className={`text-xs ${overdue ? "text-red-400/70" : "text-zinc-600"}`}>
            · {formatMatchDate(match.match_date)}
          </span>
        )}
        {match.venue && <span className="text-xs text-zinc-700">· {match.venue}</span>}
        <Badge className={`${s.color} border-transparent text-xs ml-auto`}>{s.label}</Badge>
      </div>

      {/* Equipos + resultado */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <TeamLogo team={match.home_team} />
          <span className={`text-xs font-semibold text-center leading-tight line-clamp-2 max-w-[80px] sm:max-w-none ${match.home_team_id === myTeamId ? "text-[#DFFF00]" : overdue ? "text-zinc-500" : "text-white"
            }`}>
            {match.home_team?.name}
          </span>
        </div>

        <div className="flex flex-col items-center shrink-0 px-2">
          {isFinished ? (
            <span className="text-xl sm:text-2xl font-black tabular-nums whitespace-nowrap">
              {match.home_score}
              <span className="text-zinc-500 mx-1 font-normal">-</span>
              {match.away_score}
            </span>
          ) : (
            <span className={`text-sm font-bold ${overdue ? "text-red-400/50" : "text-zinc-600"}`}>
              {overdue ? "—" : "VS"}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <TeamLogo team={match.away_team} />
          <span className={`text-xs font-semibold text-center leading-tight line-clamp-2 max-w-[80px] sm:max-w-none ${match.away_team_id === myTeamId ? "text-[#DFFF00]" : overdue ? "text-zinc-500" : "text-white"
            }`}>
            {match.away_team?.name}
          </span>
        </div>
      </div>

      {/* Goleadores expandibles */}
      {expanded && hasScorers && (
        <div className="mt-3 pt-3 border-t border-white/5 flex justify-between gap-4 text-xs text-zinc-500">
          <div>
            {match.home_scorers?.map((s, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="text-[#DFFF00]">⚽</span>
                <span>{s.name}{s.minute ? ` ${s.minute}'` : ""}</span>
              </div>
            ))}
          </div>
          <div className="text-right">
            {match.away_scorers?.map((s, i) => (
              <div key={i} className="flex items-center gap-1 justify-end">
                <span>{s.name}{s.minute ? ` ${s.minute}'` : ""}</span>
                <span className="text-[#DFFF00]">⚽</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {hasScorers && !expanded && (
        <p className="text-[10px] text-zinc-600 mt-2 text-center">Toca para ver goleadores</p>
      )}

      {/* Aviso partido vencido */}
      {overdue && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-red-400/70">
          <AlertTriangle className="h-3 w-3" />
          Fecha pasada — resultado pendiente de registrar
        </div>
      )}
    </div>
  );
};

// ── Tabla de clasificación ─────────────────────────────────────────────────
const StandingsTable = ({ standings, matches, myTeamId, highlight3 = false }) => (
  <Card className="bg-[#121212] border-white/10 overflow-hidden">
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-zinc-500 text-xs uppercase">
              <th className="text-left py-3 pl-4 w-8">#</th>
              <th className="text-left py-3">Equipo</th>
              <th className="text-center py-3 px-2">PJ</th>
              <th className="text-center py-3 px-2 text-green-400">G</th>
              <th className="text-center py-3 px-2 hidden sm:table-cell">E</th>
              <th className="text-center py-3 px-2 hidden sm:table-cell text-red-400">P</th>
              <th className="text-center py-3 px-2 hidden md:table-cell">GF</th>
              <th className="text-center py-3 px-2 hidden md:table-cell">GC</th>
              <th className="text-center py-3 px-2">DG</th>
              <th className="text-center py-3 pr-4 font-bold text-[#DFFF00]">Pts</th>
              <th className="text-center py-3 pr-4 hidden sm:table-cell">Forma</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, idx) => {
              const isMe = row.team_id === myTeamId;
              const form = calcForm(row.team_id, matches);
              return (
                <tr key={row.team_id || row.id} className={`border-b border-white/5 transition-colors ${isMe ? "bg-[#DFFF00]/10 hover:bg-[#DFFF00]/15" : "hover:bg-white/3"
                  }`}>
                  <td className="py-3 pl-4 text-zinc-500 font-mono text-xs">
                    {highlight3 && idx < 3
                      ? <span style={{ color: ["#DFFF00", "#aaa", "#cd7f32"][idx] }}>{idx + 1}</span>
                      : idx + 1
                    }
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <TeamLogo team={row.team} size="sm" />
                      <span className={`font-medium text-sm ${isMe ? "text-[#DFFF00]" : ""}`}>{row.team?.name}</span>
                      {isMe && <Star className="h-3 w-3 text-[#DFFF00] fill-[#DFFF00] flex-shrink-0" />}
                      {highlight3 && idx < 3 && <span className="text-[9px] text-[#DFFF00] font-bold hidden sm:inline">→ Liguilla</span>}
                    </div>
                  </td>
                  <td className="text-center py-3 px-2 text-zinc-400 text-xs">{row.played}</td>
                  <td className="text-center py-3 px-2 text-green-400 font-semibold text-xs">{row.won}</td>
                  <td className="text-center py-3 px-2 text-zinc-400 hidden sm:table-cell text-xs">{row.drawn}</td>
                  <td className="text-center py-3 px-2 text-red-400 font-semibold hidden sm:table-cell text-xs">{row.lost}</td>
                  <td className="text-center py-3 px-2 text-zinc-500 hidden md:table-cell text-xs">{row.goals_for}</td>
                  <td className="text-center py-3 px-2 text-zinc-500 hidden md:table-cell text-xs">{row.goals_against}</td>
                  <td className="text-center py-3 px-2 text-xs text-zinc-400">
                    {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                  </td>
                  <td className="text-center py-3 pr-4 font-black text-lg text-[#DFFF00]">{row.points}</td>
                  <td className="text-center py-3 pr-4 hidden sm:table-cell">
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
    </CardContent>
  </Card>
);

// ── Lógica para jornada por defecto ───────────────────────────────────────
const getDefaultRound = (rounds, matches) => {
  if (!rounds.length) return "all";
  const roundsWithFinished = new Set(matches.filter(m => m.status === "finished").map(m => m.round_id));
  if (roundsWithFinished.size > 0) {
    const candidates = rounds.filter(r => roundsWithFinished.has(r.id));
    candidates.sort((a, b) => b.number - a.number);
    return candidates[0].id;
  }
  const roundsWithScheduled = new Set(matches.filter(m => m.status === "scheduled").map(m => m.round_id));
  if (roundsWithScheduled.size > 0) {
    const candidates = rounds.filter(r => roundsWithScheduled.has(r.id));
    candidates.sort((a, b) => a.number - b.number);
    return candidates[0].id;
  }
  return rounds[0]?.id || "all";
};

// ── ClubLeague ─────────────────────────────────────────────────────────────
const ClubLeague = () => {
  const { user } = useAuth();
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [teamGrupos, setTeamGrupos] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRound, setFilterRound] = useState("all");
  const [filterGrupo, setFilterGrupo] = useState("all");
  const [myTeamId, setMyTeamId] = useState(null);

  const fetchAll = useCallback(async (seasonId) => {
    setLoading(true);
    try {
      const [roundsRes, matchesRes, standingsRes, newsRes, gruposRes, teamGruposRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/league/rounds?season_id=${seasonId}`),
        axios.get(`${BACKEND_URL}/api/league/matches?season_id=${seasonId}`),
        axios.get(`${BACKEND_URL}/api/league/standings?season_id=${seasonId}`),
        axios.get(`${BACKEND_URL}/api/league/news?season_id=${seasonId}`),
        axios.get(`${BACKEND_URL}/api/league/grupos?season_id=${seasonId}`).catch(() => ({ data: [] })),
        axios.get(`${BACKEND_URL}/api/league/team-grupos?season_id=${seasonId}`).catch(() => ({ data: [] }))
      ]);

      const roundsData = roundsRes.data;
      const matchesData = matchesRes.data;

      setRounds(roundsData);
      setMatches(matchesData);
      setStandings(standingsRes.data);
      setNews(newsRes.data);
      setGrupos(gruposRes.data);
      setTeamGrupos(teamGruposRes.data);
      setFilterRound(getDefaultRound(roundsData, matchesData));

      // Buscar equipo del club
      if (user?.club_id) {
        const myEntry = standingsRes.data.find(s => s.team?.adivina_club_id === user.club_id);
        if (myEntry) {
          setMyTeamId(myEntry.team_id);
        } else {
          try {
            const teamsRes = await axios.get(`${BACKEND_URL}/api/league/teams`);
            const myTeam = teamsRes.data.find(t => t.adivina_club_id === user.club_id);
            if (myTeam) setMyTeamId(myTeam.id);
          } catch { }
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [user?.club_id]);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get(`${BACKEND_URL}/api/league/seasons`);
      setSeasons(res.data);
      const active = res.data.find(s => s.active);
      if (active) { setSelectedSeason(active.id); fetchAll(active.id); }
      else if (res.data.length > 0) { setSelectedSeason(res.data[0].id); fetchAll(res.data[0].id); }
      else setLoading(false);
    };
    load();
  }, [fetchAll]);

  const handleSeasonChange = (id) => { setSelectedSeason(id); fetchAll(id); };

  // Enriquecer partidos con info de grupo
  const enrichedMatches = matches.map(m => {
    const round = rounds.find(r => r.id === m.round_id);
    const grupo = round?.grupo_id ? grupos.find(g => g.id === round.grupo_id) : null;
    return { ...m, _grupo: grupo, _esLiguilla: round?.es_liguilla || false };
  });

  const filteredMatches = enrichedMatches.filter(m => {
    if (filterRound !== "all" && m.round_id !== filterRound) return false;
    if (filterGrupo === "liguilla") return m._esLiguilla;
    if (filterGrupo !== "all") return m._grupo?.id === filterGrupo;
    return true;
  });

  // Clasificación por grupo: asignación explícita como fuente de verdad,
  // con fallback a inferencia por partidos para temporadas antiguas sin asignación
  const getStandingsForGrupo = (grupoId) => {
    const assignedTeamIds = new Set(
      teamGrupos.filter(tg => tg.grupo_id === grupoId).map(tg => tg.team_id)
    );

    if (assignedTeamIds.size === 0) {
      const grupoRoundIds = rounds.filter(r => r.grupo_id === grupoId && !r.es_liguilla).map(r => r.id);
      matches.filter(m => grupoRoundIds.includes(m.round_id)).forEach(m => {
        assignedTeamIds.add(m.home_team_id);
        assignedTeamIds.add(m.away_team_id);
      });
    }

    if (assignedTeamIds.size === 0) return [];
    return standings.filter(s => assignedTeamIds.has(s.team_id))
      .sort((a, b) => b.points - a.points || b.goal_difference - a.goal_difference || b.goals_for - a.goals_for);
  };

  const liguillaDefined = rounds.some(r => r.es_liguilla);
  const liguillaTeamSet = new Set();
  matches.filter(m => rounds.find(r => r.id === m.round_id)?.es_liguilla).forEach(m => {
    liguillaTeamSet.add(m.home_team_id);
    liguillaTeamSet.add(m.away_team_id);
  });
  const liguillaStandings = standings.filter(s => liguillaTeamSet.has(s.team_id))
    .sort((a, b) => b.points - a.points || b.goal_difference - a.goal_difference);

  const myUpcomingMatches = enrichedMatches
    .filter(m => (m.home_team_id === myTeamId || m.away_team_id === myTeamId) && m.status === "scheduled" && !isMatchOverdue(m))
    .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
    .slice(0, 3);

  const myResults = enrichedMatches
    .filter(m => (m.home_team_id === myTeamId || m.away_team_id === myTeamId) && m.status === "finished")
    .sort((a, b) => new Date(b.match_date || 0) - new Date(a.match_date || 0))
    .slice(0, 3);

  const overdueCount = enrichedMatches.filter(m => isMatchOverdue(m)).length;

  const topScorers = [];
  matches.filter(m => m.status === "finished").forEach(m => {
    [...(m.home_scorers || []), ...(m.away_scorers || [])].forEach(s => {
      if (!s.name) return;
      const found = topScorers.find(t => t.name === s.name);
      if (found) found.goals++; else topScorers.push({ name: s.name, goals: 1 });
    });
  });
  topScorers.sort((a, b) => b.goals - a.goals);

  const finishedCount = matches.filter(m => m.status === "finished").length;
  const totalGoals = matches.reduce((a, m) => a + (m.home_score || 0) + (m.away_score || 0), 0);

  return (
    <ClubLayout title="Liga">
      {loading ? (
        <div className="text-center py-20 text-zinc-400">Cargando liga...</div>
      ) : seasons.length === 0 ? (
        <Card className="bg-[#121212] border-white/10 p-12 text-center">
          <Trophy className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">La liga aún no está disponible</p>
          <p className="text-zinc-600 text-sm mt-2">La federación publicará la información próximamente</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Selector de temporada */}
          {seasons.length > 1 && (
            <Select value={selectedSeason} onValueChange={handleSeasonChange}>
              <SelectTrigger className="w-52 bg-[#121212] border-white/10 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#121212] border-white/10">
                {seasons.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}

          {/* Aviso partidos vencidos */}
          {overdueCount > 0 && (
            <div className="flex items-center gap-2 p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-sm text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {overdueCount} partido{overdueCount > 1 ? "s" : ""} con fecha pasada sin resultado registrado
            </div>
          )}

          {/* Grupos info */}
          {grupos.length >= 2 && (
            <div className="flex items-center gap-2 p-3 bg-white/3 border border-white/5 rounded-xl text-xs text-zinc-400">
              <Layers className="h-4 w-4 text-zinc-500 shrink-0" />
              Liga en formato de <strong className="text-white">grupos regionales</strong>:
              {grupos.map(g => (
                <span key={g.id} className={`font-semibold ${g.region === "insular" ? "text-blue-400" : "text-amber-400"}`}>
                  {g.nombre}
                </span>
              ))}
              {liguillaDefined && <> · <span className="text-[#DFFF00] font-bold">🏆 Liguilla Final</span></>}
            </div>
          )}

          {/* Próximos partidos del club */}
          {myTeamId && myUpcomingMatches.length > 0 && (
            <Card className="bg-gradient-to-br from-[#DFFF00]/10 to-transparent border-[#DFFF00]/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-[#DFFF00]">
                  <Calendar className="h-4 w-4" />
                  Próximos Partidos de Tu Club
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myUpcomingMatches.map(m => (
                  <MatchCard key={m.id} match={m} myTeamId={myTeamId} grupos={grupos} rounds={rounds} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="matches">
            <TabsList className="grid grid-cols-4 bg-[#121212] border border-white/10 p-1 h-auto">
              {[
                { value: "matches", Icon: Calendar, label: "Partidos" },
                { value: "standings", Icon: Trophy, label: "Clasificación" },
                { value: "stats", Icon: TrendingUp, label: "Estadísticas" },
                { value: "news", Icon: Newspaper, label: "Noticias" },
              ].map(({ value, Icon, label }) => (
                <TabsTrigger key={value} value={value}
                  className="flex items-center gap-1.5 py-2 text-[11px] data-[state=active]:bg-[#DFFF00] data-[state=active]:text-black">
                  <Icon className="h-3.5 w-3.5" />{label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── PARTIDOS ── */}
            <TabsContent value="matches" className="space-y-4 mt-4">
              <div className="flex gap-2 flex-wrap">
                {grupos.length >= 2 && (
                  <Select value={filterGrupo} onValueChange={setFilterGrupo}>
                    <SelectTrigger className="w-44 bg-[#121212] border-white/10 text-sm h-9">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#121212] border-white/10">
                      <SelectItem value="all">Todos los partidos</SelectItem>
                      <SelectItem value="liguilla"><span className="text-[#DFFF00]">🏆 Liguilla</span></SelectItem>
                      {grupos.map(g => (
                        <SelectItem key={g.id} value={g.id}>
                          <span className={g.region === "insular" ? "text-blue-400" : "text-amber-400"}>{g.nombre}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Select value={filterRound} onValueChange={setFilterRound}>
                  <SelectTrigger className="w-44 bg-[#121212] border-white/10 text-sm h-9">
                    <SelectValue placeholder="Jornada" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    <SelectItem value="all">Todas las jornadas</SelectItem>
                    {rounds.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}{r.es_liguilla ? " 🏆" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-zinc-500 flex items-center">{filteredMatches.length} partidos</span>
              </div>

              {filteredMatches.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No hay partidos en esta selección</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredMatches.map(m => (
                    <MatchCard key={m.id} match={m} myTeamId={myTeamId} grupos={grupos} rounds={rounds} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── CLASIFICACIÓN ── */}
            <TabsContent value="standings" className="mt-4">
              {standings.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>La clasificación se actualizará con los resultados</p>
                </div>
              ) : grupos.length >= 2 ? (
                // Clasificación por grupos
                <div className="space-y-6">
                  {grupos.map(grupo => {
                    const rows = getStandingsForGrupo(grupo.id);
                    if (!rows.length) return null;
                    return (
                      <div key={grupo.id}>
                        <div className={`flex items-center gap-2 mb-3`}>
                          <span className={`text-sm font-bold ${grupo.region === "insular" ? "text-blue-400" : "text-amber-400"}`}>
                            {grupo.nombre}
                          </span>
                          <div className={`flex-1 h-px ${grupo.region === "insular" ? "bg-blue-500/20" : "bg-amber-500/20"}`} />
                          <span className="text-[10px] text-zinc-600">Top 3 → Liguilla</span>
                        </div>
                        <StandingsTable standings={rows} matches={matches} myTeamId={myTeamId} highlight3={true} />
                      </div>
                    );
                  })}
                  {liguillaDefined && liguillaStandings.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-bold text-[#DFFF00]">🏆 Liguilla Final</span>
                        <div className="flex-1 h-px bg-[#DFFF00]/20" />
                      </div>
                      <StandingsTable standings={liguillaStandings} matches={matches} myTeamId={myTeamId} highlight3={false} />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <CardHeader className="px-0 pb-2">
                    <CardTitle className="text-base">{seasons.find(s => s.id === selectedSeason)?.name}</CardTitle>
                  </CardHeader>
                  <StandingsTable standings={standings} matches={matches} myTeamId={myTeamId} highlight3={false} />
                </div>
              )}
            </TabsContent>

            {/* ── ESTADÍSTICAS ── */}
            <TabsContent value="stats" className="mt-4 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Partidos jugados", value: finishedCount, color: "text-[#DFFF00]" },
                  { label: "Goles totales", value: totalGoals, color: "text-green-400" },
                  { label: "Media goles/PJ", value: finishedCount ? (totalGoals / finishedCount).toFixed(1) : "0.0", color: "text-blue-400" },
                ].map(s => (
                  <Card key={s.label} className="bg-[#121212] border-white/10">
                    <CardContent className="p-4">
                      <p className="text-xs text-zinc-500">{s.label}</p>
                      <p className={`text-2xl font-black ${s.color} mt-1`}>{s.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {topScorers.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">Máximos goleadores</h3>
                  <div className="space-y-2">
                    {topScorers.slice(0, 10).map((s, i) => (
                      <div key={s.name} className="flex items-center gap-3 p-3 bg-[#121212] rounded-xl border border-white/5">
                        <span className={`text-xs font-black w-6 text-center ${i < 3 ? "text-[#DFFF00]" : "text-zinc-600"}`}>{i + 1}</span>
                        {i === 0 && <Star className="h-3 w-3 text-[#DFFF00] fill-[#DFFF00] flex-shrink-0" />}
                        <span className="flex-1 font-medium text-sm">{s.name}</span>
                        <span className="text-[#DFFF00] font-black text-lg">{s.goals}</span>
                        <span className="text-xs text-zinc-600">gol{s.goals !== 1 ? "es" : ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {standings.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">Rendimiento por equipo</h3>
                  <div className="space-y-2">
                    {standings.map(row => {
                      const isMe = row.team?.adivina_club_id === user?.club_id || row.team_id === myTeamId;
                      const form = calcForm(row.team_id, matches);
                      const gpg = row.played ? (row.goals_for / row.played).toFixed(1) : "0.0";
                      const gcpg = row.played ? (row.goals_against / row.played).toFixed(1) : "0.0";
                      const pct = row.played ? Math.round((row.won / row.played) * 100) : 0;
                      return (
                        <div key={row.team_id || row.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isMe ? "bg-[#DFFF00]/5 border-[#DFFF00]/20" : "bg-[#121212] border-white/5"
                          }`}>
                          <TeamLogo team={row.team} size="sm" />
                          <span className={`flex-1 font-medium text-sm truncate ${isMe ? "text-[#DFFF00]" : ""}`}>{row.team?.name}</span>
                          <div className="flex gap-1 hidden sm:flex">{form.map((r, i) => <FormBadge key={i} result={r} />)}</div>
                          <div className="flex gap-3 shrink-0 text-xs">
                            <div className="text-center"><p className="font-black text-green-400 text-sm">{gpg}</p><p className="text-zinc-600 text-[9px]">GF/PJ</p></div>
                            <div className="text-center"><p className="font-black text-red-400 text-sm">{gcpg}</p><p className="text-zinc-600 text-[9px]">GC/PJ</p></div>
                            <div className="text-center"><p className="font-black text-[#DFFF00] text-sm">{pct}%</p><p className="text-zinc-600 text-[9px]">%V</p></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── NOTICIAS ── */}
            <TabsContent value="news" className="mt-4 space-y-4">
              {news.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No hay noticias de la liga aún</p>
                </div>
              ) : news.map(item => (
                <div key={item.id} className="p-4 bg-[#121212] rounded-xl border border-white/5 hover:border-white/10">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-[#DFFF00]">{item.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${item.priority === "high" ? "bg-red-500/20 text-red-400" : "bg-zinc-700 text-zinc-400"}`}>
                      {item.priority === "high" ? "URGENTE" : "INFO"}
                    </span>
                  </div>
                  {item.content && <p className="text-zinc-400 text-sm">{item.content}</p>}
                  <p className="text-xs text-zinc-600 mt-2">{new Date(item.created_at).toLocaleDateString("es-ES")}</p>
                </div>
              ))}
            </TabsContent>
          </Tabs>

          {/* Resultados recientes del club */}
          {myTeamId && myResults.length > 0 && (
            <Card className="bg-[#121212] border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-zinc-400" />
                  Últimos resultados de tu club
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myResults.map(m => (
                  <MatchCard key={m.id} match={m} myTeamId={myTeamId} grupos={grupos} rounds={rounds} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </ClubLayout>
  );
};

export default ClubLeague;