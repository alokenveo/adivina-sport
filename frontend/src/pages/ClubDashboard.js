import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/App";
import ClubLayout from "@/components/ClubLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import LeagueDashboardWidget from "@/components/LeagueDashboardWidget";
import {
  FileText, Trophy, Newspaper, TrendingUp, Award, ArrowUp,
  Crown, Shield, User, Users, ChevronLeft, ChevronRight, Clock
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ClubDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ contracts: 0, points: 0 });
  const [news, setNews] = useState([]);
  const [dashboardContent, setDashboardContent] = useState([]);
  const [memberTier, setMemberTier] = useState(null);
  const [nextTier, setNextTier] = useState(null);
  const [profile, setProfile] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carousel state
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isDragging = useRef(false);
  const autoPlayRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!user?.club_id) return;
    try {
      const [contractsRes, pointsRes, newsRes, contentRes, tiersRes, profileRes, playersRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/contracts/${user.club_id}`),
        axios.get(`${BACKEND_URL}/api/points/${user.club_id}`),
        axios.get(`${BACKEND_URL}/api/news`),
        axios.get(`${BACKEND_URL}/api/dashboard-content`),
        axios.get(`${BACKEND_URL}/api/member-tiers`).catch(() => ({
          data: [
            { id: "silver", name: "Silver", min_points: 0, color: "#C0C0C0" },
            { id: "gold", name: "Gold", min_points: 1000, color: "#FFD700" },
            { id: "premium", name: "Premium", min_points: 2500, color: "#E5E4E2" },
            { id: "elite", name: "Elite", min_points: 5000, color: "#DFFF00" },
          ],
        })),
        axios.get(`${BACKEND_URL}/api/club/profile/${user.club_id}`),
        axios.get(`${BACKEND_URL}/api/club/players/${user.club_id}`),
      ]);

      const points = pointsRes.data.balance;
      setStats({ contracts: contractsRes.data.length, points });
      setNews(newsRes.data);
      setDashboardContent(contentRes.data);
      setProfile(profileRes.data);
      setPlayers(playersRes.data);

      const sorted = [...tiersRes.data].sort((a, b) => a.min_points - b.min_points);
      const current = [...sorted].reverse().find((t) => points >= t.min_points);
      setMemberTier(current);
      setNextTier(sorted.find((t) => points < t.min_points));
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.club_id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-play carousel
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % Math.max(players.length, 1));
    }, 3000);
  }, [players.length]);

  useEffect(() => {
    if (players.length <= 1) return;
    startAutoPlay();
    return () => clearInterval(autoPlayRef.current);
  }, [players.length, startAutoPlay]);

  const goTo = (idx) => {
    setCarouselIndex((idx + players.length) % players.length);
    // Reiniciar auto-play al navegar manualmente
    startAutoPlay();
  };

  // Touch handlers para swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy && dx > 8) {
      isDragging.current = true;
      e.preventDefault(); // evitar scroll vertical accidental
    }
  };

  const handleTouchEnd = (e) => {
    if (!isDragging.current || touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      dx < 0 ? goTo(carouselIndex + 1) : goTo(carouselIndex - 1);
    }
    touchStartX.current = null;
    isDragging.current = false;
  };

  const getProgressToNextTier = () => {
    if (!memberTier || !nextTier) return 100;
    const current = stats.points - memberTier.min_points;
    const total = nextTier.min_points - memberTier.min_points;
    return Math.min((current / total) * 100, 100);
  };

  const getContractCountdown = (days) => {
    if (days <= 0) return "Expirado";
    if (days <= 30) return `${days}d`;
    if (days <= 365) return `${Math.floor(days / 30)}m`;
    return `${(days / 365).toFixed(1)}a`;
  };

  const directiva = profile?.directiva || {};
  const hasDirectiva =
    directiva.president || directiva.vice_president || directiva.secretary ||
    directiva.technical_director || directiva.owner || directiva.founder;

  // Número de cards visibles según ancho — usamos CSS para esto
  // En JS solo controlamos el índice central
  const CARD_WIDTH = 140; // px aprox por card en móvil

  return (
    <ClubLayout title="Panel Principal">
      {loading ? (
        <div className="text-center py-20">
          <p className="text-zinc-400">Cargando panel...</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Member Tier ── */}
          <Card
            className="bg-gradient-to-br from-[#1E1E1E] via-[#121212] to-[#0A0A0A] border-2"
            style={{ borderColor: memberTier?.color || "#DFFF00" }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl"
                    style={{
                      backgroundColor: memberTier?.color || "#DFFF00",
                      color: "#000",
                      boxShadow: `0 0 30px ${memberTier?.color}40`,
                    }}
                  >
                    <Award className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Tu Nivel Actual</p>
                    <h2 className="text-2xl font-bold" style={{ color: memberTier?.color || "#DFFF00" }}>
                      {memberTier?.name || "Silver"}
                    </h2>
                  </div>
                </div>
                {nextTier && (
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">
                      Siguiente: <span style={{ color: nextTier.color }}>{nextTier.name}</span>
                    </p>
                    <div className="w-48 mt-2">
                      <Progress value={getProgressToNextTier()} className="h-2" />
                      <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1 justify-end">
                        <ArrowUp className="h-3 w-3" />
                        {nextTier.min_points - stats.points} pts restantes
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <LeagueDashboardWidget clubId={user?.club_id} />

          {/* ── Directiva ── */}
          {hasDirectiva && (
            <Card className="bg-gradient-to-br from-[#1E1E1E] to-[#0A0A0A] border-white/10 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Crown className="h-5 w-5 text-[#DFFF00]" />
                  Directiva y Cuerpo Técnico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {directiva.owner && (
                    <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-center">
                      <Crown className="h-6 w-6 text-amber-400 mx-auto mb-1" />
                      <p className="text-xs text-amber-400 uppercase">Propietario</p>
                      <p className="font-semibold text-sm truncate">{directiva.owner}</p>
                    </div>
                  )}
                  {directiva.founder && (
                    <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-center">
                      <Award className="h-6 w-6 text-amber-400 mx-auto mb-1" />
                      <p className="text-xs text-amber-400 uppercase">Fundador</p>
                      <p className="font-semibold text-sm truncate">{directiva.founder}</p>
                    </div>
                  )}
                  {directiva.historical_partner && (
                    <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-center">
                      <Shield className="h-6 w-6 text-amber-400 mx-auto mb-1" />
                      <p className="text-xs text-amber-400 uppercase">Socio Histórico</p>
                      <p className="font-semibold text-sm truncate">{directiva.historical_partner}</p>
                    </div>
                  )}
                  {directiva.president && (
                    <div className="p-3 bg-[#DFFF00]/10 rounded-lg border border-[#DFFF00]/20 text-center">
                      <Crown className="h-6 w-6 text-[#DFFF00] mx-auto mb-1" />
                      <p className="text-xs text-[#DFFF00] uppercase">Presidente</p>
                      <p className="font-semibold text-sm truncate">{directiva.president}</p>
                    </div>
                  )}
                  {directiva.vice_president && (
                    <div className="p-3 bg-[#DFFF00]/10 rounded-lg border border-[#DFFF00]/20 text-center">
                      <Shield className="h-6 w-6 text-[#DFFF00] mx-auto mb-1" />
                      <p className="text-xs text-[#DFFF00] uppercase">Vicepresidente</p>
                      <p className="font-semibold text-sm truncate">{directiva.vice_president}</p>
                    </div>
                  )}
                  {directiva.secretary && (
                    <div className="p-3 bg-[#DFFF00]/10 rounded-lg border border-[#DFFF00]/20 text-center">
                      <User className="h-6 w-6 text-[#DFFF00] mx-auto mb-1" />
                      <p className="text-xs text-[#DFFF00] uppercase">Secretario</p>
                      <p className="font-semibold text-sm truncate">{directiva.secretary}</p>
                    </div>
                  )}
                  {directiva.technical_director && (
                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-center">
                      <User className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                      <p className="text-xs text-blue-400 uppercase">DT</p>
                      <p className="font-semibold text-sm truncate">{directiva.technical_director}</p>
                    </div>
                  )}
                </div>
                {directiva.assistant_coaches?.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-zinc-500">Asistentes:</span>
                    {directiva.assistant_coaches.map((coach, i) => (
                      <Badge key={i} className="bg-blue-500/20 text-blue-400 text-xs">{coach}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Plantilla / Carousel ── */}
          {players.length > 0 && (
            <Card className="bg-[#121212] border-white/10 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5 text-[#DFFF00]" />
                    Plantilla ({players.length} jugadores)
                  </CardTitle>
                  {players.length > 1 && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => goTo(carouselIndex - 1)}
                        className="p-1 rounded-full bg-white/5 hover:bg-white/15 transition-colors"
                        aria-label="Anterior"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => goTo(carouselIndex + 1)}
                        className="p-1 rounded-full bg-white/5 hover:bg-white/15 transition-colors"
                        aria-label="Siguiente"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* 
                  Carrusel: overflow hidden + flex con translateX animado.
                  En desktop mostramos 4 cards; en móvil el ancho de cada card
                  es ~72% del contenedor para que se vea el borde del siguiente.
                */}
                <div
                  className="relative overflow-hidden select-none"
                  ref={carouselRef}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div
                    className="flex transition-transform duration-400 ease-in-out"
                    style={{
                      // En móvil cada card ocupa ~72vw, en desktop 25% del contenedor (4 cards)
                      transform: `translateX(calc(-${carouselIndex} * var(--card-w)))`,
                      "--card-w": "25%",
                    }}
                  >
                    {players.map((player, index) => (
                      <div
                        key={player.id}
                        className="flex-shrink-0 px-1.5"
                        style={{ width: "var(--card-w)" }}
                      >
                        <div className="p-3 bg-[#1E1E1E] rounded-lg border border-white/5 hover:border-[#DFFF00]/30 transition-all">
                          <div className="flex flex-col items-center text-center gap-2">
                            <div className="relative">
                              {player.photo_url ? (
                                <img
                                  src={player.photo_url}
                                  alt={player.name}
                                  className="w-14 h-14 rounded-full object-cover border-2"
                                  style={{ borderColor: player.contract_color }}
                                />
                              ) : (
                                <div
                                  className="w-14 h-14 rounded-full bg-[#0A0A0A] flex items-center justify-center border-2"
                                  style={{ borderColor: player.contract_color }}
                                >
                                  <User className="h-7 w-7 text-zinc-600" />
                                </div>
                              )}
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#DFFF00] flex items-center justify-center text-black font-bold text-xs">
                                {player.number}
                              </div>
                            </div>
                            <div className="min-w-0 w-full">
                              <p className="font-bold text-sm truncate">{player.name}</p>
                              <p className="text-xs text-zinc-400">{player.position}</p>
                              <div className="flex items-center gap-1 justify-center mt-1">
                                <Clock className="h-3 w-3 flex-shrink-0" style={{ color: player.contract_color }} />
                                <span className="text-xs" style={{ color: player.contract_color }}>
                                  {getContractCountdown(player.days_remaining)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CSS override para móvil: 1.4 cards visibles */}
                  <style>{`
                    @media (max-width: 640px) {
                      [style*="--card-w"] {
                        --card-w: 72% !important;
                      }
                    }
                    @media (min-width: 641px) and (max-width: 900px) {
                      [style*="--card-w"] {
                        --card-w: 33.333% !important;
                      }
                    }
                  `}</style>
                </div>

                {/* Indicadores de posición */}
                {players.length > 1 && (
                  <div className="flex justify-center gap-1 mt-4">
                    {players.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        className="transition-all rounded-full"
                        style={{
                          width: i === carouselIndex ? "16px" : "8px",
                          height: "8px",
                          background: i === carouselIndex ? "#DFFF00" : "rgba(255,255,255,0.2)",
                        }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── Stats ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-[#121212] border-white/10 hover:border-blue-500/30 transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500">Contratos Activos</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.contracts}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-400/30" />
              </CardContent>
            </Card>
            <Card className="bg-[#121212] border-white/10 hover:border-[#DFFF00]/30 transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500">Puntos Totales</p>
                  <p className="text-2xl font-bold text-[#DFFF00]">{stats.points}</p>
                </div>
                <Trophy className="h-8 w-8 text-[#DFFF00]/30" />
              </CardContent>
            </Card>
            <Card className="bg-[#121212] border-white/10 hover:border-purple-500/30 transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500">Estado</p>
                  <p className="text-2xl font-bold text-purple-400">Activo</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400/30" />
              </CardContent>
            </Card>
          </div>

          {/* ── Noticias ── */}
          {news.length > 0 && (
            <Card className="bg-[#121212] border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Newspaper className="h-5 w-5 text-[#DFFF00]" />
                  Noticias y Anuncios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {news.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-[#1E1E1E] border border-white/5 rounded-lg hover:border-[#DFFF00]/20 transition-all"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-[#DFFF00] text-sm">{item.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded ${item.priority === "high"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-zinc-700 text-zinc-400"
                          }`}>
                          {item.priority === "high" ? "URGENTE" : "INFO"}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-xs">{item.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Dashboard Content ── */}
          {dashboardContent.length > 0 && (
            <Card className="bg-[#121212] border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Información Importante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {dashboardContent.map((item) => (
                    <div key={item.id} className="p-3 bg-[#1E1E1E] rounded-lg border border-white/5">
                      <h3 className="font-bold mb-1 text-[#DFFF00] text-sm">{item.section_title}</h3>
                      <p className="text-xs text-zinc-400">{item.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      )}
    </ClubLayout>
  );
};

export default ClubDashboard;