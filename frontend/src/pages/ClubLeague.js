import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/App";
import ClubLayout from "@/components/ClubLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Calendar, Newspaper, Users, Clock, Star } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const STATUS_CONFIG = {
  scheduled: { label: "Programado", color: "bg-blue-500/20 text-blue-400" },
  live:      { label: "En Juego",   color: "bg-green-500/20 text-green-400" },
  finished:  { label: "Finalizado", color: "bg-zinc-700/50 text-zinc-400" },
  postponed: { label: "Aplazado",   color: "bg-yellow-500/20 text-yellow-400" },
};

const TeamLogo = ({ team, size = "md" }) => {
  const s = size === "sm" ? "w-8 h-8 text-xs" : "w-12 h-12 text-sm";
  if (team?.logo_url) {
    return <img src={team.logo_url} alt={team.name} className={`${s} rounded-full object-cover`} />;
  }
  return (
    <div className={`${s} rounded-full bg-[#1E1E1E] border border-white/10 flex items-center justify-center font-bold text-zinc-400`}>
      {team?.short_name || team?.name?.substring(0,2).toUpperCase() || "?"}
    </div>
  );
};

const MatchCard = ({ match, myTeamId }) => {
  const isMyMatch = match.home_team_id === myTeamId || match.away_team_id === myTeamId;
  const s = STATUS_CONFIG[match.status] || STATUS_CONFIG.scheduled;
  const isFinished = match.status === "finished";

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isMyMatch
        ? "bg-[#DFFF00]/5 border-[#DFFF00]/20 hover:border-[#DFFF00]/40"
        : "bg-[#121212] border-white/5 hover:border-white/10"
    }`}>
      {isMyMatch && (
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-3 w-3 text-[#DFFF00] fill-[#DFFF00]" />
          <span className="text-xs text-[#DFFF00] font-medium">Tu partido</span>
        </div>
      )}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-zinc-500">{match.round?.name}</span>
        {match.match_date && (
          <span className="text-xs text-zinc-600">
            · {new Date(match.match_date).toLocaleDateString("es-ES", {
              day: "2-digit", month: "short",
              hour: "2-digit", minute: "2-digit"
            })}
          </span>
        )}
        <Badge className={`${s.color} border-transparent text-xs ml-auto`}>{s.label}</Badge>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 flex-1">
          <TeamLogo team={match.home_team} />
          <span className={`font-bold text-sm truncate ${match.home_team_id === myTeamId ? "text-[#DFFF00]" : ""}`}>
            {match.home_team?.name}
          </span>
        </div>

        <div className="shrink-0 text-center px-3">
          {isFinished ? (
            <span className="text-2xl font-black tabular-nums">
              {match.home_score}<span className="text-zinc-500 mx-1">-</span>{match.away_score}
            </span>
          ) : (
            <span className="text-sm text-zinc-600 font-bold">VS</span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end">
          <span className={`font-bold text-sm truncate text-right ${match.away_team_id === myTeamId ? "text-[#DFFF00]" : ""}`}>
            {match.away_team?.name}
          </span>
          <TeamLogo team={match.away_team} />
        </div>
      </div>

      {/* Goleadores */}
      {isFinished && (match.home_scorers?.length > 0 || match.away_scorers?.length > 0) && (
        <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs text-zinc-500">
          <span>{match.home_scorers?.map(s => s.name).join(", ") || ""}</span>
          <span className="text-right">{match.away_scorers?.map(s => s.name).join(", ") || ""}</span>
        </div>
      )}
    </div>
  );
};

const ClubLeague = () => {
  const { user } = useAuth();
  const [seasons, setSeasons]   = useState([]);
  const [activeSeason, setActiveSeason] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [rounds, setRounds]     = useState([]);
  const [matches, setMatches]   = useState([]);
  const [standings, setStandings] = useState([]);
  const [news, setNews]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterRound, setFilterRound] = useState("all");

  // Buscar el league_team_id que corresponde al club del usuario
  const [myTeamId, setMyTeamId] = useState(null);

  const fetchAll = useCallback(async (seasonId) => {
    setLoading(true);
    try {
      const [roundsRes, matchesRes, standingsRes, newsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/league/rounds?season_id=${seasonId}`),
        axios.get(`${BACKEND_URL}/api/league/matches?season_id=${seasonId}`),
        axios.get(`${BACKEND_URL}/api/league/standings?season_id=${seasonId}`),
        axios.get(`${BACKEND_URL}/api/league/news?season_id=${seasonId}`),
      ]);
      setRounds(roundsRes.data);
      setMatches(matchesRes.data);
      setStandings(standingsRes.data);
      setNews(newsRes.data);

      // Detectar si el club del usuario tiene equipo en la liga
      if (user?.club_id) {
        const myTeam = standingsRes.data.find(s => s.team?.adivina_club_id === user.club_id);
        if (myTeam) setMyTeamId(myTeam.team_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.club_id]);

  useEffect(() => {
    const load = async () => {
      const res = await axios.get(`${BACKEND_URL}/api/league/seasons`);
      setSeasons(res.data);
      const active = res.data.find(s => s.active);
      if (active) {
        setActiveSeason(active);
        setSelectedSeason(active.id);
        fetchAll(active.id);
      } else if (res.data.length > 0) {
        setSelectedSeason(res.data[0].id);
        fetchAll(res.data[0].id);
      } else {
        setLoading(false);
      }
    };
    load();
  }, [fetchAll]);

  const handleSeasonChange = (id) => {
    setSelectedSeason(id);
    fetchAll(id);
  };

  const filteredMatches = filterRound === "all"
    ? matches
    : matches.filter(m => m.round_id === filterRound);

  // Partidos próximos del club del usuario
  const myUpcomingMatches = matches
    .filter(m =>
      (m.home_team_id === myTeamId || m.away_team_id === myTeamId) &&
      m.status === "scheduled"
    )
    .slice(0, 3);

  const myResults = matches
    .filter(m =>
      (m.home_team_id === myTeamId || m.away_team_id === myTeamId) &&
      m.status === "finished"
    )
    .slice(-3)
    .reverse();

  const currentSeasonLabel = seasons.find(s => s.id === selectedSeason)?.name || "";

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
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {activeSeason && (
                <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                  Temporada activa
                </span>
              )}
            </div>
            {seasons.length > 1 && (
              <Select value={selectedSeason} onValueChange={handleSeasonChange}>
                <SelectTrigger className="w-52 bg-[#121212] border-white/10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10">
                  {seasons.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Mis próximos partidos (si el club está en la liga) */}
          {myTeamId && myUpcomingMatches.length > 0 && (
            <Card className="bg-gradient-to-br from-[#DFFF00]/10 to-transparent border-[#DFFF00]/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-[#DFFF00]">
                  <Calendar className="h-4 w-4" />
                  Próximos Partidos de Tu Club
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myUpcomingMatches.map(m => <MatchCard key={m.id} match={m} myTeamId={myTeamId} />)}
              </CardContent>
            </Card>
          )}

          {/* Tabs principales */}
          <Tabs defaultValue="matches">
            <TabsList className="grid grid-cols-3 bg-[#121212] border border-white/10 p-1 h-auto">
              {[
                { value: "matches",   Icon: Calendar, label: "Partidos"      },
                { value: "standings", Icon: Trophy,   label: "Clasificación" },
                { value: "news",      Icon: Newspaper,label: "Noticias"      },
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

            {/* ── Partidos ── */}
            <TabsContent value="matches" className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <Select value={filterRound} onValueChange={setFilterRound}>
                  <SelectTrigger className="w-48 bg-[#121212] border-white/10 text-sm">
                    <SelectValue placeholder="Todas las jornadas" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121212] border-white/10">
                    <SelectItem value="all">Todas las jornadas</SelectItem>
                    {rounds.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-zinc-500">{filteredMatches.length} partidos</span>
              </div>

              {filteredMatches.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No hay partidos en esta jornada</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMatches.map(m => (
                    <MatchCard key={m.id} match={m} myTeamId={myTeamId} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── Clasificación ── */}
            <TabsContent value="standings" className="mt-4">
              {standings.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Trophy className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>La clasificación se actualizará con los resultados</p>
                </div>
              ) : (
                <Card className="bg-[#121212] border-white/10 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{currentSeasonLabel}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/5 text-zinc-500 text-xs uppercase">
                            <th className="text-left py-3 pl-4 w-8">#</th>
                            <th className="text-left py-3">Equipo</th>
                            <th className="text-center py-3 px-2">PJ</th>
                            <th className="text-center py-3 px-2">G</th>
                            <th className="text-center py-3 px-2">E</th>
                            <th className="text-center py-3 px-2">P</th>
                            <th className="text-center py-3 px-2 hidden sm:table-cell">GF</th>
                            <th className="text-center py-3 px-2 hidden sm:table-cell">GC</th>
                            <th className="text-center py-3 px-2">DG</th>
                            <th className="text-center py-3 pr-4 font-bold">Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standings.map((row, i) => {
                            const isMe = row.team?.adivina_club_id === user?.club_id;
                            return (
                              <tr
                                key={row.id}
                                className={`border-b border-white/5 transition-colors ${
                                  isMe
                                    ? "bg-[#DFFF00]/10 hover:bg-[#DFFF00]/15"
                                    : "hover:bg-white/3"
                                }`}
                              >
                                <td className="py-3 pl-4 text-zinc-500 font-mono">{row.position}</td>
                                <td className="py-3">
                                  <div className="flex items-center gap-2">
                                    <TeamLogo team={row.team} size="sm" />
                                    <span className={`font-medium ${isMe ? "text-[#DFFF00]" : ""}`}>
                                      {row.team?.name}
                                    </span>
                                    {isMe && (
                                      <Star className="h-3 w-3 text-[#DFFF00] fill-[#DFFF00]" />
                                    )}
                                  </div>
                                </td>
                                <td className="text-center py-3 px-2 text-zinc-400">{row.played}</td>
                                <td className="text-center py-3 px-2 text-green-400">{row.won}</td>
                                <td className="text-center py-3 px-2 text-zinc-400">{row.drawn}</td>
                                <td className="text-center py-3 px-2 text-red-400">{row.lost}</td>
                                <td className="text-center py-3 px-2 text-zinc-400 hidden sm:table-cell">{row.goals_for}</td>
                                <td className="text-center py-3 px-2 text-zinc-400 hidden sm:table-cell">{row.goals_against}</td>
                                <td className="text-center py-3 px-2 text-zinc-400">
                                  {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                                </td>
                                <td className="text-center py-3 pr-4 font-black text-lg text-[#DFFF00]">{row.points}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ── Noticias liga ── */}
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
                    <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${
                      item.priority === "high" ? "bg-red-500/20 text-red-400" : "bg-zinc-700 text-zinc-400"
                    }`}>
                      {item.priority === "high" ? "URGENTE" : "INFO"}
                    </span>
                  </div>
                  {item.content && <p className="text-zinc-400 text-sm">{item.content}</p>}
                  <p className="text-xs text-zinc-600 mt-2">
                    {new Date(item.created_at).toLocaleDateString("es-ES")}
                  </p>
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
                {myResults.map(m => <MatchCard key={m.id} match={m} myTeamId={myTeamId} />)}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </ClubLayout>
  );
};

export default ClubLeague;