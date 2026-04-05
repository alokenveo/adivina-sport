import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  FileText, Receipt, Trophy, Palette, Package,
  ShoppingBag, Swords, Save, CheckCircle2, XCircle,
  Users, Zap
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Secciones configurables — perfil no aparece porque es siempre visible
const SECTION_DEFINITIONS = [
  {
    key:         "contracts",
    label:       "Contratos",
    description: "Acceso a contratos firmados con Adivina",
    icon:        FileText,
    color:       "text-blue-400",
    bg:          "bg-blue-500/10",
    border:      "border-blue-500/20",
  },
  {
    key:         "invoices",
    label:       "Facturas",
    description: "Gestión de facturas y pagos",
    icon:        Receipt,
    color:       "text-green-400",
    bg:          "bg-green-500/10",
    border:      "border-green-500/20",
  },
  {
    key:         "points",
    label:       "Sistema de Puntos",
    description: "Saldo y historial de puntos de lealtad",
    icon:        Trophy,
    color:       "text-yellow-400",
    bg:          "bg-yellow-500/10",
    border:      "border-yellow-500/20",
  },
  {
    key:         "kit-design",
    label:       "Diseño de Kit",
    description: "Visualización de diseños de equipamiento",
    icon:        Palette,
    color:       "text-purple-400",
    bg:          "bg-purple-500/10",
    border:      "border-purple-500/20",
  },
  {
    key:         "requests",
    label:       "Solicitudes",
    description: "Canal de solicitudes al equipo Adivina",
    icon:        Package,
    color:       "text-orange-400",
    bg:          "bg-orange-500/10",
    border:      "border-orange-500/20",
  },
  {
    key:         "orders",
    label:       "Mis Pedidos",
    description: "Seguimiento de pedidos de material",
    icon:        ShoppingBag,
    color:       "text-cyan-400",
    bg:          "bg-cyan-500/10",
    border:      "border-cyan-500/20",
  },
  {
    key:         "league",
    label:       "Liga",
    description: "Clasificación, partidos y noticias de liga",
    icon:        Swords,
    color:       "text-[#DFFF00]",
    bg:          "bg-[#DFFF00]/10",
    border:      "border-[#DFFF00]/20",
  },
];

const SPORTS = [
  { value: "football",   label: "⚽ Fútbol" },
  { value: "basketball", label: "🏀 Baloncesto" },
  { value: "futsal",     label: "🥅 Fútbol Sala" },
  { value: "volleyball", label: "🏐 Voleibol" },
  { value: "other",      label: "🏅 Otro deporte" },
];

// Secciones por defecto sugeridas según el deporte
const DEFAULT_SECTIONS_BY_SPORT = {
  football:   ["contracts", "invoices", "points", "kit-design", "requests", "orders", "league"],
  basketball: ["contracts", "invoices", "points", "kit-design", "requests", "orders", "league"],
  futsal:     ["contracts", "invoices", "points", "kit-design", "requests", "orders", "league"],
  volleyball: ["contracts", "invoices", "points", "kit-design", "requests", "orders"],
  other:      ["contracts", "invoices", "points", "requests", "orders"],
};

const ClubNavConfig = () => {
  const [clubs, setClubs]               = useState([]);
  const [selectedClubId, setSelectedClubId] = useState("");
  const [selectedClub, setSelectedClub] = useState(null);
  const [sections, setSections]         = useState([]);
  const [sport, setSport]               = useState("football");
  const [saving, setSaving]             = useState(false);
  const [changed, setChanged]           = useState(false);

  const fetchClubs = useCallback(async () => {
    const res = await axios.get(`${BACKEND_URL}/api/clubs`);
    setClubs(res.data);
  }, []);

  useEffect(() => { fetchClubs(); }, [fetchClubs]);

  useEffect(() => {
    if (!selectedClubId) { setSelectedClub(null); return; }
    const club = clubs.find(c => c.id === selectedClubId);
    if (!club) return;
    setSelectedClub(club);
    setSport(club.sport || "football");
    // nav_sections puede ser null en clubes legacy → usar todas por defecto
    setSections(
      club.nav_sections || SECTION_DEFINITIONS.map(s => s.key)
    );
    setChanged(false);
  }, [selectedClubId, clubs]);

  const toggleSection = (key) => {
    setSections(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
    setChanged(true);
  };

  const applyDefault = () => {
    setSections(DEFAULT_SECTIONS_BY_SPORT[sport] || DEFAULT_SECTIONS_BY_SPORT.other);
    setChanged(true);
  };

  const enableAll = () => {
    setSections(SECTION_DEFINITIONS.map(s => s.key));
    setChanged(true);
  };

  const disableAll = () => {
    setSections([]);
    setChanged(true);
  };

  const handleSportChange = (newSport) => {
    setSport(newSport);
    // Sugerir secciones del deporte pero mantener las ya elegidas
    // Solo si el admin quiere, puede aplicar el defecto con el botón
    setChanged(true);
  };

  const handleSave = async () => {
    if (!selectedClubId) return;
    setSaving(true);
    try {
      await axios.put(`${BACKEND_URL}/api/clubs/${selectedClubId}`, {
        sport,
        nav_sections: sections,
      });
      toast.success(`Configuración guardada para ${selectedClub?.name}`);
      setChanged(false);
      fetchClubs();
    } catch {
      toast.error("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-[#121212] border-white/10">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Zap className="h-6 w-6 text-[#DFFF00]" />
          Configuración del Portal por Club
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Define el deporte y qué secciones del portal privado ve cada club en su menú de navegación.
          El Perfil del Club siempre es visible.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Selector de club */}
        <div className="p-4 bg-[#1A1A1A] rounded-xl border border-white/5">
          <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">
            Club a configurar
          </label>
          <Select value={selectedClubId} onValueChange={setSelectedClubId}>
            <SelectTrigger className="bg-[#0A0A0A] border-white/10 text-white">
              <SelectValue placeholder="Selecciona un club…" />
            </SelectTrigger>
            <SelectContent className="bg-[#121212] border-white/10">
              {clubs.map(club => (
                <SelectItem key={club.id} value={club.id} className="text-white">
                  <div className="flex items-center gap-2">
                    {club.crest_url && (
                      <img src={club.crest_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                    )}
                    <span>{club.name}</span>
                    {club.sport && (
                      <span className="text-xs text-zinc-500">
                        · {SPORTS.find(s => s.value === club.sport)?.label || club.sport}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedClub && (
          <>
            {/* Deporte */}
            <div className="p-4 bg-[#1A1A1A] rounded-xl border border-white/5 space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 block">
                Deporte del club
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {SPORTS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => handleSportChange(s.value)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all text-left ${
                      sport === s.value
                        ? "bg-[#DFFF00]/10 border-[#DFFF00]/50 text-white"
                        : "bg-[#0A0A0A] border-white/5 text-zinc-400 hover:border-white/20"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <Button
                onClick={applyDefault}
                variant="outline"
                size="sm"
                className="border-white/10 text-zinc-400 hover:text-white text-xs"
              >
                Aplicar secciones por defecto para este deporte
              </Button>
            </div>

            {/* Secciones */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Secciones visibles en el menú
                </label>
                <div className="flex gap-2">
                  <Button onClick={enableAll}  size="sm" variant="outline" className="border-white/10 text-zinc-400 text-xs">
                    Activar todas
                  </Button>
                  <Button onClick={disableAll} size="sm" variant="outline" className="border-white/10 text-zinc-400 text-xs">
                    Desactivar todas
                  </Button>
                </div>
              </div>

              {/* Siempre habilitadas */}
              <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-[#1A1A1A] opacity-60">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-300">Perfil del Club</p>
                  <p className="text-xs text-zinc-600">Siempre visible, no configurable</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-zinc-600 shrink-0" />
              </div>

              {/* Secciones configurables */}
              <div className="grid md:grid-cols-2 gap-3">
                {SECTION_DEFINITIONS.map(section => {
                  const Icon = section.icon;
                  const active = sections.includes(section.key);
                  return (
                    <button
                      key={section.key}
                      onClick={() => toggleSection(section.key)}
                      className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all group ${
                        active
                          ? `${section.bg} ${section.border}`
                          : "bg-[#0A0A0A] border-white/5 hover:border-white/15"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        active ? section.bg : "bg-white/5"
                      }`}>
                        <Icon className={`h-4 w-4 ${active ? section.color : "text-zinc-600"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${active ? "text-white" : "text-zinc-500"}`}>
                          {section.label}
                        </p>
                        <p className="text-xs text-zinc-600 truncate">{section.description}</p>
                      </div>
                      <div className="shrink-0">
                        {active
                          ? <CheckCircle2 className={`h-5 w-5 ${section.color}`} />
                          : <XCircle className="h-5 w-5 text-zinc-700" />
                        }
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resumen + botón guardar */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-sm text-zinc-500">
                <span className="text-white font-semibold">{sections.length}</span> de {SECTION_DEFINITIONS.length} secciones activas
                {changed && <span className="ml-2 text-yellow-400 text-xs">· Cambios sin guardar</span>}
              </p>
              <Button
                onClick={handleSave}
                disabled={saving || !changed}
                className="bg-[#DFFF00] text-black hover:bg-white disabled:opacity-40"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ClubNavConfig;
