import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Calendar, Newspaper, ArrowRight, Shield, Lock } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const STATUS_CONFIG = {
  scheduled: { label: "Programado", color: "bg-blue-500/20 text-blue-400" },
  live:      { label: "En Juego",   color: "bg-green-500/20 text-green-400" },
  finished:  { label: "Finalizado", color: "bg-zinc-700/50 text-zinc-400" },
  postponed: { label: "Aplazado",   color: "bg-yellow-500/20 text-yellow-400" },
};

const TeamLogo = ({ team }) => {
  if (team?.logo_url) {
    return <img src={team.logo_url} alt={team.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />;
  }
  return (
    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-zinc-500 text-xs flex-shrink-0">
      {team?.short_name || team?.name?.substring(0, 2).toUpperCase() || "?"}
    </div>
  );
};

/** Card de partido responsive: equipos en columna, nombre debajo del escudo */
const MatchCardPublic = ({ match }) => {
  const s = STATUS_CONFIG[match.status] || STATUS_CONFIG.scheduled;
  const isFinished = match.status === "finished";

  return (
    <div className="p-3 sm:p-4 bg-[#121212] rounded-xl border border-white/5 hover:border-white/10 transition-all">
      {/* Cabecera */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span style={{ fontSize: "11px", color: "rgba(240,239,232,0.3)" }}>
          {match.round?.name}
          {match.match_date && ` · ${new Date(match.match_date).toLocaleDateString("es-ES", {
            day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
          })}`}
        </span>
        <Badge className={`${s.color} border-transparent text-xs ml-auto`}>{s.label}</Badge>
      </div>

      {/* Cuerpo: equipo | resultado | equipo */}
      <div className="flex items-center justify-between gap-2">
        {/* Local */}
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <TeamLogo team={match.home_team} />
          <span className="text-xs font-semibold text-center leading-tight line-clamp-2 text-white max-w-[80px] sm:max-w-none">
            {match.home_team?.name}
          </span>
        </div>

        {/* Resultado */}
        <div className="shrink-0 text-center px-2">
          {isFinished ? (
            <span style={{ fontSize: "20px", fontWeight: 900, whiteSpace: "nowrap" }}>
              {match.home_score}
              <span style={{ color: "rgba(240,239,232,0.2)", margin: "0 4px" }}>-</span>
              {match.away_score}
            </span>
          ) : (
            <span style={{ color: "rgba(240,239,232,0.25)", fontWeight: 700 }}>VS</span>
          )}
        </div>

        {/* Visitante */}
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <TeamLogo team={match.away_team} />
          <span className="text-xs font-semibold text-center leading-tight line-clamp-2 text-white max-w-[80px] sm:max-w-none">
            {match.away_team?.name}
          </span>
        </div>
      </div>
    </div>
  );
};

const LeaguePublic = () => {
  const navigate = useNavigate();
  const [seasons, setSeasons]     = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [rounds, setRounds]       = useState([]);
  const [matches, setMatches]     = useState([]);
  const [standings, setStandings] = useState([]);
  const [news, setNews]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filterRound, setFilterRound] = useState("all");

  const [fedModal, setFedModal]   = useState(false);
  const [fedUser, setFedUser]     = useState("");
  const [fedPass, setFedPass]     = useState("");
  const [fedError, setFedError]   = useState("");
  const [fedLoading, setFedLoading] = useState(false);

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/league/seasons`);
        setSeasons(res.data);
        const active = res.data.find(s => s.active) || res.data[0];
        if (active) {
          setSelectedSeason(active.id);
          fetchAll(active.id);
        } else {
          setLoading(false);
        }
      } catch {
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

  const handleFedLogin = async () => {
    if (!fedUser || !fedPass) { setFedError("Rellena usuario y contraseña"); return; }
    setFedLoading(true);
    setFedError("");
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/federation/login`, {
        username: fedUser,
        password: fedPass,
      });
      localStorage.setItem("federation_user", JSON.stringify(res.data));
      navigate("/federation/dashboard");
    } catch {
      setFedError("Credenciales incorrectas");
      setFedPass("");
    } finally {
      setFedLoading(false);
    }
  };

  const currentSeasonLabel = seasons.find(s => s.id === selectedSeason)?.name || "Liga";

  return (
    <>
      <style>{`
        .league-public {
          min-height: 100dvh;
          background: #050505;
          color: #F0EFE8;
          font-family: 'Manrope', sans-serif;
        }
        .lp-header {
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(5,5,5,0.9);
          backdrop-filter: blur(16px);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .lp-header-inner {
          max-width: 900px;
          margin: 0 auto;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .lp-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lp-brand-logo {
          height: 28px;
          filter: brightness(0) invert(1);
          opacity: 0.85;
          cursor: pointer;
        }
        .lp-brand-divider {
          width: 1px;
          height: 20px;
          background: rgba(255,255,255,0.1);
        }
        .lp-brand-tag {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(240,239,232,0.4);
        }
        .lp-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-portal {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #DFFF00;
          color: #050505;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 8px 12px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-family: 'Barlow Condensed', inherit;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .btn-portal:hover { background: #f0ff33; }
        .btn-fed {
          display: flex;
          align-items: center;
          gap: 5px;
          background: transparent;
          color: rgba(240,239,232,0.3);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 7px 10px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .btn-fed:hover {
          color: rgba(240,239,232,0.6);
          border-color: rgba(255,255,255,0.15);
        }
        .lp-main {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px 16px 60px;
        }
        .lp-hero {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .lp-hero h1 {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(24px, 5vw, 44px);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: #F0EFE8;
        }
        .lp-hero h1 em {
          font-style: normal;
          color: #DFFF00;
        }
        /* matches grid: 2 columnas en sm+ */
        .matches-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 540px) {
          .matches-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        /* Modal federación */
        .fed-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
          backdrop-filter: blur(4px);
        }
        .fed-modal {
          background: #0f0f0f;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 28px 24px;
          width: 100%;
          max-width: 340px;
          position: relative;
        }
        .fed-modal-close {
          position: absolute;
          top: 12px; right: 12px;
          background: rgba(255,255,255,0.05);
          border: none;
          border-radius: 50%;
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: rgba(240,239,232,0.4);
          font-size: 13px;
        }
        .fed-modal-close:hover { color: #ff7070; }
        .fed-input {
          width: 100%;
          background: #181818;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 11px 13px;
          color: #F0EFE8;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          margin-top: 6px;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }
        .fed-input:focus { border-color: rgba(223,255,0,0.4); }
        .fed-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(240,239,232,0.3);
          display: block;
          margin-top: 14px;
        }
        .fed-btn {
          width: 100%;
          background: #DFFF00;
          color: #050505;
          font-family: 'Barlow Condensed', inherit;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 12px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 18px;
          transition: background 0.15s;
        }
        .fed-btn:hover:not(:disabled) { background: #f0ff33; }
        .fed-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .fed-error {
          background: rgba(255,80,80,0.08);
          border: 1px solid rgba(255,80,80,0.2);
          border-radius: 6px;
          color: #ff7070;
          font-size: 12px;
          padding: 8px 12px;
          margin-top: 10px;
        }
        @media (max-width: 400px) {
          .lp-brand-tag { display: none; }
          .lp-brand-divider { display: none; }
          .btn-portal span { display: none; }
        }
      `}</style>

      <div className="league-public">
        {/* Header */}
        <header className="lp-header">
          <div className="lp-header-inner">
            <div className="lp-brand">
              <img
                className="lp-brand-logo"
                src="https://customer-assets.emergentagent.com/job_adivina-portal/artifacts/rexq8hh7_A56B5578-48F3-41C0-A247-75CAB5930CA5.png"
                alt="ADIVINA"
                onClick={() => navigate("/")}
              />
              <div className="lp-brand-divider" />
              <span className="lp-brand-tag">Liga EG</span>
            </div>
            <div className="lp-actions">
              <button className="btn-fed" onClick={() => setFedModal(true)}>
                <Lock size={10} />Federación
              </button>
              <button className="btn-portal" onClick={() => navigate("/member-club")}>
                <span>Portal Clubes</span> <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </header>

        <main className="lp-main">
          <div className="lp-hero">
            <div>
              <h1>Liga <em>Ecuatoguineana</em></h1>
              <p style={{ color: "rgba(240,239,232,0.35)", fontSize: "13px", marginTop: "4px" }}>
                Resultados, clasificación y noticias en tiempo real
              </p>
            </div>
            {seasons.length > 1 && (
              <Select value={selectedSeason} onValueChange={handleSeasonChange}>
                <SelectTrigger className="w-48 bg-[#121212] border-white/10 text-sm">
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

          {loading ? (
            <div className="text-center py-20" style={{ color: "rgba(240,239,232,0.3)" }}>
              Cargando liga...
            </div>
          ) : seasons.length === 0 ? (
            <div className="text-center py-20" style={{ color: "rgba(240,239,232,0.3)" }}>
              <Trophy size={40} style={{ margin: "0 auto 12px", opacity: 0.2 }} />
              <p>La liga aún no está disponible</p>
            </div>
          ) : (
            <Tabs defaultValue="matches">
              <TabsList className="grid grid-cols-3 bg-[#121212] border border-white/10 p-1 h-auto mb-5">
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

              {/* Partidos */}
              <TabsContent value="matches" className="space-y-4">
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

                <div className="matches-grid">
                  {filteredMatches.length === 0 ? (
                    <div className="col-span-full text-center py-12" style={{ color: "rgba(240,239,232,0.25)" }}>
                      <Calendar size={36} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
                      <p>No hay partidos en esta jornada</p>
                    </div>
                  ) : filteredMatches.map(match => (
                    <MatchCardPublic key={match.id} match={match} />
                  ))}
                </div>
              </TabsContent>

              {/* Clasificación */}
              <TabsContent value="standings">
                {standings.length === 0 ? (
                  <div className="text-center py-12" style={{ color: "rgba(240,239,232,0.25)" }}>
                    <Trophy size={36} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
                    <p>Sin datos aún</p>
                  </div>
                ) : (
                  <div className="bg-[#121212] rounded-xl border border-white/5 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "rgba(240,239,232,0.6)" }}>{currentSeasonLabel}</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            {["#", "Equipo", "PJ", "G", "E", "P", "DG", "Pts"].map(h => (
                              <th key={h} style={{
                                padding: "10px 8px",
                                textAlign: h === "Equipo" ? "left" : "center",
                                color: "rgba(240,239,232,0.3)",
                                fontSize: "10px",
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                              }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {standings.map(row => (
                            <tr key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                              <td style={{ padding: "12px 8px 12px 16px", color: "rgba(240,239,232,0.3)", fontVariantNumeric: "tabular-nums" }}>{row.position}</td>
                              <td style={{ padding: "12px 8px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <TeamLogo team={row.team} />
                                  <span style={{ fontWeight: 600 }}>{row.team?.name}</span>
                                </div>
                              </td>
                              <td style={{ textAlign: "center", padding: "12px 8px", color: "rgba(240,239,232,0.5)" }}>{row.played}</td>
                              <td style={{ textAlign: "center", padding: "12px 8px", color: "#4ade80" }}>{row.won}</td>
                              <td style={{ textAlign: "center", padding: "12px 8px", color: "rgba(240,239,232,0.5)" }}>{row.drawn}</td>
                              <td style={{ textAlign: "center", padding: "12px 8px", color: "#f87171" }}>{row.lost}</td>
                              <td style={{ textAlign: "center", padding: "12px 8px", color: "rgba(240,239,232,0.5)" }}>
                                {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                              </td>
                              <td style={{ textAlign: "center", padding: "12px 16px 12px 8px", fontWeight: 900, fontSize: "18px", color: "#DFFF00" }}>{row.points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Noticias */}
              <TabsContent value="news" className="space-y-4">
                {news.length === 0 ? (
                  <div className="text-center py-12" style={{ color: "rgba(240,239,232,0.25)" }}>
                    <Newspaper size={36} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
                    <p>Sin noticias aún</p>
                  </div>
                ) : news.map(item => (
                  <div key={item.id} className="p-4 bg-[#121212] rounded-xl border border-white/5">
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }}>
                      <h3 style={{ fontWeight: 700, color: "#DFFF00", fontSize: "15px" }}>{item.title}</h3>
                      <span style={{
                        fontSize: "10px", padding: "3px 8px", borderRadius: "4px", whiteSpace: "nowrap",
                        background: item.priority === "high" ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
                        color: item.priority === "high" ? "#f87171" : "rgba(240,239,232,0.3)",
                      }}>
                        {item.priority === "high" ? "URGENTE" : "INFO"}
                      </span>
                    </div>
                    {item.content && <p style={{ color: "rgba(240,239,232,0.5)", fontSize: "13px", lineHeight: "1.6" }}>{item.content}</p>}
                    <p style={{ color: "rgba(240,239,232,0.2)", fontSize: "11px", marginTop: "8px" }}>
                      {new Date(item.created_at).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>

      {/* Modal login federación */}
      {fedModal && (
        <div className="fed-overlay" onClick={e => { if (e.target.classList.contains("fed-overlay")) setFedModal(false); }}>
          <div className="fed-modal">
            <button className="fed-modal-close" onClick={() => setFedModal(false)}>✕</button>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <Shield size={18} color="#DFFF00" />
                <span style={{ fontWeight: 800, fontSize: "18px", fontFamily: "Barlow Condensed, sans-serif", textTransform: "uppercase" }}>
                  Acceso Federación
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "rgba(240,239,232,0.35)" }}>Panel de gestión de la liga</p>
            </div>
            <label className="fed-label">Usuario</label>
            <input className="fed-input" type="text" value={fedUser}
              onChange={e => setFedUser(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleFedLogin()} />
            <label className="fed-label">Contraseña</label>
            <input className="fed-input" type="password" value={fedPass}
              onChange={e => setFedPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleFedLogin()} />
            {fedError && <div className="fed-error">{fedError}</div>}
            <button className="fed-btn" onClick={handleFedLogin} disabled={fedLoading}>
              {fedLoading ? "Comprobando..." : "Entrar al panel"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LeaguePublic;
