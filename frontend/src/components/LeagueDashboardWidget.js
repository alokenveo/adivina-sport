import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Swords, Calendar, ChevronRight } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Logo sin molde circular
const TeamLogo = ({ team }) => {
  if (team?.logo_url) {
    return (
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
        <img
          src={team.logo_url}
          alt={team?.name || ""}
          className="max-w-full max-h-full w-auto h-auto object-contain"
          style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}
        />
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 text-xs font-bold flex-shrink-0">
      {(team?.short_name || team?.name || "?").substring(0, 2).toUpperCase()}
    </div>
  );
};

const LeagueDashboardWidget = ({ clubId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const hasLeagueSection = !user?.nav_sections || user.nav_sections.includes("league");

  const [myTeamId, setMyTeamId]     = useState(null);
  const [nextMatch, setNextMatch]   = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [myPosition, setMyPosition] = useState(null);
  const [totalTeams, setTotalTeams] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [hasLeague, setHasLeague]   = useState(false);

  useEffect(() => {
    if (!clubId || !hasLeagueSection) { setLoading(false); return; }
    const load = async () => {
      try {
        const seasonsRes = await axios.get(`${BACKEND_URL}/api/league/seasons`);
        const active = seasonsRes.data.find(s => s.active);
        if (!active) { setLoading(false); return; }
        setHasLeague(true);

        const teamsRes = await axios.get(`${BACKEND_URL}/api/league/teams`);
        const myTeam = teamsRes.data.find(t => t.adivina_club_id === clubId);
        if (!myTeam) { setLoading(false); return; }

        const teamId = myTeam.id;
        setMyTeamId(teamId);

        const standingsRes = await axios.get(`${BACKEND_URL}/api/league/standings?season_id=${active.id}`);
        const standings = standingsRes.data;
        setTotalTeams(standings.length);
        const myEntry = standings.find(s => s.team_id === teamId);
        if (myEntry) setMyPosition(myEntry);

        const matchesRes = await axios.get(
          `${BACKEND_URL}/api/league/matches?season_id=${active.id}&team_id=${teamId}`
        );
        const matches = matchesRes.data;

        const upcoming = matches
          .filter(m => m.status === "scheduled" && m.match_date)
          .sort((a, b) => new Date(a.match_date) - new Date(b.match_date));
        if (upcoming.length > 0) setNextMatch(upcoming[0]);

        const finished = matches
          .filter(m => m.status === "finished")
          .sort((a, b) => new Date(b.match_date || 0) - new Date(a.match_date || 0));
        if (finished.length > 0) setLastResult(finished[0]);
      } catch (err) {
        console.error("LeagueDashboardWidget error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clubId, hasLeagueSection]);

  if (!hasLeagueSection || loading || !hasLeague || !myTeamId) return null;

  const getMatchResult = (match, teamId) => {
    if (!match || match.status !== "finished") return null;
    const isHome = match.home_team_id === teamId;
    const myScore    = isHome ? match.home_score : match.away_score;
    const theirScore = isHome ? match.away_score : match.home_score;
    if (myScore > theirScore) return { label: "V", color: "text-green-400 bg-green-500/20" };
    if (myScore < theirScore) return { label: "D", color: "text-red-400 bg-red-500/20" };
    return { label: "E", color: "text-yellow-400 bg-yellow-500/20" };
  };

  const result = lastResult ? getMatchResult(lastResult, myTeamId) : null;

  const formatMatchDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("es-ES", { day: "2-digit", month: "short", timeZone: "UTC" });
  };

  const TeamBlock = ({ team, score, isHome }) => (
    <div className={`flex items-center gap-2 ${isHome ? "" : "flex-row-reverse"}`}>
      <TeamLogo team={team} />
      <div className={`${isHome ? "text-left" : "text-right"} min-w-0`}>
        <p className="text-xs font-bold truncate max-w-[90px]">{team?.name}</p>
        {score !== null && score !== undefined && (
          <p className="text-lg font-black text-[#DFFF00] leading-none">{score}</p>
        )}
      </div>
    </div>
  );

  return (
    <Card
      className="bg-gradient-to-br from-[#0D0D0D] to-[#121212] border border-[#DFFF00]/15 hover:border-[#DFFF00]/30 transition-all cursor-pointer"
      onClick={() => navigate("/club/liga")}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#DFFF00]/10 rounded-full flex items-center justify-center">
              <Swords className="h-3.5 w-3.5 text-[#DFFF00]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#DFFF00]">Liga</span>
          </div>
          <div className="flex items-center gap-1 text-zinc-500 text-xs">
            <span>Ver todo</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Posición */}
          {myPosition ? (
            <div className="p-3 bg-[#1A1A1A] rounded-lg border border-white/5">
              <p className="text-xs text-zinc-500 mb-1">Clasificación</p>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black text-[#DFFF00]">{myPosition.position}º</span>
                {totalTeams > 0 && <span className="text-xs text-zinc-500 mb-1">de {totalTeams}</span>}
              </div>
              <div className="flex gap-2 text-xs mt-1">
                <span className="text-zinc-500">PJ <span className="text-white">{myPosition.played}</span></span>
                <span className="text-zinc-500">Pts <span className="text-[#DFFF00] font-bold">{myPosition.points}</span></span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[#1A1A1A] rounded-lg border border-white/5 flex items-center justify-center">
              <p className="text-xs text-zinc-600 text-center">Clasificación pendiente</p>
            </div>
          )}

          {/* Próximo partido */}
          {nextMatch ? (
            <div className="p-3 bg-[#1A1A1A] rounded-lg border border-white/5">
              <div className="flex items-center gap-1 mb-2">
                <Calendar className="h-3 w-3 text-blue-400" />
                <p className="text-xs text-blue-400 font-medium">Próximo</p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <TeamBlock team={nextMatch.home_team} isHome={true} />
                <div className="text-center shrink-0">
                  <span className="text-zinc-600 font-bold text-xs">VS</span>
                  {nextMatch.match_date && (
                    <p className="text-[10px] text-zinc-600 mt-0.5">
                      {formatMatchDate(nextMatch.match_date)}
                    </p>
                  )}
                </div>
                <TeamBlock team={nextMatch.away_team} isHome={false} />
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[#1A1A1A] rounded-lg border border-white/5 flex items-center justify-center">
              <p className="text-xs text-zinc-600 text-center">Sin próximo partido</p>
            </div>
          )}

          {/* Último resultado */}
          {lastResult ? (
            <div className="p-3 bg-[#1A1A1A] rounded-lg border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500 font-medium">Último resultado</p>
                {result && (
                  <span className={`text-xs font-black px-2 py-0.5 rounded ${result.color}`}>
                    {result.label}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1">
                <TeamBlock team={lastResult.home_team} score={lastResult.home_score} isHome={true} />
                <span className="text-zinc-600 font-bold shrink-0">—</span>
                <TeamBlock team={lastResult.away_team} score={lastResult.away_score} isHome={false} />
              </div>
            </div>
          ) : (
            <div className="p-3 bg-[#1A1A1A] rounded-lg border border-white/5 flex items-center justify-center">
              <p className="text-xs text-zinc-600 text-center">Sin resultados aún</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeagueDashboardWidget;
